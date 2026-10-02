---
title: Registro de auditoría
description: Active el registro de auditoría para ver quién hizo qué en Semaphore y envíe los eventos de auditoría de Semaphore Pro a un SIEM.
---

# Registro de auditoría

El registro de auditoría guarda las acciones importantes en Semaphore: quién inició sesión, quién cambió un
usuario o un rol, quién creó un token de API. Cada evento muestra quién lo hizo, cuándo, desde qué dirección
y si funcionó. Úselo para averiguar qué pasó en su instalación o envíe los eventos a su SIEM para tenerlos
junto al resto de sus registros.

El registro de auditoría está disponible en todas las ediciones. Enviar eventos a un SIEM requiere
Semaphore Pro.

## Qué se registra {#recorded-events}

Actualmente Semaphore registra los inicios de sesión y la actividad de las cuentas, de los proyectos y de las tareas:

- inicios de sesión, intentos fallidos, cierres de sesión y comprobaciones del segundo factor;
- tokens de API rechazados, solicitudes denegadas y solicitudes entre sitios bloqueadas;
- cambios en usuarios, contraseñas, autenticación de dos factores, identidades externas y tokens de API;
- cambios en los miembros del proyecto, los roles y los permisos de plantillas;
- cambios en proyectos, inventarios, repositorios, plantillas, programaciones, integraciones, configuraciones de
  host, entornos, credenciales y almacenes de secretos, y exportaciones y restauraciones de copias de proyectos;
- cambios en la configuración del sistema y la activación de la licencia Pro;
- inicios de tareas con su origen (API, programación, integración, ejecución automática, flujo de trabajo), aprobaciones, detenciones,
  finalizaciones y el historial de tareas eliminado;
- cambios en los runners, registros (incluidos los tokens de registro rechazados), bajas de registro y los informes de los runners
  con un estado no válido;
- cada arranque del servidor.

Se añadirán más eventos en próximas versiones. Para ver la lista completa, consulte
[Eventos de auditoría](/reference/audit-events).

Las contraseñas, los tokens, los valores secretos y la salida de las tareas nunca aparecen en los eventos de
auditoría. Los tokens de API se muestran mediante una huella en lugar de su valor. Un inicio de sesión
fallido conserva el nombre de usuario introducido, por lo que puede contener una dirección de correo.

Una tarea que termina tiene un evento de finalización, también cuando falla antes de iniciarse. `metadata.result` muestra el
estado que Semaphore dio a la tarea, y `metadata.end_reason` indica por qué Semaphore la terminó: `timeout` cuando se ejecutó
demasiado tiempo, `runner_lost` cuando su runner dejó de responder. Los argumentos de la tarea, las variables, las etiquetas del runner y los tokens
no se registran.

Los eventos de finalización siguen lo que Semaphore muestra en el historial de tareas, incluidas sus lagunas conocidas:

- Una tarea detenida con «Detener todo» o al detener una ejecución de flujo de trabajo mientras aún espera en la cola no tiene
  evento de finalización. El evento `task.control/stop_all` se registra para «Detener todo».
- Una tarea detenida antes de iniciarse, por ejemplo mientras espera confirmación, puede quedarse en el estado
  `stopping`. Su evento de finalización tiene entonces `result` `stopping`.
- En un clúster HA, al detener una tarea que ya no ejecuta ningún nodo (por ejemplo, tras la caída de un nodo) no se registra ningún
  evento de finalización.
- Una detención que llega en el mismo momento en que una tarea se inicia o termina puede dar a la tarea dos eventos de
  finalización, ya que el historial de tareas muestra entonces dos entradas finales.

Durante una actualización progresiva de un clúster HA, una tarea iniciada en un nodo actualizado y terminada en un nodo que
aún no está actualizado no tiene evento de finalización.

Las URL de repositorios, las URL de configuraciones de host y los alias de integraciones tampoco se registran.

A veces Semaphore guarda o elimina un objeto, pero una parte posterior de la misma solicitud falla. La
interfaz o la API muestra entonces un error, aunque el objeto se creó o se eliminó. Ese evento se registra como
un éxito con `metadata.partial=true`, y `reason` indica qué no se completó:

- `secret_failed`: se guardó o eliminó un entorno, pero algunos de sus secretos no se guardaron o no se
  quitaron;
- `inventory_failed`: se creó una plantilla, pero no su inventario del workspace de Terraform;
- `restore_failed`: se restauró un proyecto desde una copia, pero no todos sus objetos;
- `setup_failed`: se creó un proyecto, pero no quedó configurado del todo; por ejemplo, su creador no se añadió
  como propietario.

## Activar el registro de auditoría {#enable}

El registro de auditoría está desactivado por defecto. Para activarlo, establezca `audit.enabled` y dé un
nombre a su instalación en `audit.instance_id`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

O con variables de entorno:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

El ID de instancia tiene de 1 a 255 caracteres sin espacios. Se añade a cada evento para que pueda
distinguir sus instalaciones cuando envían eventos al mismo lugar.

