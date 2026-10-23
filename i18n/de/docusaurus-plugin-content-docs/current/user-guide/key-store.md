---
title: Key Store
description: Umfassende Anleitung zu Anmeldedaten im Semaphore Key Store, SSH-Schlüsselpaar-Generierung, Login-Passwörtern, Token-Secrets und externen Secret-Speichern.
---

# Key Store

Der **Key Store** dient als zentrales Repository für Anmeldedaten in Semaphore. Er verwaltet Authentifizierungsmaterialien, die zum Klonen entfernter Git-Repositories, für Verbindungen zu Ziel-Infrastruktur-Hosts, zur Rechteausweitung (`sudo`/`become`) und zum Entschlüsseln von Ansible-Vault-Secrets benötigt werden.

![Key Store](/assets/key-store-keys.webp)

Der Key Store ist in zwei Hauptansichten unterteilt:
* **Tab Keys**: Listet alle für das aktuelle Projekt bereitgestellten Zugangsdaten mit Name, Speicher-Backend, Typ und Synchronisationsstatus auf.
* **Tab Storages (Pro)**: Konfiguriert externe Secret-Backends (wie HashiCorp Vault, OpenBao, AWS Secrets Manager oder CyberArk) für dynamische Secret-Auflösung und automatische Synchronisation.

---

## Typen von Anmeldedaten {#types}

Semaphore unterteilt gespeicherte Anmeldedaten in drei grundlegende Typen:

### 1. SSH-Schlüssel {#1-ssh}
SSH-Schlüssel bieten eine asymmetrische kryptografische Authentifizierung für Verbindungen zu Linux/UNIX-Knoten und das Klonen von Git-Repositories über SSH (`git@github.com:...`).

Beim Konfigurieren eines SSH-Schlüssels können Sie folgende Optionen festlegen:
* **Schlüsselname**: Eine aussagekräftige Bezeichnung für die Anmeldedaten in Ihren Projektinventaren und Vorlagen.
* **Benutzername (Optional)**: Das standardmäßige Remote-Benutzerkonto für den SSH-Verbindungsaufbau (z. B. `ansible` oder `ubuntu`).
* **Passphrase (Optional)**: Die Passphrase zum Entschlüsseln verschlüsselter privater Schlüssel. Passphrase-Eingaben bieten ein Sichtbarkeitssymbol (`Auge`) und sind standardmäßig maskiert.
* **Privater Schlüssel**: Der PEM/OpenSSH-Private-Key-Klartext.

#### Integrierter SSH-Schlüsselgenerator {#built-in-ssh-key-generator}

Statt `ssh-keygen` manuell auf externen Maschinen auszuführen, bietet Semaphore einen **integrierten Ein-Klick-SSH-Schlüsselpaar-Generator** direkt im Modalfenster:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Wählen Sie **SSH-Schlüssel** im Dropdown-Menü **Typ** aus.
2. Aktivieren Sie das Kontrollkästchen **SSH-Schlüssel generieren**.
3. Das Textfeld für den manuellen **privaten Schlüssel** wird automatisch deaktiviert und gesperrt.
4. Klicken Sie auf **Erstellen**. Semaphore generiert automatisch ein kryptografisch sicheres Schlüsselpaar (ED25519/RSA), verschlüsselt den privaten Schlüssel in der Datenbank und zeigt den öffentlichen Schlüssel in einem Dialog an:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Kopieren Sie den öffentlichen Schlüssel mit der Schaltfläche **In die Zwischenablage kopieren** und fügen Sie ihn in die Deploy-Keys Ihres Git-Anbieters oder die `~/.ssh/authorized_keys`-Datei Ihrer Zielknoten ein.

#### Öffentliche Schlüssel später abrufen (Public Key Drawer) {#extracting-public-keys-later}

Wenn Sie den Dialog schließen oder den öffentlichen Schlüssel später erneut benötigen, müssen Sie das Schlüsselpaar nicht neu generieren. Beim Bearbeiten eines mit dem Generator erstellten Schlüssels stellt Semaphore einen ausklappbaren **Öffentlicher Schlüssel**-Bereich bereit:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Klicken Sie auf **Anzeigen** / **Ausblenden**, um den öffentlichen Schlüsselstring einzusehen.
* Klicken Sie auf das Zwischenablage-Symbol, um den öffentlichen Schlüssel sofort zu kopieren.

#### Deploy-Keys bei gängigen Git-Hostern hinterlegen

