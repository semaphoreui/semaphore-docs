# Configurazione

Semaphore può essere configurato in diversi modi:

* [Configuratore online](https://semaphoreui.com/install) &mdash; interfaccia web per generare la configurazione online.
* [File di configurazione](/admin-guide/configuration/config-file) &mdash; il metodo principale e più flessibile per configurare Semaphore.
* [Variabili d'ambiente](/admin-guide/configuration/env-vars) &mdash; utili per deployment containerizzati o cloud-native.


## Opzioni di configurazione {#configuration-options}

Elenco completo delle opzioni di configurazione disponibili:

| Opzione del file di configurazione / Variabile d'ambiente     | Descrizione                        |
| ----------------------- | --------------------------------------------------------- |
| **Generali** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Tipo di client Git. Può essere `cmd_git` (predefinito) o `go_git`. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Numero di tentativi di git clone o pull prima che il task fallisca. Utilizza un backoff esponenziale (1s, poi 2s, 4s, … fino a 60s) tra un tentativo e l'altro. Predefinito: `4`. Impostare a `1` per disabilitare i nuovi tentativi. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Percorso del file di configurazione SSH personalizzato. Predefinito: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Porta TCP su cui sarà disponibile l'interfaccia web. Predefinito: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Indirizzo di bind (vuoto = tutte le interfacce). Utile se il server dispone di più interfacce di rete. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Percorso della directory in cui vengono archiviati i repository clonati e i file generati. Predefinito: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Percorso della directory in cui vengono archiviati i segreti (ad esempio i file dei token Vault). Predefinito: `/tmp/semaphore`. L'opzione legacy di primo livello `secrets_path` è ancora accettata quando `dirs.secrets` non è impostato o è lasciato al valore predefinito. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Percorso della directory in cui vengono archiviati i repository. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Percorso della directory in cui vengono archiviati i socket dell'agente SSH. Predefinito: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Controlla come viene impostata la variabile d'ambiente HOME per i task. Opzioni: `template_dir` (predefinito), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Numero massimo di task paralleli eseguibili sul server. Predefinito: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Durata massima di un task in secondi. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Numero massimo di task recenti archiviati nel database per ogni template. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Fuso orario utilizzato per la pianificazione dei task e dei job cron. Predefinito: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Impostazioni dei provider OpenID. È possibile specificare più provider OpenID. Per maggiori informazioni sulla configurazione di OpenID consultare [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Nega l'accesso tramite password. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Consente agli utenti non amministratori di creare progetti. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | Mappa JSON contenente le variabili d'ambiente esposte alle esecuzioni dei task. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | Array JSON delle variabili d'ambiente dell'host che verranno inoltrate alle esecuzioni dei task. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | Mappa JSON contenente la configurazione delle app. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Abilitare per utilizzare un runner remoto. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Token di bootstrap utilizzato dai runner per registrarsi sul server. |
| **Sottoscrizione** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Chiave o token di sottoscrizione. Se impostato, disabilita l'attivazione dall'interfaccia web. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Percorso del file contenente la chiave o il token di sottoscrizione. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL del server di sottoscrizione / fatturazione. Predefinito: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Se abilitato, Semaphore genera un JWT di breve durata per ogni esecuzione di task ed espone la relativa chiave pubblica tramite `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Valore emesso nel claim `iss` dei JWT rilasciati. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Durata predefinita di un JWT di task rilasciato, espressa come durata Go (ad es. `30m`, `1h`). Predefinito: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Limite massimo assoluto per il TTL dei JWT per template, espresso come durata Go. Predefinito: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Percorso del file contenente il token di registrazione del runner. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Token di autenticazione del runner. Mutuamente esclusivo con `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Percorso del file del token per la registrazione del runner. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Percorso del file della chiave privata del runner. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Il runner elabora un singolo job e termina. Utile per i runner dinamici. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Abilita il runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | URL del webhook per il runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Nome del runner. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | Array JSON dei tag del runner. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Numero massimo di task paralleli per il runner. Predefinito: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Frequenza, in secondi, con cui il runner interroga il server per nuovi job e riporta l'avanzamento. Predefinito: 1. Valori più alti riducono il volume delle richieste a costo di una presa in carico dei job leggermente più lenta. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Limita il runner a un singolo progetto. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | Bundle PEM utilizzato per verificare il certificato del server Semaphore, in aggiunta all'archivio di certificati attendibili del sistema. Da impostare quando il server utilizza un certificato autofirmato o emesso da una CA interna. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Disabilita completamente la verifica del certificato del server. Non sicuro (vulnerabile ad attacchi MITM) — da utilizzare solo per i test. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | Oggetto JSON con la configurazione completa dell'executor del runner (`type` più le impostazioni annidate `docker` o `k8s`). Da utilizzare quando si desidera impostare l'intero blocco executor da una singola variabile d'ambiente. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Strategia utilizzata dal runner per eseguire ogni task: `local` (predefinito), `k8s` o `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Percorso di un file kubeconfig. Vuoto = configurazione in-cluster. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace in cui vengono creati i Pod effimeri dei task. Predefinito: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Immagine container predefinita per il container di build. Predefinito: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Immagine utilizzata per l'init container di git-clone. Predefinito: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Service account con cui vengono eseguiti i Pod dei task. Predefinito: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Elenco separato da virgole di imagePullSecrets associati a ogni Pod. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Frequenza, in secondi, con cui l'executor interroga lo stato dei Pod. Predefinito: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Periodo di tolleranza, in secondi, per l'eliminazione dei Pod. Predefinito: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL del daemon Docker (`unix://`, `tcp://` o `npipe://`). Vuoto = ambiente standard (`DOCKER_HOST`) e socket predefinito della piattaforma. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Abilita la verifica del certificato TLS per le connessioni `tcp://`. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Directory contenente ca.pem, cert.pem e key.pem per il TLS reciproco. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Immagine predefinita per il container di build. Predefinito: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Immagine utilizzata per il container temporaneo di git-clone. Predefinito: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Rete Docker a cui si collega il container di build. Predefinito: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Politica di pull delle immagini: `always`, `if-not-present` (predefinito) o `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Se > 0, limita la CPU del container di build (passato come `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Se non vuoto, limita la memoria del container di build (ad es. `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Frequenza, in secondi, con cui viene interrogato lo stato del container. Predefinito: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Timeout passato a `docker stop`, in secondi. Predefinito: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Esegue il container di build con `--privileged`. Pericoloso; disabilitato per impostazione predefinita. |
| **Runner (flotta lato server)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Anzianità dell'heartbeat (secondi) oltre la quale un runner viene considerato offline. I suoi task in stato "starting" vengono riassegnati. Predefinito: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Anzianità dell'heartbeat (secondi) oltre la quale i task in stato "running" di un runner vengono contrassegnati come falliti. I valori inferiori a `offline_timeout_sec` vengono portati a tale valore. Predefinito: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Frequenza (secondi) con cui i task assegnati vengono riconciliati con lo stato di attività dei runner. Predefinito: 30 |
| **Team** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Consente agli utenti di invitare membri nei team. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Tipo di invito: `username` (predefinito), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Consente ai membri di lasciare i team. |
| **Database** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Percorso del file del database SQLite.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host del database MySQL.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nome del database (schema) MySQL.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | Nome utente MySQL.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Password dell'utente MySQL.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host del database Postgres.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nome del database (schema) Postgres.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Nome utente Postgres.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Password dell'utente Postgres.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Può essere `sqlite` (predefinito), `postgres` o `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | Mappa JSON contenente le opzioni di connessione al database. |
| **Sicurezza** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Chiave codificata in Base64 utilizzata per cifrare le chiavi di accesso archiviate nel database. Per maggiori informazioni consultare il [riferimento sulla cifratura del database](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Chiave codificata in Base64 utilizzata per cifrare le opzioni del DB (la chiave di firma JWT) con il vecchio schema a chiave singola (senza rotazione). Se non impostata, viene utilizzata la chiave di accesso. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Chiave HMAC codificata in Base64 utilizzata per firmare i cookie. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Chiave codificata in Base64 utilizzata per cifrare i cookie. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Può essere utile se si desidera utilizzare Semaphore tramite un sottopercorso, ad esempio: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Non aggiungere una `/` finale. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Abilita o disabilita TLS (HTTPS) per la comunicazione sicura con il server Semaphore. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Percorso del file del certificato TLS. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Percorso del file della chiave TLS. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Indirizzo (`host[:port]`) del listener per il reindirizzamento HTTP→HTTPS. Mutuamente esclusivo con `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Porta per reindirizzare il traffico HTTP verso HTTPS. Mutuamente esclusivo con `tls.http_redirect_addr`. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Abilita l'autenticazione a due fattori tramite TOTP. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Etichetta dell'issuer (titolo di Semaphore) mostrata nelle app di autenticazione TOTP. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Consente agli utenti di reimpostare il TOTP utilizzando un codice di recupero. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Abilita l'autenticazione a più fattori tramite email. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Consente l'accesso come utente esterno (solo email). |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Consente la creazione di utenti esterni al primo accesso. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | Array JSON dei domini email consentiti. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Disabilita l'MFA via email per gli utenti autenticati tramite OIDC. |
| **Cifratura** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Percorso di un file separato contenente i keyring di cifratura (YAML o JSON). Il file viene monitorato: le modifiche vengono applicate senza riavviare il server. Se non impostato, viene utilizzato il campo legacy `access_key_encryption`. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Frequenza con cui `keys_file` viene controllato per rilevare modifiche (una durata Go come `15s`). `0` disabilita il controllo periodico (un SIGHUP forza comunque il ricaricamento). Predefinito: 15s |
| **Processo** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Utente con cui verranno eseguiti i processi incapsulati (come Ansible, Terraform o OpenTofu). |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID dell'utente con cui verranno eseguiti i processi incapsulati (come Ansible, Terraform o OpenTofu). |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID del gruppo con cui verranno eseguiti i processi incapsulati (come Ansible, Terraform o OpenTofu). |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Directory chroot per i processi incapsulati. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Imposta il flag `no_new_privs` in modo che i processi incapsulati non possano acquisire nuovi privilegi. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Isola UID/GID (`CLONE_NEWUSER`) per le esecuzioni delle app. Solo Linux. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Nasconde i punti di mount dell'host, come i tmpfs dei segreti (`CLONE_NEWNS`), per le esecuzioni delle app. Solo Linux. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Nasconde i processi dell'host alle esecuzioni delle app (`CLONE_NEWPID`). Solo Linux. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Isola l'IPC SysV e le code di messaggi POSIX (`CLONE_NEWIPC`) per le esecuzioni delle app. Solo Linux. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Isola hostname e dominio (`CLONE_NEWUTS`) per le esecuzioni delle app. Solo Linux. |
| **Email** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | Indirizzo email del mittente. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Hostname del server SMTP. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Porta del server SMTP. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Abilita StartTLS per promuovere una connessione SMTP non cifrata a una connessione sicura e cifrata. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Utilizza una connessione SSL o TLS per la comunicazione con il server SMTP. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Versione minima di TLS da utilizzare per la connessione. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Nome utente per l'autenticazione sul server SMTP. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Password per l'autenticazione sul server SMTP. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Flag che abilita gli avvisi via email. |
| **Messaggistica** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Impostare a True per abilitare l'invio degli avvisi a Telegram. Da utilizzare in combinazione con `telegram_chat` e `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Impostare al Chat ID della chat a cui inviare gli avvisi.  Per maggiori informazioni consultare [Configurazione delle notifiche Telegram](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Impostare al token di autorizzazione del bot che riceverà il payload dell'avviso.  Per maggiori informazioni consultare [Configurazione delle notifiche Telegram](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Impostare a True per abilitare l'invio degli avvisi a Slack. Da utilizzare in combinazione con `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | URL del webhook Slack. Semaphore lo utilizzerà per inviare tramite POST avvisi JSON in formato Slack all'URL specificato.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Flag che abilita gli avvisi Microsoft Teams. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | URL del webhook Microsoft Teams. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Impostare a True per abilitare l'invio degli avvisi a Rocket.Chat. Da utilizzare in combinazione con `rocketchat_url`. Disponibile dalla versione v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | URL del webhook Rocket.Chat. Semaphore lo utilizzerà per inviare tramite POST avvisi JSON in formato Rocket.Chat all'URL specificato. Disponibile dalla versione v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Abilita gli avvisi Dingtalk. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | URL del webhook della messaggistica Dingtalk. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Abilita gli avvisi Gotify. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL del server Gotify. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Token del server Gotify. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Flag che abilita l'autenticazione LDAP. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Flag per abilitare o disabilitare TLS per le connessioni LDAP. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | Il distinguished name (DN) utilizzato per il bind al server LDAP per l'autenticazione. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | La password utilizzata per il bind al server LDAP per l'autenticazione. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | Hostname e porta del server LDAP (ad es. ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | Il distinguished name (DN) di base utilizzato per la ricerca degli utenti nella directory LDAP (ad es. dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | Il filtro utilizzato per la ricerca degli utenti nella directory LDAP (ad es. (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | Attributo LDAP da utilizzare come mapping del distinguished name (DN) per l'autenticazione degli utenti. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | Attributo LDAP da utilizzare come mapping dell'indirizzo email per l'autenticazione degli utenti. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | Attributo LDAP da utilizzare come mapping dell'ID utente (UID) per l'autenticazione degli utenti. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | Attributo LDAP da utilizzare come mapping del common name (CN) per l'autenticazione degli utenti. |
| **Logging** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Formato del log degli eventi. Può essere `json` oppure vuoto per il formato testuale. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Abilita o disabilita il logging degli eventi. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | Mappa JSON contenente la configurazione del logger degli eventi. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Formato del log dei task. Può essere `json` oppure vuoto per il formato testuale. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Abilita o disabilita il logging dei task. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | Mappa JSON contenente la configurazione del logger dei task. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | Mappa JSON contenente la configurazione del logger dei risultati dei task. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Abilita o disabilita la scrittura dei log sul server syslog configurato. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protocollo utilizzato per la connessione al server Syslog: `udp` o `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Hostname e porta del server Syslog. Esempio: `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Il tag utilizzato per contrassegnare i record di Semaphore UI sul server Syslog. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Formato dei messaggi Syslog. Può essere `rfc5424` oppure vuoto per il formato predefinito. |
| **Debug** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Aggiunge un ritardo alle risposte dell'API (a scopo di debug). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Directory per i file di dump pprof. |
| **Alta disponibilità (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Abilita la modalità ad alta disponibilità (HA). |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Identificatore univoco del nodo HA. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Indirizzo del server Redis utilizzato per l'HA. Esempio: `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Numero del database Redis. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Password del server Redis. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Nome utente del server Redis. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Abilita TLS per la connessione a Redis. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Ignora la verifica del certificato TLS per la connessione a Redis. |

## Domande frequenti {#frequently-asked-questions}

### 1. Come configurare un URL pubblico per Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Se si utilizza nginx o un altro server web davanti a Semaphore, è necessario specificare l'opzione di configurazione `web_host`.

Ad esempio, si è configurato NGINX sul server in modo che inoltri le richieste a Semaphore.

L'indirizzo del server è `https://example.com` e tutte le richieste a `https://example.com/semaphore` vengono inoltrate a Semaphore.

Il valore di `web_host` sarà `https://example.com/semaphore`.