Reinicie Semaphore. El registro empieza tras el reinicio; las acciones anteriores no se añaden. Para ver
todas las opciones, consulte [Opciones de configuración](/reference/configuration#audit-log).

## Registrar la dirección del cliente detrás de un proxy {#trusted-proxies}

Si Semaphore funciona detrás de un proxy inverso, los eventos muestran la dirección del proxy en lugar de la
del usuario. Para registrar la dirección real del cliente, indique las redes de sus proxies en
`audit.trusted_proxy_cidrs`:

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
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore toma entonces la dirección del cliente de `X-Forwarded-For` o `X-Real-IP`, pero solo en las
solicitudes que llegan desde esas redes. Si las solicitudes pasan por varios proxies, indíquelos todos. No
incluya las redes desde las que se conectan sus usuarios: cualquiera en ellas podría poner cualquier
dirección en esas cabeceras.

## Almacenamiento {#storage}

Los eventos se guardan en la base de datos de Semaphore, así que sus copias de seguridad habituales los
incluyen. Semaphore no muestra los eventos de auditoría en la interfaz ni elimina los eventos antiguos, así
que vigile el tamaño de la base de datos.

El registro de auditoría nunca estorba a sus usuarios. Si un evento no se puede guardar, Semaphore escribe
un error en el registro del servidor y la acción continúa con normalidad.

## Exportar a un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro puede enviar eventos de auditoría a un receptor Syslog mediante TLS, como rsyslog o Vector. El
receptor puede guardarlos o reenviarlos a su SIEM.

Necesitará:

- el nombre de host y el puerto del receptor;
- un nombre para este destino, como `security-syslog`;
- el certificado de la CA del receptor, si el host de Semaphore aún no confía en ella.

Añada `audit.syslog` a `config.json`:

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

O con variables de entorno:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` y `address` son obligatorios. Semaphore recuerda qué eventos ya ha enviado a cada destino, así que
mantenga el mismo `id` cuando cambie la dirección o el certificado. Un `id` nuevo empieza con los eventos
nuevos.

Semaphore siempre comprueba el certificado del receptor y usa TLS 1.2 o posterior. `ca_file` añade su CA a
los certificados de confianza, y `server_name` indica el nombre que se comprueba en el certificado cuando
difiere de la dirección.

Reinicie Semaphore. Si la configuración no es válida o no se puede leer el archivo de la CA, Semaphore no
arranca.

### Comprobar que llegan los eventos {#verify-siem-delivery}

Semaphore registra un evento cada vez que arranca. Tras el reinicio, búsquelo en el receptor: `event_code`
es `audit.lifecycle`, `action` es `start` y `metadata.destinations` incluye el ID de su destino.

### Cómo se entregan los eventos {#delivery}

- Si el receptor no está disponible, los eventos esperan en la base de datos y se envían cuando vuelve. Los
  usuarios no notan nada.
- Tras errores de red, reinicios o una conmutación por error en HA, algunos eventos pueden llegar dos veces.
  Use `event_id` para descartar duplicados y `seq` para ordenar los eventos.
- Si una conexión se corta sin error, el evento enviado en ese momento puede perderse.
- En una [instalación HA](/admin-guide/ha), un solo nodo envía eventos a la vez. Si Redis no está
  disponible, el envío se pausa y los eventos se siguen registrando.

Cada evento se envía como un mensaje Syslog RFC 5424 con el JSON del evento como cuerpo. `HOSTNAME` es el ID
del nodo HA, o el ID de instancia en un solo nodo, y `MSGID` es el código del evento.

Los ejemplos siguientes son mínimos y solo muestran cómo recibir los eventos. Aceptan conexiones de cualquier
cliente que llegue al puerto. En producción, proteja el receptor para que solo sus servidores de Semaphore
puedan enviarle eventos.

### Ejemplo de rsyslog {#rsyslog}

Esta configuración de rsyslog acepta la conexión TLS y escribe un evento por línea:

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

### Ejemplo de Vector {#vector}

Esta configuración de Vector acepta la conexión TLS, lee el JSON del evento y lo escribe en un archivo:

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

- **Semaphore no arranca.** Compruebe que `audit.syslog.id` y `audit.syslog.address` están definidos y que
  el archivo de la CA contiene certificados PEM.
- **La conexión TLS falla.** Compruebe que el certificado del receptor coincide con `server_name` y está
  firmado por una CA en la que Semaphore confía.
- **Los eventos no llegan.** Revise el registro del servidor de Semaphore y el registro del receptor. Tras un
  fallo, Semaphore espera un poco antes de volver a intentarlo.
- **Algunos eventos llegan dos veces.** Puede ocurrir tras reintentos y conmutaciones. Descarte los
  duplicados por `event_id`.

## Qué no se registra {#not-recorded}

La herramienta de línea de comandos `semaphore` trabaja directamente con la base de datos, así que comandos
como `user add` y `user token` no se registran.

Algunas acciones de la interfaz aún no se registran: eliminar una licencia, la configuración de apps,
limpiar el estado de tareas en HA, los alias de inventarios de Terraform, eliminar un estado de Terraform, las
ejecuciones de workflows y las invitaciones a proyectos. Tampoco se registran las descripciones de plantillas,
las vistas, la limpieza de la caché del proyecto ni las sincronizaciones programadas de almacenes de secretos.
Para ver los eventos previstos en próximas versiones, consulte [Eventos de auditoría](/reference/audit-events).

## Siguientes pasos {#whats-next}

- [Eventos de auditoría](/reference/audit-events) — el formato de los eventos y todos los eventos registrados.
- [Opciones de configuración](/reference/configuration#audit-log) — todas las opciones `audit.*` y variables de entorno.
- [Registros](/admin-guide/logs) — registros del servidor, de actividad y de tareas.
