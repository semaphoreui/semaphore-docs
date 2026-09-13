---
title: "Backend HTTP"
sidebar_custom_props:
  edition: pro
---

# Backend HTTP <Pro />

El backend HTTP de Semaphore UI para Terraform almacena y gestiona de forma segura los archivos de estado de Terraform directamente dentro de Semaphore. Disponible en el plan Pro, ofrece varias ventajas clave.

## Características {#features}

- **Almacenamiento seguro del estado**: los archivos de estado se <!-- encrypted and--> almacenan de forma segura dentro de Semaphore.
- **Bloqueo del estado**: evita modificaciones concurrentes del mismo archivo de estado.
- **Historial de versiones**: haga seguimiento de los cambios en el estado de su infraestructura a lo largo del tiempo.
- **Integración con la interfaz**: gestione los archivos de estado directamente desde la interfaz de Semaphore.

## Configuración {#configuration}

Para empezar a usar el backend HTTP integrado, primero necesita crear un workspace para su plantilla de tarea de Terraform.

Para añadir un workspace, vaya a la pestaña **Workspaces** de su plantilla de Terraform/OpenTofu.

Al crear un workspace, se le pedirá que seleccione una clave SSH para clonar los módulos privados utilizados en su código de Terraform. Si no usa módulos privados, simplemente seleccione la opción `None`.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### Uso del backend HTTP en tareas {#using-the-http-backend-in-tasks}

Para usar el backend HTTP integrado para almacenar el estado de sus tareas de Terraform, no necesita configurar manualmente el backend en su código de Terraform. Semaphore puede crear automáticamente el archivo de configuración durante la ejecución. Para habilitarlo, simplemente marque la opción **Sobrescribir la configuración del backend** en los ajustes de su plantilla de tarea, como se muestra en la captura de pantalla siguiente.


Opcionalmente, puede especificar el nombre del archivo de configuración que se creará dinámicamente durante la ejecución. Esto resulta útil si su código ya contiene un archivo de configuración del backend y necesita sobrescribirlo dinámicamente para trabajar con el backend integrado de Semaphore.

### Uso del backend HTTP fuera de Semaphore {#using-the-http-backend-outside-semaphore}

Puede usar el backend HTTP integrado no solo al ejecutar tareas dentro de Semaphore, sino también al ejecutar código de Terraform fuera de Semaphore, por ejemplo desde su terminal local.

Para habilitarlo, Semaphore permite crear alias (endpoints HTTP únicos) para su almacenamiento de estado. Estos alias facilitan la referencia a sus archivos de estado desde entornos externos.

Para configurarlo, vaya a la pestaña **Workspaces**, seleccione el workspace deseado y añada un alias. También deberá elegir una clave con nombre de usuario y contraseña, que se usará para autenticar el acceso al backend.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

Después de esto, necesita añadir la configuración del backend a su código de Terraform:

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

Ahora Terraform usará el backend HTTP integrado de Semaphore incluso al ejecutarse desde su terminal:

```
terraform apply
```
