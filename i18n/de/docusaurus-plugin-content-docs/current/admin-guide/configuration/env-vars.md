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
