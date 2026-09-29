---
title: Registro de auditoría
description: Activa el registro de auditoría de seguridad, comprende qué registra y envía eventos de auditoría desde Semaphore Pro a un SIEM mediante Syslog con TLS.
---

# Registro de auditoría

El registro de auditoría recoge la actividad relevante para la seguridad: quién actuó, qué hizo, a qué objeto
afectó, de dónde procedía la solicitud y si se completó correctamente. Los operadores lo usan para investigar
cambios, mientras que los equipos de seguridad usan su formato de eventos documentado para crear reglas de detección y aportar pruebas de cumplimiento.

La captura y el almacenamiento local de auditorías están disponibles en Semaphore Community. Semaphore Pro también puede enviar los eventos
capturados a un sistema de gestión de eventos e información de seguridad (SIEM).

## En qué se diferencia de otros registros {#log-types}

| Registro | Úsalo para |
| --- | --- |
| Registro del servidor | Diagnosticar errores de inicio, configuración y ejecución de Semaphore. |
| Registro de actividad | Mostrar a los usuarios de un proyecto un flujo de actividad del proyecto. |
| Registro e historial de tareas | Revisar la ejecución, el estado y la salida de las tareas. |
| Registro de auditoría | Investigar acciones de autenticación y administración en toda la instalación. |

