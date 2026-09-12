# Konfiguration

Semaphore kann auf mehrere Arten konfiguriert werden:

* [Online-Konfigurator](https://semaphoreui.com/install) &mdash; Weboberfläche zum Erzeugen der Konfiguration online.
* [Konfigurationsdatei](/admin-guide/configuration/config-file) &mdash; die primäre und flexibelste Methode, Semaphore zu konfigurieren.
* [Umgebungsvariablen](/admin-guide/configuration/env-vars) &mdash; nützlich für containerisierte oder Cloud-native Bereitstellungen.


## Konfigurationsoptionen {#configuration-options}

Vollständige Liste der verfügbaren Konfigurationsoptionen:

| Option in der Konfigurationsdatei / Umgebungsvariable     | Beschreibung                        |
| ----------------------- | --------------------------------------------------------- |
| **Allgemein** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Typ des Git-Clients. Kann `cmd_git` (Standard) oder `go_git` sein. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Wie oft ein git clone oder pull versucht wird, bevor die Aufgabe fehlschlägt. Verwendet exponentielles Backoff (1s, dann 2s, 4s, … bis zu 60s) zwischen den Versuchen. Standard: `4`. Auf `1` setzen, um Wiederholungen zu deaktivieren. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Pfad zu einer benutzerdefinierten SSH-Konfigurationsdatei. Standard: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | TCP-Port, unter dem die Weboberfläche erreichbar ist. Standard: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Bind-Adresse (leer = alle Schnittstellen). Nützlich, wenn Ihr Server mehrere Netzwerkschnittstellen hat. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Pfad zum Verzeichnis, in dem geklonte Repositories und generierte Dateien gespeichert werden. Standard: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Pfad zum Verzeichnis, in dem Secrets gespeichert werden (zum Beispiel Vault-Token-Dateien). Standard: `/tmp/semaphore`. Das veraltete Top-Level-Feld `secrets_path` wird weiterhin akzeptiert, wenn `dirs.secrets` nicht gesetzt ist oder auf dem Standardwert bleibt. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Pfad zum Verzeichnis, in dem Repositories gespeichert werden. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Pfad zum Verzeichnis, in dem SSH-Agent-Sockets gespeichert werden. Standard: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Steuert, wie die Umgebungsvariable HOME für Aufgaben gesetzt wird. Optionen: `template_dir` (Standard), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Maximale Anzahl paralleler Aufgaben, die auf dem Server ausgeführt werden können. Standard: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Maximale Dauer einer Aufgabe in Sekunden. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Maximale Anzahl der letzten Aufgaben, die pro Vorlage in der Datenbank gespeichert werden. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Zeitzone, die für die Planung von Aufgaben und Cron-Jobs verwendet wird. Standard: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Einstellungen für OpenID-Provider. Sie können mehrere OpenID-Provider angeben. Mehr zur OpenID-Konfiguration finden Sie unter [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Anmeldung per Passwort verweigern. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Nicht-Administratoren erlauben, Projekte zu erstellen. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | JSON-Map mit Umgebungsvariablen, die Aufgabenausführungen zur Verfügung gestellt werden. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | JSON-Array von Host-Umgebungsvariablen, die an Aufgabenausführungen weitergereicht werden. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | JSON-Map mit der Konfiguration der Apps. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Aktivieren, um einen Remote-Runner zu verwenden. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Bootstrap-Token, mit dem sich Runner beim Server registrieren. |
| **Abonnement** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Abonnementschlüssel oder -Token. Deaktiviert die Aktivierung über die Weboberfläche, wenn gesetzt. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Pfad zur Datei mit dem Abonnementschlüssel oder -Token. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL des Abonnement-/Abrechnungsservers. Standard: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Wenn aktiviert, erzeugt Semaphore für jede Aufgabenausführung ein kurzlebiges JWT und stellt dessen öffentlichen Schlüssel unter `/.well-known/jwks.json` bereit. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Wert, der im `iss`-Claim der ausgestellten JWTs ausgegeben wird. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Standardlebensdauer eines ausgestellten Aufgaben-JWT als Go-Duration (z. B. `30m`, `1h`). Standard: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Harte Obergrenze für die JWT-TTL pro Vorlage als Go-Duration. Standard: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Pfad zur Datei mit dem Registrierungstoken des Runners. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Authentifizierungstoken des Runners. Schließt sich mit `runner.token_file` gegenseitig aus. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Pfad zur Token-Datei für die Runner-Registrierung. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Pfad zur Datei mit dem privaten Schlüssel des Runners. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Der Runner verarbeitet einen einzelnen Job und beendet sich anschließend. Nützlich für dynamische Runner. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Runner aktivieren. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | Webhook-URL für den Runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Name des Runners. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | JSON-Array mit Runner-Tags. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Maximale Anzahl paralleler Aufgaben für den Runner. Standard: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Wie oft der Runner den Server nach neuen Jobs abfragt und den Fortschritt meldet, in Sekunden. Standard: 1. Höhere Werte reduzieren das Anfragevolumen auf Kosten einer etwas langsameren Job-Übernahme. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Beschränkt den Runner auf ein einzelnes Projekt. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | PEM-Bundle, das zusätzlich zum System-Truststore zur Überprüfung des Zertifikats des Semaphore-Servers verwendet wird. Setzen, wenn der Server ein selbstsigniertes Zertifikat oder ein Zertifikat einer internen CA verwendet. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Überprüfung des Serverzertifikats vollständig deaktivieren. Unsicher (anfällig für MITM) — nur zu Testzwecken verwenden. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | JSON-Objekt mit der vollständigen Executor-Konfiguration des Runners (`type` plus verschachtelte `docker`- oder `k8s`-Einstellungen). Verwenden, wenn Sie den gesamten Executor-Block über eine einzige Umgebungsvariable setzen möchten. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Strategie, mit der der Runner jede Aufgabe ausführt: `local` (Standard), `k8s` oder `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Pfad zu einer kubeconfig-Datei. Leer = In-Cluster-Konfiguration. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace, in dem die kurzlebigen Aufgaben-Pods erstellt werden. Standard: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Standard-Container-Image für den Build-Container. Standard: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Image, das für den git-clone-Init-Container verwendet wird. Standard: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Service Account, unter dem die Aufgaben-Pods laufen. Standard: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Kommagetrennte Liste von imagePullSecrets, die jedem Pod zugewiesen werden. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Wie oft der Executor den Pod-Status abfragt, in Sekunden. Standard: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Karenzzeit beim Löschen von Pods, in Sekunden. Standard: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL des Docker-Daemons (`unix://`, `tcp://` oder `npipe://`). Leer = Standardumgebung (`DOCKER_HOST`) und plattformspezifischer Standard-Socket. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | TLS-Zertifikatsprüfung für `tcp://`-Verbindungen aktivieren. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Verzeichnis mit ca.pem, cert.pem und key.pem für gegenseitiges TLS. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Standard-Image für den Build-Container. Standard: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Image, das für den temporären git-clone-Container verwendet wird. Standard: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Docker-Netzwerk, dem der Build-Container beitritt. Standard: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Pull-Richtlinie für Images: `always`, `if-not-present` (Standard) oder `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Wenn > 0, begrenzt die CPU des Build-Containers (wird als `--cpus` übergeben). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Wenn nicht leer, begrenzt den Arbeitsspeicher des Build-Containers (z. B. `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Wie oft der Container-Status abgefragt wird, in Sekunden. Standard: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Timeout, das an `docker stop` übergeben wird, in Sekunden. Standard: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Build-Container mit `--privileged` ausführen. Gefährlich; standardmäßig deaktiviert. |
| **Runner (serverseitige Flotte)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Heartbeat-Alter (Sekunden), ab dem ein Runner als offline gilt. Seine Aufgaben im Status „starting“ werden neu zugewiesen. Standard: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Heartbeat-Alter (Sekunden), ab dem die Aufgaben eines Runners im Status „running“ als fehlgeschlagen markiert werden. Werte unterhalb von `offline_timeout_sec` werden auf diesen Wert angehoben. Standard: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Wie oft (Sekunden) verteilte Aufgaben mit der Erreichbarkeit der Runner abgeglichen werden. Standard: 30 |
| **Teams** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Benutzern erlauben, Mitglieder in Teams einzuladen. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Art der Einladung: `username` (Standard), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Mitgliedern erlauben, Teams zu verlassen. |
| **Datenbank** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Pfad zur SQLite-Datenbankdatei.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host der MySQL-Datenbank.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Name der MySQL-Datenbank (Schema).       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL-Benutzername.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Passwort des MySQL-Benutzers.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host der Postgres-Datenbank.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Name der Postgres-Datenbank (Schema).    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres-Benutzername.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Passwort des Postgres-Benutzers.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Kann `sqlite` (Standard), `postgres` oder `mysql` sein.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | JSON-Map mit Optionen für die Datenbankverbindung. |
| **Sicherheit** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Base64-kodierter Schlüssel zur Verschlüsselung der in der Datenbank gespeicherten Zugriffsschlüssel. Mehr dazu in der [Referenz zur Datenbankverschlüsselung](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Base64-kodierter Schlüssel zur Verschlüsselung der DB-Optionen (des JWT-Signaturschlüssels) nach dem alten Einzelschlüssel-Schema (ohne Rotation). Fällt auf den Zugriffsschlüssel zurück, wenn nicht gesetzt. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Base64-kodierter HMAC-Schlüssel zum Signieren von Cookies. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Base64-kodierter Schlüssel zur Verschlüsselung von Cookies. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Kann nützlich sein, wenn Sie Semaphore unter einem Unterpfad verwenden möchten, zum Beispiel: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Fügen Sie keinen abschließenden `/` hinzu. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | TLS (HTTPS) für die sichere Kommunikation mit dem Semaphore-Server aktivieren oder deaktivieren. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Pfad zur TLS-Zertifikatsdatei. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Pfad zur TLS-Schlüsseldatei. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Adresse (`host[:port]`) für den HTTP→HTTPS-Weiterleitungs-Listener. Schließt sich mit `tls.http_redirect_port` gegenseitig aus. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Port, über den HTTP-Verkehr auf HTTPS umgeleitet wird. Schließt sich mit `tls.http_redirect_addr` gegenseitig aus. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Zwei-Faktor-Authentifizierung mit TOTP aktivieren. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Aussteller-Bezeichnung (Semaphore-Titel), die in TOTP-Authenticator-Apps angezeigt wird. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Benutzern erlauben, TOTP mit einem Wiederherstellungscode zurückzusetzen. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | E-Mail-basierte Multi-Faktor-Authentifizierung aktivieren. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Anmeldung als externer Benutzer (nur E-Mail) erlauben. |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Erstellen externer Benutzer bei der ersten Anmeldung erlauben. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | JSON-Array der erlaubten E-Mail-Domains. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | E-Mail-MFA für Benutzer deaktivieren, die über OIDC authentifiziert sind. |
| **Verschlüsselung** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Pfad zu einer separaten Datei mit den Verschlüsselungs-Keyrings (YAML oder JSON). Wird auf Änderungen überwacht — Bearbeitungen werden ohne Neustart des Servers übernommen. Wenn nicht gesetzt, wird das veraltete Feld `access_key_encryption` verwendet. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Wie oft `keys_file` auf Änderungen geprüft wird (eine Go-Duration wie `15s`). `0` deaktiviert die Abfrage (ein SIGHUP erzwingt weiterhin ein Neuladen). Standard: 15s |
| **Prozess** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Benutzer, unter dem gekapselte Prozesse (wie Ansible, Terraform oder OpenTofu) ausgeführt werden. |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID des Benutzers, unter dem gekapselte Prozesse (wie Ansible, Terraform oder OpenTofu) ausgeführt werden. |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID der Gruppe, unter der gekapselte Prozesse (wie Ansible, Terraform oder OpenTofu) ausgeführt werden. |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Chroot-Verzeichnis für gekapselte Prozesse. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Setzt das Flag `no_new_privs`, damit gekapselte Prozesse keine neuen Berechtigungen erlangen können. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | UIDs/GIDs für App-Ausführungen isolieren (`CLONE_NEWUSER`). Nur Linux. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Host-Mountpunkte wie Secret-tmpfs vor App-Ausführungen verbergen (`CLONE_NEWNS`). Nur Linux. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Host-Prozesse vor App-Ausführungen verbergen (`CLONE_NEWPID`). Nur Linux. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | SysV-IPC und POSIX-Message-Queues für App-Ausführungen isolieren (`CLONE_NEWIPC`). Nur Linux. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Hostname und Domain für App-Ausführungen isolieren (`CLONE_NEWUTS`). Nur Linux. |
| **E-Mail** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | E-Mail-Adresse des Absenders. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Hostname des SMTP-Servers. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Port des SMTP-Servers. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | StartTLS aktivieren, um eine unverschlüsselte SMTP-Verbindung auf eine sichere, verschlüsselte Verbindung hochzustufen. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | SSL- oder TLS-Verbindung für die Kommunikation mit dem SMTP-Server verwenden. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Minimale TLS-Version, die für die Verbindung verwendet wird. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Benutzername für die Authentifizierung am SMTP-Server. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Passwort für die Authentifizierung am SMTP-Server. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Flag, das E-Mail-Benachrichtigungen aktiviert. |
| **Messenger** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Auf True setzen, um Benachrichtigungen an Telegram zu senden. Sollte in Kombination mit `telegram_chat` und `telegram_token` verwendet werden. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Auf die Chat-ID des Chats setzen, an den Benachrichtigungen gesendet werden sollen.  Mehr dazu unter [Einrichtung von Telegram-Benachrichtigungen](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Auf das Autorisierungstoken des Bots setzen, der die Benachrichtigungsdaten empfängt.  Mehr dazu unter [Einrichtung von Telegram-Benachrichtigungen](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Auf True setzen, um Benachrichtigungen an Slack zu senden. Sollte in Kombination mit `slack_url` verwendet werden                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | Die Slack-Webhook-URL. Semaphore sendet damit per POST Slack-formatierte JSON-Benachrichtigungen an die angegebene URL.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Flag, das Microsoft-Teams-Benachrichtigungen aktiviert. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft-Teams-Webhook-URL. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Auf True setzen, um Benachrichtigungen an Rocket.Chat zu senden. Sollte in Kombination mit `rocketchat_url` verwendet werden. Verfügbar seit v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | Die Rocket.Chat-Webhook-URL. Semaphore sendet damit per POST Rocket.Chat-formatierte JSON-Benachrichtigungen an die angegebene URL. Verfügbar seit v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Dingtalk-Benachrichtigungen aktivieren. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | Webhook-URL des Dingtalk-Messengers. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Gotify-Benachrichtigungen aktivieren. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL des Gotify-Servers. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Token des Gotify-Servers. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Flag, das die LDAP-Authentifizierung aktiviert. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Flag zum Aktivieren oder Deaktivieren von TLS für LDAP-Verbindungen. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | Der Distinguished Name (DN), der für das Bind am LDAP-Server zur Authentifizierung verwendet wird. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | Das Passwort, das für das Bind am LDAP-Server zur Authentifizierung verwendet wird. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | Hostname und Port des LDAP-Servers (z. B. ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | Der Basis-Distinguished-Name (DN), der für die Suche nach Benutzern im LDAP-Verzeichnis verwendet wird (z. B. dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | Der Filter, der für die Suche nach Benutzern im LDAP-Verzeichnis verwendet wird (z. B. (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | LDAP-Attribut, das als Zuordnung für den Distinguished Name (DN) bei der Benutzerauthentifizierung verwendet wird. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | LDAP-Attribut, das als Zuordnung für die E-Mail-Adresse bei der Benutzerauthentifizierung verwendet wird. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | LDAP-Attribut, das als Zuordnung für die Benutzer-ID (UID) bei der Benutzerauthentifizierung verwendet wird. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | LDAP-Attribut, das als Zuordnung für den Common Name (CN) bei der Benutzerauthentifizierung verwendet wird. |
| **Protokollierung** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Format des Ereignisprotokolls. Kann `json` oder leer für Text sein. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Ereignisprotokollierung aktivieren oder deaktivieren. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | JSON-Map mit der Konfiguration des Ereignis-Loggers. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Format des Aufgabenprotokolls. Kann `json` oder leer für Text sein. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Aufgabenprotokollierung aktivieren oder deaktivieren. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | JSON-Map mit der Konfiguration des Aufgaben-Loggers. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | JSON-Map mit der Konfiguration des Loggers für Aufgabenergebnisse. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Schreiben von Protokollen an den konfigurierten Syslog-Server aktivieren oder deaktivieren. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protokoll für die Verbindung zum Syslog-Server: `udp` oder `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Hostname und Port des Syslog-Servers. Beispiel: `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Das Tag, mit dem Semaphore-UI-Einträge auf dem Syslog-Server gekennzeichnet werden. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Format der Syslog-Nachrichten. Kann `rfc5424` oder leer für den Standard sein. |
| **Debugging** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Verzögerung zu API-Antworten hinzufügen (zu Debugging-Zwecken). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Verzeichnis für pprof-Dump-Dateien. |
| **Hochverfügbarkeit (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Hochverfügbarkeitsmodus (HA) aktivieren. |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Eindeutige Kennung des HA-Knotens. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Adresse des für HA verwendeten Redis-Servers. Beispiel: `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Nummer der Redis-Datenbank. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Passwort für den Redis-Server. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Benutzername für den Redis-Server. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | TLS für die Redis-Verbindung aktivieren. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | TLS-Zertifikatsprüfung für die Redis-Verbindung überspringen. |

## Häufig gestellte Fragen {#frequently-asked-questions}

### 1. Wie konfiguriert man eine öffentliche URL für Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Wenn Sie nginx oder einen anderen Webserver vor Semaphore einsetzen, sollten Sie die Konfigurationsoption `web_host` angeben.

Angenommen, Sie haben NGINX auf dem Server konfiguriert, der Anfragen an Semaphore weiterleitet.

Die Serveradresse lautet `https://example.com` und Sie leiten alle Anfragen an `https://example.com/semaphore` an Semaphore weiter.

Ihr `web_host` lautet dann `https://example.com/semaphore`.
