---
title: Envía el registro de auditoría a un SIEM
description: Configura Semaphore Pro para enviar los eventos de auditoría a un SIEM mediante Syslog con TLS y prepara rsyslog o Vector para recibirlos.
---

# Envía el registro de auditoría a un SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro envía cada evento del [registro de auditoría](/admin-guide/audit-log) a un SIEM como un mensaje
Syslog RFC 5424 sobre TLS.

## Antes de empezar {#before-you-begin}

- Una licencia de Semaphore Pro.
- El [registro de auditoría activado](/admin-guide/audit-log#enable).
- Un receptor Syslog que acepte TLS, por ejemplo rsyslog o Vector, consulta
  [Ejemplos de receptores](#receivers).
- El certificado de la CA que firmó el certificado del receptor, en formato PEM, si no está en el almacén de
  confianza del sistema.

## Pasos {#steps}

Para enviar el registro de auditoría a un SIEM, sigue estos pasos:

1. Añade la sección `audit.syslog` a `config.json`:

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
         "address": "siem.example.com:6514",
         "ca_file": "/etc/semaphore/siem-ca.pem",
         "server_name": "siem.example.com",
         "timeout": "10s"
       }
     }
   }
   ```

   O con variables de entorno:

   ```bash
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` y `address` son obligatorios. `ca_file` añade una CA al almacén de confianza del sistema.
   `server_name` sustituye el nombre que se comprueba en el certificado del receptor. `timeout` limita la
   conexión y la escritura, 10 segundos por defecto.
2. Reinicia Semaphore. Un archivo de CA ilegible o la falta de `id` o `address` detiene el arranque con un
   error.
3. Inicia sesión con una contraseña incorrecta. El SIEM recibe un evento `auth.login` con el resultado
   `failure`.

## Cómo se entregan los eventos {#delivery}

- Semaphore guarda su posición en el registro con el `id`. Tras un reinicio continúa desde ahí, y los eventos
  registrados mientras el receptor no estaba disponible se envían cuando vuelve. Un `id` nuevo empieza en el
  evento actual y no envía los anteriores.
- La entrega es de mejor esfuerzo: un evento escrito en una conexión que se cae sin avisar puede perderse.
- Un evento puede llegar dos veces, por ejemplo tras un error de red o una conmutación por error. Elimina los
  duplicados por `event_id` y ordena los eventos por `seq`.
- Con [alta disponibilidad](/admin-guide/ha), envía un nodo cada vez. Otro nodo toma el relevo cuando se
  detiene.

## Ejemplos de receptores {#receivers}

Semaphore envía mensajes RFC 5424 con entramado por recuento de octetos (RFC 5425). El cuerpo del mensaje es el
JSON del evento. El `HOSTNAME` de Syslog es el ID del nodo o, sin HA, el ID de la instancia, y `MSGID` es el
`event_code`.

### rsyslog {#rsyslog}

Recibe eventos por TLS y escribe un evento JSON por línea:

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

### Vector {#vector}

Recibe eventos por TLS y analiza el JSON del evento:

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

## Qué sigue {#whats-next}

- [Registro de auditoría](/admin-guide/audit-log) — el esquema del evento y qué se registra.
- [Eventos de auditoría](/reference/audit-events) — cada evento con sus resultados, motivos y metadatos.
- [Configuración](/reference/configuration) — cada opción `audit.*`.
