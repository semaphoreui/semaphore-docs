
# Espacios de trabajo

![Pestaña Espacios de trabajo de una plantilla](/assets/template-workspaces.webp)

Semaphore ofrece compatibilidad nativa con los espacios de trabajo de Terraform, lo que le permite gestionar varios entornos y configuraciones dentro de un mismo proyecto. Esta funcionalidad le ayuda a mantener archivos de estado separados para distintos entornos, como desarrollo, preproducción y producción.

## Funcionalidades {#features}

- **Gestión de espacios de trabajo**: cree, cambie y elimine espacios de trabajo directamente desde la interfaz de Semaphore.
- **Aislamiento del estado**: cada espacio de trabajo mantiene su propio archivo de estado, lo que evita conflictos entre entornos.
- **Variables de entorno**: configure variables de entorno específicas de cada espacio de trabajo.
- **Selección del espacio de trabajo**: elija el espacio de trabajo de destino al ejecutar comandos de Terraform.

## Uso de los espacios de trabajo en Semaphore {#using-workspaces-in-semaphore}

### Crear un espacio de trabajo {#creating-a-workspace}

En la sección **Espacios de trabajo** de la plantilla de Terraform/OpenTofu en la que desee añadir un espacio de trabajo, siga estos pasos:

1. Haga clic en el botón ➕.  
2. En el menú que aparece, seleccione **Nuevo espacio de trabajo**.  
3. En el cuadro de diálogo, introduzca el nombre del espacio de trabajo y seleccione la clave SSH que se usará para clonar los módulos.  
4. Haga clic en el botón **Crear** para añadir el nuevo espacio de trabajo a la plantilla.  
5. Ya puede usar este espacio de trabajo para ejecutar tareas.


### Cambiar de espacio de trabajo {#switching-workspaces}

Puede establecer el espacio de trabajo predeterminado de una plantilla de Terraform/OpenTofu haciendo clic en el botón **MAKE DEFAULT**.


### Variables específicas del espacio de trabajo {#workspace-specific-variables}

Actualmente, Semaphore no admite variables específicas de cada espacio de trabajo.