El registro de auditoría es independiente del [registro de actividad](/admin-guide/logs#activity-log). Activar o exportar
uno no activa ni exporta el otro.

## Qué se registra {#recorded-events}

La versión actual registra los eventos de autenticación y gestión de identidades compatibles, entre ellos:

- inicios de sesión correctos y fallidos, cierres de sesión y comprobaciones de TOTP;
- tokens de API rechazados, permisos denegados y solicitudes entre sitios bloqueadas;
- cambios en usuarios, contraseñas, inscripción en TOTP, identidades externas y tokens de API;
- cambios en miembros de proyectos, roles y permisos de plantillas;
- cambios en ajustes del sistema y activación de licencias Pro;
- inicio de la captura de auditoría junto con el servidor.

Un inicio de sesión correcto se registra después de que el usuario complete todos los pasos de autenticación requeridos, incluido TOTP.
Para consultar todos los eventos disponibles y los previstos para versiones posteriores, consulta
[Eventos de auditoría](/reference/audit-events).

## Datos sensibles excluidos de los eventos {#sensitive-data}

Los eventos de auditoría identifican una acción sin copiar sus credenciales ni su contenido secreto. Excluyen contraseñas,
códigos de acceso, secretos y códigos QR de TOTP, códigos de recuperación, cookies de sesión, tokens sin procesar, códigos y claims de OAuth,
claves privadas, frases de contraseña, valores secretos, valores de entorno y de encuestas, cuerpos de webhooks, salida de tareas y
URL de repositorios.

Los tokens de API se identifican por una huella, no por su valor. Un inicio de sesión fallido incluye el identificador de acceso
enviado, truncado a 64 bytes. Si los usuarios inician sesión con una dirección de correo electrónico, ese identificador puede contener
una dirección de correo electrónico.

## Activar el registro de auditoría {#enable}

Elige un nombre estable para la instalación y configura `audit.enabled` y `audit.instance_id` en
`config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

El ID de instancia debe contener entre 1 y 255 caracteres ASCII imprimibles sin espacios. Aparece en todos los eventos
y permite que un SIEM distinga varias instalaciones de Semaphore.

También puedes usar variables de entorno:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Reinicia Semaphore para aplicar el cambio. La captura comienza después del reinicio; la actividad anterior no se añade al
registro de auditoría. El primer evento es `audit.lifecycle` con la acción `start`.

Para consultar todas las opciones y variables de entorno, consulta
[Opciones de configuración](/reference/configuration#audit-log).

## Registrar la dirección del cliente tras un proxy {#trusted-proxies}

De forma predeterminada, un evento de auditoría HTTP registra la dirección que se conectó directamente a Semaphore. Si esa dirección
corresponde a un proxy inverso, añade únicamente las redes del proxy a `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

O configura:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore solo confía en `X-Forwarded-For` y `X-Real-IP` cuando proceden de estas redes. No añadas redes de clientes: un
cliente de una red de confianza podría elegir la dirección de origen registrada en sus eventos. Cuando varios proxies
añaden valores a `X-Forwarded-For`, Semaphore registra la dirección situada más a la derecha que no corresponda a un proxy de confianza.

## Almacenamiento y limitaciones {#storage}

Semaphore almacena los eventos de auditoría en su base de datos. Esta versión no dispone de un visor de auditoría, una API de auditoría, retención
automática ni depuración. Supervisa el crecimiento de la base de datos e incluye los datos de auditoría en tu política de copias de seguridad de la base de datos.

El registro de auditoría no bloquea la acción registrada. Si falla el almacenamiento de un evento, Semaphore escribe un
error en el registro del servidor y continúa con la operación original. Los registros locales están protegidos por los mismos
controles de acceso a la base de datos que el resto de Semaphore; no son inmutables ni permiten detectar manipulaciones.

Cada inicio del servidor registra `audit.lifecycle/start`. No hay ningún evento de parada. Un apagado, un fallo o la desactivación del
registro de auditoría aparecen como un periodo sin eventos antes de un evento de inicio posterior.

## Exportar a un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro puede enviar los eventos capturados correctamente a un receptor Syslog con TLS existente, como rsyslog o
Vector. El receptor puede almacenar los eventos o reenviarlos a tu SIEM.

Antes de empezar, prepara:

- el nombre de host y el puerto del receptor;
- un ID de destino estable, como `security-syslog`;
- el certificado de la CA que firmó el certificado del receptor, si el host de Semaphore aún no confía en esa CA.

Añade `audit.syslog` a `config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

También puedes usar variables de entorno:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` y `address` son obligatorios. Conserva el mismo ID cuando cambies la dirección o el certificado del receptor para que
Semaphore continúe desde la posición guardada. Un ID nuevo empieza con los eventos registrados después de inicializar ese destino;
los eventos que ya estén almacenados en ese momento no se envían al destino.

`ca_file` añade certificados al almacén de confianza del sistema. `server_name` sustituye el nombre de host que se comprueba en el
certificado del receptor. Semaphore requiere TLS 1.2 o posterior y siempre verifica el certificado del servidor. No
permite desactivar la verificación ni usar un certificado de cliente para esta conexión.

Reinicia Semaphore. Si los ajustes del destino no son válidos o no se puede leer el archivo de la CA, Semaphore no se iniciará.

### Verificar la entrega {#verify-siem-delivery}

Después del reinicio, busca el nuevo evento en el receptor y confirma que:

- `event_code` es `audit.lifecycle`;
- `action` es `start`;
- `outcome` es `success`;
- `instance_id` coincide con el nombre configurado para la instalación;
- `metadata.destinations` contiene el ID de destino.

### Comportamiento de la entrega {#delivery}

- Si el receptor no está disponible, Semaphore conserva localmente los eventos capturados y vuelve a intentar enviarlos cuando el
  receptor vuelve a estar disponible. Las solicitudes de los usuarios continúan con normalidad.
- La entrega por Syslog es de mejor esfuerzo. Puede perderse un evento escrito en una conexión que falle sin notificárselo a Semaphore.
- Los errores de red, los reinicios y las conmutaciones por error de HA pueden producir entregas duplicadas. Elimina los duplicados por
  `event_id` y ordena los eventos por `seq`.
- En una [instalación de HA](/admin-guide/ha), normalmente un solo nodo envía datos a un destino en cada momento. La exportación
  se interrumpe si Redis no está disponible, mientras que la captura continúa en la base de datos compartida.

Semaphore envía mensajes RFC 5424 con TLS y entramado por recuento de octetos. El cuerpo del mensaje contiene el JSON del evento
de auditoría. `HOSTNAME` es el ID del nodo de HA o el ID de instancia si solo hay un nodo; `MSGID` es `event_code`.

### Ejemplo de receptor rsyslog {#rsyslog}

Este fragmento de configuración de rsyslog acepta la conexión TLS y escribe un objeto JSON de evento por línea:

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Ejemplo de receptor Vector {#vector}

Esta configuración de Vector acepta la conexión TLS, analiza el JSON del evento y lo escribe en un archivo:

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Solucionar problemas de exportación {#troubleshoot-export}

- Si Semaphore no se inicia, comprueba que tanto `audit.syslog.id` como `audit.syslog.address` estén configurados y
  que el archivo de la CA contenga certificados PEM legibles.
- Si TLS falla, comprueba que el certificado del receptor sea válido para `server_name` y que su cadena llegue a una CA del sistema o
  configurada.
- Si un evento aún no ha llegado, consulta el registro del servidor de Semaphore y el registro de ingesta del receptor. Los reintentos de
  exportación aplican una espera tras los fallos.
- Si los eventos aparecen dos veces, elimina los duplicados por `event_id`; es normal que haya duplicados tras algunos reintentos y
  conmutaciones por error.

## Acciones sin cobertura de auditoría {#not-recorded}

El comando `semaphore` modifica la base de datos directamente, por lo que las acciones de la CLI ejecutadas en el servidor, como `user add` y
`user token`, no se registran. El acceso al servidor y a la base de datos debe controlarse por separado.

Esta versión tampoco dispone de eventos de auditoría para la eliminación de licencias, los ajustes de ejecución de aplicaciones, el borrado del estado de tareas de HA,
los alias de inventarios de Terraform, las ejecuciones de workflows ni las invitaciones a proyectos. El
[catálogo de eventos](/reference/audit-events) marca los eventos previstos para versiones posteriores.

## Próximos pasos {#whats-next}

- [Eventos de auditoría](/reference/audit-events) — campos de los eventos, eventos disponibles y previstos, y cobertura de cumplimiento.
- [Opciones de configuración](/reference/configuration#audit-log) — todas las opciones `audit.*` y variables de entorno.
- [Registros](/admin-guide/logs) — registros del servidor, de actividad y de tareas.
