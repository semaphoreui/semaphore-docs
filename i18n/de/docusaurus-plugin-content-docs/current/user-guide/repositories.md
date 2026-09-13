# Repositories

Ein Repository ist ein Ort zum Speichern und Verwalten von Ansible-Inhalten wie Playbooks und Rollen.

![](/assets/repository.webp)

Semaphore versteht Repositories, die:
  * ein lokales Dateisystem sind (`/path/to/the/repo`)
  * ein lokales Git-Repository sind (`file://`)
  * ein entferntes Git-Repository sind, auf das über HTTPS (`https://`) oder SSH (`ssh://`) zugegriffen wird
  * das Protokoll `git://` wird unterstützt, ist aber aus Sicherheitsgründen nicht empfohlen.

Alle Aufgabenvorlagen benötigen ein Repository, um ausgeführt werden zu können.

## Authentifizierung {#authentication}
Wenn Sie ein entferntes Repository verwenden, das eine Authentifizierung erfordert, müssen Sie im Bereich **Key Store** von Semaphore einen Schlüssel konfigurieren.

Für entfernte Repositories, die SSH verwenden, müssen Sie Ihren SSH-Schlüssel im **Key Store** verwenden.

Für entfernte Repositories ohne Authentifizierung können Sie einen Schlüssel vom Typ `None` erstellen.

## Ein neues Repository erstellen {#creating-a-new-repository}
1. Stellen Sie sicher, dass Sie den Schlüssel für das hinzuzufügende Repository im Bereich Key Store konfiguriert haben.

2. Gehen Sie zum Bereich Repositories von Semaphore und klicken Sie auf die Schaltfläche **Neues Repository** in der oberen rechten Ecke.

3. Konfigurieren Sie das Repository:
    * Benennen Sie das Repository
    * Fügen Sie die URL hinzu. Die URL muss mit einem der folgenden beginnen:
        * `/path/to/the/repo` für einen lokalen Ordner im Dateisystem
        * `https://` für ein entferntes Git-Repository mit Zugriff über HTTPS
        * `ssh://` für ein entferntes Git-Repository mit Zugriff über SSH
        * `file://` für ein lokales Git-Repository
        * `git://` für ein entferntes Git-Repository mit Zugriff über das Git-Protokoll
    * Legen Sie den Branch des Repositories fest; wenn Sie nicht sicher sind, ist es wahrscheinlich master oder main
    * Wählen Sie den **Zugangsschlüssel** aus, den Sie vor dem Einrichten dieses Repositories konfiguriert haben.

4. Klicken Sie auf Speichern, sobald alles konfiguriert ist.

## Ein bestehendes Repository bearbeiten {#editing-an-existing-repository}
1. Gehen Sie zum Bereich Repositories von Semaphore.

2. Klicken Sie auf das Stiftsymbol neben dem Repository, das Sie ändern möchten; anschließend wird Ihnen die Repository-Konfiguration angezeigt.

## Ein Repository löschen {#deleting-a-repository}
Stellen Sie sicher, dass das zu löschende Repository von keiner Aufgabenvorlage verwendet wird.
Ein Repository kann nicht gelöscht werden, wenn es in einer Aufgabenvorlage verwendet wird:
1. Gehen Sie zum Bereich Repositories von Semaphore.

2. Klicken Sie auf das Papierkorbsymbol des Repositories, das Sie löschen möchten.

3. Klicken Sie im Bestätigungsdialog auf Ja, wenn Sie das Repository wirklich löschen möchten.

## Anforderungen {#requirements}
Bei der Projektinitialisierung sucht Semaphore nach Ansible-Rollen und -Collections aus requirements.yml an den folgenden Orten und in der folgenden Reihenfolge und installiert sie.

### Rollen {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Collections {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Verarbeitungslogik {#processing-logic}

* Jede Datei wird unabhängig verarbeitet
* Wenn eine Datei existiert, wird sie entsprechend ihrem Typ (Rolle oder Collection) verarbeitet
* Wenn die Verarbeitung einer Datei zu einem Fehler führt, wird der Installationsvorgang abgebrochen und der Fehler zurückgegeben
* Dieselbe requirements.yml-Datei in den Stammverzeichnissen (**`playbook_dir`/requirements.yml** und **`repo_path`/requirements.yml**) wird zweimal verarbeitet - einmal für Rollen und einmal für Collections

Semaphore versucht, alle diese Orte zu verarbeiten, unabhängig davon, ob vorherige Orte gefunden oder erfolgreich verarbeitet wurden, außer im Fehlerfall.
