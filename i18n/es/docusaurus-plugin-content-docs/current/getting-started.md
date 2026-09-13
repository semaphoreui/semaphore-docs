# Primeros pasos

Esta página le guía desde una instalación nueva hasta su primera tarea ejecutada con éxito. Cada paso enlaza a la página con los detalles.

## De cero a la primera tarea {#from-zero-to-first-task}

1. **Instale Semaphore** con el método que prefiera: [Instalación](/admin-guide/installation).
2. **Inicie sesión** con el usuario administrador que creó durante la configuración, o mediante las variables `SEMAPHORE_ADMIN_*` en Docker.
3. **Cree un proyecto.** Un proyecto aísla equipos, infraestructuras o aplicaciones entre sí: [Proyectos](/user-guide/projects).
4. **Conecte lo que necesita su automatización:**
   - Código fuente con playbooks, módulos o scripts: [Repositorios](/user-guide/repositories).
   - Claves SSH, tokens y contraseñas: [Almacén de claves](/user-guide/key-store).
   - Hosts de destino y ajustes de conexión: [Inventario](/user-guide/inventory).
   - Variables reutilizables: [Grupos de variables](/user-guide/environment).
5. **Cree una plantilla de tarea y ejecútela.** Elija la guía de su herramienta: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) o [Python](/user-guide/apps/python). Después, ejecútela y observe el resultado: [Tareas](/user-guide/tasks).
6. **Automatice y ponga en operación:**
   - Ejecute según una programación: [Programaciones](/user-guide/schedules).
   - Controle quién puede hacer qué: [Equipos y roles personalizados](/user-guide/team).
   - Reciba alertas sobre los resultados: [Notificaciones](/admin-guide/notifications).

## Conceptos clave {#key-concepts}

Estos términos aparecen por todas partes en la interfaz.

| Término | Significado |
|------|---------|
| **Proyecto** | La unidad principal de separación. Cada proyecto tiene sus propios repositorios, claves, inventarios, plantillas y equipo. [Proyectos](/user-guide/projects) |
| **Repositorio** | Un repositorio Git o una ruta local donde residen los playbooks, módulos o scripts. [Repositorios](/user-guide/repositories) |
| **Inventario** | Hosts, grupos y ajustes de conexión para ejecuciones al estilo de Ansible. [Inventario](/user-guide/inventory) |
| **Grupo de variables** | Variables reutilizables y configuración de entorno, también llamado Entorno. [Grupos de variables](/user-guide/environment) |
| **Almacén de claves** | Credenciales cifradas como claves SSH, tokens y contraseñas. [Almacén de claves](/user-guide/key-store) |
| **Plantilla de tarea** | La definición de una ejecución: aplicación, repositorio, inventario, variables y opciones. [Plantillas de tareas](/user-guide/task-templates) |
| **Tarea** | Una ejecución individual de una plantilla, con su registro y estado. [Tareas](/user-guide/tasks) |
| **Flujo de trabajo** | Un grafo de plantillas con ramificaciones, aprobaciones y retardos. Funcionalidad Pro. [Flujos de trabajo](/user-guide/workflows) |
| **Runner** | Dónde se ejecutan las tareas: el propio servidor o un runner remoto. [Runners](/admin-guide/runners) |

## Próximos pasos {#next-steps}

- Ponga Semaphore detrás de TLS con un [proxy inverso](/admin-guide/reverse-proxy).
- Conecte su proveedor de identidad: [LDAP](/admin-guide/authentication/ldap) u [OpenID Connect](/admin-guide/authentication/openid).
- Controle Semaphore desde CI o scripts con la [API](/reference/api) y la [CLI](/reference/cli).
