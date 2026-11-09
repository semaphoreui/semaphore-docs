---
title: "Hochverfügbarkeit"
---

# Hochverfügbarkeit <Enterprise />

:::info
Hochverfügbarkeit ist in der Edition **Semaphore Enterprise** verfügbar.
:::

Semaphore UI unterstützt Aktiv-Aktiv-Deployments mit Hochverfügbarkeit (HA), bei denen mehrere Instanzen gleichzeitig hinter einem Load Balancer laufen. Jede Instanz kann UI-Anfragen, API-Aufrufe, geplante Jobs und die Ausführung von Tasks vollständig verarbeiten. Fällt eine Instanz aus, arbeiten die verbleibenden Knoten ohne Unterbrechung weiter.

## Architektur {#architecture}

Ein typisches Aktiv-Aktiv-Deployment besteht aus den folgenden Komponenten:

**Load Balancer** — Benutzer verbinden sich über einen Load Balancer (z. B. NGINX, HAProxy oder einen Cloud-Load-Balancer). Der Load Balancer verteilt HTTP- und WebSocket-Verkehr auf die verfügbaren Semaphore-Knoten.

**Semaphore-Knoten** — Jeder Knoten führt eine identische Instanz von Semaphore UI aus. Jeder Knoten kann Benutzeranfragen entgegennehmen, Automatisierungsjobs starten, geplante Tasks verarbeiten und Echtzeit-Updates senden. Alle Knoten sind gleichberechtigt — es gibt keinen primären oder Standby-Knoten.

**Gemeinsame Datenbank** — Alle Instanzen verbinden sich mit einer gemeinsamen PostgreSQL- oder MySQL-Datenbank. Die Datenbank ist die einzige verbindliche Quelle für Projekte, Vorlagen, Inventories, Zeitpläne, Task-Verlauf, Benutzerkonten und RBAC-Konfiguration.

:::warning
SQLite und BoltDB werden für HA-Deployments nicht unterstützt. Verwenden Sie PostgreSQL oder MySQL.
:::

**Redis** — Redis stellt die Koordinationsschicht bereit, mit der sich mehrere Knoten wie ein einziges System verhalten. Es erfüllt drei Funktionen:

* **Verteilte Sperren (Distributed Locks)** stellen sicher, dass nur eine Instanz einen bestimmten Job zu einem Zeitpunkt ausführt, und verhindern so die doppelte Ausführung von Tasks.
* **Gemeinsamer Zustand der Task-Warteschlange** verwaltet die Task-Warteschlange, sodass Jobs von genau einem Worker übernommen werden. Alle Knoten sehen dieselbe Warteschlange und koordinieren die Ausführung.
* **Pub/Sub-Messaging** ermöglicht es Knoten, Ereignisse wie Task-Updates, Cluster-Benachrichtigungen, Cache-Invalidierung und Änderungen des UI-Zustands zu verbreiten. So bleiben alle Knoten in Echtzeit synchron.

## Voraussetzungen {#prerequisites}

Bevor Sie HA einrichten, benötigen Sie:

* Einen Abonnementschlüssel für **Semaphore Enterprise**.
* Eine gemeinsame **PostgreSQL**- oder **MySQL**-Datenbank, die von allen Knoten erreichbar ist.
* Einen **Redis**-Server oder ein **Redis Sentinel**-Deployment, erreichbar von allen Knoten. Redis Cluster wird nicht unterstützt.
* Einen **Load Balancer**, der HTTP- und WebSocket-Verkehr unterstützt.
* Zwei oder mehr Server, auf denen die Semaphore-Instanzen laufen.

Alle Semaphore-Knoten müssen dieselbe Datenbank, dasselbe Redis-Backend und dieselbe Konfiguration verwenden (mit Ausnahme von `ha.node_id`, das pro Knoten eindeutig sein muss).

## Konfiguration {#configuration}

Aktivieren Sie HA, indem Sie auf jedem Knoten den Block `ha` zu Ihrer `config.json` hinzufügen:

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

Jeder Knoten muss eine eindeutige `ha.node_id` haben. Die gesamte übrige Konfiguration sollte auf allen Knoten identisch sein.

### Umgebungsvariablen {#environment-variables}

