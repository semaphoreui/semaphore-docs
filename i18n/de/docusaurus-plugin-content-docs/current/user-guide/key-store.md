# Key Store

Der Key Store in Semaphore dient zum Speichern von Zugangsdaten für den Zugriff auf entfernte Repositories, den Zugriff auf entfernte Hosts, Sudo-Zugangsdaten und Ansible-Vault-Passwörter.

![Key Store](/assets/key-store-keys.webp)

Der Tab **Keys** listet die Zugangsdaten des Projekts mit ihrem Typ auf. Der Tab **Storages** (Pro) listet die für das Projekt konfigurierten externen Secret-Speicher auf, siehe [Secret-Speicher](#secret-storages).

## Typen {#types}

### 1. SSH {#1-ssh}
SSH-Schlüssel werden für den Zugriff auf entfernte Server sowie auf entfernte Repositories verwendet.

Wenn Sie Hilfe beim schnellen Erzeugen eines Schlüssels und dessen Ablage auf Ihrem Host benötigen, [finden Sie hier eine kurze Anleitung.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

Bei Git-Repositories mit SSH-Authentifizierung muss dem Git-Repository, aus dem Sie klonen möchten, der zum privaten Schlüssel gehörende öffentliche Schlüssel zugeordnet sein.

Nachfolgend Links zur Dokumentation einiger gängiger Git-Repositories:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Anmeldung mit Passwort {#2-login-with-password}
Anmeldung mit Passwort ist eine Kombination aus Benutzername und Passwort/Access Token, die für Folgendes verwendet werden kann:
* Authentifizierung bei entfernten Hosts (allerdings weniger sicher als die Verwendung von SSH-Schlüsseln)
* Sudo-Zugangsdaten auf entfernten Hosts
* Authentifizierung bei entfernten Git-Repositories über HTTPS (allerdings ist SSH sicherer)
* Entsperren von Ansible-Vaults

:::tip
    Dieser Secret-Typ kann als Personal Access Token (PAT) oder als Secret-Zeichenkette verwendet werden. Lassen Sie dazu einfach das Feld Login leer.
:::

### 3. Keine {#3-none}
Dieser Typ dient als Platzhalter für Repositories, die keine Authentifizierung erfordern, wie etwa ein Open-Source-Repository auf GitLab.


## Secret-Speicher {#secret-storages}

Semaphore UI unterstützt verschiedene Speicher für Secrets. Sie können den Speicher pro Secret beim Erstellen oder Bearbeiten eines Secrets auswählen.

Externe Speicher werden auf dem Tab **Storages** des Key Store (Pro) erstellt. Jeder Speicher hat einen Namen und einen Typ; die Schlüssel verweisen dann auf den Speicher und den Pfad des Secrets darin.

![Secret-Speicher](/assets/key-store-storages.webp)

### Datenbank {#database}

Secrets werden standardmäßig verschlüsselt in der Datenbank gespeichert. Der Verschlüsselungsschlüssel wird über die Konfigurationsoption
`access_key_encryption` oder `SEMAPHORE_ACCESS_KEY_ENCRYPTION` konfiguriert (muss mit `head -c32 /dev/urandom | base64` erzeugt werden).

### Umgebungsvariable oder Datei {#environment-variable-or-file}

Ein Schlüssel kann seinen Wert aus einer Umgebungsvariablen des Semaphore-Servers oder aus einer Datei auf dem Server lesen
(zum Beispiel einem in den Container eingebundenen SSH-Schlüssel). Die Tabs **Env** und **File** des Schlüsselformulars wählen diesen Modus aus.

Dateien müssen sich innerhalb des konfigurierten Secrets-Verzeichnisses befinden (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, Standard `/tmp/semaphore`),
und Schlüssel vom Typ SSH und Anmeldung mit Passwort müssen in ein kleines JSON-Dokument verpackt werden.

[Mehr erfahren...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

Secrets können anstelle der Datenbank in einer externen HashiCorp-Vault-Instanz gespeichert werden.

[Mehr erfahren...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

Secrets können in einer externen [OpenBao](https://openbao.org)-Instanz gespeichert werden (ein Open-Source-, API-kompatibler Fork von HashiCorp Vault).

[Mehr erfahren...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![Static Badge](https://img.shields.io/badge/enterprise-yellow)

Secrets können im AWS Secrets Manager gespeichert werden. Die Authentifizierung erfolgt über eine IAM-Rolle/ein Instanzprofil oder über statische Zugriffsschlüssel.

[Mehr erfahren...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

Secrets können anstelle der Datenbank in einer externen Devolutions-Server-Instanz gespeichert werden.

[Mehr erfahren...](/user-guide/key-store/devolutions-server)

## Secrets aus entfernten Speichern synchronisieren {#syncing-secrets-from-remote-storages}

Semaphore kann Secrets automatisch aus einem externen Secret-Manager (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault oder Devolutions Server) importieren und synchron halten. Über Sync-Pfade legen Sie fest, welche Secrets importiert und wie sie benannt werden.

[Mehr erfahren...](/user-guide/key-store/secret-sync)
