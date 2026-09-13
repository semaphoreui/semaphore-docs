
# PowerShell

Semaphore kann PowerShell-Skripte auf Windows-Hosts (oder von einem Windows-Runner aus) ausführen. Erstellen Sie dazu ein **PowerShell**-Task-Template.

## Ein PowerShell-Template erstellen {#creating-a-powershell-template}

1. Öffnen Sie den Bereich **Task-Templates** und klicken Sie auf die Schaltfläche **Neues Template**.
2. Wählen Sie **PowerShell** als App-Typ.
3. Konfigurieren Sie das Template:

| Feld | Beschreibung |
|---|---|
| **Name** | Ein aussagekräftiger Name für das Template |
| **Repository** | Repository, das Ihr `.ps1`-Skript enthält |
| **Playbook / Skript** | Relativer Pfad zum Skript, z. B. `scripts/deploy.ps1` |
| **Variablengruppen** | Variablengruppen, deren Werte als Umgebungsvariablen eingefügt werden |

4. Klicken Sie auf **Erstellen**.
5. Klicken Sie auf **Ausführen**, um das Template auszuführen.

## Variablen an Skripte übergeben {#passing-variables-to-scripts}

Variablen aus den ausgewählten **Variablengruppen** werden vor der Skriptausführung als Umgebungsvariablen eingefügt. Greifen Sie in PowerShell mit `$env:VARIABLE_NAME` darauf zu:

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Ausführung auf Windows-Hosts {#running-on-windows-hosts}

PowerShell-Templates erfordern entweder:
- Einen **Windows-Runner** – einen Semaphore-Runner, der auf einem Windows-Host bereitgestellt ist. Siehe [Runner](/admin-guide/runners).
- Oder der Semaphore-Server selbst läuft unter Windows.

## Hinweise {#notes}

- Skripte laufen nicht interaktiv. Vermeiden Sie Abfragen, die Benutzereingaben erfordern.
- Exit-Code `0` bedeutet Erfolg; jeder Exit-Code ungleich null markiert den Task als fehlgeschlagen.
