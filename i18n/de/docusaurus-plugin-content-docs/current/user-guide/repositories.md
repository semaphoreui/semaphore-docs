import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

Der Schlüssel eines Repositories wird nur für dieses Repository verwendet. Um Submodule, Rollen aus `requirements.yml` oder andere anderswo gehostete Repositories mit eigenen Zugangsdaten zu erreichen, fügen Sie eine Zuordnung in der [Host config](/user-guide/host-config) hinzu.

### Deploy-Keys konfigurieren {#deploy-keys}

In Enterprise-Automationsumgebungen ist die Verwendung dedizierter **Deploy-Keys** (oder Access Keys), die auf ein einzelnes Repository beschränkt sind, die empfohlene Best Practice gegenüber persönlichen Benutzer-SSH-Schlüsseln oder Personal Access Tokens (PATs). Deploy-Keys gewährleisten:
* **Lifecycle-Isolation**: CI/CD- und Automatisierungspipelines hängen nicht von einzelnen Mitarbeiterkonten oder persönlichen Zugangsdaten ab.
* **Least Privilege**: Deploy-Keys können streng auf Nur-Lese-Zugriff beschränkt werden, sodass Semaphore keine unerwünschten Änderungen in das Quell-Repository pushen kann.
* **Begrenzter Wirkungsbereich**: Wenn ein Schlüssel rotiert werden muss, ist nur das spezifische Repository betroffen.

