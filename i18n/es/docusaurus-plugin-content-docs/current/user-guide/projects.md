# Proyectos

Un proyecto es la principal unidad de separación en Semaphore UI. Todos los recursos con los que trabaja pertenecen exactamente a un proyecto: plantillas de tareas, tareas, inventarios, grupos de variables, claves, repositorios, integraciones, programaciones, runners y miembros del equipo.

Los proyectos son independientes entre sí, por lo que puede usarlos para organizar sistemas sin relación dentro de una misma instalación de Semaphore: distintos equipos, infraestructuras, entornos o aplicaciones.

## Navegación por el proyecto {#project-navigation}

Cuando abre un proyecto, la barra lateral izquierda muestra el selector de proyectos en la parte superior y todas las secciones del proyecto debajo. Bajo el nombre del proyecto aparece su rol en este proyecto (por ejemplo, `task_runner`). El rol define qué secciones puede modificar; consulte [Equipos](./team).

![Panel del proyecto con la pestaña Historial](/assets/project-dashboard-history.webp)

| Sección | Qué contiene |
|---|---|
| **Panel** | Las pestañas [Historial](./projects/history), [Estadísticas](./projects/stats), [Actividad](./projects/activity) y, para los propietarios del proyecto, [Ajustes](./projects/settings) |
| **Plantillas de tareas** | Definiciones de qué ejecutar y cómo: [Plantillas de tareas](./task-templates) |
| **Flujos de trabajo** (Pro) | Grafos de plantillas con aprobaciones y ramificaciones: [Flujos de trabajo](./workflows) |
| **Programación** | Programaciones de tipo cron para las plantillas: [Programaciones](./schedules) |
| **Inventario** | Hosts y ajustes de conexión para Ansible, espacios de trabajo para Terraform: [Inventario](./inventory) |
| **Grupos de variables** | Variables y secretos reutilizables que se inyectan en las tareas: [Grupos de variables](./environment) |
| **Almacén de claves** | Credenciales cifradas y almacenamientos externos de secretos: [Almacén de claves](./key-store) |
| **Repositorios** | Repositorios Git o rutas locales con sus playbooks y scripts: [Repositorios](./repositories) |
| **Integraciones** | Webhooks entrantes que inician tareas: [Integraciones](./integrations) |
| **Equipo** | Miembros y sus roles: [Equipos](./team) |
| **Runners** (Pro) | Runners asociados a este proyecto: [Runners del proyecto](./projects/runners) |

En la parte inferior de la barra lateral están el interruptor del modo oscuro, el selector de idioma y su [menú de cuenta](./account).

## Crear un proyecto {#creating-a-project}

La creación de proyectos está disponible para los administradores. Los usuarios normales solo pueden crear proyectos cuando la opción del servidor `non_admin_can_create_project` (`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`) está habilitada; consulte [Configuración](/admin-guide/configuration).

1. Haga clic en el nombre del proyecto en la parte superior de la barra lateral y elija **Nuevo proyecto**.
2. Rellene el formulario:

| Campo | Descripción |
|---|---|
| **Nombre del proyecto** | Nombre visible del proyecto. Puede cambiarlo más adelante en [Ajustes](./projects/settings). |
| **Número máximo de tareas paralelas** | Opcional. Cuántas tareas de este proyecto pueden ejecutarse a la vez. Déjelo vacío para no imponer ningún límite. Las tareas que superen el límite esperan en la cola con el estado `waiting`. |
| **Demo** | Rellena el nuevo proyecto con datos de ejemplo: un repositorio de demostración público, un inventario, una clave y varias plantillas de tareas. Úselo para probar Semaphore sin configurar nada. |

3. Haga clic en **Crear**.

El usuario que crea un proyecto se convierte en su **Propietario**.

## Cambiar de proyecto {#switching-between-projects}

Haga clic en el nombre del proyecto en la parte superior de la barra lateral para ver todos los proyectos de los que es miembro y cambiar entre ellos. El último proyecto abierto se recuerda en su navegador.

## Copia de seguridad y restauración {#backup-and-restore}

Un proyecto puede exportarse a un archivo JSON e importarse en la misma instancia de Semaphore o en otra:

- **Exportar**: abra **Panel → Ajustes** y haga clic en **Copia de seguridad del proyecto** (consulte [Ajustes](./projects/settings)).
- **Importar**: haga clic en el nombre del proyecto en la barra lateral, elija **Restaurar proyecto** y suba el archivo de copia de seguridad.

Ambas operaciones también están disponibles desde la línea de comandos; consulte [CLI: Proyectos](/admin-guide/cli/projects).
