---
title: Primeros pasos
description: Instale Semaphore UI, ejecute su primera tarea de Ansible, revise el resultado y configure una programación.
sidebar_label: Primeros pasos
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Primeros pasos

Semaphore UI es una interfaz web y una API para ejecutar automatizaciones repetibles con Ansible, Terraform/OpenTofu, Bash, PowerShell y Python. Reúne automatizaciones almacenadas en Git, credenciales, variables, programaciones, flujos de trabajo y entornos de ejecución, y conserva el estado y el registro de cada ejecución.

Esta guía utiliza Ansible como primer ejemplo práctico. Use un playbook de su propio repositorio o reproduzca el ejemplo de las capturas con el repositorio público [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo).

<div className="VideoEmbed">
  <iframe
    src="https://www.youtube-nocookie.com/embed/LVKwud2Wno4"
    title="Inicio rápido de Semaphore UI: instalar, ejecutar y programar Ansible"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  ></iframe>
</div>

## 1. Instale Semaphore

Elija el método de instalación según dónde vaya a ejecutar Semaphore. El paquete nativo está seleccionado de forma predeterminada.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Paquete nativo" default className="InstallationMethod">

Para Debian o Ubuntu en `amd64`:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

Para RHEL, Fedora, Rocky Linux, AlmaLinux o CentOS Stream en `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Configure la base de datos y el primer administrador; después, inicie Semaphore con la configuración generada:

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

Para una evaluación local, elija SQLite, acepte o establezca las rutas de la base de datos y los playbooks, indique la URL pública y cree el primer administrador cuando se le solicite.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Cree `compose.yaml`:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

Genere una clave de cifrado y guárdela, junto con una contraseña de administrador segura, en un archivo `.env` junto a `compose.yaml`:

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Mantenga `.env` fuera del control de versiones e inicie el contenedor:

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Archivo binario" className="InstallationMethod">

Descargue el archivo para su sistema operativo y arquitectura de CPU desde [GitHub Releases](https://github.com/semaphoreui/semaphore/releases). Ejemplo para Linux `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

Para una evaluación local, elija SQLite, acepte o establezca las rutas de la base de datos y los playbooks, indique la URL pública y cree el primer administrador cuando se le solicite.

Elija un archivo `darwin` para macOS o un `.zip` para Windows. El tutorial de Ansible que sigue requiere un entorno de ejecución Linux, macOS, WSL, un contenedor o un runner Linux con Ansible instalado.

  </TabItem>
  <TabItem value="helm" label="Kubernetes con Helm" className="InstallationMethod">

Añada el chart oficial y revise sus valores predeterminados antes de instalarlo:

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

El campo `appVersion` del chart identifica la versión de Semaphore. Antes de usarlo en producción, configure en `values.yaml` el almacenamiento persistente, la base de datos, las credenciales de administrador, la clave de cifrado de las claves de acceso e ingress/TLS.

  </TabItem>
</Tabs>

