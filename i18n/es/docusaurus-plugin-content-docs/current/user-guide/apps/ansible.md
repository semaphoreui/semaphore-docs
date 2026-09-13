
# Ansible

Con Semaphore UI puede ejecutar playbooks de Ansible. Para ello, debe crear una plantilla de tipo **Ansible Playbook**.

1. Vaya a la sección **Plantillas de tareas**, haga clic en **Nueva plantilla** y luego en **Ansible Playbook**.

![](/assets/ansible_1.png)

2. Configure la plantilla.

La plantilla le permite especificar los siguientes parámetros:

* Repositorio
* Ruta al archivo del playbook
* Directorio de trabajo (opcional)
* Inventario
* Grupos de variables
* Vaults
* Argumentos adicionales de la CLI (tags, skip-tags, limit, verbosidad)
* Variables de entorno

![](/assets/ansible_2.png)

## Directorio de trabajo {#working-directory}

Use **Directorio de trabajo** para ejecutar los comandos de Ansible desde un subdirectorio del repositorio de la plantilla. Introduzca una ruta relativa a la raíz del repositorio. Por ejemplo, si `ansible.cfg` está guardado en `<repository>/automation`, introduzca `automation`. Las rutas absolutas y las rutas fuera del repositorio se rechazan. Si se omite, Semaphore usa la raíz del repositorio.

El directorio de trabajo afecta al comportamiento de Ansible que depende del directorio actual del proceso. El [orden de búsqueda del archivo de configuración][ansible-config-search] de Ansible incluye el `ansible.cfg` del directorio actual. El directorio de trabajo también afecta a la resolución de las rutas relativas en los argumentos adicionales de la CLI; por ejemplo, [`--extra-vars @vars.yml`][ansible-extra-vars-file] y [`--private-key key.pem`][ansible-private-key]. Las rutas del playbook y del inventario en archivo siguen siendo relativas a la raíz de sus repositorios.

Cambiar el directorio de trabajo no añade por sí mismo los subdirectorios `roles/` o `collections/` de ese directorio a las rutas de búsqueda de Ansible. El [descubrimiento de roles relativo al playbook][ansible-role-search] y las [colecciones adyacentes a un playbook][ansible-playbook-collections] siguen basándose en la ubicación del playbook. Aun así, el directorio de trabajo puede afectar indirectamente a su descubrimiento cuando el `ansible.cfg` seleccionado configura `roles_path` o `collections_path`.

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## Tipos de plantilla {#template-types}

Una plantilla de ansible-playbook puede ser de uno de los siguientes tipos:

