
# PowerShell

Semaphore puede ejecutar scripts de PowerShell en hosts Windows (o desde un runner de Windows). Para ello, cree una plantilla de tarea **PowerShell**.

## Creación de una plantilla PowerShell {#creating-a-powershell-template}

1. Vaya a la sección **Plantillas de tareas** y haga clic en el botón **Nueva plantilla**.
2. Seleccione **PowerShell** como tipo de aplicación.
3. Configure la plantilla:

| Campo | Descripción |
|---|---|
| **Nombre** | Un nombre descriptivo para la plantilla |
| **Repositorio** | Repositorio que contiene su script `.ps1` |
| **Playbook / Script** | Ruta relativa al script, p. ej. `scripts/deploy.ps1` |
| **Grupos de variables** | Grupos de variables cuyos valores se inyectan como variables de entorno |

4. Haga clic en **Crear**.
5. Haga clic en **Ejecutar** para ejecutar la plantilla.

## Paso de variables a los scripts {#passing-variables-to-scripts}

Las variables de los **Grupos de variables** seleccionados se inyectan como variables de entorno antes de que se ejecute el script. Acceda a ellas en PowerShell con `$env:VARIABLE_NAME`:

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Ejecución en hosts Windows {#running-on-windows-hosts}

Las plantillas de PowerShell requieren una de estas opciones:
- Un **runner de Windows**: un runner de Semaphore desplegado en un host Windows. Consulte [Runners](/admin-guide/runners).
- Que el propio servidor de Semaphore se ejecute en Windows.

## Notas {#notes}

- Los scripts se ejecutan de forma no interactiva. Evite los prompts que requieren la entrada del usuario.
- El código de salida `0` significa éxito; cualquier código de salida distinto de cero marca la tarea como fallida.