Alternativ können Sie HA über Umgebungsvariablen konfigurieren:

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Um auch den Ausfall des Redis-Servers selbst zu überstehen, richten Sie den Cluster auf ein [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)-Deployment statt auf eine einzelne Adresse aus. Setzen Sie `ha.engine` auf `redis_sentinel` und beschreiben Sie das Sentinel-Setup in `ha.redis_sentinel`:

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

Jeder Knoten fragt die Sentinels nach dem aktuellen Master und folgt einem Failover ohne Neustart: Ein Task, der während des Master-Wechsels läuft, läuft weiter, und neue Tasks, Zeitpläne und Echtzeit-Updates werden auf dem beförderten Replica fortgesetzt.

Dasselbe Setup mit Umgebungsvariablen (die Sentinel-Liste ist ein JSON-Array):

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Hinweise:

* `ha.engine` entscheidet, welcher Block gelesen wird. `redis` (der Standard) liest `ha.redis`, `redis_sentinel` liest `ha.redis_sentinel`. Der jeweils andere Block wird, falls vorhanden, ignoriert, und beim Start wird eine Warnung protokolliert.
* Mit `redis_sentinel` sind `master_name` und mindestens eine Adresse in `addrs` erforderlich; ohne sie startet der Knoten nicht.
* `user` und `pass` authentifizieren gegenüber den Redis-Datenknoten. Wenn die Sentinels selbst eine Authentifizierung erfordern (`requirepass` in `sentinel.conf`), setzen Sie zusätzlich `sentinel_user` und `sentinel_pass`.
* `tls` und `tls_skip_verify` gelten sowohl für die Verbindungen zu Sentinel als auch für die Verbindungen zu den Redis-Datenknoten.

### Konfigurationsreferenz {#configuration-reference}

