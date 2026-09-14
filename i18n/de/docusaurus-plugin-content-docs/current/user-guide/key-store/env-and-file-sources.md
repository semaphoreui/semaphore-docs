# Schlüssel aus Umgebungsvariablen und Dateien

Neben der Speicherung eines Secrets in der Datenbank kann ein Key-Store-Eintrag seinen Wert zur Laufzeit eines Tasks aus
einer **Datei** auf dem Semaphore-Server oder aus einer **Umgebungsvariablen** des Semaphore-Server-Prozesses lesen.
Das ist nützlich, wenn die Zugangsdaten bereits außerhalb von Semaphore bereitgestellt werden, zum Beispiel:

* ein SSH-Schlüssel, der als Docker- oder Kubernetes-Secret in den Semaphore-Container eingebunden ist;
* ein Token, das von einem Agenten (HashiCorp Vault Agent, cert-manager usw.) auf die Festplatte geschrieben und regelmäßig rotiert wird;
* ein Passwort, das von Ihrem Orchestrator in die Container-Umgebung injiziert wird.

Semaphore kopiert den Wert nicht in seine Datenbank. Jedes Mal, wenn ein Task den Schlüssel benötigt, liest der Server
die Datei oder die Variable erneut, sodass eine Rotation der Zugangsdaten auf der Festplatte beim nächsten Task wirksam wird.

:::info
Die Datei oder Variable wird vom **Semaphore-Server** gelesen, nicht von einem Runner. Wenn Sie entfernte Runner verwenden,
binden Sie die Datei auf dem Server-Host ein; der Server löst das Secret auf und übergibt es an den Runner.
:::

## Quelle auswählen {#choosing-the-source}

Wenn Sie einen Schlüssel erstellen oder bearbeiten (**Key Store → New Key**), befinden sich oben im Formular Tabs zur Auswahl der Quelle:

