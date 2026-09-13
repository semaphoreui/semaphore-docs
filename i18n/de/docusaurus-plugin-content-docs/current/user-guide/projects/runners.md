# Projekt-Runner (Pro)

Runner führen Tasks auf anderen Maschinen als dem Semaphore-Server aus: näher an der Zielinfrastruktur, in einer anderen Netzwerkzone oder mit einer anderen Toolchain. **Globale Runner** werden von einem Administrator registriert und stehen allen Projekten zur Verfügung. **Projekt-Runner** gehören zu einem Projekt und werden von seinem Team im Bereich **Runners** verwaltet.

![Projekt-Runner](/assets/project-runners-list.webp)

| Spalte | Inhalt |
|---|---|
| Schalter | Aktiviert oder deaktiviert den Runner. Ein deaktivierter Runner erhält keine Tasks. Nur Projekt-Runner haben den Schalter; globale Runner werden vom Administrator verwaltet. |
| **Name** | Name des Runners. Das Badge **Global** kennzeichnet Runner, die von allen Projekten gemeinsam genutzt werden. |
| **Tag** | Tags des Runners. Task Templates mit einem **Runner tag** laufen nur auf Runnern, die dieses Tag haben. |
| **Status** | **Online**, wenn der Runner den Server kürzlich abgefragt hat, andernfalls **Offline**. |

## Einen Runner hinzufügen {#adding-a-runner}

Sie benötigen die Rolle **Manager** oder höher. Klicken Sie auf **New Runner** und füllen Sie das Formular aus.

<div style={{maxWidth: 420}}>

![Dialog für einen neuen Runner](/assets/project-runner-new.webp)

</div>

| Feld | Beschreibung |
|---|---|
| **Name** | Name des Runners, der in der Liste und in den Task-Details angezeigt wird. |
| **Tags** | Optional. Ein oder mehrere Tags. Ein Task Template mit einem **Runner tag** wird nur von Runnern ausgeführt, die das Tag tragen. |
| **Is default** | Runner mit diesem Flag übernehmen auch Tasks von Task Templates ohne Runner-Tag. Ein Runner ohne dieses Flag und ohne Tags erhält niemals Tasks. |
| **Register** | Aktiviert: Der Runner wird als registriert erstellt und der Dialog zeigt den Runner-Token, den Sie in die Runner-Konfiguration eintragen. Deaktiviert: Der Runner wird unregistriert erstellt und Sie erhalten einen einmalig verwendbaren **Registrierungstoken**; der Runner registriert sich selbst mit `semaphore runner register` oder `semaphore runner start --auto-register`. |
| **Webhook** | Optionale URL, die Semaphore aufruft, wenn dem Runner ein Task zugewiesen wird. Verwenden Sie sie, um Runner bei Bedarf (einmalig) zu starten, zum Beispiel mit einer Cloud-Funktion. |
| **Max number of parallel tasks** | Optional. Wie viele Tasks der Runner gleichzeitig ausführen darf. |
| **Enabled** | Ob der Runner Tasks erhält. |

Klicken Sie nach dem Erstellen auf den Runner, um seinen Token oder Registrierungstoken erneut anzuzeigen und die Konfigurations-Snippets zu kopieren.

## Den Runner installieren {#installing-the-runner}

Der Runner ist dieselbe `semaphore`-Binärdatei bzw. das Docker-Image `semaphoreui/runner`, gestartet im Runner-Modus. Installation, Konfigurationsdatei, Registrierungsbefehle, Executoren (local, Docker, Kubernetes) und Sicherheit sind im Admin-Handbuch beschrieben: [Runner](/admin-guide/runners) und [CLI: Runners](/reference/cli/runners).

## Tasks an Runner weiterleiten {#routing-tasks-to-runners}

1. Geben Sie dem Runner ein oder mehrere **Tags**, zum Beispiel `windows-qa-server`.
2. Setzen Sie im Formular des Task Template **Runner tag** auf denselben Wert.
3. Tasks des Task Template warten im Status `waiting`, bis ein Runner mit diesem Tag online ist.

Task Templates ohne Runner-Tag gehen an die Runner, die als **Is default** markiert sind, einschließlich globaler Standard-Runner. Der Runner, der einen Task ausgeführt hat, wird auf dem Tab **Details** des [Task-Fensters](../tasks#task-window) angezeigt.

## Sicherheit {#security}

- Runner verbinden sich mit dem Server, niemals umgekehrt, sodass ein Runner hinter NAT oder in einem privaten Netzwerk betrieben werden kann.
- Jede Anfrage eines Runners wird mit seinem Token authentifiziert. Sie entziehen einem Runner den Zugang, indem Sie ihn löschen oder deaktivieren.
- Verwenden Sie HTTPS zwischen Runnern und dem Server; siehe [Netzwerksicherheit](/admin-guide/security/network).
