# 🔐 Sicherheit

## Einführung {#introduction}

Sicherheit hat in Semaphore UI höchste Priorität. Ob Sie kritische Infrastrukturaufgaben automatisieren oder den Teamzugriff auf sensible Systeme verwalten – Semaphore UI ist darauf ausgelegt, von Haus aus einen robusten und sicheren Betrieb zu bieten. Dieser Abschnitt beschreibt, wie Semaphore mit Sicherheit umgeht und was Sie beim Einsatz in der Produktion beachten sollten.

## Authentifizierung & Autorisierung {#authentication--authorization}

Semaphore unterstützt sichere Authentifizierung und flexible Autorisierungsmechanismen:

- **Anmeldemethoden:**
  - **Benutzername/Passwort**<br />Standardmethode mit Anmeldedaten, die in der Semaphore-Datenbank gespeichert sind. Passwörter werden niemals im Klartext gespeichert; sie werden mit Argon2id gehasht (siehe [Passwort-Hashing](#password-hashing)).

  - **LDAP**<br />Ermöglicht die Integration mit Unternehmensverzeichnisdiensten. Unterstützt Benutzer-/Gruppenfilterung und sichere Verbindungen über LDAPS.

  - **OpenID Connect (OIDC)**<br />Ermöglicht Single Sign-on mit Identitätsanbietern wie Google, Azure AD oder Keycloak. Unterstützt benutzerdefinierte Claims und Gruppenzuordnungen.

- **Zwei-Faktor-Authentifizierung (2FA)**<br />TOTP-basierte 2FA ist verfügbar und wird für alle Benutzer empfohlen. Sie kann pro Benutzer aktiviert werden und unterstützt optionale Wiederherstellungscodes. Siehe die Konfigurationsoptionen `mfa.totp.enabled` und `mfa.totp.allow_recovery`.

- **Rollenbasierte Zugriffskontrolle**<br />Sie können Benutzern unterschiedliche Rollen wie Admin, Maintainer oder Viewer zuweisen und so den Zugriff entsprechend der Verantwortung einschränken.

- **Sitzungsverwaltung**<br />Sitzungen werden durch sichere HTTP-Cookies geschützt. Sitzungsablauf und Abmeldemechanismen sorgen für eine minimale Angriffsfläche.
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### Passwort-Hashing {#password-hashing}

:::info Seit v2.20
Argon2id-Passwort-Hashing ist seit **Semaphore 2.20** verfügbar. Frühere Versionen verwenden bcrypt.
:::

Passwörter lokaler Benutzer werden mit **Argon2id** gehasht, dem von [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) für die Passwortspeicherung empfohlenen Algorithmus. Semaphore verwendet die OWASP-Mindestparameter:

| Parameter | Wert |
|-----------|-------|
| Speicher | 19 MiB (`m=19456`) |
| Iterationen | 2 (`t=2`) |
| Parallelität | 1 (`p=1`) |
| Salt | 16 zufällige Bytes pro Passwort |
| Hash-Länge | 32 Bytes |

Hashes werden im standardisierten [PHC-String-Format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md) gespeichert, zum Beispiel `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`, sodass die für jeden Hash verwendeten Parameter gemeinsam mit ihm festgehalten werden.

Das gilt für jede Art, ein Passwort zu setzen: die Weboberfläche, die API und die CLI-Befehle `semaphore user add`, `semaphore user change-by-login` und `semaphore setup`.

**Upgrade von Versionen vor 2.20.** Versionen vor 2.20 haben Passwörter mit bcrypt gehasht. Ein Migrationsschritt ist nicht erforderlich:

- Bestehende bcrypt-Hashes werden bei der Anmeldung weiterhin akzeptiert, sodass alle Benutzer nach dem Upgrade weiterarbeiten können.
- Bei der ersten erfolgreichen Anmeldung wird das Passwort transparent mit Argon2id neu gehasht und der bcrypt-Hash ersetzt.
- Wenn die Argon2id-Parameter von Semaphore in einer künftigen Version verstärkt werden, werden mit den älteren Parametern erzeugte Hashes bei der nächsten Anmeldung auf dieselbe Weise aktualisiert.

Da das erneute Hashen nur bei der Anmeldung erfolgt, behalten Benutzer, die sich nie wieder anmelden, ihren bcrypt-Hash. Um ein Upgrade für solche Konten zu erzwingen, setzen Sie deren Passwort mit `semaphore user change-by-login --password ...` oder über die Admin-Oberfläche zurück.

:::note
Wiederherstellungscodes für die Zwei-Faktor-Authentifizierung sind keine Benutzerpasswörter und verwenden weiterhin bcrypt.
:::

## Geheimnisse & Anmeldedaten {#secrets--credentials}

Die sichere Verwaltung von Geheimnissen ist eine Kernfunktion:

- **Verschlüsselter Schlüsselspeicher**<br />Anmeldedaten und geheime Variablen werden im Ruhezustand mit AES-Verschlüsselung verschlüsselt.

- **Umgebungsisolation**<br />Geheimnisse werden Jobs nur zur Laufzeit übergeben und nicht direkt in der Container-Umgebung offengelegt.

- **SSH-Schlüssel und Token**<br />Benutzer sind dafür verantwortlich, gültige SSH-Schlüssel und Token hochzuladen. Diese werden verschlüsselt und nur beim Ausführen von Tasks verwendet.
- **HashiCorp-Vault-Integration (Pro)**<br />Geheimnisse können in einer externen Vault-Instanz gespeichert werden. Wählen Sie den Speicherort pro Geheimnis beim Erstellen oder Bearbeiten eines Geheimnisses.

## Datenverschlüsselung {#data-encryption}

Sensible Daten werden in verschlüsselter Form in der Datenbank gespeichert. Sie sollten die Konfigurationsoption `access_key_encryption` in der Konfigurationsdatei setzen, um die Verschlüsselung der Access Keys zu aktivieren. Der Schlüssel muss mit folgendem Befehl generiert werden:

```bash
head -c32 /dev/urandom | base64
```

## Ausführen von nicht vertrauenswürdigem Code / Playbooks {#running-untrusted-code--playbooks}

Semaphore führt benutzerdefinierte Playbooks und Befehle aus, was riskant sein kann:

- **Container-Isolation**<br />Tasks werden in isolierten Docker-Containern ausgeführt. Diese Container haben keinen Zugriff auf das Hostsystem.

- **Execution-Isolation**<br />Standardmäßig ist ein Task ein gewöhnlicher Prozess auf dem Semaphore-Server und hat dessen Dateisystem- und Netzwerkzugriff. Isolation ist optional: Geben Sie den Task an einen [Runner](/admin-guide/runners) mit dem `docker`- oder `k8s`-Executor, und jeder Task erhält einen frischen Container bzw. Pod, der nach dem Ende verworfen wird.

- **Minimale Rechte**<br />Mit dem Docker- und dem Kubernetes-Executor wählen Sie Image, Netzwerk und Service-Account selbst, sodass ein Task nur das bekommt, was er braucht.

- **Prozessbenutzer für Tasks**<br />Tasks können unter einem dedizierten Systembenutzer ohne Root-Rechte (z. B. `semaphore`) ausgeführt werden, um die Auswirkungen potenzieller Exploits zu verringern. Dies ist optional und kann entsprechend den Systemrichtlinien konfiguriert werden.
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## Sichere Bereitstellung {#secure-deployment}

Um sicherzustellen, dass Semaphore sicher bereitgestellt wird:

- **HTTPS verwenden**<br />
    Semaphore unterstützt HTTPS sowohl über die **integrierte TLS-Unterstützung** als auch über einen **Reverse-Proxy wie Nginx**. Es wird dringend empfohlen, HTTPS in der Produktion zu aktivieren.

    Um die integrierte HTTPS-Unterstützung zu aktivieren, fügen Sie folgenden Block zur **config.json** hinzu:
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **Hinter einer Firewall betreiben**<br />Beschränken Sie den Zugriff auf Semaphore UI und die Datenbank auf vertrauenswürdige IP-Adressen.

- **Datenbanksicherheit**<br />Verwenden Sie starke Passwörter und beschränken Sie den Datenbankzugriff ausschließlich auf Semaphore.

## Updates & Patch-Management {#updates--patch-management}

Sicherheitsupdates werden regelmäßig veröffentlicht:

- **Aktuell bleiben**<br />Verwenden Sie immer die neueste stabile Version.

- **Changelog**<br />Prüfen Sie die Änderungen auf GitHub, bevor Sie aktualisieren.

- **Automatische Updates**<br />Wenn Sie Docker verwenden, ziehen Sie Automatisierungs-Pipelines für regelmäßige Updates in Betracht.

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## Melden von Schwachstellen {#reporting-vulnerabilities}

Sie haben eine Schwachstelle gefunden? Helfen Sie uns, Semaphore sicher zu halten:

- **Verantwortungsvolle Offenlegung**<br />Bitte senden Sie uns eine E-Mail an `security@semaphoreui.com`.
 
### Zielfristen für die Behebung von Schwachstellen {#vulnerability-resolution-targets}

Wir streben an, gemeldete Schwachstellen innerhalb der folgenden Zeitfenster zu beheben:

- Kritisch: innerhalb von 30 Tagen
- Hoch: innerhalb von 60 Tagen
- Mittel: innerhalb von 90 Tagen
- Niedrig: nach bestem Bemühen, in der Regel innerhalb von 180 Tagen

Für aktiv ausgenutzte Probleme, die die neuesten stabilen Versionen betreffen, können außerplanmäßige Patches veröffentlicht werden.

### Werkzeuge für die Codesicherheit {#code-security-tooling}

Wir verwenden CodeQL, Codacy, Snyk und Renovate, um den Code und die Abhängigkeiten zu analysieren und Abhängigkeitsupdates zu automatisieren.
- **Keine öffentlichen Exploits**<br />Veröffentlichen Sie Schwachstellen nicht, bevor sie gepatcht sind.

- **Danksagungen**<br />Sicherheitsforscher können auf Wunsch in den Versionshinweisen genannt werden.

