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
