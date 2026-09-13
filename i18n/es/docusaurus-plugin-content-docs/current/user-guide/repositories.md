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
    * Seleccione la **clave de acceso** que configuró antes de añadir este repositorio.

4. Haga clic en Guardar una vez que todo esté configurado.

## Editar un repositorio existente {#editing-an-existing-repository}
1. Vaya a la sección Repositorios de Semaphore.

2. Haga clic en el icono del lápiz junto al repositorio que desea modificar; se le mostrará la configuración del repositorio.

## Eliminar un repositorio {#deleting-a-repository}
Asegúrese de que el repositorio que va a eliminar no esté en uso por ninguna plantilla de tareas.
Un repositorio no puede eliminarse si se usa en alguna plantilla de tareas:
1. Vaya a la sección Repositorios de Semaphore.

2. Haga clic en el icono de la papelera del repositorio que desea eliminar.

3. Haga clic en Sí en la ventana emergente de confirmación si está seguro de que desea eliminar este repositorio.

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