Fügen Sie bei Git-Repositories mit SSH-Authentifizierung den generierten öffentlichen Schlüssel als Deploy-Key hinzu:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Anmeldung mit Passwort {#2-login-with-password}

Der Anmeldedatentyp **Anmeldung mit Passwort** unterstützt sowohl traditionelle Benutzername/Passwort-Kombinationen als auch isolierte Secret-Zeichenketten:

* **Host- und Sudo-Authentifizierung**: Ermöglicht passwortbasierten SSH-Zugriff und `sudo`-Rechteausweitung auf Zielsystemen.
* **HTTPS-Git-Authentifizierung**: Authentifiziert gegenüber Remote-Repositories über HTTPS mittels Benutzername und Personal Access Tokens (PAT).
* **Ansible-Vault-Passwörter**: Entsperrt verschlüsselte Ansible-Vault-Dateien und -Variablen zur Laufzeit.

:::tip Secret-Zeichenketten und Personal Access Tokens (PAT)
Um eine reine Secret-Zeichenkette zu speichern (wie ein API-Token, Vault-Passwort oder PAT), **lassen Sie das Feld Benutzername leer**. Semaphore behandelt den Eintrag dann als reines Secret ohne zugehörigen Benutzernamen.
:::

#### Maskierung und Überschreibschutz {#secret-masking-and-override-protection}

Zum Schutz vor unbefugter Einsicht und versehentlicher Änderung:
* Passwort- und Passphrase-Eingaben sind maskiert und verfügen über Umschaltoptionen für die Sichtbarkeit.
* Beim Bearbeiten bestehender Anmeldedaten sind sensible Secret-Eingaben standardmäßig deaktiviert.
* Um ein bestehendes Secret zu aktualisieren, müssen Sie das Kontrollkästchen **Überschreiben** am Ende des Formulars aktivieren. Diese Schutzfunktion verhindert versehentliches Überschreiben bei routinemäßigen Änderungen.

---

### 3. Keine {#3-none}

Der Typ **Keine** dient als Null-Authentifizierungs-Platzhalter. Er wird für öffentliche Open-Source-Git-Repositories (z. B. auf GitHub oder GitLab) und lokale Playbook-Ausführungen ohne SSH-Schlüssel oder Passwörter verwendet.

---

## Secret-Speicher {#secret-storages}

Semaphore unterstützt entkoppelte Secret-Speicherarchitekturen. Beim Erstellen oder Bearbeiten können Sie über die Speicher-Tabs wählen, wo das Secret abgelegt wird:

| Speicher-Tab | Verfügbarkeit | Beschreibung |
| :--- | :--- | :--- |
| **Lokal** | Open Source & Pro | Secret wird direkt in der Semaphore-Datenbank mit Umschlagverschlüsselung gespeichert. |
| **Speicher** | Pro | Secret verweist auf eine externe Secret-Engine (z. B. HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | Secret wird zur Laufzeit aus einer Umgebungsvariablen auf dem Semaphore-Server aufgelöst. |
| **Datei** | Open Source & Pro | Secret wird aus einer geschützten Datei im konfigurierten Secrets-Verzeichnis gelesen. |

![Secret-Speicher](/assets/key-store-storages.webp)

### Datenbank-Speicher (Lokal) {#database}

Standardmäßig werden Secrets verschlüsselt in der Datenbank mittels symmetrischer AES-Verschlüsselung abgelegt. Der Hauptschlüssel wird über die Serverkonfiguration definiert:
* Konfigurationsschlüssel: `access_key_encryption`
* Umgebungsvariable: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Generierung des Master-Schlüssels
Erzeugen Sie vor dem Start von Produktionsinstanzen einen kryptografisch sicheren 32-Byte-Base64-Schlüssel:
```bash
head -c32 /dev/urandom | base64
```
Sichern Sie diesen Schlüssel sorgfältig. Bei Verlust des Schlüssels können bestehende Secrets nicht wiederhergestellt werden.
:::

### Umgebungsvariablen & Dateien (Schreibgeschützt) {#environment-variable-or-file}

Wenn Sie den Tab **Env** oder **Datei** wählen, behandelt Semaphore die Quelle als extern und schreibgeschützt. Die Oberfläche zeigt einen entsprechenden Hinweis an:

> **Read-only secret storage chosen.**

![Schreibgeschützter Speicher](/assets/key-store-env-readonly-storage.webp)

* **Env-Quelle**: Geben Sie den exakten Namen der Umgebungsvariablen an (z. B. `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **Datei-Quelle**: Geben Sie den relativen Pfad zum konfigurierten Verzeichnis an (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, Standard `/tmp/semaphore`).

Für strukturierte Schlüssel müssen Datei- und Variableninhalte als gültiges JSON formatiert sein. Details finden Sie unter [Umgebungs- und Dateiquellen](/user-guide/key-store/env-and-file-sources).

### Externe Enterprise-Secret-Engines (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro und Enterprise erweitern den Key Store um native Anbindungen an führende Secret-Manager:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: Verbindung über AppRole- oder Token-Authentifizierung für KV v1/v2 Secrets.
* **[OpenBao](/user-guide/key-store/openbao)**: Open-Source-, API-kompatibler Fork von HashiCorp Vault.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: Integration mit AWS-IAM-Rollen oder statischen Anmeldedaten.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: Integration für zentrales privilegiertes Zugriffsmanagement.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: Liest und schreibt Secrets über die CyberArk PVWA-REST-API.

---

## Secrets aus Remote-Speichern synchronisieren {#syncing-secrets-from-remote-storages}

Statt Anmeldedaten einzeln manuell anzulegen, unterstützt Semaphore eine automatisierte Synchronisation aus externen Vaults.

Wenn ein Secret über Synchronisation verwaltet wird:
* Wird es mit einem aktiven **synchronized**-Badge in der Key-Store-Tabelle gekennzeichnet.
* Ist die manuelle Bearbeitung des Inhalts gesperrt, um den externen Tresor als Single Source of Truth zu wahren.
* Werden Aktualisierungen oder Rotationen automatisch gemäß dem konfigurierten Intervall nach Semaphore übertragen.

Detaillierte Konfigurationsschritte finden Sie unter [Secret-Synchronisation](/user-guide/key-store/secret-sync).
