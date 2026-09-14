# Protokolle

Semaphore schreibt Serverprotokolle nach **stdout** und speichert **Task**- und **Aktivitäts**-Protokolle in einer **Datenbank**. Dadurch werden die wichtigsten Protokollinformationen zentralisiert, und Protokolldateien müssen nicht mehr separat gesichert werden. Die einzigen Daten, die im Dateisystem abgelegt werden, sind Cache-Daten.

---

## Serverprotokoll {#server-log}

Semaphore schreibt keine Protokolldateien. Stattdessen werden alle Anwendungsprotokolle nach **stdout** geschrieben.  
Wenn Semaphore als systemd-Dienst läuft, können Sie die Protokolle mit folgendem Befehl anzeigen:

```bash
journalctl -u semaphore.service -f
```

Wenn Semaphore in einem Docker-Container läuft, können Sie die Protokolle mit folgendem Befehl anzeigen:
```
docker logs -f my-semaphore-container
```

Dies liefert eine Live-Ansicht (Streaming) der Protokolle.

---

## Aktivitätsprotokoll {#activity-log}

Das Aktivitätsprotokoll erfasst Benutzeraktionen in Semaphore, darunter:

- Hinzufügen oder Entfernen von Ressourcen (z. B. Vorlagen, Inventories, Repositories).
- Hinzufügen oder Entfernen von Teammitgliedern.

### Pro-Version 2.10 und neuer <Pro /> {#pro-version-210-and-later}

**Semaphore Pro** 2.10+ unterstützt das Schreiben des Aktivitätsprotokolls und des Task-Protokolls in eine Datei. Um dies zu aktivieren, fügen Sie folgende Konfiguration zu Ihrer `config.json` hinzu:

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


