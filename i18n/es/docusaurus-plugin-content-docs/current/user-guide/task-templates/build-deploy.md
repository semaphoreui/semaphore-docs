# Plantillas de compilación y despliegue

Además de las plantillas simples de tipo **Task**, Semaphore tiene dos tipos de plantilla que forman una canalización sencilla: **Build** crea un artefacto con versión y **Deploy** envía la versión elegida a los servidores. Ambos tipos se seleccionan en el formulario de la plantilla y cambian lo que ve el usuario al iniciar una tarea.

## Plantillas de compilación {#build-templates}

Una plantilla de compilación produce un artefacto: un tarball, una imagen de contenedor, un paquete. Cada tarea de compilación recibe una versión autoincrementada, a partir de la **Versión inicial** de la plantilla (por ejemplo, `1.0.0`). La versión se muestra en la columna **Versión** de la lista de plantillas y del historial de tareas.

<div class="DialogScreenshot">
  ![Cuadro de diálogo Nueva tarea de una plantilla de compilación](/assets/task-new-build.webp)
</div>

Use la versión en su playbook mediante `semaphore_vars.task_details.target_version` para nombrar el artefacto.

## Plantillas de despliegue {#deploy-templates}

Una plantilla de despliegue se vincula a una plantilla de compilación mediante el campo **Plantilla de compilación**. Cuando un usuario hace clic en **Deploy**, el cuadro de diálogo Nueva tarea solicita la **Versión de compilación** que se desplegará; la última compilación correcta aparece preseleccionada.

<div class="DialogScreenshot">
![Cuadro de diálogo Nueva tarea de una plantilla de despliegue](/assets/task-new-deploy.webp)
</div>

Habilite **Autorun** en la plantilla de despliegue para iniciar un despliegue automáticamente después de cada compilación correcta. La versión que se desplegará está disponible en el playbook como `semaphore_vars.task_details.incoming_version`.

## La variable `semaphore_vars` {#the-semaphore_vars-variable}

Semaphore pasa la variable `semaphore_vars` a cada playbook de Ansible que ejecuta. Úsela para saber qué tipo de tarea se ejecutó, qué versión debe compilarse o desplegarse, quién ejecutó la tarea y el mensaje de la tarea.

Ejemplo para las tareas `build`:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Ejemplo para las tareas `deploy`:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

En las plantillas de **Bash**, **PowerShell** y **Python**, Semaphore proporciona los mismos valores de `task_details` como variables de entorno:

| Campo de `task_details` | Variable de entorno | Notas |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` o `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Usuario que inició la tarea |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Mensaje de la tarea |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Presente en las tareas `build` |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Presente en las tareas `deploy` |

Ejemplo para Bash:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Ejemplo para PowerShell:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Ejemplo para Python:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Canalización de ejemplo {#example-pipeline}

Un rol de Ansible de `build`:

1. Obtener el código fuente de la aplicación de GitHub.
2. Compilar el código fuente.
3. Empaquetar el binario en `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`.
4. Subir el tarball a un bucket de S3.

Un rol de Ansible de `deploy`:

1. Descargar `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` del bucket de S3 a los servidores de destino.
2. Desempaquetarlo en el directorio de destino.
3. Crear o actualizar los archivos de configuración.
4. Reiniciar el servicio de la aplicación.

Para encadenar más de dos pasos, añadir aprobaciones o ramificar en caso de error, use [Flujos de trabajo](../workflows).
