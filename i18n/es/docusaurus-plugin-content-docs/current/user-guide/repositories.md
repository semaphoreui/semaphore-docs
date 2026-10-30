import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Repositorios

Un repositorio es un lugar para almacenar y gestionar contenido de Ansible, como playbooks y roles.

![](/assets/repository.webp)

Semaphore reconoce repositorios que son:
  * un sistema de archivos local (`/path/to/the/repo`)
  * un repositorio Git local (`file://`)
  * un repositorio Git remoto al que se accede mediante HTTPS (`https://`) o SSH (`ssh://`)
  * el protocolo `git://` está soportado, pero no se recomienda por motivos de seguridad.

Todas las plantillas de tareas requieren un repositorio para ejecutarse.

## Autenticación {#authentication}
Si usa un repositorio remoto que requiere autenticación, deberá configurar una clave en la sección **Almacén de claves** de Semaphore.

Para repositorios remotos que usan SSH, deberá usar su clave SSH en el **Almacén de claves**.

Para repositorios remotos sin autenticación, puede crear una clave de tipo `None`.

La clave de un repositorio se usa solo para ese repositorio. Para acceder a submódulos, roles de `requirements.yml` u otros repositorios alojados en otro lugar con sus propias credenciales, añada una asignación en [Host config](/user-guide/host-config).

### Configuración de Deploy Keys {#deploy-keys}

En entornos de automatización empresarial, el uso de **Deploy Keys** dedicadas (o Access Keys) asignadas a un único repositorio es la práctica recomendada frente a claves SSH de usuario o Personal Access Tokens (PAT). Las Deploy Keys garantizan:
* **Aislamiento del ciclo de vida**: Las canalizaciones de CI/CD y automatización no dependen de cuentas de empleados individuales ni de credenciales personales.
* **Mínimo privilegio**: Las Deploy Keys pueden configurarse estrictamente con acceso de solo lectura, lo que garantiza que Semaphore no pueda enviar cambios no deseados al repositorio de origen.
* **Radio de impacto limitado**: Si es necesario rotar una clave, solo se ve afectado el repositorio específico.