:::tip SSH-Schlüssel direkt in Semaphore generieren
Sie müssen SSH-Schlüssel nicht auf der Befehlszeile generieren. Gehen Sie in Semaphore zu **Key Store** &rarr; **Neuer Schlüssel** &rarr; wählen Sie **SSH Key** &rarr; klicken Sie auf **Generate**. Semaphore erstellt ein sicheres Schlüsselpaar und zeigt einen Dialog mit dem kopierbereiten **Public Key** an. Siehe [Key Store](/user-guide/key-store#built-in-ssh-key-generator) für Details.
:::

Kopieren Sie den in Semaphore generierten öffentlichen Schlüssel und fügen Sie ihn Ihrem Git-Provider hinzu:

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

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
    * Aktivieren Sie **Single checkout for all templates**, wenn das Repository ein Monorepo ist, das alle Aufgabenvorlagen gemeinsam nutzen sollen, siehe [Monorepo](#monorepo)
    * Wählen Sie den **Zugangsschlüssel** aus, den Sie vor dem Einrichten dieses Repositories konfiguriert haben.

4. Klicken Sie auf Speichern, sobald alles konfiguriert ist.

## Monorepo: ein Checkout für alle Vorlagen {#monorepo}

:::info Seit v2.20
Die Option **Single checkout for all templates** ist seit **Semaphore 2.20** verfügbar. Frühere Versionen klonen ein Repository immer einmal pro Vorlage.
:::

Standardmäßig klont Semaphore ein Repository einmal pro Aufgabenvorlage, sodass jede Vorlage in einer eigenen Kopie arbeitet. Bei einem großen Repository, das viele Vorlagen gemeinsam nutzen, kosten die Kopien Speicherplatz, und jeder Task beginnt mit einem Clone oder Pull seiner eigenen Kopie.

Aktivieren Sie **Single checkout for all templates**, um das Repository einmal zu klonen und diesen Checkout zwischen allen Vorlagen des Projekts zu teilen. Die Option ist für einen lokalen Ordner (`/path/to/the/repo`) nicht verfügbar, da dieser nie geklont wird.

<div style={{maxWidth: 450}}>

![Repository-Formular mit aktivierter Option Single checkout for all templates](/assets/repository-monorepo.webp)

</div>

So funktioniert der gemeinsame Checkout:

* Bevor ein Task startet, sperrt Semaphore den Checkout, holt (fetch) und zieht (pull) den im Repository konfigurierten Branch und gibt die Sperre wieder frei. Tasks anderer Vorlagen warten auf die Sperre, während der Checkout aktualisiert wird, die Tasks selbst laufen jedoch parallel.
* Jeder Branch erhält weiterhin einen eigenen Checkout, sodass Repositories mit unterschiedlichen Branches nie denselben Arbeitsbaum teilen.
* Der Checkout wird gemeinsam genutzt, aber das Ansible-Home-Verzeichnis (aus `requirements.yml` installierte Rollen und Collections) bleibt für jede Vorlage getrennt.

Da alle Vorlagen im selben Checkout auf demselben Branch arbeiten, kann eine Vorlage eines Monorepos keinen eigenen **Branch** haben und den **Branch**-Prompt, mit dem ein Task einen Branch oder Commit wählen kann, nicht aktivieren. Das Vorlagenformular deaktiviert beides und erklärt den Grund, und die API lehnt eine solche Vorlage ab. Stellen Sie sicher, dass die Playbooks nicht in den Checkout schreiben: Ein geänderter Arbeitsbaum bricht den nächsten Pull, und Semaphore entfernt dann den Checkout und klont ihn neu.

## Playbooks in Unterverzeichnissen {#subdirectories}

Enterprise-Repositories organisieren die Automatisierung häufig über dedizierte Verzeichnisse, Monorepos oder Multi-Environment-Layouts, anstatt alle Playbooks im Stammverzeichnis abzulegen.

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

Beim Erstellen einer [Aufgabenvorlage](/user-guide/task-templates) wird der **Playbook-Dateiname** immer **relativ zum Repository-Stammverzeichnis** angegeben:

* **Relative Pfade verwenden**: Geben Sie `playbooks/site.yml` oder `playbooks/provisioning/aws-vms.yml` ein.
* **Kein führender Schrägstrich**: Verwenden Sie nicht `/playbooks/site.yml`. Ein führender Schrägstrich führt dazu, dass der Executor ab dem Systemstammverzeichnis statt im Repository-Klon sucht.
* **Unix-Schrägstriche**: Verwenden Sie immer `/`, auch wenn Sie auf Windows-Runner-Knoten arbeiten.
* **Groß-/Kleinschreibung beachten**: Pfade müssen exakt der Ordner- und Dateischreibweise entsprechen (z. B. `playbooks/site.yml`).

:::info Arbeitsverzeichnis und Anforderungen
Wenn ein Playbook aus einem Unterverzeichnis ausgeführt wird (z. B. `playbooks/site.yml`), wertet Semaphore sowohl das Playbook-Verzeichnis (`playbook_dir`) als auch das Repository-Stammverzeichnis (`repo_path`) bei der Auflösung von Rollen und Collections aus. Siehe [Anforderungen](#requirements) unten für die genaue Suchreihenfolge.
:::

## Ein bestehendes Repository bearbeiten {#editing-an-existing-repository}
1. Gehen Sie zum Bereich Repositories von Semaphore.

2. Klicken Sie auf das Stiftsymbol neben dem Repository, das Sie ändern möchten; anschließend wird Ihnen die Repository-Konfiguration angezeigt.

## Ein Repository löschen {#deleting-a-repository}
Stellen Sie sicher, dass das zu löschende Repository von keiner Aufgabenvorlage verwendet wird.
Ein Repository kann nicht gelöscht werden, wenn es in einer Aufgabenvorlage verwendet wird:
1. Gehen Sie zum Bereich Repositories von Semaphore.

2. Klicken Sie auf das Papierkorbsymbol des Repositories, das Sie löschen möchten.

3. Klicken Sie im Bestätigungsdialog auf Ja, wenn Sie das Repository wirklich löschen möchten.

### Abhängigkeitsschutz und Verwendungsprüfung {#dependency-protection}

Ein Repository kann nicht gelöscht werden, wenn es derzeit einer oder mehreren Aufgabenvorlagen zugewiesen ist.

Vor dem Löschen prüft Semaphore aktive Vorlagenreferenzen:
1. In der Repositories-Liste prüft ein Klick auf das Papierkorbsymbol, ob das Repository von Projektvorlagen referenziert wird.
2. Wenn Abhängigkeiten bestehen, zeigt Semaphore einen Warndialog an, der die genauen Aufgabenvorlagen auflistet, die dieses Repository referenzieren, mit direkten Links zu jeder Vorlage.
3. Wenn das Repository direkt über die API gelöscht wird, während es noch in Verwendung ist, wird die Anfrage mit HTTP `400 Bad Request` abgelehnt:

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

So löschen Sie ein Repository sicher:
1. Navigieren Sie zu **Vorlagen** und weisen Sie jede abhängige Vorlage einem anderen Repository zu oder löschen Sie ungenutzte Vorlagen.
2. Kehren Sie zu **Repositories** zurück und klicken Sie auf das Papierkorbsymbol neben dem Repository.
3. Bestätigen Sie das Löschen im Popup-Dialog.

:::tip Automatische Bereinigung des Checkout-Caches
Wenn ein Repository erfolgreich gelöscht wird, bereinigt Semaphore automatisch das lokale Arbeitsverzeichnis des Checkouts auf dem Dateisystem des Hosts/Runners und gibt Speicherplatz frei.
:::

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
