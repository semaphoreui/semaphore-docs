# Ajustes

La pestaña **Ajustes** del panel del proyecto está disponible para los **Propietarios** del proyecto. Contiene las opciones generales del proyecto y las acciones destructivas.

![Ajustes del proyecto](/assets/project-settings-general.webp)

## General {#general}

| Campo | Descripción |
|---|---|
| **Nombre del proyecto** | Nombre visible que se muestra en el selector de proyectos y en las alertas. |
| **Número máximo de tareas paralelas** | Opcional. Número máximo de tareas de este proyecto que pueden ejecutarse a la vez. Déjelo vacío para no imponer ningún límite. Las tareas que superen el límite permanecen en la cola con el estado `waiting` hasta que se libere un hueco. |
| **Telegram Chat ID** | Opcional. Envía las alertas de este proyecto a un chat de Telegram distinto del configurado globalmente. Consulte [Notificaciones de Telegram](/admin-guide/notifications/telegram#per-project-chat-ids). |
| **Permitir alertas para este proyecto** | Interruptor general de las notificaciones. Cuando está desactivado, ningún canal envía alertas sobre las tareas de este proyecto, aunque el canal esté configurado en el servidor. |

**Probar alertas** envía un mensaje de prueba a través de todos los [canales de notificación](/admin-guide/notifications) configurados, de modo que pueda verificar la configuración del servidor sin ejecutar una tarea. **Guardar** aplica los cambios.

## Zona de peligro {#danger-zone}

| Acción | Efecto |
|---|---|
| **Copia de seguridad del proyecto** | Descarga un archivo JSON con la definición del proyecto: plantillas, inventarios, grupos de variables, claves (sin los valores secretos), repositorios, programaciones, vistas e integraciones. Restáurelo mediante **Nuevo proyecto → Restaurar proyecto** o con [`semaphore projects import`](/reference/cli/projects). |
| **Borrar caché** | Elimina del servidor todos los archivos en caché del proyecto, por ejemplo los repositorios clonados. La siguiente tarea vuelve a clonar los repositorios. La acción es irreversible. |
| **Eliminar proyecto** | Elimina el proyecto con todos sus recursos y su historial de tareas. No se puede deshacer. |

## Ajustes relacionados {#related-settings}

- Miembros y roles: [Equipos](../team)
- Runners asociados al proyecto y etiquetas de runner: [Runners del proyecto](./runners)
- Los canales de notificación se configuran en el servidor: [Notificaciones](/admin-guide/notifications)
