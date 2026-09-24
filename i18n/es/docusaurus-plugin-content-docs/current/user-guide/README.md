---
title: Guía del usuario
description: "Para ingenieros que trabajan dentro de un proyecto de Semaphore: recursos, plantillas de tareas, tareas, programaciones y acceso del equipo."
---

# Guía del usuario

Esta sección está dirigida a quienes ya tienen acceso a un proyecto de Semaphore.
Todo lo que aquí se describe ocurre en la interfaz web o a través de la API del
proyecto. La instalación del servidor, su configuración y la conexión de un proveedor
de identidad se explican en la
[Guía de administración](/admin-guide).

El trabajo en Semaphore sigue una única cadena. Un **proyecto** contiene todo lo
demás. Dentro de él registra los recursos que necesita una ejecución: un
**repositorio** con sus playbooks o scripts, las **claves** con las que se accede a
él y a sus hosts, un **inventario** de máquinas de destino y **grupos de variables**
con valores y secretos. Una **plantilla de tareas** combina todo eso en una
definición de qué ejecutar, y cada ejecución de esa plantilla es una **tarea**. Las
programaciones, los flujos de trabajo y los webhooks entrantes inician plantillas
por usted.

## Preparar un proyecto {#set-up-a-project}

En este orden, porque cada paso depende del anterior.

| Página | Qué cubre |
|---|---|
| [Proyectos](/user-guide/projects) | Crear un proyecto, las secciones de la barra lateral, copia de seguridad y restauración. |
| [Equipos](/user-guide/team) | Los cuatro roles integrados y los roles personalizados en Enterprise. |
| [Almacén de claves](/user-guide/key-store) | Claves SSH, credenciales de acceso y almacenes de secretos externos. |
| [Repositorios](/user-guide/repositories) | Repositorios Git y rutas locales que contienen su automatización. |
| [Host config](/user-guide/host-config) | Credenciales para hosts Git y URL de repositorios que la clave del repositorio no cubre: submódulos, roles de Galaxy, módulos de Terraform. |
| [Inventario](/user-guide/inventory) | Hosts y ajustes de conexión para Ansible, espacios de trabajo para Terraform. |
| [Grupos de variables](/user-guide/environment) | Variables y secretos reutilizables que se pasan a las tareas. |

## Definir y ejecutar el trabajo {#define-and-run-work}

| Página | Qué cubre |
|---|---|
| [Plantillas de tareas](/user-guide/task-templates) | Todos los campos del formulario de la plantilla, además de los tipos de plantilla. |
| [Aplicaciones](/user-guide/apps) | Qué ejecuta cada aplicación: Ansible, Terraform, OpenTofu, Terragrunt y scripts. |
| [Tareas](/user-guide/tasks) | Iniciar una tarea, estados de las tareas, registros, detención y reejecución. |
| [Programaciones](/user-guide/schedules) | Ejecutar plantillas según una programación cron. |
| [Flujos de trabajo](/user-guide/workflows) | Encadenar plantillas con aprobaciones y ramificaciones. |
| [Integraciones](/user-guide/integrations) | Iniciar tareas desde webhooks entrantes. |
| [Runners del proyecto](/user-guide/projects/runners) | Enviar las tareas de un proyecto a sus propios runners. |
| [Su cuenta](/user-guide/account) | Ajustes personales y tokens de API. |

## Por dónde empezar {#where-to-start}

Si acaban de añadirle a un proyecto, lea [Proyectos](/user-guide/projects) para
orientarse y después [Tareas](/user-guide/tasks) para ejecutar una y leer su
registro. Si va a preparar un proyecto desde cero, siga la tabla anterior en orden.

¿Es completamente nuevo en Semaphore? Empiece por [Primeros pasos](/getting-started).
