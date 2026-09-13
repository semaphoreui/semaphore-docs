# Zeitpläne

Die Zeitplanfunktion in Semaphore ermöglicht es, die Ausführung von Templates (z. B. Playbook-Läufe) in vordefinierten Intervallen zu automatisieren. Mit dieser Funktion lassen sich routinemäßige Automatisierungsaufgaben umsetzen, etwa regelmäßige Backups, Compliance-Prüfungen, Systemaktualisierungen und mehr.

Starten Sie den Semaphore-Dienst nach Änderungen neu, damit diese wirksam werden.

[//]: # (## Setup and configuration)

## Zeitzonenkonfiguration {#timezone-configuration}

Standardmäßig arbeitet die Zeitplanfunktion in der Zeitzone UTC. Dies kann jedoch an Ihre lokale Zeitzone oder spezifische Anforderungen angepasst werden.

Sie können die Zeitzone ändern, indem Sie die Konfigurationsdatei aktualisieren oder eine Umgebungsvariable setzen:

1. **Über die Konfigurationsdatei**:  
    Fügen Sie das Feld `timezone` in Ihrer Semaphore-Konfigurationsdatei hinzu oder aktualisieren Sie es:
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **Über eine Umgebungsvariable**:  
    Setzen Sie die Umgebungsvariable `SEMAPHORE_SCHEDULE_TIMEZONE`:
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

Eine Liste gültiger Zeitzonenwerte finden Sie in der [IANA Time Zone Database](https://www.iana.org/time-zones).

### Zugriff auf die Zeitplanfunktion {#accessing-the-schedule-feature}

1. Melden Sie sich an der Semaphore-Weboberfläche an
2. Navigieren Sie im Hauptnavigationsmenü zum Tab „Zeitplan“
3. Klicken Sie oben rechts auf die Schaltfläche „Neuer Zeitplan“, um einen neuen Zeitplan zu erstellen

![](/assets/schedule01.png)

### Einen neuen Zeitplan erstellen {#creating-a-new-schedule}

Beim Erstellen eines neuen Zeitplans müssen Sie die folgenden Optionen konfigurieren:

| Feld | Beschreibung |
|-------|-------------|
| Name | Ein aussagekräftiger Name für die geplante Aufgabe |
| Template | Das auszuführende Task-Template |
| Zeitpunkt | Entweder im Cron-Format für mehr Flexibilität oder über die integrierten Optionen für gängige Intervalle |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Syntax des Cron-Formats {#cron-format-syntax}

Der Zeitplan verwendet die Standard-Cron-Syntax mit fünf Feldern:

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Beispiele:
- `*/15 * * * *` – Alle 15 Minuten ausführen
- `0 2 * * *` – Täglich um 2:00 Uhr ausführen
- `0 0 * * 0` – Sonntags um Mitternacht ausführen
- `0 9 1 * *` – Am ersten Tag jedes Monats um 9:00 Uhr ausführen

Sehr hilfreicher Generator für Cron-Ausdrücke: [https://crontab.guru/](https://crontab.guru/)

## Anwendungsfälle {#use-cases}

### Systemwartung {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

Planen Sie dieses Playbook wöchentlich außerhalb der Geschäftszeiten ein, damit die Systeme auf dem neuesten Stand bleiben.

### Backup-Vorgänge {#backup-operations}

Erstellen Sie Zeitpläne für Datenbank-Backups mit unterschiedlichen Häufigkeiten:
- Tägliche Backups, die eine Woche aufbewahrt werden
- Wöchentliche Backups, die einen Monat aufbewahrt werden
- Monatliche Backups, die ein Jahr aufbewahrt werden

### Compliance-Prüfungen {#compliance-checks}

Planen Sie regelmäßige Compliance-Scans ein, um sicherzustellen, dass die Systeme die Sicherheitsanforderungen erfüllen:

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### Bereitstellung und Bereinigung von Umgebungen {#environment-provisioning-and-cleanup}

Für Entwicklungs- oder Testumgebungen. Planen Sie die Erstellung von Cloud-Umgebungen am Morgen und deren Abbau am Abend ein, um Kosten zu optimieren.

## Best Practices {#best-practices}

* Verwenden Sie aussagekräftige Namen für Zeitpläne, die sowohl Funktion als auch Zeitpunkt angeben (z. B. „Weekly-Backup-Sunday-2AM“)
* Vermeiden Sie es, zu viele ressourcenintensive Aufgaben gleichzeitig einzuplanen
* Berücksichtigen Sie die Auswirkungen lang laufender geplanter Aufgaben auf andere Zeitpläne
* Testen Sie Zeitpläne mit kurzen Intervallen, bevor Sie Produktionszeitpläne mit längeren Intervallen einrichten
* Dokumentieren Sie Zweck und erwartete Ergebnisse geplanter Aufgaben

---

## Task-Parameter {#task-parameters}

Zeitpläne können Parameter an Tasks übergeben. Aktivieren Sie im Template die Prompts für die benötigten Felder und definieren Sie anschließend die Parameterwerte in der Zeitplankonfiguration, sodass jeder Lauf die gewünschten Überschreibungen (zum Beispiel Branch, Variablen, Flags) erhält.
