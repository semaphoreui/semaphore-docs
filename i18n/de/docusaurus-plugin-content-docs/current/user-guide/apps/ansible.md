
# Ansible

Mit Semaphore UI können Sie Ansible-Playbooks ausführen. Dazu müssen Sie ein **Ansible Playbook**-Template erstellen.

1. Öffnen Sie den Bereich **Task-Templates**, klicken Sie auf **Neues Template** und dann auf **Ansible Playbook**.

![](/assets/ansible_1.png)

2. Richten Sie das Template ein.

Im Template können Sie die folgenden Parameter angeben:

* Repository
* Pfad zur Playbook-Datei
* Arbeitsverzeichnis (optional)
* Inventory
* Variablengruppen
* Vaults
* Zusätzliche CLI-Argumente (tags, skip-tags, limit, Ausführlichkeit)
* Umgebungsvariablen

![](/assets/ansible_2.png)

## Arbeitsverzeichnis {#working-directory}

Verwenden Sie **Arbeitsverzeichnis**, um Ansible-Befehle aus einem Unterverzeichnis des Template-Repositorys auszuführen. Geben Sie einen Pfad relativ zum Repository-Stammverzeichnis an. Wenn zum Beispiel `ansible.cfg` in `<repository>/automation` liegt, geben Sie `automation` ein. Absolute Pfade und Pfade außerhalb des Repositorys werden abgelehnt. Wird nichts angegeben, verwendet Semaphore das Repository-Stammverzeichnis.

Das Arbeitsverzeichnis beeinflusst das Ansible-Verhalten, das vom aktuellen Verzeichnis des Prozesses abhängt. Die [Suchreihenfolge der Konfigurationsdatei][ansible-config-search] von Ansible umfasst `ansible.cfg` im aktuellen Verzeichnis. Das Arbeitsverzeichnis beeinflusst auch die Auflösung relativer Pfade in zusätzlichen CLI-Argumenten; Beispiele sind [`--extra-vars @vars.yml`][ansible-extra-vars-file] und [`--private-key key.pem`][ansible-private-key]. Playbook- und Datei-Inventory-Pfade bleiben relativ zu ihren jeweiligen Repository-Stammverzeichnissen.

Das Ändern des Arbeitsverzeichnisses fügt für sich genommen nicht das Unterverzeichnis `roles/` oder `collections/` dieses Verzeichnisses zu den Suchpfaden von Ansible hinzu. [Playbook-relative Rollenerkennung][ansible-role-search] und [Collections neben einem Playbook][ansible-playbook-collections] basieren weiterhin auf dem Speicherort des Playbooks. Das Arbeitsverzeichnis kann ihre Erkennung dennoch indirekt beeinflussen, wenn die ausgewählte `ansible.cfg` `roles_path` oder `collections_path` konfiguriert.

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## Template-Typen {#template-types}

Ein ansible-playbook-Template kann einen der folgenden Typen haben:

