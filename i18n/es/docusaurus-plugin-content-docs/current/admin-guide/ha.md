---
title: "Alta disponibilidad"
---

# Alta disponibilidad <Enterprise />

:::info
La alta disponibilidad está disponible en la edición **Semaphore Enterprise**.
:::

Semaphore UI admite despliegues de alta disponibilidad (HA) activo-activo, en los que varias instancias se ejecutan simultáneamente detrás de un balanceador de carga. Cada instancia es plenamente capaz de atender solicitudes de la interfaz, llamadas a la API, trabajos programados y ejecución de tareas. Si una instancia falla, los nodos restantes continúan funcionando sin interrupción.

## Arquitectura {#architecture}

Un despliegue activo-activo típico consta de los siguientes componentes:

**Balanceador de carga** — Los usuarios se conectan a través de un balanceador de carga (por ejemplo, NGINX, HAProxy o un balanceador de carga en la nube). El balanceador de carga distribuye el tráfico HTTP y WebSocket entre los nodos de Semaphore disponibles.

**Nodos de Semaphore** — Cada nodo ejecuta una instancia idéntica de Semaphore UI. Cualquier nodo puede recibir solicitudes de usuarios, iniciar trabajos de automatización, procesar tareas programadas y enviar actualizaciones en tiempo real. Todos los nodos son iguales: no existe un nodo principal ni un nodo en espera.

**Base de datos compartida** — Todas las instancias se conectan a una base de datos PostgreSQL o MySQL compartida. La base de datos actúa como única fuente de verdad para proyectos, plantillas, inventarios, programaciones, historial de tareas, cuentas de usuario y configuración de RBAC.

:::warning
SQLite y BoltDB no son compatibles con despliegues de HA. Utilice PostgreSQL o MySQL.
:::

**Redis** — Redis proporciona la capa de coordinación que permite que varios nodos se comporten como un único sistema. Cumple tres funciones:

* **Bloqueos distribuidos**: garantizan que solo una instancia ejecute un trabajo determinado a la vez, evitando la ejecución duplicada de tareas.
* **Estado compartido de la cola de tareas**: mantiene la cola de tareas para que cada trabajo sea tomado exactamente por un worker. Todos los nodos ven la misma cola y coordinan la ejecución.
* **Mensajería Pub/Sub**: permite a los nodos difundir eventos como actualizaciones de tareas, notificaciones del clúster, invalidación de caché y cambios de estado de la interfaz. Esto mantiene todos los nodos sincronizados en tiempo real.

## Requisitos previos {#prerequisites}

Antes de configurar HA necesita:

* Una clave de suscripción a **Semaphore Enterprise**.
* Una base de datos **PostgreSQL** o **MySQL** compartida y accesible desde todos los nodos.
* Un servidor de **Redis**, o un despliegue de **Redis Sentinel**, accesible desde todos los nodos. Redis Cluster no es compatible.
* Un **balanceador de carga** compatible con tráfico HTTP y WebSocket.
* Dos o más servidores para ejecutar las instancias de Semaphore.

Todos los nodos de Semaphore deben usar la misma base de datos, el mismo backend de Redis y la misma configuración (salvo `ha.node_id`, que debe ser único en cada nodo).

## Configuración {#configuration}

Habilite HA añadiendo el bloque `ha` a su `config.json` en cada nodo:

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

Cada nodo debe tener un `ha.node_id` único. El resto de la configuración debe ser idéntica en todos los nodos.

### Variables de entorno {#environment-variables}

Como alternativa, configure HA mediante variables de entorno:

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Para sobrevivir a la pérdida del propio servidor Redis, apunte el clúster a un despliegue de [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) en lugar de a una única dirección. Establezca `ha.engine` en `redis_sentinel` y describa la configuración de Sentinel en `ha.redis_sentinel`:

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

Cada nodo pregunta a los sentinels cuál es el maestro actual y sigue una conmutación por error sin reiniciarse: una tarea que se está ejecutando mientras cambia el maestro continúa en ejecución, y las nuevas tareas, las programaciones y las actualizaciones en tiempo real continúan en la réplica promovida.

La misma configuración con variables de entorno (la lista de sentinels es un array JSON):

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Notas:

* `ha.engine` decide qué bloque se lee. `redis` (el valor predeterminado) lee `ha.redis`; `redis_sentinel` lee `ha.redis_sentinel`. El otro bloque, si existe, se ignora y se registra una advertencia durante el arranque.
* Con `redis_sentinel`, `master_name` y al menos una dirección en `addrs` son obligatorios; el nodo se niega a arrancar sin ellos.
* `user` y `pass` autentican contra los nodos de datos de Redis. Si los propios sentinels requieren autenticación (`requirepass` en `sentinel.conf`), establezca también `sentinel_user` y `sentinel_pass`.
* `tls` y `tls_skip_verify` se aplican tanto a las conexiones con Sentinel como a las conexiones con los nodos de datos de Redis.

