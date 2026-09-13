# Tareas

Una tarea es una única ejecución de una [plantilla de tareas](./task-templates): una ejecución de un playbook de Ansible, de una configuración de Terraform/OpenTofu/Terragrunt o de un script de Bash, PowerShell o Python. Cada tarea conserva su propio registro, estado y detalles, de modo que siempre puede ver qué se ejecutó, cuándo, por quién y con qué revisión del repositorio.

## Iniciar una tarea {#starting-a-task}

Necesita el rol **Task Runner** o superior en el proyecto (consulte [Equipos](./team)). Puede iniciar una tarea desde dos lugares:

- En **Plantillas de tareas**, haga clic en el botón de **reproducción** de la fila de la plantilla.
- En la página de la plantilla, haga clic en el botón de la esquina superior derecha. Su etiqueta depende del tipo de plantilla: **Run**, **Build** o **Deploy**.

Ambas opciones abren el cuadro de diálogo **Nueva tarea**. Su contenido depende de la aplicación y de las opciones habilitadas en la plantilla.

![Cuadro de diálogo Nueva tarea para una plantilla de Ansible](/assets/task-new-ansible.webp)

| Campo | Se muestra en | Descripción |
|---|---|---|
| **Mensaje** | todas las plantillas | Nota opcional que se guarda con la tarea y se muestra en el historial y en las alertas. |
| **Versión de la compilación** | plantillas de despliegue | Qué compilación se despliega. De forma predeterminada se selecciona la última compilación correcta. Consulte [Plantillas de compilación y despliegue](./task-templates/build-deploy). |
| Variables de encuesta | plantillas con [variables de encuesta](./task-templates/survey-vars) | Un campo por variable; las variables obligatorias deben rellenarse. |
| **Dry Run** `--check`, **Diff** `--diff` | Ansible | Ejecutar el playbook en modo de comprobación o mostrar los cambios en los archivos. Las demás solicitudes de Ansible (Limit, Tags, Skip tags, Debug) aparecen cuando se habilitan en la plantilla; consulte [Solicitudes](./task-templates/prompts). |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | Ejecutar solo `plan`, añadir `-destroy`, `-auto-approve`, `-upgrade` o `-reconfigure`. Consulte [Terraform/OpenTofu](./apps/terraform). |
| **Rama**, **Inventario**, **CLI args** | cualquier aplicación | Sustituir los valores de la plantilla para esta ejecución. Cada sustitución debe estar permitida en los ajustes de la plantilla. |

![Cuadro de diálogo Nueva tarea para una plantilla de Terraform](/assets/task-new-terraform.webp)

Haga clic en **Run** (o **Build** / **Deploy**) para poner la tarea en la cola.

### Cola y ejecución paralela {#queue-and-parallel-execution}

Las tareas de una misma plantilla se ejecutan una tras otra, a menos que la opción **Permitir tareas paralelas** esté habilitada en la plantilla. El proyecto también puede limitar el número total de tareas en ejecución con **Número máximo de tareas paralelas** en los [ajustes del proyecto](./projects/settings). Una tarea que tiene que esperar permanece en el estado `waiting` y se inicia automáticamente cuando hay un hueco libre.

## Ventana de la tarea {#task-window}

Al hacer clic en una tarea en cualquier parte de la interfaz se abre la ventana de la tarea. El encabezado muestra la plantilla, el número de la tarea, el mensaje del commit de la revisión del repositorio, el distintivo de estado, quién inició la tarea y cuándo, y la duración. El icono de las flechas amplía la ventana a pantalla completa.

![Registro de la tarea](/assets/task-log.webp)

| Pestaña | Contenido |
|---|---|
| **Registro** | Salida en directo de la tarea con marcas de tiempo. El registro se transmite mientras la tarea se ejecuta. **Raw log** abre la salida sin procesar en una nueva pestaña del navegador. |
| **Detalles** | Información de la plantilla (aplicación, plantilla), información del commit (mensaje y hash) e información de la ejecución: mensaje, hora de creación, de inicio y de finalización, duración y, cuando se han definido, el runner, la rama, el limit y las variables usadas en la ejecución. |
| **Resumen** (Pro) | En las tareas de Ansible: cuántos hosts terminaron correctamente y cuántos fallaron, con una tabla de las tareas fallidas por servidor. |

![Detalles de la tarea](/assets/task-details.webp)

![Resumen de la tarea](/assets/task-summary.webp)

## Estados de las tareas {#task-statuses}

| Estado | Significado |
|---|---|
| `waiting` | La tarea está en la cola: se está ejecutando otra tarea de la misma plantilla, se ha alcanzado el límite del proyecto o todavía no hay ningún runner disponible. |
| `starting` | Un runner ha tomado la tarea y está preparando el repositorio y el entorno. |
| `waiting_confirmation` | La herramienta ha formulado una pregunta y espera a un usuario, por ejemplo `terraform apply` sin **Auto Approve** o un script que lee la entrada. Use **Confirm** o **Reject** en la ventana de la tarea. |
| `confirmed` | Un usuario ha confirmado la pregunta; la tarea continúa. |
| `rejected` | Un usuario ha rechazado la pregunta; la tarea finaliza. |
| `running` | El playbook o el script se está ejecutando. |
| `stopping` | Se ha solicitado la detención y el proceso se está terminando. |
| `stopped` | Un usuario detuvo la tarea. |
| `success` | Terminó con el código de salida 0. |
| `error` | Terminó con un código de salida distinto de cero o no pudo iniciarse. Se muestra como **Failed** en la interfaz. |

## Detener tareas {#stopping-tasks}

Abra la ventana de la tarea de una tarea en ejecución y haga clic en **Stop**. Semaphore envía una señal de terminación y la tarea pasa al estado `stopping` mientras el proceso finaliza. Si el proceso no reacciona, el botón cambia a **Force Stop**; haga clic en él para matar el proceso de inmediato.

Para detener todas las tareas en ejecución y en cola de una plantilla, abra la página de la plantilla y use **Stop all**. El menú desplegable ofrece tanto **Stop** como **Force stop**.

<div style={{maxWidth: 200}}>

![Menú Stop all](/assets/task-stop-all-menu.webp)

</div>

## Volver a ejecutar una tarea {#running-a-task-again}

En la pestaña **Tareas** de una plantilla, cada fila tiene un botón de **reejecución**. Abre el cuadro de diálogo Nueva tarea con el mensaje y los parámetros de esa tarea ya rellenados.

![Tareas de la plantilla con botones de reejecución](/assets/template-tasks.webp)

## Dónde se listan las tareas {#where-tasks-are-listed}

- **Panel de control → Historial**: todas las tareas del proyecto; consulte [Historial](./projects/history).
- **Página de la plantilla → Tareas**: las tareas de una sola plantilla.
- **Plantillas de tareas**: despliegue una fila con la flecha de la izquierda para ver las últimas tareas de la plantilla sin salir de la lista.

## Retención de registros {#log-retention}

De forma predeterminada, las tareas y los registros se conservan para siempre. Use `max_tasks_per_template` para conservar solo las últimas tareas de cada plantilla; consulte [Historial](./projects/history#task-retention).