* [Task](#task)
* [Build](#build)
* [Deploy](#deploy)

### Task {#task}

Führt einfach die angegebenen Playbooks mit den angegebenen Parametern aus.

Wenn Sie das Template über einen API-Aufruf mit der *limit*-Funktion starten möchten, aktivieren Sie unbedingt die Option *Ansible-Prompts: Limit*. Andernfalls wird das im API-Aufruf gesetzte Limit ignoriert. Bei einem über die API ausgelösten Task führt dies zu keiner interaktiven Abfrage; der Task läuft unbeaufsichtigt.

### Build {#build}

Dieser Template-Typ sollte zum Erstellen von [Artefakten](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\)) verwendet werden. Die Startversion des Artefakts kann in einem Template-Parameter angegeben werden. Jede Ausführung erhöht die Artefaktversion.

![](/assets/template_new_build_ipad1.png)

Semaphore unterstützt Artefakte nicht von Haus aus, es stellt lediglich eine Task-Versionierung bereit. Die Erstellung der Artefakte müssen Sie selbst implementieren. Lesen Sie den Artikel [CI/CD](../../admin-guide/cicd), um zu erfahren, wie das geht.

### Deploy {#deploy}

Dieser Template-Typ sollte zum Bereitstellen von Artefakten auf den Zielservern verwendet werden. Jedes `deploy`-Template ist mit einem `build`-Template verknüpft.


So können Sie eine bestimmte Version des Artefakts auf den Servern bereitstellen.

## Template-Optionen {#template-options}

### Zeitplan {#schedule}

Sie können die Task-Planung einrichten, indem Sie in den Template-Einstellungen einen Cron-Zeitplan angeben. Das Format der Cron-Ausdrücke finden Sie in der [Dokumentation](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format).


#### Einen Task ausführen, wenn ein neuer Commit zum Repository hinzugefügt wird {#run-a-task-when-a-new-commit-is-added-to-the-repository}

Sie können Cron verwenden, um regelmäßig nach neuen Commits im Repository zu suchen und bei deren Eintreffen einen Task auszulösen.

Beispielsweise haben Sie den Quellcode der App im Git-Repository. Sie können es zu **Repositories** hinzufügen und den Build-Task bei neuen Commits auslösen.


### Tags, skip-tags und limit {#tags-skip-tags-and-limit}

Templates unterstützen Ansible-CLI-Optionen:

- `--tags`
- `--skip-tags`
- `--limit`

Diese können im Template gesetzt und beim Erstellen eines Tasks überschrieben werden. Stellen Sie sicher, dass die entsprechenden Prompts aktiviert sind, wenn Sie diese Werte über die API übergeben möchten.

### Galaxy-Requirements {#galaxy-requirements}

Bevor ein Playbook ausgeführt wird, installiert Semaphore Rollen und Collections aus `requirements.yml`-Dateien, die im Playbook-Verzeichnis, im Repository-Stammverzeichnis sowie in deren Unterverzeichnissen `roles/` und `collections/` gefunden werden, mit `ansible-galaxy install --force`.

Um eine erneute Installation bei jeder Ausführung zu vermeiden, speichert Semaphore eine Prüfsumme jeder Requirements-Datei und führt die Installation nur dann erneut aus, wenn sich die Datei ändert. Zwei Template-Optionen im ausklappbaren Bereich **Galaxy-Installationsoptionen** (unterhalb von **Ansible-Prompts**) steuern dieses Verhalten:

- **Galaxy-Installation überspringen** — `ansible-galaxy` überhaupt nicht ausführen. Verwenden Sie dies, wenn die Requirements bereits im Runner-Image vorinstalliert sind.
- **Galaxy-Installation erzwingen** — immer `ansible-galaxy install --force` ausführen und die gespeicherte Prüfsumme ignorieren. Verwenden Sie dies, wenn eine Requirements-Datei auf ein bewegliches Ziel verweist (zum Beispiel auf einen Branch statt auf ein Tag) und Sie bei jeder Ausführung die neueste Version möchten.

**Galaxy-Installation überspringen** kann im Formular zum Ausführen eines Tasks angezeigt werden, indem Sie das gleichnamige Kontrollkästchen unter **Prompts** am Ende des Bereichs aktivieren. Wenn ein Prompt aktiviert ist, überschreibt der zur Laufzeit gewählte Wert den Standardwert des Templates.

#### Zusätzliche Galaxy-Argumente {#galaxy-extra-args}

**Argumente für die Rolleninstallation** und **Argumente für die Collection-Installation** (im ausklappbaren Bereich **Galaxy-Installationsoptionen** unterhalb von **Ansible-Prompts**; standardmäßig eingeklappt; der Zähler daneben zeigt, wie viele Galaxy-Einstellungen angepasst sind) hängen Flags an `ansible-galaxy role install` bzw. `ansible-galaxy collection install` an. Sie werden getrennt konfiguriert, weil die beiden Unterbefehle unterschiedliche Flags akzeptieren: `--pre` ist zum Beispiel nur für Collections gültig.

Jeder Eintrag ist ein argv-Token; ein Wert kann entweder inline (`--timeout=60`) oder als nächster Eintrag (`--timeout`, `60`) angegeben werden. Nur die folgenden Flags werden akzeptiert:

| Geltungsbereich | Flags |
|-------|-------|
| Beide | `-c`/`--ignore-certs`, `-f`/`--force`, `--force-with-deps`, `-i`/`--ignore-errors`, `-n`/`--no-deps`, `-s`/`--server <url>`, `--timeout <seconds>`, `-v`…`-vvvv`/`--verbose` |
| Nur Rollen | `-g`/`--keep-scm-meta` |
| Nur Collections | `--pre`, `-U`/`--upgrade`, `--offline`, `--no-cache`, `--clear-response-cache`, `--disable-gpg-verify`, `--keyring <path>`, `--signature <url>`, `--required-valid-signature-count <n>`, `--ignore-signature-status-code(s) <code>` |

Alles andere wird beim Speichern des Templates abgelehnt. Insbesondere sind `--token`/`--api-key` nicht erlaubt, weil Befehlszeilenargumente in der Prozessliste sichtbar sind — konfigurieren Sie Galaxy-Anmeldedaten stattdessen über Umgebungsvariablen (zum Beispiel `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`) in einer Variablengruppe. Die Requirements-Datei (`-r`) wird von Semaphore gesetzt, und Installationspfade (`-p`, `--roles-path`, `--collections-path`) werden absichtlich nicht akzeptiert, damit ein Template nicht außerhalb des Repositorys schreiben kann — setzen Sie stattdessen `roles_path`/`collections_path` in `ansible.cfg` oder über `ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH`.

### Parallelität (`--forks` / `-f`) {#parallelism---forks---f}

Steuern Sie, mit wie vielen Hosts Ansible parallel Verbindungen aufbaut, indem Sie `--forks` oder
`-f` in den **Zusätzlichen CLI-Argumenten** des Templates übergeben. Die Argumente müssen gültiges JSON sein –
verwenden Sie ein Array aus einzelnen Token:

```json
["--forks", "10"]
```

Die Kurzform wird ebenfalls unterstützt:

```json
["-f", "10"]
```

Wenn **Überschreiben der Argumente im Task erlauben** im Template aktiviert ist, kann ein Task
zur Laufzeit seinen eigenen forks-Wert angeben. Ansible erhält sowohl die Template- als auch die
Task-Argumente; das letzte `--forks` / `-f` auf der Befehlszeile gewinnt.

Wenn die Argumente kein gültiges JSON sind, schlägt der Task mit einem aussagekräftigen Validierungsfehler
fehl, bevor die Ausführung beginnt.

### Authentifizierung {#authentication}

Die Authentifizierung für die Hosts im Playbook erfolgt über die Benutzerverweise aus dem Schlüsselspeicher im Inventory. Der Benutzer für SSH wird durch den optionalen Benutzer am Schlüsselspeicher-Element bestimmt.

### Mehrere Vault-Passwörter {#multiple-vault-passwords}

Sie können einem Template mehrere Vault-Passwörter aus dem Schlüsselspeicher zuordnen. Während der Ausführung versucht Ansible, mit den angegebenen Passwörtern zu entschlüsseln.

### Ausführlichkeitsstufe {#verbosity-level}

Sie können die Ausführlichkeit von Ansible für einen Task (zum Beispiel `-v`, `-vvv`) im Template-/Task-Formular anpassen, um die Fehlersuche zu erleichtern.
