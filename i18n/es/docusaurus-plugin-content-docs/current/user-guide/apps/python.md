
# Python

Semaphore puede ejecutar scripts de Python directamente. Para ello, cree una plantilla de tarea **Python**.

## Creación de una plantilla Python {#creating-a-python-template}

1. Vaya a la sección **Plantillas de tareas** y haga clic en el botón **Nueva plantilla**.
2. Seleccione **Python** como tipo de aplicación.
3. Configure la plantilla:

| Campo | Descripción |
|---|---|
| **Nombre** | Un nombre descriptivo para la plantilla |
| **Repositorio** | Repositorio que contiene su script `.py` |
| **Playbook / Script** | Ruta relativa al script, p. ej. `scripts/deploy.py` |
| **Grupos de variables** | Grupos de variables cuyos valores se inyectan como variables de entorno |

4. Haga clic en **Crear**.
5. Haga clic en **Ejecutar** para ejecutar la plantilla.

## Paso de variables a los scripts {#passing-variables-to-scripts}

Las variables de los **Grupos de variables** seleccionados se inyectan como variables de entorno. Acceda a ellas en Python con `os.environ`:

```python
import os

target = os.environ.get("TARGET_HOST")
print(f"Deploying to {target}")
```

## Versión de Python y dependencias {#python-version-and-dependencies}

Semaphore usa el binario `python3` que se encuentre en el `PATH` del entorno de ejecución.

- **Instalación mediante binario/paquete**: asegúrese de que el `python3` correcto esté instalado en el host.
- **Docker**: use una imagen personalizada con la versión de Python requerida.
- **Docker (paquetes adicionales)**: monte un `requirements.txt` en `/etc/semaphore/requirements.txt` en el contenedor del servidor o del runner. Semaphore lo instala en el entorno virtual de Python incluido en cada arranque del contenedor. Consulte [Instalación de dependencias adicionales de Python](/admin-guide/installation/docker#installing-additional-python-dependencies).

## Notas {#notes}

- Los scripts se ejecutan de forma no interactiva.
- El código de salida `0` significa éxito; cualquier código de salida distinto de cero marca la tarea como fallida.
