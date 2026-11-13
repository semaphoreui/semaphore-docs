---
title: Caché de autenticación de runners
description: Por qué Semaphore almacena en caché los registros de runners por token, cómo los nodos HA comparten la caché a través de Redis, cuándo se invalidan las entradas y qué ocurre si Redis falla.
---

# Caché de autenticación de runners

Cada solicitud que un [runner](/admin-guide/runners) envía al servidor lleva su token, y el servidor tiene que convertir ese token en un registro de runner antes de poder hacer cualquier otra cosa. Los runners sondean cada pocos segundos e informan de su progreso cada segundo mientras se ejecuta un trabajo, de modo que sin una caché cada una de esas solicitudes costaría una consulta a la base de datos. La caché de runners responde la mayoría de ellas desde la memoria.

Un nodo único mantiene la caché en su propia memoria. En modo HA eso no basta: si edita un runner en el nodo A, el nodo B no debe seguir sirviendo el registro antiguo. Por eso, en modo HA la caché vive en Redis y es compartida por todos los nodos, y un cambio realizado a través de cualquier nodo es visible para todos ellos a la vez.

:::note
Esta caché no es la acción **Limpiar caché** de la página de Runners. Esa acción pide al propio runner que elimine los directorios de trabajo de su máquina.
:::

## Qué se almacena en caché y durante cuánto tiempo {#runner-cache-ttl}

El valor almacenado en caché es el registro del runner sin sus etiquetas y sin el token. El token nunca llega a Redis: la clave se deriva de un hash SHA-256 del token, y el campo del token se vacía antes de almacenar el registro.

Una entrada vive como máximo 30 segundos. En la práctica se descarta mucho antes, porque todo cambio realizado a través de Semaphore invalida la caché de inmediato:

* Crear, actualizar, eliminar o volver a registrar un runner, o eliminar un proyecto, descarta **todos** los runners en caché en todos los nodos.
* Un heartbeat de runner descarta **solo la entrada de ese runner**, de modo que la hora de "visto por última vez" almacenada se mantiene actualizada sin tocar las demás. Un heartbeat se escribe como máximo una vez por intervalo; el intervalo es un tercio de `runners.offline_timeout_sec`, con un límite de 45 segundos. Con el tiempo de espera predeterminado de 120 segundos, eso es cada 40 segundos.

La caducidad de 30 segundos solo importa para los cambios realizados al margen de Semaphore, por ejemplo editando directamente la tabla `runner` o restaurando una copia de seguridad.

## Cómo se evitan las escrituras obsoletas {#runner-cache-generation}

Una búsqueda que no encuentra la entrada en la caché lee el runner de la base de datos y después lo almacena. Entre esos dos pasos, otro nodo puede cambiar el runner. Para garantizar que la búsqueda nunca almacene en caché lo que leyó antes del cambio, la caché mantiene un contador que crece con cada invalidación. La búsqueda recuerda el valor del contador que vio antes de ir a la base de datos, y el almacenamiento se rechaza si el contador ha avanzado mientras tanto. Cada paso se ejecuta como un único script Lua en Redis, de modo que el contador y la entrada se leen y se escriben juntos.

## Claves de Redis {#runner-cache-redis-keys}

| Clave | Tipo | Propósito |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | El contador. Crece en uno con cada invalidación, ya sea de toda la caché o de un único runner. |
| `ha:runner:inv` | string, integer | Valor del contador en la última invalidación completa. Forma parte de la clave de cada entrada, de modo que una invalidación completa hace inalcanzables todas las entradas existentes de una vez; después caducan por sí solas. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | El registro del runner en caché. Caduca a los 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Valor del contador en el último heartbeat de este runner. Una búsqueda que comenzó antes del heartbeat no puede almacenar el registro anterior al heartbeat. Caduca a los 30 s. |

El panel del clúster informa del número de claves `ha:runner:token:*` como tamaño de la caché de runners.

## Comportamiento ante problemas de Redis {#runner-cache-failures}

La caché nunca hace que falle una solicitud de un runner. Toda operación de caché está limitada a 500 milisegundos; si Redis es lento o inaccesible, la búsqueda se trata como un fallo de caché y va a la base de datos, y no se almacena nada. El único caso que conviene tener en cuenta es una invalidación que falla porque Redis está caído justo en el momento en que se cambia un runner: los demás nodos pueden entonces servir el registro antiguo hasta que caduque, como máximo 30 segundos después. El fallo se registra con nivel de error.

## Páginas relacionadas {#related-pages}

- [Alta disponibilidad](/admin-guide/ha) — arquitectura, configuración y balanceador de carga.
- [Coordinación del clúster](/admin-guide/ha/coordination) — las claves, bloqueos y canales de Redis compartidos por los nodos.
- [Runners](/admin-guide/runners) — registro y configuración de runners.