| Option in der Konfigurationsdatei | Umgebungsvariable | Beschreibung |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Aktiviert den Hochverfügbarkeitsmodus. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Eindeutige Kennung dieses Knotens. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Adresse des Redis-Servers (z. B. `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Nummer der Redis-Datenbank. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Passwort des Redis-Servers. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Benutzername des Redis-Servers. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Aktiviert TLS für die Redis-Verbindung. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Überspringt die Prüfung des TLS-Zertifikats für Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Redis-Backend: `redis` (einzelner Server, Standard) oder `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Name des überwachten Masters, wie in Sentinel konfiguriert. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Sentinel-Adressen, `host:port`. In der Umgebungsvariablen ein JSON-Array. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Benutzername für die Sentinel-Knoten selbst. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Passwort für die Sentinel-Knoten selbst. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Nummer der Redis-Datenbank auf den Datenknoten. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Benutzername für die Redis-Datenknoten. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Passwort für die Redis-Datenknoten. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Aktiviert TLS für die Sentinel- und Redis-Verbindungen. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Überspringt die Prüfung des TLS-Zertifikats für die Sentinel- und Redis-Verbindungen. |

Die vollständige Liste der verfügbaren Optionen finden Sie unter [Konfiguration](/admin-guide/configuration).

## Load Balancer {#load-balancer}

Setzen Sie einen Load Balancer vor die Semaphore-Knoten, um den Verkehr zu verteilen. Der Load Balancer muss **WebSocket-Verbindungen** für Echtzeit-Updates der Benutzeroberfläche unterstützen.

### NGINX-Beispiel {#nginx-example}

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

Weitere Details zur NGINX-Konfiguration finden Sie unter [Reverse Proxy](/admin-guide/reverse-proxy/nginx).

## So funktioniert die Job-Ausführung {#how-job-execution-works}

In einem Deployment mit mehreren Knoten folgt die Task-Ausführung einem koordinierten Ablauf:

1. **Ein Benutzer löst einen Task aus.** Ein Benutzer startet einen Job über die Benutzeroberfläche oder die API. Die Anfrage kann auf jedem beliebigen Semaphore-Knoten eintreffen.
2. **Die Task-Metadaten werden gespeichert.** Der empfangende Knoten schreibt die Task-Metadaten in die Datenbank und signalisiert über Redis, dass Arbeit ansteht.
3. **Ein Knoten übernimmt den Task.** Einer der verfügbaren Knoten holt den Task aus Redis, erwirbt eine verteilte Sperre und markiert ihn in der Datenbank als laufend.
4. **Der Task wird ausgeführt.** Der Knoten führt den Task lokal aus oder delegiert ihn an einen [Remote-Runner](/admin-guide/runners). Fortschritt und Logs werden in die Datenbank zurückgeschrieben.
5. **Die Ergebnisse werden verbreitet.** Task-Updates werden über Redis Pub/Sub weitergegeben, sodass alle Knoten und verbundenen UI-Clients synchron bleiben.

## So funktioniert HA unter der Haube {#under-the-hood}

Semaphore-Knoten kommunizieren nie direkt miteinander. Alles, worüber sie sich einigen müssen, läuft über Redis: wer am Leben ist, welcher Task zu welchem Knoten gehört, wer einen Zeitplan auslöst und welche UI-Nachrichten weiterzuleiten sind. Jeder Teil dieses Zustands ist eine kleine Menge von Redis-Schlüsseln mit Ablaufzeit, sodass ein abgestürzter Knoten nichts für lange Zeit zurücklassen kann. Die dauerhaften Daten (Tasks, Vorlagen, Logs, Runner) liegen immer in der Datenbank; Redis hält nur den Koordinationszustand.

Alle Schlüssel verwenden die festen Präfixe `ha:` und `tasks:`. Sie sind nicht konfigurierbar, daher müssen zwei Semaphore-Cluster, die sich einen Redis-Server teilen, unterschiedliche Datenbanknummern (`ha.redis.db`) verwenden.

### Knotenregister {#node-registry}

Jeder Knoten registriert sich beim Start und aktualisiert seinen Eintrag anschließend alle 10 Sekunden. Der Eintrag läuft nach 30 Sekunden ab, sodass ein Knoten, der ihn nicht mehr aktualisiert, nach spätestens einer halben Minute als tot gilt. Bei einem geordneten Herunterfahren entfernt der Knoten seinen Eintrag sofort.

| Schlüssel | Typ | Zweck |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat eines Knotens: `node_id`, `started_at`, `version`, `last_beat`. Läuft 30 s nach der letzten Aktualisierung ab. |
| `ha:nodes` | set | IDs aller registrierten Knoten. Mitglieder, deren Heartbeat-Schlüssel abgelaufen ist, werden von den anderen Knoten entfernt. |

Das Knotenregister ist das, was das Cluster-Dashboard anzeigt, und das, was der Orphan-Cleaner (siehe unten) heranzieht, um zu entscheiden, ob der Besitzer eines Tasks noch am Leben ist.

### Task-Warteschlange und laufende Tasks {#task-queue}

Die Task-Warteschlange ist gemeinsam, sodass ein auf einem Knoten gestarteter Task von jedem anderen Knoten verteilt, überwacht und abgeschlossen werden kann. Redis speichert nur Task-IDs und einige wenige flüchtige Felder; der Task selbst wird von dem Knoten, der ihn benötigt, aus der Datenbank geladen.

| Schlüssel | Typ | Zweck |
| --- | --- | --- |
| `tasks:queue` | list | IDs der Tasks, die auf ihre Verteilung warten, in Reihenfolge. |
| `tasks:claim:<task_id>` | string | ID des Knotens, dem der Task gehört. Wird atomar zusammen mit dem Entfernen aus der Warteschlange geschrieben, sodass ein Task von genau einem Knoten übernommen wird. Läuft nach 5 Minuten ab; der Besitzer aktualisiert ihn jede Minute. |
| `tasks:running` | set | IDs der Tasks, die gerade laufen. |
| `tasks:active:<project_id>` | set | IDs der Tasks, die in einem Projekt aktiv sind (wartend oder laufend). Wird für die Parallelitätsgrenzen pro Projekt verwendet. |
| `tasks:task_project` | hash | `task_id` → `project_id`, damit jeder Knoten den Task aus der Datenbank laden kann. |
| `tasks:aliases` | hash | `alias` → `task_id` für Tasks, die über einen Alias angesprochen werden. |
| `tasks:runtime:<task_id>` | hash | Felder, die sich während der Ausführung des Tasks ändern, etwa die Runner-ID und der Benutzer, der ihn gestartet hat. |
| `tasks:finalize:<task_id>` | string | Sperre, die der Knoten nimmt, der das Endergebnis eines auf einem Remote-Runner ausgeführten Tasks schreibt. Läuft nach 5 Minuten ab. |

Einträge in `tasks:task_project`, `tasks:aliases` und `tasks:runtime:*` werden entfernt, wenn der Task endet, und laufen zusätzlich als Sicherheitsnetz nach 7 Tagen ab.

Ein Knoten nimmt einen Task mit einer einzigen atomaren Operation aus der Warteschlange: Er prüft, dass der Task noch in der Warteschlange steht, schreibt den Claim, entfernt den Task aus der Warteschlange und fügt ihn zur Menge der laufenden Tasks hinzu. Versuchen es zwei Knoten gleichzeitig, hat nur einer Erfolg.

**Orphan-Cleaner.** Einmal pro Minute prüft jeder Knoten die laufenden Tasks, deren Besitzer tot ist, das heißt, der Claim ist abgelaufen oder der Heartbeat des Besitzers ist verschwunden. Ein Task, den die Datenbank bereits als beendet ausweist, wird einfach aus Redis entfernt. Ein Task, der nie an einen Runner übergeben wurde, wird zurück in die Warteschlange gestellt, damit ein lebender Knoten ihn verteilt. Ein Task, der bereits auf einem Runner ausgeführt wird, bleibt unangetastet: Der Runner arbeitet weiter, und der Task wird aufgeräumt, sobald die Datenbank ihn als beendet ausweist.

### Sperren {#locks}

Sperren sind einzelne Schlüssel, die mit `SET NX` erstellt werden: Der Knoten, dem es gelingt, den Schlüssel anzulegen, hält die Sperre. Jede Sperre hat eine Ablaufzeit, und lange gehaltene Sperren werden von ihrem Besitzer aufgefrischt, sodass ein abgestürzter Knoten seine Sperren automatisch freigibt.

| Schlüssel | Ablauf | Zweck |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Eine Sperre pro Zeitplan und Minute. Der Knoten, der sie anlegt, löst den Zeitplan aus; die anderen überspringen ihn. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, alle 10 s aufgefrischt | Nur ein Knoten treibt einen bestimmten Workflow-Lauf zu einem Zeitpunkt voran. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Kurze Sperre, während ein neuer Workflow-Lauf erstellt wird, damit zwei Knoten denselben Workflow nicht zweimal starten. |
| `ha:audit:export:<destination_id>` | 30 s, alle 10 s aufgefrischt | Nur ein Knoten exportiert Audit-Ereignisse an ein bestimmtes Ziel. Ist Redis nicht verfügbar, exportiert kein Knoten, sodass Ereignisse nie doppelt gesendet werden. |

Zeitplan- und Workflow-Sperren verhalten sich im Fehlerfall offen (fail open): Ist Redis nicht erreichbar, fährt der Knoten fort, statt die Arbeit zu überspringen, und die bedingten Aktualisierungen in der Datenbank halten das Ergebnis korrekt. Die Lease für den Audit-Export verhält sich im Fehlerfall geschlossen (fail closed), weil ein doppelter Export nicht rückgängig gemacht werden kann.

### Pub/Sub-Kanäle {#pubsub-channels}

| Kanal | Zweck |
| --- | --- |
| `ha:ws:broadcast` | WebSocket-Nachrichten für die Benutzeroberfläche. Ein Knoten stellt eine Nachricht an seine eigenen verbundenen Browser zu und veröffentlicht sie hier; die anderen Knoten leiten sie an ihre Browser weiter. |
| `tasks:events` | Änderungen in der Task-Warteschlange und in der Menge der laufenden Tasks, Aktualisierungen der Laufzeitfelder und Anfragen zum erzwungenen Stopp. Die Knoten nutzen diese Ereignisse, um ihre Sicht auf die Warteschlange im Speicher aktuell zu halten und einen Task zu stoppen, dessen Stopp ein anderer Knoten angefordert hat. |

Nachrichten tragen die ID des sendenden Knotens, sodass ein Knoten seine eigenen Nachrichten ignoriert.

### Schlüssel des Runner-Caches {#runner-cache-keys}

Die Schlüssel `ha:runner:*` gehören zum [Runner-Cache](#runner-cache), der im nächsten Abschnitt beschrieben wird.

## Runner-Cache {#runner-cache}

Jede Anfrage, die ein [Runner](/admin-guide/runners) an den Server sendet, trägt sein Token, und der Server muss dieses Token in einen Runner-Datensatz auflösen, bevor er irgendetwas anderes tun kann. Runner fragen alle paar Sekunden nach und melden während eines laufenden Jobs jede Sekunde ihren Fortschritt, sodass ohne Cache jede dieser Anfragen eine Datenbankabfrage kosten würde. Der Runner-Cache beantwortet die meisten davon aus dem Speicher.

Ein einzelner Knoten hält den Cache in seinem eigenen Speicher. Im HA-Modus reicht das nicht aus: Wenn Sie einen Runner auf Knoten A bearbeiten, darf Knoten B nicht weiterhin den alten Datensatz ausliefern. Deshalb liegt der Cache im HA-Modus in Redis und wird von allen Knoten gemeinsam genutzt, und eine über einen beliebigen Knoten vorgenommene Änderung ist für alle sofort sichtbar.

:::note
Dieser Cache ist nicht die Aktion **Cache leeren** auf der Seite „Runner“. Diese Aktion fordert den Runner selbst auf, die Arbeitsverzeichnisse auf seiner Maschine zu löschen.
:::

### Was wie lange zwischengespeichert wird {#runner-cache-ttl}

Der zwischengespeicherte Wert ist der Runner-Datensatz ohne seine Tags und ohne das Token. Das Token gelangt nie nach Redis: Der Schlüssel wird aus einem SHA-256-Hash des Tokens abgeleitet, und das Token-Feld wird geleert, bevor der Datensatz gespeichert wird.

Ein Eintrag lebt höchstens 30 Sekunden. In der Praxis wird er deutlich früher verworfen, weil jede über Semaphore vorgenommene Änderung den Cache sofort invalidiert:

* Das Erstellen, Aktualisieren, Löschen oder erneute Registrieren eines Runners sowie das Löschen eines Projekts verwirft **jeden** zwischengespeicherten Runner auf allen Knoten.
* Ein Runner-Heartbeat verwirft **nur den Eintrag dieses Runners**, sodass die gespeicherte „Zuletzt gesehen“-Zeit aktuell bleibt, ohne die anderen anzufassen. Ein Heartbeat wird höchstens einmal pro Intervall geschrieben; das Intervall ist ein Drittel von `runners.offline_timeout_sec`, begrenzt auf 45 Sekunden. Mit dem Standard-Timeout von 120 Sekunden ist das alle 40 Sekunden.

Die Ablaufzeit von 30 Sekunden spielt nur bei Änderungen an Semaphore vorbei eine Rolle, etwa beim direkten Bearbeiten der Tabelle `runner` oder beim Wiederherstellen eines Backups.

### Wie veraltete Schreibvorgänge verhindert werden {#runner-cache-generation}

Eine Abfrage, die den Cache verfehlt, liest den Runner aus der Datenbank und speichert ihn anschließend. Zwischen diesen beiden Schritten kann ein anderer Knoten den Runner ändern. Damit die Abfrage nie das zwischenspeichert, was sie vor der Änderung gelesen hat, führt der Cache einen Zähler, der bei jeder Invalidierung wächst. Die Abfrage merkt sich den Zählerwert, den sie vor dem Gang zur Datenbank gesehen hat, und das Speichern wird abgelehnt, wenn der Zähler in der Zwischenzeit weitergelaufen ist. Jeder Schritt läuft als ein einziges Lua-Skript in Redis, sodass Zähler und Eintrag zusammen gelesen und geschrieben werden.

### Redis-Schlüssel {#runner-cache-redis-keys}

| Schlüssel | Typ | Zweck |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | Der Zähler. Wächst bei jeder Invalidierung um eins, egal ob des gesamten Caches oder eines einzelnen Runners. |
| `ha:runner:inv` | string, integer | Zählerwert bei der letzten vollständigen Invalidierung. Er ist Teil jedes Eintragsschlüssels, sodass eine vollständige Invalidierung alle vorhandenen Einträge auf einen Schlag unerreichbar macht; sie laufen dann von selbst ab. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | Der zwischengespeicherte Runner-Datensatz. Läuft nach 30 s ab. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Zählerwert beim letzten Heartbeat dieses Runners. Eine Abfrage, die vor dem Heartbeat begonnen hat, kann den Datensatz von vor dem Heartbeat nicht speichern. Läuft nach 30 s ab. |

Das Cluster-Dashboard meldet die Anzahl der Schlüssel `ha:runner:token:*` als Größe des Runner-Caches.

### Verhalten bei Redis-Problemen {#runner-cache-failures}

Der Cache lässt eine Runner-Anfrage nie fehlschlagen. Jede Cache-Operation ist auf 500 Millisekunden begrenzt; ist Redis langsam oder nicht erreichbar, wird die Abfrage als Fehltreffer behandelt und geht zur Datenbank, und nichts wird gespeichert. Der einzige Fall, den Sie kennen sollten, ist eine Invalidierung, die fehlschlägt, weil Redis genau in dem Moment ausgefallen ist, in dem ein Runner geändert wird: Andere Knoten können dann den alten Datensatz ausliefern, bis er abläuft, spätestens 30 Sekunden später. Der Fehler wird auf der Stufe „error“ protokolliert.

## Skalierung mit Runnern {#scaling-with-runners}

HA ermöglicht außerdem die horizontale Skalierung der Task-Ausführung. Anstatt Jobs nur auf den Semaphore-Knoten selbst auszuführen, kann die Ausführung an mehrere [Runner](/admin-guide/runners) delegiert werden. Das erlaubt Ihnen:

* Die Arbeitslast über Ihre Infrastruktur zu verteilen.
* Die Automatisierungskapazität unabhängig von der Web-/API-Schicht zu skalieren.
* Ausführungsumgebungen zu isolieren, um den Schadensradius zu begrenzen.
* Tasks parallel auf vielen Knoten auszuführen.

Anweisungen zur Einrichtung finden Sie unter [Runner](/admin-guide/runners).

## Vorteile {#benefits}

* **Höhere Zuverlässigkeit** — Fällt eine Instanz aus, bedienen die anderen weiterhin den Verkehr und führen Jobs aus.
* **Wartung ohne Ausfallzeit** — Knoten können einzeln aktualisiert oder neu gestartet werden, ohne das System anzuhalten.
* **Horizontale Skalierbarkeit** — Fügen Sie Semaphore-Knoten hinter dem Load Balancer hinzu, um die Kapazität zu erhöhen.
* **Keine Abhängigkeit von einem primären Knoten** — Alle Knoten sind gleichberechtigt, komplexe Failover-Mechanismen entfallen.
* **Konsistenter Cluster-Zustand** — Gemeinsame Datenbank und Redis-Koordination halten alle Instanzen synchron.

## FAQ {#faq}

### Was ist Aktiv-Aktiv-Hochverfügbarkeit? {#what-is-active-active-high-availability}

Aktiv-Aktiv-HA bedeutet, dass mehrere Anwendungsinstanzen gleichzeitig laufen und alle Anfragen bedienen. Es gibt keinen primären Knoten — jede Instanz kann Verkehr verarbeiten und Jobs ausführen.

### Warum verwendet Semaphore im HA-Modus Redis? {#why-does-semaphore-use-redis-in-ha-mode}

Redis dient als Koordinationsschicht zwischen den Instanzen. Es stellt verteilte Sperren, den gemeinsamen Zustand der Task-Warteschlange und Pub/Sub-Messaging bereit, damit Knoten nicht denselben Job gleichzeitig ausführen.

### Welche Datenbank sollte ich für HA-Deployments verwenden? {#what-database-should-i-use-for-ha-deployments}

Semaphore unterstützt PostgreSQL und MySQL als gemeinsame Datenbank. SQLite und BoltDB können im HA-Modus nicht verwendet werden, da sie keinen gleichzeitigen Zugriff aus mehreren Prozessen unterstützen.

### Was passiert, wenn Redis ausfällt? {#what-happens-if-redis-fails}

Mit einem einzelnen Redis-Server (`ha.engine: redis`) können sich die Knoten nicht koordinieren, bis Redis wieder verfügbar ist. Mit [Redis Sentinel](#redis-sentinel) befördern die Sentinels ein Replica, und jeder Semaphore-Knoten wechselt automatisch zu diesem — in der Regel innerhalb weniger Sekunden und ohne Neustart.

### Was passiert, wenn ein Semaphore-Knoten ausfällt? {#what-happens-if-one-semaphore-node-fails}

Der Load Balancer leitet den Verkehr an die verbleibenden Knoten weiter. Laufende Jobs werden auf den anderen Instanzen fortgesetzt, und neue Jobs werden von einem beliebigen verfügbaren Knoten übernommen.

### Kann ich horizontal skalieren? {#can-i-scale-horizontally}

Ja. Sie können Semaphore-Knoten hinter dem Load Balancer hinzufügen, um die Web-/API-Kapazität zu erhöhen, und [Runner](/admin-guide/runners) hinzufügen, um die Kapazität für die Task-Ausführung zu erhöhen.
