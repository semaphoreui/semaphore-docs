---
title: Registro de auditoría
description: El registro de auditoría de seguridad que Semaphore lleva para inicios de sesión, MFA, usuarios, permisos, tokens de API y ajustes, y cómo activarlo.
---

# Registro de auditoría

El registro de auditoría es una pista de auditoría de seguridad: quién hizo qué, desde dónde, sobre qué objeto
y con qué resultado. Lo leen los analistas de seguridad y los equipos de cumplimiento, normalmente en un SIEM.
Cada evento tiene un esquema estable y documentado, así que un analista puede escribir reglas de detección sin
conocer el funcionamiento interno de Semaphore.

El registro de auditoría es distinto del [registro de actividad](/admin-guide/logs). El registro de actividad
es un feed para los usuarios de un proyecto. El registro de auditoría es una pista para quienes comprueban que
el sistema se usa correctamente.

## Cómo funciona {#overview}

Con el registro de auditoría activado, Semaphore registra un evento por cada acción relevante para la seguridad
que llega por la interfaz web o la API: inicios y cierres de sesión, comprobaciones de MFA, cambios de
usuarios, miembros de proyectos, roles y permisos, tokens de API y ajustes del sistema. También se registran
las solicitudes rechazadas: un inicio de sesión fallido, un token de API desconocido o caducado, un permiso
denegado, una solicitud entre sitios bloqueada.

