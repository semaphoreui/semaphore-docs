
# Terraform/OpenTofu

Con Semaphore UI puede ejecutar código de Terraform. Para ello, necesita crear una **plantilla de código Terraform**.

1. Vaya a la sección **Plantillas de tareas** y haga clic en el botón **Nueva plantilla**.
2. Seleccione **Terraform** como tipo de aplicación.
3. Configure la plantilla y haga clic en el botón **Crear**.
4. Haga clic en **Ejecutar** para ejecutar la plantilla.

## Paso de variables {#passing-variables}

Las variables de los **grupos de variables** seleccionados se inyectan como variables de entorno. Añada el prefijo `TF_VAR_` a los nombres para que Terraform las reconozca como variables de entrada:

| Clave del grupo de variables | Variable de Terraform |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

Para valores sensibles, utilice la pestaña **Secretos** de los grupos de variables: se cifran en reposo.

## Workspaces {#workspaces}

Semaphore admite de forma nativa los workspaces de Terraform/OpenTofu. Consulte [Workspaces](./workspaces) para crear y cambiar de workspace y usar claves SSH para módulos privados.

## Sobrescritura del backend y backend HTTP (Pro) {#backend-override-and-http-backend-pro}

Puede sobrescribir el backend en una plantilla para usar el backend HTTP integrado sin modificar su código de Terraform. Consulte [Backend HTTP (Pro)](./states) para más detalles.

## Indicador destroy y migración de estado {#destroy-flag-and-state-migration}

El diálogo de ejecución de la tarea incluye interruptores para `-destroy` y `-migrate-state`. Utilícelos al desmantelar infraestructura o al migrar el estado de Terraform.

## Notas {#notes}

- Semaphore ejecuta `terraform init` automáticamente antes de cada ejecución.
- El estado lo gestiona el backend configurado en su código de Terraform (local, S3, GCS, etc.), a menos que utilice el backend HTTP integrado (Pro).