:::tip Generar claves SSH directamente en Semaphore
No necesita generar claves SSH en la línea de comandos. En Semaphore, vaya a **Key Store** &rarr; **Nueva clave** &rarr; seleccione **SSH Key** &rarr; haga clic en **Generate**. Semaphore creará un par de claves seguro y mostrará un cuadro de diálogo con la **Clave pública** lista para copiar. Consulte [Key Store](/user-guide/key-store#built-in-ssh-key-generator) para más detalles.
:::

Copie la clave pública generada en Semaphore y agréguela a su proveedor Git:

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

## Crear un nuevo repositorio {#creating-a-new-repository}
1. Asegúrese de haber configurado en la sección del almacén de claves la clave del repositorio que va a añadir.

2. Vaya a la sección Repositorios de Semaphore y haga clic en el botón **Nuevo repositorio** en la esquina superior derecha.

3. Configure el repositorio:
    * Asigne un nombre al repositorio
    * Añada la URL. La URL debe empezar por lo siguiente:
        * `/path/to/the/repo` para una carpeta local del sistema de archivos
        * `https://` para un repositorio Git remoto accedido mediante HTTPS
        * `ssh://` para un repositorio Git remoto accedido mediante SSH
        * `file://` para un repositorio Git local
        * `git://` para un repositorio Git remoto accedido mediante el protocolo Git
    * Establezca la rama del repositorio; si no está seguro de cuál debe ser, probablemente sea master o main
    * Marque **Descarga única para todas las plantillas** si el repositorio es un monorepo que todas las plantillas deben compartir; consulte [Monorepo](#monorepo)
    * Seleccione la **clave de acceso** que configuró antes de añadir este repositorio.

4. Haga clic en Guardar una vez que todo esté configurado.

## Monorepo: una sola descarga para todas las plantillas {#monorepo}

:::info Desde la v2.20
La opción **Descarga única para todas las plantillas** está disponible desde **Semaphore 2.20**. Las versiones anteriores siempre clonan un repositorio una vez por plantilla.
:::

De forma predeterminada, Semaphore clona un repositorio una vez por plantilla, de modo que cada plantilla trabaja en su propia copia. En un repositorio grande compartido por muchas plantillas, las copias consumen espacio en disco y cada tarea empieza con un clone o un pull de su propia copia.

Marque **Descarga única para todas las plantillas** para clonar el repositorio una sola vez y compartir esa copia entre todas las plantillas del proyecto. La opción no está disponible para una carpeta local (`/path/to/the/repo`), que nunca se clona.

<div style={{maxWidth: 450}}>

![Formulario de repositorio con la opción Descarga única para todas las plantillas activada](/assets/repository-monorepo.webp)

</div>

Cómo funciona la copia compartida:

* Antes de que empiece una tarea, Semaphore bloquea la copia, hace fetch y pull de la rama configurada en el repositorio y después libera el bloqueo. Las tareas de otras plantillas esperan al bloqueo mientras se actualiza la copia, pero las tareas en sí se ejecutan en paralelo.
* Cada rama sigue teniendo su propia copia, por lo que los repositorios con ramas distintas nunca comparten un árbol de trabajo.
* La copia se comparte, pero el directorio home de Ansible (roles y colecciones instalados desde `requirements.yml`) sigue siendo independiente para cada plantilla.

Como todas las plantillas trabajan en la misma copia y en la misma rama, una plantilla de un monorepo no puede tener una **Rama** propia ni activar la solicitud **Rama**, que permite a una tarea elegir una rama o un commit. El formulario de la plantilla desactiva ambas opciones y explica el motivo, y la API rechaza una plantilla así. Asegúrese de que los playbooks no escriban en la copia: un árbol de trabajo modificado rompe el siguiente pull, y Semaphore entonces elimina la copia y la clona de nuevo.

## Playbooks en subdirectorios {#subdirectories}

Los repositorios empresariales frecuentemente organizan la automatización en directorios dedicados, monorrepositorios o estructuras multientorno en lugar de colocar todos los playbooks en la raíz del repositorio.

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

Al crear una [Plantilla de tarea](/user-guide/task-templates), el **Nombre de archivo del playbook** siempre se especifica **relativo a la raíz del repositorio**:

* **Usar rutas relativas**: Introduzca `playbooks/site.yml` o `playbooks/provisioning/aws-vms.yml`.
* **Sin barra inicial**: No use `/playbooks/site.yml`. Una barra inicial hace que el ejecutor busque desde el directorio raíz del sistema en lugar del clon del repositorio.
* **Barras diagonales Unix**: Utilice siempre `/`, incluso si se ejecuta en nodos runner de Windows.
* **Sensible a mayúsculas y minúsculas**: Las rutas deben coincidir exactamente con el nombre de carpetas y archivos (por ejemplo, `playbooks/site.yml`).

:::info Directorio de trabajo y requisitos
Cuando un playbook se ejecuta desde un subdirectorio (como `playbooks/site.yml`), Semaphore evalúa tanto el directorio del playbook (`playbook_dir`) como la raíz del repositorio (`repo_path`) al resolver roles y colecciones. Consulte [Requisitos](#requirements) a continuación para el orden de búsqueda exacto.
:::

## Editar un repositorio existente {#editing-an-existing-repository}
1. Vaya a la sección Repositorios de Semaphore.

2. Haga clic en el icono del lápiz junto al repositorio que desea modificar; se le mostrará la configuración del repositorio.

## Eliminar un repositorio {#deleting-a-repository}
Asegúrese de que el repositorio que va a eliminar no esté en uso por ninguna plantilla de tareas.
Un repositorio no puede eliminarse si se usa en alguna plantilla de tareas:
1. Vaya a la sección Repositorios de Semaphore.

2. Haga clic en el icono de la papelera del repositorio que desea eliminar.

3. Haga clic en Sí en la ventana emergente de confirmación si está seguro de que desea eliminar este repositorio.

### Protección de dependencias y comprobaciones de uso {#dependency-protection}

Un repositorio no se puede eliminar si está asignado actualmente a una o más plantillas de tareas.

Antes de intentar la eliminación, Semaphore comprueba las referencias activas de plantillas:
1. En la lista de repositorios, al hacer clic en el icono de papelera se comprueba si el repositorio está referenciado por alguna plantilla del proyecto.
2. Si existen dependencias, Semaphore muestra un cuadro de diálogo de advertencia con la lista exacta de plantillas de tareas que hacen referencia a este repositorio, con enlaces directos a cada plantilla.
3. Si se elimina directamente a través de la API mientras está en uso, la solicitud se rechaza con HTTP `400 Bad Request`:

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

Para eliminar de forma segura un repositorio:
1. Vaya a **Plantillas** y reasigne cada plantilla dependiente a otro repositorio, o elimine las plantillas en desuso.
2. Vuelva a **Repositorios** y haga clic en el icono de papelera junto al repositorio.
3. Confirme la eliminación en el cuadro de diálogo emergente.

:::tip Limpieza automática de la caché de checkout
Cuando un repositorio se elimina correctamente, Semaphore purga automáticamente el directorio de trabajo local del checkout en el sistema de archivos del host/runner, liberando espacio en disco.
:::

## Requisitos {#requirements}
Al inicializar el proyecto, Semaphore busca e instala roles y colecciones de Ansible desde requirements.yml en las siguientes ubicaciones y en este orden.

### Roles {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Colecciones {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Lógica de procesamiento {#processing-logic}

* Cada archivo se procesa de forma independiente
* Si un archivo existe, se procesa según su tipo (rol o colección)
* Si el procesamiento de algún archivo produce un error, el proceso de instalación se detiene y devuelve el error
* El mismo archivo requirements.yml de los directorios raíz (**`playbook_dir`/requirements.yml** y **`repo_path`/requirements.yml**) se procesa dos veces: una para roles y otra para colecciones

Semaphore intentará procesar todas estas ubicaciones independientemente de si las anteriores se encontraron o se procesaron correctamente, salvo en caso de error.