Los eventos se guardan en la base de datos de Semaphore. Semaphore Pro puede enviarlos a un SIEM, consulta
[Exportación a un SIEM](#siem-export).

## Esquema del evento {#event-schema}

Cada evento es un objeto JSON con los mismos campos. Para la lista de eventos, sus resultados, motivos y
metadatos, consulta [Eventos de auditoría](/reference/audit-events).

| Campo | Descripción |
| --- | --- |
| `event_id` | ID único del evento. Úsalo para eliminar duplicados en el SIEM. |
| `seq` | Número de secuencia sin huecos que crece con cada evento. Úsalo para ordenar los eventos. |
| `timestamp` | Hora del evento en UTC. |
| `schema_version` | Versión de este esquema. Solo cambia cuando un campo se renombra, se elimina o cambia de tipo. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` o `audit`. |
| `event_code` | De qué trata el evento, por ejemplo `iam.api_token`. |
| `type` | Tipo de cambio: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` o `info`. |
| `action` | Qué se hizo, por ejemplo `create`. |
| `outcome` | `success` o `failure`. |
| `reason` | Por qué falló la acción, de una lista fija por evento. Vacío en caso de éxito. |
| `actor` | Quién actuó: su `type` (`user`, `anonymous`, `system`, `runner`, `integration`), `id` y `name`. Para un usuario, también `auth` (`session` o `api_token`) y, para un token de API, `token_fingerprint`. |
| `source` | Para solicitudes a la interfaz web y la API: la `ip` y el `user_agent` del cliente. |
| `target` | El objeto sobre el que se actuó: su `type`, `id` y `name`. |
| `scope` | El `project_id` para eventos dentro de un proyecto. |
| `request_id` | ID de la solicitud HTTP. Semaphore también lo devuelve en la cabecera de respuesta `X-Request-ID`. |
| `instance_id` | Nombre de esta instalación de Semaphore, de `audit.instance_id`. |
| `node_id` | Nodo que registró el evento, cuando la [alta disponibilidad](/admin-guide/ha) está activada. |
| `metadata` | Detalles adicionales que dependen del evento. |

`timestamp` es la hora de la base de datos, en microsegundos, o en milisegundos en SQLite. Ordena los eventos
por `seq`: dos eventos pueden tener la misma hora, pero nunca el mismo `seq`.

En MySQL, la columna `created` de la tabla `audit_event` usa la zona horaria de la opción de conexión
`loc`, UTC por defecto. El `timestamp` de cada evento siempre está en UTC.

Cada arranque del servidor registra `audit.lifecycle` con la acción `start`. No hay evento de parada: una
parada, un fallo o la desactivación del registro de auditoría aparecen como un hueco de tiempo antes del
siguiente `start`.

## Qué no se registra nunca {#never-recorded}

El registro de auditoría nunca contiene contraseñas, códigos de un solo uso, secretos y códigos QR de TOTP,
códigos de recuperación, cookies de sesión, tokens, códigos y claims de OAuth, claves privadas, frases de
contraseña, valores de secretos, valores de entorno y de encuestas, cuerpos de webhooks, salida de tareas,
direcciones de correo electrónico ni URL. Un token de API se identifica solo por su huella: los primeros 16
caracteres hexadecimales de su hash SHA-256.

El ID y el nombre de usuario identifican al actor. Un inicio de sesión fallido registra el login escrito,
recortado a 64 bytes, porque la investigación de inicios de sesión fallidos lo necesita.

## Activa el registro de auditoría {#enable}

Establece `audit.enabled` y da un nombre a la instalación en `audit.instance_id`. El nombre tiene de 1 a 255
caracteres ASCII imprimibles sin espacios y aparece en cada evento.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

O con variables de entorno:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Reinicia Semaphore para aplicar el cambio. Para todas las opciones, consulta
[Configuración](/reference/configuration).

## Dirección del cliente tras un proxy inverso {#trusted-proxies}

Tras un proxy inverso, el interlocutor directo de Semaphore es el proxy, y la dirección del cliente viene de la
cabecera `X-Forwarded-For` o `X-Real-IP`. Semaphore lee estas cabeceras solo cuando el interlocutor directo
está dentro de `audit.trusted_proxy_cidrs`. En caso contrario registra la dirección del interlocutor, así que
un cliente no puede falsificar su dirección.

Incluye en `audit.trusted_proxy_cidrs` solo tus proxies inversos, nunca redes de clientes. Un cliente dentro
de un rango de confianza puede poner cualquier dirección en `X-Forwarded-For`.

Se registra la dirección situada más a la derecha en `X-Forwarded-For` que no sea un proxy de confianza.
`X-Real-IP` solo se usa cuando no hay `X-Forwarded-For`, y solo si tiene un único valor.

## Almacenamiento {#storage}

Los eventos se guardan en la base de datos de Semaphore y nunca se eliminan: esta versión no tiene retención.
Planifica el tamaño de la base de datos según el número de inicios de sesión y cambios de tu instalación.

## Correspondencia con normativas {#compliance}

Semaphore registra los eventos que necesitas para estos controles. Por sí solo no hace que tu instalación
cumpla con ellos.

| Requisito | Cubierto por | Estado |
| --- | --- | --- |
| PCI DSS 10.2.1.1 acceso a datos sensibles (análogo: secretos) | `iam.mfa/view_qr` | Disponible |
| PCI DSS 10.2.1.1 acceso a datos sensibles (análogo: secretos) | `resource.project_backup/export` | Planificado |
| PCI DSS 10.2.1.2 acciones de administradores / ISO 27002 8.15 uso de privilegios | `iam.*`, `system.*` | Disponible |
| PCI DSS 10.2.1.2 acciones de administradores / ISO 27002 8.15 uso de privilegios | `resource.*`, `secret.*` | Planificado |
| PCI DSS 10.2.1.2 acciones de administradores / ISO 27002 8.15 uso de privilegios | `runner.*`, `task.control`, `task.history` | Planificado |
| PCI DSS 10.2.1.3 acceso a los registros de auditoría | No aplica: Semaphore no da acceso a la pista de auditoría. | — |
| PCI DSS 10.2.1.4 intentos de acceso lógico no válidos / ISO intentos de acceso rechazados | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Disponible |
| PCI DSS 10.2.1.4 intentos de acceso lógico no válidos / ISO intentos de acceso rechazados | `runner.lifecycle/register` failure | Planificado |
| PCI DSS 10.2.1.5 cambios en credenciales de identificación y autenticación | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Disponible |
| PCI DSS 10.2.1.5 cambios en credenciales de identificación y autenticación | `runner.credential` | Planificado |
| PCI DSS 10.2.1.6 inicio, parada y pausa de los registros de auditoría / ISO activación de sistemas de seguridad | `audit.lifecycle/start`; una parada aparece como el hueco anterior | Disponible |
| PCI DSS 10.2.1.7 creación y eliminación de objetos del sistema | `resource.*` create/delete | Planificado |
| PCI DSS 10.2.1.7 creación y eliminación de objetos del sistema | `runner.lifecycle` create/delete | Planificado |
| PCI DSS 10.2.2 campos obligatorios | `actor`, `event_code` y `action`, `timestamp`, `outcome`, `source` o `node_id`, `target` o `scope` | Disponible |
| PCI DSS 10.3.3 copia rápida en un servidor central de registros | Exportación a un SIEM mediante Syslog+TLS | Disponible |
| PCI DSS 10.3.3 copia rápida en un servidor central de registros | Exportación a un SIEM mediante Splunk HEC | Planificado |

Los eventos planificados no se registran en esta versión.

## Qué no se registra en esta versión {#not-recorded}

- Las acciones hechas con el comando `semaphore` en el servidor, como `user add` o `user token`. Cambian la
  base de datos directamente, y quien puede ejecutarlas también puede cambiar la tabla de auditoría.
- La eliminación de la licencia, los ajustes de ejecución de las apps, el borrado del estado de tareas de HA,
  los alias de inventarios de Terraform, las ejecuciones de workflows y las invitaciones a proyectos. Todavía
  no tienen evento de auditoría.

## Exportación a un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro envía el registro de auditoría a un SIEM mediante Syslog con TLS. Guarda su posición en el
registro para el SIEM, así que los eventos registrados mientras el SIEM no está disponible se envían cuando
vuelve. Para los pasos, consulta [Envía el registro de auditoría a un SIEM](/admin-guide/audit-log-siem).

## Qué sigue {#whats-next}

- [Envía el registro de auditoría a un SIEM](/admin-guide/audit-log-siem) — exporta los eventos mediante Syslog+TLS.
- [Eventos de auditoría](/reference/audit-events) — cada evento con sus resultados, motivos y metadatos.
- [Configuración](/reference/configuration) — cada opción `audit.*`.