### Referencia de configuración {#configuration-reference}

| Opción del archivo de configuración | Variable de entorno | Descripción |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Habilita el modo de alta disponibilidad. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Identificador único de este nodo. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Dirección del servidor Redis (por ejemplo, `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Número de base de datos de Redis. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Contraseña del servidor Redis. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Nombre de usuario del servidor Redis. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Habilita TLS para la conexión con Redis. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Omite la verificación del certificado TLS de Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Backend de Redis: `redis` (servidor único, predeterminado) o `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Nombre del maestro monitorizado tal como está configurado en Sentinel. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Direcciones de los sentinels, `host:port`. Array JSON en la variable de entorno. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Nombre de usuario de los propios nodos Sentinel. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Contraseña de los propios nodos Sentinel. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Número de base de datos de Redis en los nodos de datos. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Nombre de usuario de los nodos de datos de Redis. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Contraseña de los nodos de datos de Redis. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Habilita TLS para las conexiones con Sentinel y con Redis. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Omite la verificación del certificado TLS en las conexiones con Sentinel y con Redis. |

Consulte [Configuración](/admin-guide/configuration) para ver la lista completa de opciones disponibles.

## Balanceador de carga {#load-balancer}

Coloque un balanceador de carga delante de los nodos de Semaphore para distribuir el tráfico. El balanceador de carga debe admitir **conexiones WebSocket** para las actualizaciones en tiempo real de la interfaz.

### Ejemplo con NGINX {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

Consulte [Proxy inverso](/admin-guide/reverse-proxy/nginx) para obtener más detalles sobre la configuración de NGINX.

## Cómo funciona la ejecución de trabajos {#how-job-execution-works}

En un despliegue multinodo, la ejecución de tareas sigue un flujo coordinado:

1. **El usuario lanza una tarea.** Un usuario inicia un trabajo desde la interfaz o la API. La solicitud puede llegar a cualquier nodo de Semaphore.
2. **Se almacenan los metadatos de la tarea.** El nodo receptor escribe los metadatos de la tarea en la base de datos y señala el trabajo a través de Redis.
3. **Un nodo toma la tarea.** Uno de los nodos disponibles recupera la tarea de Redis, adquiere un bloqueo distribuido y la marca como en ejecución en la base de datos.
4. **La tarea se ejecuta.** El nodo ejecuta la tarea localmente o la delega a un [runner remoto](/admin-guide/runners). El progreso y los registros se escriben de vuelta en la base de datos.
5. **Se difunden los resultados.** Las actualizaciones de la tarea se propagan mediante Redis Pub/Sub para que todos los nodos y los clientes de la interfaz conectados permanezcan sincronizados.

## Cómo funciona HA por dentro {#under-the-hood}

Los nodos de Semaphore nunca se comunican directamente entre sí. Todo aquello en lo que necesitan ponerse de acuerdo pasa por Redis: quién está vivo, qué tarea pertenece a qué nodo, quién dispara una programación y qué mensajes de la interfaz hay que retransmitir. Cada parte de ese estado es un pequeño conjunto de claves de Redis con caducidad, de modo que un nodo caído no puede dejar nada atrás durante mucho tiempo. Los datos duraderos (tareas, plantillas, registros, runners) viven siempre en la base de datos; Redis solo guarda el estado de coordinación.

Todas las claves usan los prefijos fijos `ha:` y `tasks:`. No son configurables, por lo que dos clústeres de Semaphore que compartan un mismo servidor Redis deben usar números de base de datos distintos (`ha.redis.db`).

### Registro de nodos {#node-registry}

Cada nodo se registra al arrancar y después renueva su registro cada 10 segundos. El registro caduca a los 30 segundos, de modo que un nodo que deja de renovarlo se considera muerto como máximo al cabo de medio minuto. En un apagado ordenado, el nodo elimina su registro de inmediato.

| Clave | Tipo | Propósito |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat de un nodo: `node_id`, `started_at`, `version`, `last_beat`. Caduca 30 s después de la última renovación. |
| `ha:nodes` | set | IDs de todos los nodos registrados. Los miembros cuya clave de heartbeat ha caducado son eliminados por los demás nodos. |

El registro de nodos es lo que muestra el panel del clúster y lo que consulta el limpiador de huérfanos (más abajo) para decidir si el propietario de una tarea sigue vivo.

### Cola de tareas y tareas en ejecución {#task-queue}

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

### Bloqueos {#locks}

Los bloqueos son claves individuales creadas con `SET NX`: el nodo que consigue crear la clave posee el bloqueo. Todo bloqueo tiene una caducidad, y los bloqueos que se mantienen durante mucho tiempo son renovados por su propietario, de modo que un nodo caído libera sus bloqueos automáticamente.

| Clave | Caducidad | Propósito |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Un bloqueo por programación y por minuto. El nodo que lo crea dispara la programación; los demás la omiten. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, renovado cada 10 s | Solo un nodo hace avanzar una ejecución de flujo de trabajo determinada a la vez. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Bloqueo breve mientras se crea una nueva ejecución de flujo de trabajo, para que dos nodos no inicien el mismo flujo de trabajo dos veces. |
| `ha:audit:export:<destination_id>` | 30 s, renovado cada 10 s | Solo un nodo exporta eventos de auditoría a un destino determinado. Si Redis no está disponible, ningún nodo exporta, de modo que los eventos nunca se envían dos veces. |

Los bloqueos de programaciones y de flujos de trabajo fallan en abierto: si no se puede contactar con Redis, el nodo continúa en lugar de omitir el trabajo, y las actualizaciones condicionales en la base de datos mantienen el resultado correcto. La concesión de la exportación de auditoría falla en cerrado, porque una exportación duplicada no puede deshacerse.

### Canales Pub/Sub {#pubsub-channels}

| Canal | Propósito |
| --- | --- |
| `ha:ws:broadcast` | Mensajes WebSocket para la interfaz. Un nodo entrega un mensaje a sus propios navegadores conectados y lo publica aquí; los demás nodos lo retransmiten a los suyos. |
| `tasks:events` | Cambios en la cola de tareas y en el conjunto de tareas en ejecución, actualizaciones de los campos de tiempo de ejecución y solicitudes de detención forzada. Los nodos usan estos eventos para mantener actualizada su vista en memoria de la cola y para detener una tarea cuya detención ha solicitado otro nodo. |

Los mensajes llevan el ID del nodo emisor, de modo que un nodo ignora sus propios mensajes.

### Claves de la caché de runners {#runner-cache-keys}

Las claves `ha:runner:*` pertenecen a la [caché de runners](#runner-cache), descrita en la siguiente sección.

## Caché de runners {#runner-cache}

Cada solicitud que un [runner](/admin-guide/runners) envía al servidor lleva su token, y el servidor tiene que convertir ese token en un registro de runner antes de poder hacer cualquier otra cosa. Los runners sondean cada pocos segundos e informan de su progreso cada segundo mientras se ejecuta un trabajo, de modo que sin una caché cada una de esas solicitudes costaría una consulta a la base de datos. La caché de runners responde la mayoría de ellas desde la memoria.

Un nodo único mantiene la caché en su propia memoria. En modo HA eso no basta: si edita un runner en el nodo A, el nodo B no debe seguir sirviendo el registro antiguo. Por eso, en modo HA la caché vive en Redis y es compartida por todos los nodos, y un cambio realizado a través de cualquier nodo es visible para todos ellos a la vez.

:::note
Esta caché no es la acción **Limpiar caché** de la página de Runners. Esa acción pide al propio runner que elimine los directorios de trabajo de su máquina.
:::

### Qué se almacena en caché y durante cuánto tiempo {#runner-cache-ttl}

El valor almacenado en caché es el registro del runner sin sus etiquetas y sin el token. El token nunca llega a Redis: la clave se deriva de un hash SHA-256 del token, y el campo del token se vacía antes de almacenar el registro.

Una entrada vive como máximo 30 segundos. En la práctica se descarta mucho antes, porque todo cambio realizado a través de Semaphore invalida la caché de inmediato:

* Crear, actualizar, eliminar o volver a registrar un runner, o eliminar un proyecto, descarta **todos** los runners en caché en todos los nodos.
* Un heartbeat de runner descarta **solo la entrada de ese runner**, de modo que la hora de "visto por última vez" almacenada se mantiene actualizada sin tocar las demás. Un heartbeat se escribe como máximo una vez por intervalo; el intervalo es un tercio de `runners.offline_timeout_sec`, con un límite de 45 segundos. Con el tiempo de espera predeterminado de 120 segundos, eso es cada 40 segundos.

La caducidad de 30 segundos solo importa para los cambios realizados al margen de Semaphore, por ejemplo editando directamente la tabla `runner` o restaurando una copia de seguridad.

### Cómo se evitan las escrituras obsoletas {#runner-cache-generation}

Una búsqueda que no encuentra la entrada en la caché lee el runner de la base de datos y después lo almacena. Entre esos dos pasos, otro nodo puede cambiar el runner. Para garantizar que la búsqueda nunca almacene en caché lo que leyó antes del cambio, la caché mantiene un contador que crece con cada invalidación. La búsqueda recuerda el valor del contador que vio antes de ir a la base de datos, y el almacenamiento se rechaza si el contador ha avanzado mientras tanto. Cada paso se ejecuta como un único script Lua en Redis, de modo que el contador y la entrada se leen y se escriben juntos.

### Claves de Redis {#runner-cache-redis-keys}

| Clave | Tipo | Propósito |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | El contador. Crece en uno con cada invalidación, ya sea de toda la caché o de un único runner. |
| `ha:runner:inv` | string, integer | Valor del contador en la última invalidación completa. Forma parte de la clave de cada entrada, de modo que una invalidación completa hace inalcanzables todas las entradas existentes de una vez; después caducan por sí solas. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | El registro del runner en caché. Caduca a los 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Valor del contador en el último heartbeat de este runner. Una búsqueda que comenzó antes del heartbeat no puede almacenar el registro anterior al heartbeat. Caduca a los 30 s. |

El panel del clúster informa del número de claves `ha:runner:token:*` como tamaño de la caché de runners.

### Comportamiento ante problemas de Redis {#runner-cache-failures}

La caché nunca hace que falle una solicitud de un runner. Toda operación de caché está limitada a 500 milisegundos; si Redis es lento o inaccesible, la búsqueda se trata como un fallo de caché y va a la base de datos, y no se almacena nada. El único caso que conviene tener en cuenta es una invalidación que falla porque Redis está caído justo en el momento en que se cambia un runner: los demás nodos pueden entonces servir el registro antiguo hasta que caduque, como máximo 30 segundos después. El fallo se registra con nivel de error.

## Escalado con runners {#scaling-with-runners}

HA también permite el escalado horizontal de la ejecución de tareas. En lugar de ejecutar los trabajos únicamente en los propios nodos de Semaphore, la ejecución puede delegarse a varios [runners](/admin-guide/runners). Esto le permite:

* Distribuir la carga de trabajo por toda su infraestructura.
* Escalar la capacidad de automatización de forma independiente de la capa web/API.
* Aislar los entornos de ejecución para limitar el radio de impacto.
* Ejecutar tareas en muchos nodos en paralelo.

Consulte [Runners](/admin-guide/runners) para ver las instrucciones de configuración.

## Ventajas {#benefits}

* **Mayor fiabilidad** — Si una instancia falla, las demás siguen atendiendo el tráfico y ejecutando trabajos.
* **Mantenimiento sin tiempo de inactividad** — Los nodos pueden actualizarse o reiniciarse individualmente sin detener el sistema.
* **Escalabilidad horizontal** — Añada nodos de Semaphore detrás del balanceador de carga para aumentar la capacidad.
* **Sin dependencia de un nodo principal** — Todos los nodos son iguales, lo que elimina mecanismos complejos de conmutación por error.
* **Estado del clúster consistente** — La base de datos compartida y la coordinación mediante Redis mantienen todas las instancias sincronizadas.

## Preguntas frecuentes {#faq}

### ¿Qué es la alta disponibilidad activo-activo? {#what-is-active-active-high-availability}

La HA activo-activo significa que varias instancias de la aplicación se ejecutan simultáneamente y todas ellas atienden solicitudes. No existe un nodo principal: cualquier instancia puede gestionar el tráfico y ejecutar trabajos.

### ¿Por qué Semaphore utiliza Redis en modo HA? {#why-does-semaphore-use-redis-in-ha-mode}

Redis actúa como capa de coordinación entre las instancias. Proporciona bloqueos distribuidos, estado compartido de la cola de tareas y mensajería Pub/Sub para garantizar que los nodos no ejecuten el mismo trabajo simultáneamente.

### ¿Qué base de datos debo usar en despliegues de HA? {#what-database-should-i-use-for-ha-deployments}

Semaphore admite PostgreSQL y MySQL como base de datos compartida. SQLite y BoltDB no pueden utilizarse en modo HA porque no admiten el acceso concurrente desde varios procesos.

### ¿Qué ocurre si falla Redis? {#what-happens-if-redis-fails}

Con un único servidor Redis (`ha.engine: redis`), los nodos no pueden coordinarse hasta que Redis vuelva a estar disponible. Con [Redis Sentinel](#redis-sentinel), los sentinels promueven una réplica y todos los nodos de Semaphore cambian a ella automáticamente, normalmente en unos pocos segundos y sin reiniciarse.

### ¿Qué ocurre si falla un nodo de Semaphore? {#what-happens-if-one-semaphore-node-fails}

El balanceador de carga dirige el tráfico a los nodos restantes. Los trabajos en ejecución continúan en otras instancias y los nuevos trabajos son tomados por cualquier nodo disponible.

### ¿Puedo escalar horizontalmente? {#can-i-scale-horizontally}

Sí. Puede añadir nodos de Semaphore detrás del balanceador de carga para aumentar la capacidad web/API, y añadir [runners](/admin-guide/runners) para aumentar la capacidad de ejecución de tareas.
