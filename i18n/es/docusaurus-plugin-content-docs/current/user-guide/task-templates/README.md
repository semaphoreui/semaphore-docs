# Plantillas de tareas

Una plantilla de tareas define qué ejecutar y cómo: la aplicación, el repositorio y el archivo que se ejecuta, el inventario, los grupos de variables, las credenciales y las opciones que un usuario puede cambiar al iniciar una tarea. Cada [tarea](../tasks) se crea a partir de una plantilla.

Las plantillas admiten las siguientes aplicaciones:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) y [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

Los administradores pueden habilitar o deshabilitar aplicaciones y añadir las suyas propias; consulte [Aplicaciones](/user-guide/apps).

## Lista de plantillas {#template-list}

La sección **Plantillas de tareas** muestra todas las plantillas del proyecto.

![Lista de plantillas](/assets/templates-list.webp)

| Columna | Contenido |
|---|---|
| **Nombre** | Nombre de la plantilla con el icono de la aplicación. El botón de **reproducción** inicia una nueva tarea. |
| **Versión** | La última versión compilada en las plantillas de compilación y despliegue; en los demás casos, el icono del resultado de la última tarea. |
| **Estado** | Distintivo de estado de la última tarea, o *Sin lanzar*. |
| **Última tarea** | Número de la última tarea y quién la inició. |
| **Playbook** | El archivo que ejecuta la plantilla. |
| **Inventario**, **Grupos de variables**, **Repositorio** | Recursos asociados a la plantilla. |

Las pestañas situadas sobre la lista son [vistas](./views): grupos de plantillas con nombre. El icono del engranaje de la esquina superior derecha le permite elegir qué columnas se muestran. Haga clic en la flecha situada a la izquierda de una fila para desplegar las últimas tareas de esa plantilla.

![Fila de plantilla desplegada](/assets/templates-list-expanded.webp)

## Página de la plantilla {#template-page}

Haga clic en el nombre de una plantilla para abrir su página. El botón de la esquina superior derecha inicia una tarea (**Run**, **Build** o **Deploy**, según el tipo); **Stop all** detiene todas las tareas en ejecución o en cola de la plantilla.

| Pestaña | Contenido |
|---|---|
| **Tareas** | Tareas de esta plantilla, con un botón de **reejecución** en cada fila. |
| **Detalles** | El playbook, el tipo, el inventario, los grupos de variables y el repositorio, además del gráfico de estado de las tareas con los mismos filtros que [Estadísticas](../projects/stats). |
| **Espacios de trabajo** | Solo en las plantillas de Terraform, OpenTofu y Terragrunt: la lista de espacios de trabajo; consulte [Espacios de trabajo](../apps/terraform/workspaces). |

![Detalles de la plantilla](/assets/template-details.webp)

## Tipos de plantilla {#template-types}

| Tipo | Finalidad |
|---|---|
| **Task** | Una ejecución simple. Es el tipo predeterminado. |
| **Build** | Produce un artefacto y le asigna una versión autoincrementada. |
| **Deploy** | Despliega una versión producida por una plantilla de compilación. |

Las plantillas de compilación y despliegue, y las `semaphore_vars` que pasan a los playbooks, se describen en [Plantillas de compilación y despliegue](./build-deploy).

## Formulario de la plantilla {#template-form}

Los usuarios con el rol **Manager** o superior pueden crear y editar plantillas con **Nueva plantilla** y el icono del lápiz. El formulario se organiza en los siguientes grupos. Los campos marcados con el nombre de una aplicación solo aparecen para esa aplicación.

### Campos comunes {#common-fields}

| Campo | Descripción |
|---|---|
| **Nombre** | Obligatorio. Nombre de la plantilla. |
| **Descripción** | Texto opcional que se muestra bajo el nombre. |
| **Aplicación** | Aplicación que se ejecutará. |
| **Repositorio** | Repositorio con el playbook o el script; consulte [Repositorios](../repositories). |
| **Rama** | Rama de Git que se descargará. Vacío significa la rama configurada en el repositorio. |
| **Nombre del archivo del playbook o script** | Ruta al archivo relativa a la raíz del repositorio. En las aplicaciones de Terraform: el subdirectorio con la configuración. |
| **Directorio de trabajo distinto** | Ejecutar la herramienta desde otro directorio del repositorio. |
| **Inventario** | Inventario de Ansible, o un espacio de trabajo en las aplicaciones de Terraform. |
| **Grupos de variables** | Uno o varios grupos de variables cuyas variables y secretos se inyectan en la tarea; consulte [Grupos de variables](../environment). |
| **Contraseña de vault** (Ansible) | Claves usadas para desbloquear Ansible Vault; consulte [Varias contraseñas de vault](../apps/ansible#multiple-vault-passwords). |
| **Vista** | En qué pestaña de [vista](./views) se muestra la plantilla. |
| **CLI args** | Argumentos de línea de comandos adicionales como array JSON, por ejemplo `["-vvv"]`. |

### Campos específicos del tipo {#type-specific-fields}

| Campo | Tipo | Descripción |
|---|---|---|
| **Versión inicial** | Build | La primera versión que se asignará, por ejemplo `1.0.0`. |
| **Plantilla de compilación** | Deploy | La plantilla de compilación cuyos artefactos despliega esta plantilla. |
| **Autorun** | Deploy | Iniciar un despliegue automáticamente después de cada compilación correcta. |

### Opciones avanzadas {#advanced-options}

| Campo | Descripción |
|---|---|
| **Permitir tareas paralelas** | Permitir que varias tareas de esta plantilla se ejecuten a la vez; consulte [Tareas paralelas](#parallel-tasks). |
| **Alertas**, **Enviar si hay éxito**, **Enviar si hay error** | Si se envían notificaciones de las tareas de esta plantilla y con qué resultados. Las notificaciones también requieren la opción **Permitir alertas para este proyecto** en los [ajustes del proyecto](../projects/settings). |
| **Etiqueta de runner** (Pro) | Ejecutar las tareas solo en los runners que tengan esta etiqueta; consulte [Runners del proyecto](../projects/runners). |
| **Imagen del ejecutor** | Imagen de contenedor para los runners de Docker y Kubernetes; consulte [Imagen del ejecutor](#executor-image-docker-and-kubernetes-runners). |
| **Emitir JWT al ejecutor de la tarea**, **Audiencia del JWT**, **TTL del JWT** | Proporcionar a la tarea un token firmado; consulte [JWT de tareas](./jwt). |
| **Ejecutar la tarea automáticamente si se encuentra un nuevo commit de git** | Consultar el repositorio en el intervalo indicado e iniciar una tarea cuando la rama avance. |
| **Variables de encuesta** | Datos que el usuario rellena al iniciar una tarea; consulte [Variables de encuesta](./survey-vars). |

### Solicitudes {#prompts}

Las solicitudes son casillas de verificación que permiten al usuario cambiar opciones integradas en el cuadro de diálogo Nueva tarea: rama, inventario, argumentos de la CLI y, en el caso de Ansible, limit, tags, skip tags, nivel de depuración e instalación de Galaxy. Consulte [Solicitudes](./prompts).

### Opciones de la aplicación {#application-options}

- **Ansible**: opciones de limit, tags, skip tags e instalación de Galaxy; consulte [Ansible](../apps/ansible).
- **Terraform/OpenTofu/Terragrunt**: aprobación automática y sustitución del backend; consulte [Terraform/OpenTofu](../apps/terraform) y [Backend HTTP](../apps/terraform/states).

---

## Tareas paralelas {#parallel-tasks}

De forma predeterminada, las tareas de una misma plantilla se ejecutan de forma secuencial. Para permitir ejecuciones simultáneas de la misma plantilla, habilite la opción «Permitir tareas paralelas» en los ajustes de la plantilla.

## Imagen del ejecutor (runners de Docker y Kubernetes) {#executor-image-docker-and-kubernetes-runners}

Cuando un runner del proyecto usa el ejecutor **Docker** (Pro) o **Kubernetes** (Enterprise), cada tarea se ejecuta normalmente en la imagen de trabajo predeterminada configurada en el runner (por ejemplo, `semaphoreui/job:latest`). Puede sustituir esa imagen en cada plantilla.

1. Abra los ajustes de la plantilla
2. Establezca **Imagen del ejecutor** con la referencia de la imagen de contenedor (por ejemplo, `my-registry/ansible:2.16` o `semaphoreui/job:latest`)
3. Guarde la plantilla

**Comportamiento**:
- Solo los ejecutores de runner **Docker** y **Kubernetes** tienen en cuenta este campo; el ejecutor local lo ignora
- Deje el campo vacío para usar la imagen predeterminada del runner definida en `runner.executor.docker.image` o `runner.executor.k8s.image`
- Vaciar el campo en la interfaz elimina la sustitución

**Casos de uso**:
- Plantillas que necesitan un conjunto de herramientas diferente (una versión antigua de Ansible, una versión concreta de Terraform, paquetes del sistema adicionales incluidos en una imagen personalizada)
- Imágenes aisladas para plantillas sensibles desde el punto de vista de la seguridad, sin cambiar el valor predeterminado de todo el runner

Consulte [Configuración del runner](/admin-guide/configuration) para los ajustes de la imagen predeterminada y [Runners del proyecto](/user-guide/projects/runners) para la configuración del ejecutor.