| Tab | Woher der Wert stammt | Was einzugeben ist |
|-----|-----------------------|--------------------|
| **Local** | Semaphore-Datenbank (verschlüsselt) | Login, Passwort oder privater Schlüssel im Formular |
| **Storage** <Pro /> | Externer Secret-Speicher wie [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | Speicher und Secret-Pfad |
| **Env** | Eine Umgebungsvariable des Semaphore-Server-Prozesses | Der Variablenname, zum Beispiel `PROD_SSH_KEY` |
| **File** | Eine Datei auf dem Semaphore-Server | Der **absolute** Pfad zur Datei, zum Beispiel `/var/lib/semaphore/secrets/prod.json` |

Wenn **Env** oder **File** ausgewählt ist, werden die Felder für Login, Passwort und privaten Schlüssel ausgeblendet. Die gesamten
Zugangsdaten, einschließlich des Logins bei Schlüsseln vom Typ SSH und Anmeldung mit Passwort, müssen in der Datei bzw. Variablen enthalten sein.

## 1. Verzeichnis freigeben {#allow-the-directory}

Aus Sicherheitsgründen liest Semaphore nur Schlüsseldateien, die sich innerhalb seines **Secrets-Verzeichnisses** befinden. Jeder andere
Pfad wird beim Start eines Tasks abgelehnt:

```
Failed to install inventory: file path must be inside secrets path
```

Das Standard-Secrets-Verzeichnis ist `/tmp/semaphore`. Verweisen Sie über `dirs.secrets` in `config.json` oder die Umgebungsvariable
`SEMAPHORE_SECRETS_PATH` auf das Verzeichnis, in dem Ihre Schlüsseldateien liegen.
Die Vorrangregeln finden Sie unter [Secrets-Verzeichnis](/admin-guide/configuration/config-file#secrets-directory).

Docker-Compose-Beispiel, das ein Host-Verzeichnis einbindet und freigibt:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

Gleichwertiges `config.json`-Fragment:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Regeln für den im Tab **File** eingegebenen Pfad:

* er muss absolut sein (`/var/lib/semaphore/secrets/prod.json`, nicht `prod.json`);
* er darf keine `..`-Segmente enthalten;
* er muss auf einen Ort innerhalb des Secrets-Verzeichnisses verweisen (Unterverzeichnisse sind zulässig);
* die Datei muss für den Benutzer lesbar sein, unter dem Semaphore läuft (im offiziellen Docker-Image ist das `semaphore`, UID 1001).

Für Umgebungsvariablen gibt es keine solche Einschränkung; der Server liest einfach die angegebene Variable aus seiner eigenen Umgebung.

## 2. Wert formatieren {#format-the-value}

Der Inhalt der Datei (bzw. der Wert der Variablen) hängt vom Schlüsseltyp ab. Ein einzelner Zeilenumbruch am Ende
einer Datei wird ignoriert; alles andere wird unverändert übernommen.

### SSH-Schlüssel {#ssh-key}

Semaphore erwartet ein **JSON-Dokument**, keine rohe PEM- oder OpenSSH-Datei mit dem privaten Schlüssel:

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — der SSH-Benutzername, der als `--user` an Ansible übergeben wird. Lassen Sie ihn leer, damit das Inventory entscheidet (`ansible_user`). Bei Git-Repositories wird ein leerer Login standardmäßig zu `git`.
* `passphrase` — Passphrase des privaten Schlüssels oder eine leere Zeichenkette.
* `private_key` — der private Schlüssel, wobei Zeilenumbrüche als `\n` kodiert sind.

Erzeugen Sie den Wrapper aus einem vorhandenen Schlüssel mit `jq`, das sich um das Escaping kümmert:

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

Erstellen Sie anschließend einen Schlüssel vom Typ **SSH**, öffnen Sie den Tab **File** und geben Sie `/var/lib/semaphore/secrets/prod_ssh.json` ein
(den Pfad, wie er **innerhalb** des Containers sichtbar ist).

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
Den Tab **File** auf einen rohen privaten Schlüssel wie `~/.ssh/id_ed25519` zu verweisen, funktioniert nicht.
Die Datei wird als JSON geparst, und der Task schlägt beim Laden des Inventorys fehl.
:::

### Anmeldung mit Passwort {#login-with-password}

Ebenfalls ein JSON-Dokument:

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

Lassen Sie `login` leer, um den Schlüssel als reines Token oder Passwort zu verwenden, zum Beispiel als Ansible-Vault-Passwort.

## Beispiel mit Umgebungsvariable {#environment-variable-example}

Dasselbe JSON-Format gilt für den Tab **Env**. In Docker Compose:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

Erstellen Sie einen **SSH**-Schlüssel, wählen Sie den Tab **Env** aus und geben Sie `PROD_SSH_KEY` als Variablennamen ein.

:::tip
Umgebungsvariablen sind für jeden Prozess im Container sichtbar und landen häufig in
Orchestrator-Metadaten und Logs. Bevorzugen Sie nach Möglichkeit den Tab **File** mit einem eingebundenen Secret.
:::

## Fehlerbehebung {#troubleshooting}

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| `file path must be absolute` | Es wurde ein relativer Pfad eingegeben | Geben Sie den vollständigen, mit `/` beginnenden Pfad ein |
| `file path must not contain traversal segments` | Der Pfad enthält `..` | Geben Sie den aufgelösten Pfad ein |
| `file path must be inside secrets path` | Die Datei liegt außerhalb von `dirs.secrets` | Setzen Sie `SEMAPHORE_SECRETS_PATH` auf das Verzeichnis der Datei oder verschieben Sie die Datei |
| `no such file or directory` | Der Pfad ist falsch oder nicht in den Container eingebunden | Prüfen Sie den Volume-Mount und verwenden Sie den Pfad innerhalb des Containers |
| `permission denied` | Der Semaphore-Prozess kann die Datei nicht lesen | Korrigieren Sie Eigentümer oder Berechtigungen der Datei |
| `invalid character '-' looking for beginning of value` | Es wurde ein roher privater Schlüssel statt des JSON-Wrappers angegeben | Verpacken Sie den Schlüssel wie oben gezeigt |