* [Task](#task)
* [Build](#build)
* [Deploy](#deploy)

### Task {#task}

Simplemente ejecuta los playbooks indicados con los parámetros indicados.

Si piensa lanzar la plantilla mediante una llamada a la API usando la funcionalidad *limit*, asegúrese de activar la opción *Ansible prompts: Limit*. De lo contrario, el límite establecido en la llamada a la API se ignorará. En el caso de una tarea lanzada desde la API, esto no provocará ninguna solicitud interactiva: la tarea se ejecutará de forma desatendida.

### Build {#build}

Este tipo de plantilla debe usarse para crear [artefactos](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\)). La versión inicial del artefacto puede especificarse en un parámetro de la plantilla. Cada ejecución incrementa la versión del artefacto.

![](/assets/template_new_build_ipad1.png)

Semaphore no admite artefactos de forma nativa, solo proporciona el versionado de las tareas. Debe implementar usted mismo la creación de los artefactos. Lea el artículo [CI/CD](../../admin-guide/cicd) para saber cómo hacerlo.

### Deploy {#deploy}

Este tipo de plantilla debe usarse para desplegar artefactos en los servidores de destino. Cada plantilla `deploy` está asociada a una plantilla `build`.


Esto le permite desplegar una versión concreta del artefacto en los servidores.

## Opciones de la plantilla {#template-options}

### Programación {#schedule}

Puede configurar la programación de tareas especificando una programación cron en los ajustes de la plantilla. Encontrará el formato de las expresiones cron en la [documentación](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format).


#### Ejecutar una tarea cuando se añade un nuevo commit al repositorio {#run-a-task-when-a-new-commit-is-added-to-the-repository}

Puede usar cron para comprobar periódicamente si hay nuevos commits en el repositorio y lanzar una tarea cuando lleguen.

Por ejemplo, supongamos que tiene el código fuente de la aplicación en el repositorio git. Puede añadirlo a **Repositorios** y lanzar la tarea Build para los nuevos commits.


### Tags, skip-tags y limit {#tags-skip-tags-and-limit}

Las plantillas admiten las siguientes opciones de la CLI de Ansible:

- `--tags`
- `--skip-tags`
- `--limit`

Pueden establecerse en la plantilla y sobrescribirse al crear una tarea. Asegúrese de que las solicitudes correspondientes estén habilitadas si piensa pasar estos valores mediante la API.

### Requisitos de Galaxy {#galaxy-requirements}

Antes de ejecutar un playbook, Semaphore instala los roles y colecciones de los archivos `requirements.yml` encontrados en el directorio del playbook, en la raíz del repositorio y en sus subdirectorios `roles/` y `collections/`, usando `ansible-galaxy install --force`.

Para evitar reinstalarlos en cada ejecución, Semaphore guarda una suma de comprobación de cada archivo de requisitos y solo vuelve a ejecutar la instalación cuando el archivo cambia. Dos opciones de la plantilla, en la sección desplegable **Galaxy install options** (debajo de **Ansible prompts**), controlan este comportamiento:

- **Skip Galaxy install**: no ejecutar `ansible-galaxy` en absoluto. Úselo cuando los requisitos ya estén preinstalados en la imagen del runner.
- **Force Galaxy install**: ejecutar siempre `ansible-galaxy install --force`, ignorando la suma de comprobación guardada. Úselo cuando un archivo de requisitos apunte a un objetivo cambiante (por ejemplo, una rama en lugar de una etiqueta) y quiera obtener la última versión en cada ejecución.

**Skip Galaxy install** puede mostrarse en el formulario de ejecución de la tarea activando la casilla del mismo nombre bajo **Prompts**, al final de la sección. Cuando una solicitud está habilitada, el valor elegido en el momento de la ejecución prevalece sobre el valor predeterminado de la plantilla.

#### Argumentos adicionales de Galaxy {#galaxy-extra-args}

**Role install args** y **Collection install args** (en la sección desplegable **Galaxy install options**, debajo de **Ansible prompts**; contraída de forma predeterminada; el contador junto a ella indica cuántos ajustes de Galaxy están personalizados) añaden opciones a `ansible-galaxy role install` y `ansible-galaxy collection install`, respectivamente. Se configuran por separado porque ambos subcomandos aceptan opciones distintas: `--pre`, por ejemplo, solo es válido para colecciones.

Cada entrada es un único token de argv; un valor puede indicarse en línea (`--timeout=60`) o como la entrada siguiente (`--timeout`, `60`). Solo se aceptan las siguientes opciones:

| Ámbito | Opciones |
|-------|-------|
| Ambos | `-c`/`--ignore-certs`, `-f`/`--force`, `--force-with-deps`, `-i`/`--ignore-errors`, `-n`/`--no-deps`, `-s`/`--server <url>`, `--timeout <seconds>`, `-v`…`-vvvv`/`--verbose` |
| Solo roles | `-g`/`--keep-scm-meta` |
| Solo colecciones | `--pre`, `-U`/`--upgrade`, `--offline`, `--no-cache`, `--clear-response-cache`, `--disable-gpg-verify`, `--keyring <path>`, `--signature <url>`, `--required-valid-signature-count <n>`, `--ignore-signature-status-code(s) <code>` |

Cualquier otra cosa se rechaza al guardar la plantilla. En particular, `--token`/`--api-key` no están permitidos porque los argumentos de línea de comandos son visibles en la lista de procesos: configure las credenciales de Galaxy mediante variables de entorno (por ejemplo, `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`) en un grupo de variables. El archivo de requisitos (`-r`) lo establece Semaphore, y las rutas de instalación (`-p`, `--roles-path`, `--collections-path`) no se aceptan deliberadamente para que una plantilla no pueda escribir fuera del repositorio: establezca `roles_path`/`collections_path` en `ansible.cfg` o mediante `ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH`.

### Paralelismo (`--forks` / `-f`) {#parallelism---forks---f}

Controle a cuántos hosts se conecta Ansible en paralelo pasando `--forks` o
`-f` en los **Argumentos adicionales de la CLI** de la plantilla. Los argumentos deben ser JSON válido:
use un array de tokens separados:

```json
["--forks", "10"]
```

También se admite la forma abreviada:

```json
["-f", "10"]
```

Cuando la opción **Allow override arguments in task** está habilitada en la plantilla, una tarea puede
proporcionar su propio valor de forks en el momento de la ejecución. Ansible recibe los argumentos de la plantilla y los de la
tarea; prevalece el último `--forks` / `-f` de la línea de comandos.

Si los argumentos no son JSON válido, la tarea falla con un error de validación
descriptivo antes de que comience la ejecución.

### Autenticación {#authentication}

La autenticación de los hosts del playbook se realiza usando las referencias de usuario del Almacén de claves indicadas en el inventario. El usuario para SSH se determina mediante el usuario opcional del elemento del Almacén de claves.

### Varias contraseñas de vault {#multiple-vault-passwords}

Puede asociar a una plantilla varias contraseñas de Vault del Almacén de claves. Durante la ejecución, Ansible intentará descifrar usando las contraseñas proporcionadas.

### Nivel de verbosidad {#verbosity-level}

Puede ajustar la verbosidad de Ansible para una tarea (por ejemplo, `-v`, `-vvv`) desde el formulario de la plantilla o de la tarea para facilitar la resolución de problemas.
