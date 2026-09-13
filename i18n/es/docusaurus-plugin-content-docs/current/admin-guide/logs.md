# Registros

Semaphore escribe los registros del servidor en **stdout** y almacena los registros de **Tareas** y de **Actividad** en una **base de datos**, centralizando la información clave de los registros y eliminando la necesidad de hacer copias de seguridad de los archivos de registro por separado. Los únicos datos almacenados en el sistema de archivos son los datos de caché.

---

## Registro del servidor {#server-log}

Semaphore no escribe registros en archivos. En su lugar, todos los registros de la aplicación se escriben en **stdout**.  
Si Semaphore se ejecuta como servicio de systemd, puede ver los registros con el siguiente comando:

```bash
journalctl -u semaphore.service -f
```

Si Semaphore se ejecuta en un contenedor Docker, puede ver los registros con el siguiente comando:
```
docker logs -f my-semaphore-container
```

Esto proporciona una vista en vivo (en streaming) de los registros.

---

## Registro de actividad {#activity-log}

El Registro de actividad captura acciones de usuario realizadas en Semaphore, incluidas:

- Añadir o eliminar recursos (p. ej., Plantillas, Inventarios, Repositorios).
- Añadir o eliminar miembros del equipo.

### Versión Pro 2.10 y posteriores {#pro-version-210-and-later}

**Semaphore Pro** 2.10+ permite escribir el Registro de actividad y el registro de Tareas en un archivo. Para habilitarlo, añada la siguiente configuración a su `config.json`:

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


O puede hacerlo mediante las siguientes variables de entorno:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Opciones de registro de actividad (eventos) {#activity-events-logging-options}

Las opciones de registro de actividad (eventos) permiten configurar cómo Semaphore registra en un archivo las acciones de usuario y los eventos del sistema. Estos ajustes controlan el comportamiento del registro de eventos, incluido si está habilitado, el formato de las entradas de registro y la configuración específica del logger. Cuando está habilitado, las acciones de usuario como crear plantillas o gestionar equipos se escribirán en el archivo de registro especificado según estos ajustes.

| Parámetro             | Variables de entorno | Descripción           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Habilita el registro de eventos en archivo. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Formato de los registros. Déjelo vacío para formato raw o establézcalo en `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Opciones del logger](#logger-options). |

#### Opciones de registro de tareas {#tasks-logging-options}

Las opciones de registro de tareas permiten configurar cómo Semaphore registra en un archivo los detalles de ejecución de las tareas. Estos ajustes controlan el registro de los eventos relacionados con tareas, incluidos los inicios, las finalizaciones y su estado de ejecución. Cuando está habilitado, todas las operaciones de tareas y sus resultados se escribirán en el archivo de registro especificado según estos ajustes, proporcionando una traza de auditoría detallada del historial de ejecución de tareas.

| Parámetro             | Variables de entorno | Descripción           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Habilita el registro de tareas en archivo. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Formato de los registros. Déjelo vacío para formato raw o establézcalo en `json`. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Opciones del logger](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Opciones del logger. |



#### Opciones del logger {#logger-options}

| Parámetro             | Tipo | Descripción           |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Ruta y nombre del archivo en el que se escriben los registros. Los archivos de registro de respaldo se conservarán en el mismo directorio.  Si está vacío, se usa `processname`-lumberjack.log en el directorio temporal. |
| `maxsize`      | Integer | Tamaño máximo en megabytes del archivo de registro antes de rotarlo. El valor predeterminado es 100 megabytes. |
| `maxage`       | Integer | Número máximo de días que se conservan los archivos de registro antiguos, según la marca de tiempo codificada en su nombre de archivo.  Tenga en cuenta que un día se define como 24 horas y puede no corresponder exactamente con los días naturales debido al horario de verano, segundos intercalares, etc. De forma predeterminada no se eliminan archivos de registro antiguos por antigüedad. |
| `maxbackups`   | Integer | Número máximo de archivos de registro antiguos que se conservan.  De forma predeterminada se conservan todos los archivos de registro antiguos (aunque MaxAge puede seguir provocando su eliminación). |
| `localtime`    | Boolean | Determina si la hora utilizada para formatear las marcas de tiempo en los archivos de respaldo es la hora local del equipo.  De forma predeterminada se usa la hora UTC. |
| `compress`     | Boolean | Determina si los archivos de registro rotados deben comprimirse con gzip. De forma predeterminada no se realiza compresión. |



Cada línea del archivo sigue este formato:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Historial de tareas {#task-history}

Semaphore almacena en la base de datos la información sobre la ejecución de tareas. El historial de tareas ofrece una vista detallada de todas las tareas ejecutadas, incluido su estado y sus registros. Puede supervisar las tareas en tiempo real o revisar los registros históricos a través de la interfaz web.

### Configurar la retención de tareas {#configuring-task-retention}

De forma predeterminada, Semaphore almacena todas las tareas en la base de datos. Si ejecuta un gran número de tareas, estas pueden ocupar una cantidad considerable de espacio en disco.

Puede configurar cuántas tareas se conservan por plantilla usando uno de los siguientes métodos:

1. **Variable de entorno**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **Opción en `config.json`**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

Cuando el número de tareas supera este límite, los registros de tareas más antiguos se eliminan automáticamente.

---

## Compatibilidad con el protocolo syslog {#syslog-protocol-support}

Semaphore puede reenviar las entradas del registro de actividad y de tareas a un colector syslog externo para su almacenamiento a largo plazo o para una supervisión centralizada. El reenvío a syslog está deshabilitado de forma predeterminada.

Configure la compatibilidad con syslog en `config.json`:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

Las mismas opciones están disponibles mediante variables de entorno si prefiere no editar el archivo JSON:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Opciones de syslog {#syslog-options}

| Parámetro             | Variables de entorno | Descripción           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Activa o desactiva el reenvío a syslog. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protocolo utilizado para llegar al colector, como `udp` o `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Dirección del colector en formato `host:port`. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Identificador opcional que se antepone a cada mensaje. |


Reinicie el servicio de Semaphore después de cambiar estos valores para que se aplique el nuevo destino de syslog.

---

## Integración con SIEM {#siem-integration}

Semaphore 2.20+ registra una traza de auditoría de seguridad adecuada para reenviarla a un SIEM (Splunk, Elastic Security, QRadar, Wazuh, etc.).

Cada evento de auditoría incluye la **acción** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), la **dirección IP del cliente** y el **user agent**, además del usuario que actúa y el objeto afectado. Además de los cambios en recursos, Semaphore registra:

- Inicios de sesión correctos (contraseña, LDAP y OpenID), cierres de sesión, intentos de inicio de sesión fallidos y verificaciones MFA fallidas.
- Creación, actualización y eliminación de cuentas de usuario, así como cambios de contraseña.
- Creación y eliminación de tokens de API (solo se registra el prefijo corto del token, nunca el secreto).

Hay tres formas de entregar los eventos de auditoría a su SIEM:

1. **Pull:** lea `/api/events` (consulte la [documentación de la API](/reference/api)).
2. **Colector de archivos:** habilite el archivo del Registro de actividad (Pro, ver arriba) y envíe `events.log` (se recomienda el formato JSON) con Filebeat, Fluentd o un Splunk Universal Forwarder.
3. **Webhook de auditoría (Pro):** envíe eventos en tiempo real mediante HTTPS: a un endpoint JSON genérico o a Splunk HTTP Event Collector.

### Webhook de auditoría {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

O mediante variables de entorno:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Opciones del webhook de auditoría {#audit-webhook-options}

| Parámetro             | Variables de entorno | Descripción           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Activa o desactiva el reenvío de eventos de auditoría. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | URL completa del endpoint receptor. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Formato del payload: vacío para JSON plano o `splunk_hec` para un envoltorio Splunk HEC. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | Cabeceras HTTP adicionales, p. ej. el token HEC: `{"Authorization": "Splunk <token>"}`. |

La entrega es asíncrona: los eventos se encolan en memoria y se reintentan hasta tres veces con espera progresiva, de modo que un receptor no disponible nunca ralentiza ni hace fallar las peticiones de los usuarios. Si el receptor permanece caído, los eventos encolados se descartan con una advertencia en el registro del servidor.

## Resumen {#summary}

- **Registro del servidor:** se escribe en stdout; puede verse con `journalctl` si se ejecuta bajo systemd.  
- **Registro de actividad y tareas:** registra todas las acciones de usuario. Opcionalmente, **Pro 2.10+** puede escribirlos en un archivo.  
- **Historial de tareas:** almacena los registros de ejecución de tareas en tiempo real e históricos. La retención se puede configurar por plantilla.

Seguir estas pautas garantiza una visibilidad adecuada de las operaciones de Semaphore UI, a la vez que se controla el uso de almacenamiento y la retención de registros.
