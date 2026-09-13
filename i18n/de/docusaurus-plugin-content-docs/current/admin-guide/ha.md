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
* Eine **Redis**-Instanz (oder einen Redis-Cluster), die von allen Knoten erreichbar ist.
* Einen **Load Balancer**, der HTTP- und WebSocket-Verkehr unterstützt.
* Zwei oder mehr Server, auf denen die Semaphore-Instanzen laufen.

Alle Semaphore-Knoten müssen dieselbe Datenbank, dieselbe Redis-Instanz und dieselbe Konfiguration verwenden (mit Ausnahme von `ha.node_id`, das pro Knoten eindeutig sein muss).

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

### Was passiert, wenn ein Semaphore-Knoten ausfällt? {#what-happens-if-one-semaphore-node-fails}

Der Load Balancer leitet den Verkehr an die verbleibenden Knoten weiter. Laufende Jobs werden auf den anderen Instanzen fortgesetzt, und neue Jobs werden von einem beliebigen verfügbaren Knoten übernommen.

### Kann ich horizontal skalieren? {#can-i-scale-horizontally}

Ja. Sie können Semaphore-Knoten hinter dem Load Balancer hinzufügen, um die Web-/API-Kapazität zu erhöhen, und [Runner](/admin-guide/runners) hinzufügen, um die Kapazität für die Task-Ausführung zu erhöhen.