Para una configuración guiada, use la [página oficial de instalación de Semaphore](https://semaphoreui.com/install) para seleccionar la versión, generar la configuración y obtener los comandos de descarga o ejecución correspondientes.

<details>
<summary>¿No sabe qué método de instalación elegir?</summary>

| Método de instalación | Cuándo elegirlo | Guía detallada |
| --- | --- | --- |
| **Paquete nativo** | Un servidor Linux compatible | [Instalación mediante gestor de paquetes](/admin-guide/installation/package-manager) |
| **Docker Compose** | Una configuración aislada rápida o un host de contenedores | [Instalación con Docker](/admin-guide/installation/docker) |
| **Archivo binario** | macOS, Windows, FreeBSD o Linux sin un paquete adecuado | [Instalación del binario](/admin-guide/installation/binary-file) |
| **Kubernetes con Helm** | Un clúster Kubernetes existente | [Instalación en Kubernetes](/admin-guide/installation/k8s) |

Las guías detalladas cubren bases de datos de producción, servicios, secretos, almacenamiento, ingress y actualizaciones.

</details>

Para este tutorial de Ansible, `git --version` y `ansible-playbook --version` deben funcionar en el servidor Semaphore o en el runner. Si falta alguno de los comandos, instale [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) y [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) antes de continuar.

:::tip Instalación en producción
Antes de usar Semaphore en producción, revise [Configuración](/admin-guide/configuration), [Seguridad](/admin-guide/security), [Runners](/admin-guide/runners), [Alta disponibilidad](/admin-guide/ha) y [Actualización](/admin-guide/upgrading).
:::

## 2. Inicie sesión

1. Abra Semaphore en un navegador. Una instalación local suele usar [http://localhost:3000](http://localhost:3000).
2. Introduzca el usuario y la contraseña de administrador definidos mediante `semaphore setup` o las variables de administrador de Docker.
3. Seleccione **Sign In**.

![Pantalla de inicio de sesión de Semaphore](/assets/getting-started/sign-in.jpg)

Use la cuenta de administrador para la configuración inicial porque puede crear proyectos y usuarios. Los usuarios normales acceden desde la misma página cuando un administrador crea sus cuentas y les concede acceso al proyecto. Consulte [Gestión de usuarios](/user-guide/admin/users).

## 3. Cree un proyecto

Al iniciar sesión en una instancia vacía de Semaphore, se abre automáticamente la página **New Project**. Si ya existen proyectos, abra el selector de proyectos y seleccione **New Project...**. Complete el formulario:

| Campo | Qué introducir |
| --- | --- |
| **Project Name** | Un nombre reconocible para el espacio de trabajo, por ejemplo `Production infrastructure` o el nombre de su aplicación. |
| **Max number of parallel tasks** | Opcional. Limita las tareas simultáneas del proyecto; déjelo vacío para usar el límite del servidor. |
| **Telegram Chat ID** | Opcional. Se usa cuando el proyecto tiene notificaciones de Telegram configuradas. |
| **Allow alerts for this project** | Opcional. Activa las notificaciones configuradas del proyecto. |
Seleccione **Create**.

No seleccione **Create Demo Project**: añade recursos de ejemplo, mientras que esta guía crea un proyecto vacío. Al crear otro proyecto más adelante, la misma opción aparece como un interruptor **Demo** en el diálogo New Project.

![Formulario New Project vacío con todos los campos disponibles](/assets/getting-started/new-project-empty.jpg)

El nuevo proyecto contiene las secciones **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store** y **Repositories**. Consulte [Proyectos](/user-guide/projects) para conocer la configuración del proyecto, el acceso del equipo, la actividad y el historial.

<details>
<summary>Vea este paso</summary>

![Creación del primer proyecto en una instancia vacía de Semaphore](/assets/getting-started/create-first-project.gif)

</details>

## 4. Comprenda los conceptos básicos

El nuevo proyecto abre un Dashboard vacío. La barra lateral es la navegación principal del proyecto:

![Interfaz de un proyecto vacío de Semaphore antes de añadir recursos y tareas](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** muestra el historial de ejecuciones, estadísticas, actividad y configuración del proyecto.
- **Task Templates**, **Workflows** y **Schedule** definen qué se ejecuta y cuándo.
- **Repositories**, **Inventory**, **Variable Groups** y **Key Store** proporcionan código, destinos, variables y credenciales.
- **Integrations**, **Team** y **Runners** conectan sistemas externos, usuarios y hosts de ejecución.

El diagrama muestra cómo estos recursos producen una ejecución:

<div class="BlockSchema">
  ![Cómo los recursos y disparadores de Semaphore generan una ejecución de tarea](/assets/getting-started/core-concepts.svg)
</div>

Una acción de la interfaz, una solicitud API o una programación puede iniciar directamente un **Task Template** o un **Workflow** que utiliza plantillas de tareas. Semaphore crea una ejecución, que aparece como **Task** en la interfaz, y la envía al servidor Semaphore o a un runner remoto apto. Para Ansible, ese host ejecuta `ansible-playbook`; el Inventory enumera los sistemas que Ansible administra.

| Concepto | Función |
| --- | --- |
| [**Project**](/user-guide/projects) | Un espacio de trabajo aislado con recursos de automatización, permisos e historial de ejecuciones. |
| [**Repository**](/user-guide/repositories) | Apunta a la rama o etiqueta Git que contiene los archivos de automatización de una tarea. |
| [**Key Store**](/user-guide/key-store) | Almacena claves SSH, credenciales, tokens y contraseñas de Ansible Vault reutilizables fuera de Git y de las entradas de tareas. |
| [**Inventory**](/user-guide/inventory) | Indica a Ansible qué hosts y grupos debe administrar y qué credenciales usar. |
| [**Variable Group**](/user-guide/environment) | Almacena variables de Ansible, variables de entorno y secretos reutilizables para una o varias plantillas. |
| [**Task Template**](/user-guide/task-templates/) | Guarda qué ejecutar: tipo de automatización, archivo, repositorio, inventario, variables, parámetros solicitados y opciones de ejecución. |
| [**Task (task run)**](/user-guide/tasks) | Una ejecución con sus propias entradas, estado, marcas de tiempo, registro, detalles y resultado. |
| **Workflow** | Conecta plantillas en una secuencia de varios pasos con ramas de éxito, fallo, aprobación y notas. |
| [**Schedule**](/user-guide/schedules) | Inicia una plantilla de tarea o un flujo una vez o repetidamente mediante una expresión cron. |
| [**Runner**](/admin-guide/runners) | Ejecuta tareas en cola fuera del servidor principal de Semaphore, por ejemplo en otra red o zona de seguridad. |

## 5. Conecte el repositorio

Un Repository conecta Semaphore con la automatización almacenada en Git; Semaphore no almacena el playbook en sí. Conecte su repositorio o use los valores de la demostración pública siguientes para reproducir exactamente el ejemplo. Las [Integraciones](/user-guide/integrations) son una función independiente para iniciar automatizaciones desde GitHub, GitLab u otras fuentes de webhooks.

1. Abra **Repositories** y seleccione **New Repository**.
2. Introduzca el nombre, la URL, la rama y las credenciales del repositorio. Para la demostración pública, use:

   | Campo | Valor |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`, porque este repositorio es público |

3. Seleccione **Create**.

![Formulario de repositorio con el repositorio público de demostración de Semaphore](/assets/getting-started/repository-settings.jpg)

El repositorio debería aparecer en la lista. Semaphore lo clona o actualiza en el host de ejecución al iniciar una tarea, no al crear el registro Repository. La captura muestra los valores de demostración de esta guía.

![Repositorio Demo conectado en la lista de repositorios del proyecto](/assets/getting-started/connected-repository.jpg)

Para un repositorio privado, seleccione credenciales adecuadas del Key Store en lugar de `None`. Consulte [Repositorios](/user-guide/repositories) para rutas locales, HTTPS, SSH, ramas, credenciales y archivos de dependencias.

## 6. Añada una clave SSH para un host remoto administrado

Estas credenciales SSH permiten a Ansible conectarse desde el servidor Semaphore o el runner a un host remoto del Inventory. Si sigue la demostración de `localhost`, no necesita una clave SSH; continúe con el paso 7.

La demostración usa `localhost` con `ansible_connection=local`, por lo que no abre una conexión SSH. Cuando su propio playbook administre un host remoto, añada su clave:

1. Añada la parte pública de la clave a `~/.ssh/authorized_keys` en el host administrado.
2. Abra **Key Store** y seleccione **New Key**.
3. Introduzca un nombre reconocible, por ejemplo `Production hosts`, mantenga **Local** seleccionado y elija **SSH Key**.
4. Introduzca la cuenta que Ansible debe usar en el host, por ejemplo `ubuntu` o `ec2-user`.
5. Pegue la clave privada completa, incluidas las líneas `BEGIN` y `END`, y añada la frase de contraseña si es necesaria.
6. Seleccione **Create**. En el siguiente paso, elija esta clave en **Inventory → User Credentials**.

![Formulario New SSH Key para la cuenta utilizada en los hosts administrados](/assets/getting-started/add-managed-host-ssh-key.jpg)

La captura contiene un marcador de posición, no un secreto válido. Nunca publique una clave privada en documentación, capturas, argumentos de tareas o control de versiones.

Semaphore puede almacenar secretos localmente o integrar almacenes externos como [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) y [Devolutions Server](/user-guide/key-store/devolutions-server). Consulte [Almacén de claves](/user-guide/key-store) para todos los tipos de credenciales y opciones de almacenamiento compatibles.

## 7. Cree el inventario de Ansible

Toda tarea de Ansible necesita un inventario. Para una primera ejecución local, añada al repositorio un archivo como `inventory.ini`:

```ini
[local]
localhost ansible_connection=local
```

Aquí, `localhost` es el host de ejecución: el servidor Semaphore, el contenedor o el runner, no necesariamente el equipo con el navegador abierto. `ansible_connection=local` indica a Ansible que no use SSH. El repositorio de demostración usa el archivo equivalente `invs/prod/hosts` con un grupo llamado `site`.

Si creó `inventory.ini` en su repositorio, haga commit y push a la rama conectada a Semaphore antes de continuar.

1. Abra **Inventory** y seleccione **New Inventory → Ansible Inventory**.
2. Introduzca valores que coincidan con su inventario. Por ejemplo:

   | Campo | Valor |
   | --- | --- |
   | **Name** | `Local` (`Prod` en la demostración) |
   | **User Credentials** | `None` para `localhost`; use las credenciales SSH del host para un inventario remoto |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` en la demostración) |

3. Deje **Runner tag**, **Sudo Credentials** y **Repository** vacíos y seleccione **Create**.

![Inventario de archivo de Ansible configurado con los valores del repositorio de demostración](/assets/getting-started/ansible-inventory-settings.jpg)

Dejar **Repository** vacío hace que Semaphore resuelva la ruta relativa del inventario desde el repositorio seleccionado en la plantilla de tarea. Seleccione aquí un repositorio solo si el inventario se encuentra en otro lugar. Para un host remoto, use la clave SSH del paso 6 como **User Credentials**.

Consulte [Inventario](/user-guide/inventory) para inventarios estáticos, basados en archivos y dinámicos.

## 8. Añada un grupo de variables (opcional)

Un **Variable Group** es un conjunto reutilizable de valores que puede asociar a una o varias plantillas de tareas. Use **Extra variables** para variables de Ansible, **Environment variables** para valores exportados al proceso y **Secrets** para valores sensibles que deban cifrarse y ocultarse. Esto mantiene la configuración específica del entorno fuera del playbook y evita repetir los mismos valores en cada plantilla.

La primera tarea funciona sin un grupo de variables. Como ejemplo, cree uno que establezca `ansible_python_interpreter=auto_silent`; Ansible seguirá detectando Python automáticamente, pero no mostrará su advertencia informativa de detección.

1. Abra **Variable Groups** y seleccione **New Group**.
2. Establezca **Group Name** con un nombre descriptivo, por ejemplo `Ansible defaults`.
3. En **Variables → Extra variables**, mantenga **Table** seleccionado y seleccione **+**.
4. Introduzca:

   | Nombre | Tipo | Valor |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Seleccione **Save**.

![Grupo de variables configurado en el editor de tablas](/assets/getting-started/variable-group-table.jpg)

Consulte [Grupos de variables](/user-guide/environment) para reglas de precedencia y opciones de almacenamiento de secretos.

## 9. Cree la plantilla de tarea de Ansible

### Revise el playbook en Git

Si el repositorio conectado ya contiene un playbook de Ansible, úselo. En caso contrario, añada un ejemplo pequeño como `get-started.yml`:

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

Si sigue la demostración, use su [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml). Se dirige al grupo `site` del inventario de demostración y ejecuta el rol `ping` incluido.

La demostración descarga ese rol desde un submódulo Git y envía una solicitud ICMP a `semaphoreui.com`, por lo que el host de ejecución necesita acceso a GitHub e ICMP saliente. Si ICMP está bloqueado, use el ejemplo local `get-started.yml`.

![ping.yml en el repositorio GitHub conectado](/assets/getting-started/demo-playbook-github.jpg)

La captura muestra el playbook del repositorio público de demostración. Guardar la automatización en Git permite revisar cambios y que Semaphore registre el commit exacto de cada ejecución.

Si creó `get-started.yml` en su repositorio, haga commit y push a la rama conectada a Semaphore antes de continuar.

### Configure la plantilla

1. Abra **Task Templates** y seleccione **New template → Applications**.
2. Active **Ansible Playbook** y vuelva a **Task Templates**.
3. Seleccione **New template → Ansible Playbook**.
4. Mantenga seleccionada la pestaña **Task**. **Build** y **Deploy** son tipos de plantilla CI/CD con versiones y no se necesitan para esta ejecución independiente.
5. Configure la plantilla con valores que coincidan con sus archivos. Por ejemplo:

   | Campo | Valor | Importancia |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Identifica la plantilla reutilizable y su historial de tareas. |
   | **Repository** | Su repositorio (`Demo` en el ejemplo) | Proporciona el playbook y los archivos relacionados. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` en la demostración) | Se resuelve desde la raíz del repositorio. |
   | **Inventory** | `Local` (`Prod` en la demostración) | Proporciona el destino local de esta primera ejecución. |
   | **Variable Groups** | `Ansible defaults`, si se creó | Añade la configuración opcional reutilizable de Ansible. |
   | **Runner tag** | Dejar vacío | Usa ejecución local o el runner predeterminado según la configuración del servidor. |

6. En **Ansible options**, active **Skip Galaxy install** para el pequeño playbook anterior o la demostración pública: ninguno necesita dependencias Galaxy para esta tarea. Déjelo desactivado si su repositorio requiere roles o colecciones de un archivo `requirements.yml`.
7. Seleccione **Create**.

![Plantilla de tarea de Ansible con su repositorio, inventario y grupo de variables](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Vea este paso</summary>

![Activación de Ansible y creación de la primera plantilla de tarea de Ansible](/assets/getting-started/create-ansible-template.gif)

</details>

Otros campos útiles son:

- **Vaults** selecciona contraseñas del Key Store para contenido cifrado de Ansible.
- **Limit**, **Tags** y **Skip tags** limitan lo que ejecuta el playbook.
- **Prompts** permiten a un usuario, una programación o una solicitud API sustituir los valores habilitados para una ejecución concreta.
- **Runner tag** controla dónde se ejecuta la tarea; no selecciona un destino de Ansible.

Consulte [Plantillas de Ansible](/user-guide/apps/ansible) y [Plantillas de tareas](/user-guide/task-templates/) para todos los campos y opciones de ejecución.

## 10. Ejecute la plantilla e inspeccione la tarea

1. Abra la plantilla de tarea creada y seleccione **Run**.
2. Añada un mensaje opcional, como `First Semaphore run`.
3. Mantenga **Dry Run** y **Diff** desactivados y seleccione **Run**.

![Diálogo New Task sin opciones adicionales para el playbook de Ansible](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore pone la tarea en cola, prepara el repositorio, aplica el inventario y el grupo de variables opcional y ejecuta el playbook seleccionado. El estado pasa por **Waiting** y **Running** antes de finalizar como **Success** o **Failed**.

### Registro

**Log** contiene la salida real de los comandos. Lea el `PLAY RECAP` final, no solo el indicador verde de estado.

![Registro de tarea de Ansible correcta con salida de ping y PLAY RECAP](/assets/getting-started/ansible-task-log-variable-group.jpg)

Los contadores exactos dependen de su playbook. Una primera ejecución correcta debe terminar con `unreachable=0` y `failed=0` para `localhost`. Si el registro de demostración muestra `changed=1`, significa que su paso de ping mediante shell se ejecutó e informó de un cambio; no es un error.

### Detalles y resumen

| Pestaña | Qué comprobar |
| --- | --- |
| **Log** | Fases de ejecución en directo, salida de módulos, errores y `PLAY RECAP` final. |
| **Details** | Tipo de plantilla, commit Git, mensaje de ejecución, autor, marcas de tiempo y duración. |
| **Summary** | Resultados y errores de Ansible por host tras finalizar, cuando está disponible la función de resumen de tareas. |

![Detalles de la tarea con plantilla, commit e información temporal](/assets/getting-started/ansible-task-details.jpg)

![Resumen de tarea con recuentos de hosts OK y Not OK](/assets/getting-started/ansible-task-summary.jpg)

Si **Summary** no está disponible, compruebe la ejecución en **Log**; `PLAY RECAP` sigue siendo el resultado de referencia de Ansible.

<details>
<summary>Vea la ejecución y el resultado</summary>

![Ejecución de la tarea de Ansible y revisión del registro y los detalles](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Busque ejecuciones anteriores

Cierre la ventana de tarea para volver a la pestaña **Tasks** de la plantilla. Cada ejecución tiene su número de tarea, estado, usuario, hora de inicio, duración y registro conservado. **Dashboard → History** muestra las ejecuciones de todas las plantillas del proyecto. Consulte [Tareas](/user-guide/tasks) e [Historial del proyecto](/user-guide/projects/history) para más detalles.

![Historial de una plantilla de Ansible con ejecuciones correctas](/assets/getting-started/ansible-template-history.jpg)

Si la tarea falla, use la última línea significativa del registro para decidir la siguiente comprobación:

- Un error de clonación apunta a la URL del repositorio, la rama, Access Key o el acceso de red desde el host de ejecución.
- `ansible-playbook: command not found` significa que falta Ansible en el servidor Semaphore o en el runner seleccionado.
- `UNREACHABLE` apunta a direcciones del inventario, credenciales del host, conectividad SSH o verificación de la clave del host.
- Un paso de Ansible fallido suele mostrar el nombre de la tarea, el host y el error del módulo justo encima de `PLAY RECAP`.

## 11. Ejecute la tarea según una programación

Cuando la tarea funcione desde la interfaz, podrá ejecutarla automáticamente. Por ejemplo, la expresión cron `0 3 * * *` la inicia cada día a las 03:00 en la zona horaria indicada por Semaphore.

1. Abra **Schedule** y seleccione **New Schedule → Cron**.
2. Introduzca un nombre descriptivo, por ejemplo `Nightly playbook`.
3. Seleccione la plantilla de tarea que desea ejecutar.
4. Mantenga **Show cron format** activado e introduzca una expresión cron, por ejemplo `0 3 * * *`.
5. Mantenga **Enabled** seleccionado y elija **Save**.

![Programación cron para ejecutar la tarea de ejemplo a diario a las 03:00](/assets/getting-started/create-cron-schedule.jpg)

Semaphore muestra la zona horaria configurada y calcula la siguiente ejecución antes de guardar. Una ejecución programada usa el mismo repositorio, inventario, grupos de variables y ajustes de ejecución que la plantilla. Si la plantilla expone parámetros solicitados, la programación puede aportar sus valores. Consulte [Programaciones](/user-guide/schedules) para sintaxis cron, configuración de zona horaria, ejecuciones únicas y parámetros programados.

Tras guardar, compruebe que la programación esté **Enabled** y que **Next run** muestre la hora esperada. Las tareas programadas aparecen en la pestaña **Tasks** de la plantilla y en **Dashboard → History**.

## Qué probar después

Cuando la primera tarea de Ansible termine correctamente:

- Añada las credenciales privadas adecuadas en [Almacén de claves](/user-guide/key-store) si su repositorio requiere autenticación.
- Cree un **Workflow** cuando varias plantillas necesiten rutas ordenadas de éxito, fallo, aprobación o notas.
- Use [Integraciones](/user-guide/integrations) para disparadores webhook autenticados desde GitHub, GitLab u otros sistemas.
- Use la [API](/reference/api) para gestionar recursos e iniciar plantillas mediante programación.
- Añada un [runner remoto](/admin-guide/runners) si la ejecución debe realizarse en otra red, sistema operativo o zona de seguridad.

Para producción, publique Semaphore mediante HTTPS, haga copias de seguridad conjuntas de la base de datos y el secreto de cifrado de las claves de acceso, configure autenticación centralizada y revise [Seguridad](/admin-guide/security), [Registros](/admin-guide/logs) y [Actualización](/admin-guide/upgrading).
