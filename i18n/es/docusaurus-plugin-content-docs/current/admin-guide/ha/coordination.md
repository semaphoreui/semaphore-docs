---
title: Coordinación del clúster
description: Cómo se coordinan los nodos HA de Semaphore a través de Redis, con cada clave, bloqueo y canal Pub/Sub que comparten y cuánto vive cada uno.
---

# Coordinación del clúster <Enterprise />

Los nodos de Semaphore nunca se comunican directamente entre sí. Todo aquello en lo que necesitan ponerse de acuerdo pasa por Redis: quién está vivo, qué tarea pertenece a qué nodo, quién dispara una programación y qué mensajes de la interfaz hay que retransmitir. Cada parte de ese estado es un pequeño conjunto de claves de Redis con caducidad, de modo que un nodo caído no puede dejar nada atrás durante mucho tiempo. Los datos duraderos (tareas, plantillas, registros, runners) viven siempre en la base de datos; Redis solo guarda el estado de coordinación.

Todas las claves usan los prefijos fijos `ha:` y `tasks:`. No son configurables, por lo que dos clústeres de Semaphore que compartan un mismo servidor Redis deben usar números de base de datos distintos (`ha.redis.db`).

## Registro de nodos {#node-registry}

Cada nodo se registra al arrancar y después renueva su registro cada 10 segundos. El registro caduca a los 30 segundos, de modo que un nodo que deja de renovarlo se considera muerto como máximo al cabo de medio minuto. En un apagado ordenado, el nodo elimina su registro de inmediato.

| Clave | Tipo | Propósito |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat de un nodo: `node_id`, `started_at`, `version`, `last_beat`. Caduca 30 s después de la última renovación. |
| `ha:nodes` | set | IDs de todos los nodos registrados. Los miembros cuya clave de heartbeat ha caducado son eliminados por los demás nodos. |

El registro de nodos es lo que muestra el panel del clúster y lo que consulta el limpiador de huérfanos (más abajo) para decidir si el propietario de una tarea sigue vivo.

## Cola de tareas y tareas en ejecución {#task-queue}

La cola de tareas es compartida, de modo que una tarea iniciada en un nodo puede ser despachada, supervisada y finalizada por cualquier otro. Redis almacena solo los IDs de las tareas y unos pocos campos transitorios; la tarea en sí la carga desde la base de datos el nodo que la necesite.

| Clave | Tipo | Propósito |
| --- | --- | --- |
| `tasks:queue` | list | IDs de las tareas que esperan ser despachadas, en orden. |
| `tasks:claim:<task_id>` | string | ID del nodo propietario de la tarea. Se escribe de forma atómica junto con la eliminación de la cola, de modo que una tarea es reclamada exactamente por un nodo. Caduca a los 5 minutos; el propietario la renueva cada minuto. |
| `tasks:running` | set | IDs de las tareas que se están ejecutando en este momento. |
| `tasks:active:<project_id>` | set | IDs de las tareas activas (en espera o en ejecución) en un proyecto. Se usa para los límites de concurrencia por proyecto. |
| `tasks:task_project` | hash | `task_id` → `project_id`, para que cualquier nodo pueda cargar la tarea desde la base de datos. |
| `tasks:aliases` | hash | `alias` → `task_id` para las tareas a las que se hace referencia mediante un alias. |
| `tasks:runtime:<task_id>` | hash | Campos que cambian mientras la tarea se ejecuta, como el ID del runner y el usuario que la inició. |
| `tasks:finalize:<task_id>` | string | Bloqueo tomado por el nodo que escribe el resultado final de una tarea que se ejecutó en un runner remoto. Caduca a los 5 minutos. |

Las entradas de `tasks:task_project`, `tasks:aliases` y `tasks:runtime:*` se eliminan cuando la tarea termina y, además, caducan a los 7 días como red de seguridad.

Un nodo toma una tarea de la cola con una única operación atómica: comprueba que la tarea sigue en la cola, escribe la reclamación, elimina la tarea de la cola y la añade al conjunto de tareas en ejecución. Si dos nodos lo intentan al mismo tiempo, solo uno lo consigue.

**Limpiador de huérfanos.** Una vez por minuto, cada nodo revisa las tareas en ejecución cuyo propietario está muerto, es decir, cuya reclamación ha caducado o cuyo propietario ya no tiene heartbeat. Una tarea que la base de datos ya muestra como terminada simplemente se elimina de Redis. Una tarea que nunca se entregó a un runner se devuelve a la cola para que un nodo vivo la despache. Una tarea que ya se está ejecutando en un runner se deja tal cual: el runner sigue trabajando y la tarea se limpia cuando la base de datos la muestra como terminada.

## Bloqueos {#locks}

Los bloqueos son claves individuales creadas con `SET NX`: el nodo que consigue crear la clave posee el bloqueo. Todo bloqueo tiene una caducidad, y los bloqueos que se mantienen durante mucho tiempo son renovados por su propietario, de modo que un nodo caído libera sus bloqueos automáticamente.

| Clave | Caducidad | Propósito |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Un bloqueo por programación y por minuto. El nodo que lo crea dispara la programación; los demás la omiten. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, renovado cada 10 s | Solo un nodo hace avanzar una ejecución de flujo de trabajo determinada a la vez. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Bloqueo breve mientras se crea una nueva ejecución de flujo de trabajo, para que dos nodos no inicien el mismo flujo de trabajo dos veces. |
| `ha:audit:export:<destination_id>` | 30 s, renovado cada 10 s | Solo un nodo exporta eventos de auditoría a un destino determinado. Si Redis no está disponible, ningún nodo exporta, de modo que los eventos nunca se envían dos veces. |

Los bloqueos de programaciones y de flujos de trabajo fallan en abierto: si no se puede contactar con Redis, el nodo continúa en lugar de omitir el trabajo, y las actualizaciones condicionales en la base de datos mantienen el resultado correcto. La concesión de la exportación de auditoría falla en cerrado, porque una exportación duplicada no puede deshacerse.

## Canales Pub/Sub {#pubsub-channels}

| Canal | Propósito |
| --- | --- |
| `ha:ws:broadcast` | Mensajes WebSocket para la interfaz. Un nodo entrega un mensaje a sus propios navegadores conectados y lo publica aquí; los demás nodos lo retransmiten a los suyos. |
| `tasks:events` | Cambios en la cola de tareas y en el conjunto de tareas en ejecución, actualizaciones de los campos de tiempo de ejecución y solicitudes de detención forzada. Los nodos usan estos eventos para mantener actualizada su vista en memoria de la cola y para detener una tarea cuya detención ha solicitado otro nodo. |

Los mensajes llevan el ID del nodo emisor, de modo que un nodo ignora sus propios mensajes.

## Claves de la caché de runners {#runner-cache-keys}

Las claves `ha:runner:*` pertenecen a la caché compartida de registros de runners. Para más información, consulte [Caché de autenticación de runners](/admin-guide/ha/runner-cache).

## Páginas relacionadas {#related-pages}

- [Alta disponibilidad](/admin-guide/ha) — arquitectura, configuración y balanceador de carga.
- [Caché de autenticación de runners](/admin-guide/ha/runner-cache) — la caché compartida de registros de runners.