Alternativ können Sie dies über die folgenden Umgebungsvariablen erreichen:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Optionen für die Aktivitäts-(Ereignis-)Protokollierung {#activity-events-logging-options}

Mit den Optionen für die Aktivitäts-(Ereignis-)Protokollierung legen Sie fest, wie Semaphore Benutzeraktionen und Systemereignisse in eine Datei schreibt. Diese Einstellungen steuern das Verhalten der Ereignisprotokollierung, einschließlich der Frage, ob sie aktiviert ist, des Formats der Protokolleinträge und der spezifischen Logger-Konfiguration. Wenn sie aktiviert ist, werden Benutzeraktionen wie das Erstellen von Vorlagen oder das Verwalten von Teams gemäß diesen Einstellungen in die angegebene Protokolldatei geschrieben.

| Parameter             | Umgebungsvariablen | Beschreibung          |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Aktiviert die Ereignisprotokollierung in eine Datei. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Format der Protokolleinträge. Für das Raw-Format leer lassen oder `json` festlegen. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Logger-Optionen](#logger-options). |

#### Optionen für die Task-Protokollierung {#tasks-logging-options}

Mit den Optionen für die Task-Protokollierung legen Sie fest, wie Semaphore Details zur Task-Ausführung in eine Datei schreibt. Diese Einstellungen steuern die Protokollierung task-bezogener Ereignisse, einschließlich Task-Start, Task-Abschluss und Ausführungsstatus. Wenn sie aktiviert ist, werden alle Task-Vorgänge und ihre Ergebnisse gemäß diesen Einstellungen in die angegebene Protokolldatei geschrieben, was einen detaillierten Audit-Trail der Task-Ausführungshistorie liefert.

| Parameter             | Umgebungsvariablen | Beschreibung          |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Aktiviert die Task-Protokollierung in eine Datei. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Format der Protokolleinträge. Für das Raw-Format leer lassen oder `json` festlegen. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Logger-Optionen](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Logger-Optionen. |



#### Logger-Optionen {#logger-options}

| Parameter             | Typ | Beschreibung          |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Pfad und Name der Datei, in die Protokolle geschrieben werden. Backup-Protokolldateien werden im selben Verzeichnis aufbewahrt.  Wenn leer, wird `processname`-lumberjack.log im temporären Verzeichnis verwendet. |
| `maxsize`      | Integer | Maximale Größe der Protokolldatei in Megabyte, bevor sie rotiert wird. Standard sind 100 Megabyte. |
| `maxage`       | Integer | Maximale Anzahl von Tagen, die alte Protokolldateien anhand des in ihrem Dateinamen kodierten Zeitstempels aufbewahrt werden.  Beachten Sie, dass ein Tag als 24 Stunden definiert ist und wegen Sommerzeit, Schaltsekunden usw. nicht exakt Kalendertagen entsprechen muss. Standardmäßig werden alte Protokolldateien nicht anhand des Alters entfernt. |
| `maxbackups`   | Integer | Maximale Anzahl alter Protokolldateien, die aufbewahrt werden.  Standardmäßig werden alle alten Protokolldateien aufbewahrt (MaxAge kann jedoch weiterhin dazu führen, dass sie gelöscht werden). |
| `localtime`    | Boolean | Legt fest, ob für die Formatierung der Zeitstempel in Backup-Dateien die lokale Zeit des Rechners verwendet wird.  Standardmäßig wird UTC verwendet. |
| `compress`     | Boolean | Legt fest, ob rotierte Protokolldateien mit gzip komprimiert werden sollen. Standardmäßig wird keine Komprimierung durchgeführt. |



Jede Zeile in der Datei folgt diesem Format:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Task-Verlauf {#task-history}

Semaphore speichert Informationen zur Task-Ausführung in der Datenbank. Der Task-Verlauf bietet eine detaillierte Übersicht über alle ausgeführten Tasks, einschließlich ihres Status und ihrer Protokolle. Sie können Tasks in Echtzeit überwachen oder historische Protokolle über die Weboberfläche einsehen.

### Task-Aufbewahrung konfigurieren {#configuring-task-retention}

Standardmäßig speichert Semaphore alle Tasks in der Datenbank. Wenn Sie eine große Anzahl von Tasks ausführen, können diese erheblichen Speicherplatz belegen.

Sie können mit einem der folgenden Ansätze konfigurieren, wie viele Tasks pro Vorlage aufbewahrt werden:

1. **Umgebungsvariable**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **Option in `config.json`**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

Wenn die Anzahl der Tasks diesen Grenzwert überschreitet, werden die ältesten Task-Protokolle automatisch gelöscht.

---

## Unterstützung des Syslog-Protokolls <Enterprise /> {#syslog-protocol-support}

Semaphore kann Aktivitäts- und Task-Protokolleinträge zur Langzeitspeicherung oder zentralen Überwachung an einen externen Syslog-Collector weiterleiten. Die Syslog-Weiterleitung ist standardmäßig deaktiviert.

Konfigurieren Sie die Syslog-Unterstützung in `config.json`:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

Dieselben Optionen stehen über Umgebungsvariablen zur Verfügung, wenn Sie die JSON-Datei nicht bearbeiten möchten:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Syslog-Optionen {#syslog-options}

| Parameter             | Umgebungsvariablen | Beschreibung          |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Schaltet die Syslog-Weiterleitung ein oder aus. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protokoll für die Verbindung zum Collector, z. B. `udp` oder `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Adresse des Collectors im Format `host:port`. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Optionale Kennung, die jeder Nachricht vorangestellt wird. |


Starten Sie den Semaphore-Dienst nach dem Ändern dieser Werte neu, damit das neue Syslog-Ziel übernommen wird.

---

## SIEM-Integration <Enterprise /> {#siem-integration}

Semaphore 2.20+ zeichnet einen Sicherheits-Audit-Trail auf, der sich zur Weiterleitung an ein SIEM (Splunk, Elastic Security, QRadar, Wazuh usw.) eignet.

Jedes Audit-Ereignis enthält neben dem handelnden Benutzer und dem betroffenen Objekt die **Aktion** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), die **Client-IP-Adresse** und den **User-Agent**. Neben Ressourcenänderungen protokolliert Semaphore:

- Erfolgreiche Anmeldungen (Passwort, LDAP und OpenID), Abmeldungen, fehlgeschlagene Anmeldeversuche und fehlgeschlagene MFA-Prüfungen.
- Erstellung, Aktualisierung und Löschung von Benutzerkonten sowie Passwortänderungen.
- Erstellung und Löschung von API-Tokens (nur das kurze Token-Präfix wird protokolliert, niemals das Geheimnis).

Es gibt drei Möglichkeiten, Audit-Ereignisse an Ihr SIEM zu übermitteln:

1. **Pull:** Lesen Sie `/api/events` aus (siehe [API-Dokumentation](/reference/api)).
2. **Datei-Collector:** Aktivieren Sie die Aktivitätsprotokolldatei (Pro, siehe oben) und übertragen Sie `events.log` (JSON-Format empfohlen) mit Filebeat, Fluentd oder einem Splunk Universal Forwarder.
3. **Audit-Webhook (Pro):** Senden Sie Ereignisse in Echtzeit über HTTPS – an einen generischen JSON-Endpunkt oder den Splunk HTTP Event Collector.

### Audit-Webhook {#audit-webhook}

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

Oder über Umgebungsvariablen:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Audit-Webhook-Optionen {#audit-webhook-options}

| Parameter             | Umgebungsvariablen | Beschreibung          |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Schaltet die Weiterleitung von Audit-Ereignissen ein oder aus. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | Vollständige URL des Empfänger-Endpunkts. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Payload-Format: leer für reines JSON oder `splunk_hec` für eine Splunk-HEC-Hülle. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | Zusätzliche HTTP-Header, z. B. das HEC-Token: `{"Authorization": "Splunk <token>"}`. |

Die Zustellung erfolgt asynchron: Ereignisse werden im Speicher in eine Warteschlange gestellt und bis zu dreimal mit Backoff erneut gesendet, sodass ein nicht erreichbarer Empfänger Benutzeranfragen niemals verlangsamt oder scheitern lässt. Bleibt der Empfänger nicht erreichbar, werden die Ereignisse in der Warteschlange mit einer Warnung im Serverprotokoll verworfen.

## Zusammenfassung {#summary}

- **Serverprotokoll:** Wird nach stdout geschrieben; unter systemd über `journalctl` einsehbar.  
- **Aktivitäts- und Task-Protokoll:** Erfasst alle Benutzeraktionen. Optional kann **Pro 2.10+** diese in eine Datei schreiben.  
- **Task-Verlauf:** Speichert Echtzeit- und historische Task-Ausführungsprotokolle. Die Aufbewahrung ist pro Vorlage konfigurierbar.

Wenn Sie diese Richtlinien befolgen, haben Sie angemessene Einsicht in den Betrieb von Semaphore UI und behalten zugleich Speicherverbrauch und Protokollaufbewahrung unter Kontrolle.
