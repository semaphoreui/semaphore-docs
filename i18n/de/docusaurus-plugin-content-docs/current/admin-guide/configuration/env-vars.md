# Umgebungsvariablen

Mit Umgebungsvariablen können Sie jede verfügbare Konfigurationsoption überschreiben.

Sie können den interaktiven Generator für Umgebungsvariablen (für Docker) verwenden:
* für den [Server](https://semaphoreui.com/install/docker/2_12/)
* für den [Runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Anwendungsumgebung für Apps (Ansible, Terraform usw.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore kann Umgebungsvariablen an Anwendungsprozesse (Ansible, Terraform/OpenTofu, Python, PowerShell usw.) übergeben. Dafür gibt es zwei zusammenhängende Optionen:

- `env_vars` / `SEMAPHORE_ENV_VARS`: statische Schlüssel-Wert-Paare, die für App-Prozesse gesetzt werden.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: eine Liste von Variablennamen, die der Server aus seiner eigenen Prozessumgebung weiterreicht.

Beispiel-Konfigurationsdatei:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

Äquivalent mit Umgebungsvariablen:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Hinweise:
- Die Weitergabe ist explizit: Nur in `forwarded_env_vars` aufgeführte Variablen werden von App-Prozessen geerbt.
- Geheimnisse sollten auf sicherem Weg bereitgestellt (zum Beispiel über Docker-/Kubernetes-Secrets) und anschließend über `forwarded_env_vars` weitergereicht werden.
- Dieselbe Liste gilt für die `git`-Prozesse, die Repositories klonen und aktualisieren. Alles, was `git` aus der Host-Umgebung braucht, muss also ebenfalls weitergereicht werden.

---

## Betrieb hinter einem Unternehmens-Proxy {#running-behind-a-corporate-proxy}

Semaphore gibt seine eigene Umgebung nicht an die Prozesse weiter, die es startet. Abgesehen von `PATH` erreicht eine Variable eine Aufgabe oder einen `git`-Klon nur dann, wenn sie in `forwarded_env_vars` aufgeführt oder in `env_vars` gesetzt ist.

Am wichtigsten ist das bei einer Paketinstallation (systemd). Proxy-Variablen aus der Unit-Datei gelten für den Semaphore-Server selbst, aber nicht für `git`:

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

Mit der obigen Konfiguration und sonst nichts schlägt das Klonen eines Repositories fehl:

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` hat `NO_PROXY` nie gesehen und schickte die Anfrage für den internen Host über den externen Proxy, der sie abgelehnt hat. Reichen Sie die drei Variablen explizit weiter, um das zu beheben:

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

Oder als Umgebungsvariable:

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Hinweise:
- Reichen Sie `NO_PROXY` zusammen mit den Proxy-Variablen weiter. Ohne diese Variable wird auch der Verkehr zu internen Git-Servern über den Proxy geleitet.
- Viele Werkzeuge lesen die Kleinschreibung (`http_proxy`, `https_proxy`, `no_proxy`). Unter Linux und macOS wird bei Variablennamen zwischen Groß- und Kleinschreibung unterschieden. Führen Sie daher beide Schreibweisen auf, wenn Ihre Umgebung sie klein schreibt.
- Eigene CA-Bundles funktionieren genauso. Wenn Ihr Proxy TLS terminiert, reichen Sie je nach Bedarf `GIT_SSL_CAINFO`, `SSL_CERT_FILE` oder `REQUESTS_CA_BUNDLE` weiter, anstatt die Zertifikatsprüfung abzuschalten.
- Bei Docker-Installationen scheint das meist von selbst zu funktionieren, weil die Proxy-Variablen für den gesamten Container gesetzt sind. Trotzdem empfiehlt es sich, sie explizit weiterzureichen, damit dieselbe Konfiguration auf beiden Wegen identisch funktioniert.

---

## Konfiguration des Runner-Executors {#runner-executor-configuration}

Bei Runner-Deployments kann der gesamte Executor-Block statt über einzelne Schlüssel als eine einzige JSON-Umgebungsvariable gesetzt werden:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Das entspricht dem Setzen von `runner.executor.type` und den untergeordneten Feldern `runner.executor.docker.*` in der Konfigurationsdatei. Alle Einstellungen des Runner-Executors finden Sie unter [Konfigurationsoptionen](/admin-guide/configuration).

---

## Geheime Umgebungsvariablen in Variablengruppen {#secret-environment-variables-in-variable-groups}

Zusätzlich zu globalen Umgebungsvariablen können Sie projektbezogene Geheimnisse in Variablengruppen definieren. Geheime Schlüssel werden in der Oberfläche und in den Logs maskiert. Informationen zur Verwendung und zur Terraform-Integration mit `TF_VAR_*`-Variablen finden Sie unter `User Guide → Variable Groups`.
