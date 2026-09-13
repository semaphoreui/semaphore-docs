# Metriken

:::info
Der Metrik-Endpunkt ist seit **Semaphore Version 2.20** verfügbar. Wenn Sie eine ältere Version verwenden, führen Sie ein Upgrade durch, um diese Funktion zu nutzen.
:::

Semaphore stellt einen `GET /api/metrics`-Endpunkt im Standard-Textformat von Prometheus bereit, sodass eine bestehende Prometheus-und-Grafana-Installation den Server ohne externes Polling-Tool überwachen kann.

Es werden zwei Kategorien von Metriken bereitgestellt:

- **Prozessmetriken:** Statistiken der Go-Laufzeit und des Prozesses – Anzahl der Goroutinen, Speicher (Heap/Resident), CPU-Zeit, GC-Pausen. Diese liefern die Standard-Go-/Prozess-Collector von Prometheus ohne zusätzlichen Aufwand.
- **Task-Metriken**, spezifisch für die Arbeitslast von Semaphore:
  - `semaphore_tasks_running` (Gauge): Anzahl der aktuell laufenden Tasks.
  - `semaphore_tasks_total{status}` (Counter): Gesamtzahl der abgeschlossenen Tasks, aufgeschlüsselt nach Ergebnis: `success`, `error`, `stopped`.

Beide werden in Echtzeit aktualisiert, sobald Tasks ihren Zustand ändern – es gibt keine Polling-Verzögerung, da die Zähler direkt im Task-Runner in dem Moment aktualisiert werden, in dem sich der Status eines Tasks tatsächlich ändert.

## Metriken aktivieren {#enabling-metrics}

Der Endpunkt ist standardmäßig deaktiviert und erfordert HTTP Basic Auth mit statischen Zugangsdaten auf Dienstebene – nicht an ein Benutzerkonto gebunden, da Prometheus keine interaktive Anmeldung durchführen kann:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

Oder über Umgebungsvariablen:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Metrik-Optionen {#metrics-options}

| Parameter  | Umgebungsvariablen             | Beschreibung |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Schaltet den `/api/metrics`-Endpunkt ein oder aus. Standardmäßig deaktiviert. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Basic-Auth-Benutzername, der zum Abrufen des Endpunkts erforderlich ist. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Basic-Auth-Passwort, das zum Abrufen des Endpunkts erforderlich ist (vertraulich). |

Wenn `enabled` auf `false` belassen wird (Standard) oder die Zugangsdaten fehlen oder falsch sind, gibt jede Anfrage an `/api/metrics` `401 Unauthorized` zurück.

## Abrufen mit Prometheus {#scraping-with-prometheus}

Konfigurieren Sie einen Scrape-Job mit `basic_auth` und den oben genannten Zugangsdaten:

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## Metriken in Grafana anzeigen {#viewing-metrics-in-grafana}

In der **Explore**-Ansicht von Grafana können Sie beliebige PromQL-Abfragen direkt gegen die Metriken ausführen und die Rohergebnisse sehen, ohne zuerst ein Dashboard erstellen zu müssen:

![Grafana Explore mit abgerufenen Semaphore-Metriken](/assets/semaphore-grafana-explore.png)

Auf Basis derselben Metriken lässt sich anschließend ein Dashboard erstellen – dieses Beispiel deckt beide Kategorien mit vier Panels ab: laufende Tasks, Tasks gesamt nach Ergebnis, Goroutinen und Resident-Speicher des Prozesses.

![Grafana-Dashboard mit Semaphore-Panels](/assets/semaphore-grafana-dashboard.png)
