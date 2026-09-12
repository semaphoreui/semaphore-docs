# Configuration

Semaphore peut être configuré de plusieurs manières :

* [Configurateur en ligne](https://semaphoreui.com/install) &mdash; interface web pour générer la configuration en ligne.
* [Fichier de configuration](/admin-guide/configuration/config-file) &mdash; le moyen principal et le plus flexible de configurer Semaphore.
* [Variables d'environnement](/admin-guide/configuration/env-vars) &mdash; utiles pour les déploiements conteneurisés ou cloud-native.


## Options de configuration {#configuration-options}

Liste complète des options de configuration disponibles :

| Option du fichier de configuration / Variable d'environnement     | Description                        |
| ----------------------- | --------------------------------------------------------- |
| **Général** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Type de client Git. Peut être `cmd_git` (par défaut) ou `go_git`. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Nombre de tentatives de git clone ou pull avant que la tâche n'échoue. Utilise un backoff exponentiel (1 s, puis 2 s, 4 s, … jusqu'à 60 s) entre les tentatives. Par défaut : `4`. Définissez `1` pour désactiver les nouvelles tentatives. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Chemin vers un fichier de configuration SSH personnalisé. Par défaut : `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Port TCP sur lequel l'interface web sera disponible. Par défaut : `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Adresse d'écoute (vide = toutes les interfaces). Utile si votre serveur possède plusieurs interfaces réseau. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Chemin vers le répertoire où sont stockés les dépôts clonés et les fichiers générés. Par défaut : /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Chemin vers le répertoire où sont stockés les secrets (par exemple les fichiers de token Vault). Par défaut : `/tmp/semaphore`. L'ancienne option de premier niveau `secrets_path` est toujours acceptée lorsque `dirs.secrets` n'est pas définie ou conserve sa valeur par défaut. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Chemin vers le répertoire où sont stockés les dépôts. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Chemin vers le répertoire où sont stockés les sockets de l'agent SSH. Par défaut : /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Contrôle la manière dont la variable d'environnement HOME est définie pour les tâches. Options : `template_dir` (par défaut), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Nombre maximal de tâches parallèles pouvant être exécutées sur le serveur. Par défaut : 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Durée maximale d'une tâche en secondes. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Nombre maximal de tâches récentes conservées dans la base de données pour chaque modèle. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Fuseau horaire utilisé pour la planification des tâches et des tâches cron. Par défaut : UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Paramètres des fournisseurs OpenID. Vous pouvez fournir plusieurs fournisseurs OpenID. Pour en savoir plus sur la configuration OpenID, consultez [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Interdire la connexion par mot de passe. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Autoriser les utilisateurs non administrateurs à créer des projets. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | Map JSON contenant les variables d'environnement exposées aux exécutions de tâches. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | Tableau JSON des variables d'environnement de l'hôte qui seront transmises aux exécutions de tâches. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | Map JSON contenant la configuration des applications. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Activer pour utiliser un runner distant. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Token d'amorçage utilisé par les runners pour s'enregistrer auprès du serveur. |
| **Abonnement** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Clé ou token d'abonnement. Désactive l'activation depuis l'interface web lorsqu'elle est définie. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Chemin vers le fichier contenant la clé ou le token d'abonnement. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL du serveur d'abonnement / de facturation. Par défaut : https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Lorsque cette option est activée, Semaphore émet un JWT de courte durée pour chaque exécution de tâche et expose sa clé publique via `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Valeur émise dans la revendication `iss` des JWT délivrés. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Durée de vie par défaut d'un JWT de tâche délivré, sous forme de durée Go (par ex. `30m`, `1h`). Par défaut : 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Limite supérieure stricte du TTL des JWT défini par modèle, sous forme de durée Go. Par défaut : 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Chemin vers le fichier contenant le token d'enregistrement du runner. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Token d'authentification du runner. Mutuellement exclusif avec `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Chemin vers le fichier de token pour l'enregistrement du runner. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Chemin vers le fichier de clé privée du runner. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Le runner traite un seul job puis s'arrête. Utile pour les runners dynamiques. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Activer le runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | URL du webhook pour le runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Nom du runner. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | Tableau JSON des tags du runner. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Nombre maximal de tâches parallèles pour le runner. Par défaut : 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Fréquence, en secondes, à laquelle le runner interroge le serveur pour de nouveaux jobs et remonte sa progression. Par défaut : 1. Des valeurs plus élevées réduisent le volume de requêtes au prix d'une prise en charge des jobs légèrement plus lente. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Restreindre le runner à un seul projet. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | Bundle PEM utilisé pour vérifier le certificat du serveur Semaphore, en plus du magasin de confiance du système. À définir lorsque le serveur utilise un certificat auto-signé ou émis par une CA interne. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Désactiver entièrement la vérification du certificat du serveur. Non sécurisé (vulnérable aux attaques MITM) — à utiliser uniquement pour des tests. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | Objet JSON contenant la configuration complète de l'exécuteur du runner (`type` plus les paramètres imbriqués `docker` ou `k8s`). À utiliser lorsque vous souhaitez définir tout le bloc exécuteur à partir d'une seule variable d'environnement. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Stratégie utilisée par le runner pour exécuter chaque tâche : `local` (par défaut), `k8s` ou `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Chemin vers un fichier kubeconfig. Vide = configuration in-cluster. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace dans lequel les Pods de tâche éphémères sont créés. Par défaut : semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Image de conteneur par défaut pour le conteneur de build. Par défaut : semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Image utilisée pour le conteneur d'initialisation git-clone. Par défaut : semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Compte de service sous lequel s'exécutent les Pods de tâche. Par défaut : default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Liste, séparée par des virgules, des imagePullSecrets attachés à chaque Pod. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Fréquence, en secondes, à laquelle l'exécuteur interroge l'état des Pods. Par défaut : 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Délai de grâce, en secondes, lors de la suppression des Pods. Par défaut : 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL du démon Docker (`unix://`, `tcp://` ou `npipe://`). Vide = environnement standard (`DOCKER_HOST`) et socket par défaut de la plateforme. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Activer la vérification du certificat TLS pour les connexions `tcp://`. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Répertoire contenant ca.pem, cert.pem et key.pem pour le TLS mutuel. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Image par défaut pour le conteneur de build. Par défaut : semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Image utilisée pour le conteneur git-clone temporaire. Par défaut : semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Réseau Docker que rejoint le conteneur de build. Par défaut : bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Politique de récupération des images : `always`, `if-not-present` (par défaut) ou `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Lorsque > 0, limite le CPU du conteneur de build (transmis via `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Lorsque non vide, limite la mémoire du conteneur de build (par ex. `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Fréquence, en secondes, à laquelle l'état du conteneur est interrogé. Par défaut : 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Délai d'expiration, en secondes, transmis à `docker stop`. Par défaut : 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Exécuter le conteneur de build avec `--privileged`. Dangereux ; désactivé par défaut. |
| **Runners (flotte côté serveur)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Ancienneté du heartbeat (en secondes) au-delà de laquelle un runner est considéré comme hors ligne. Ses tâches en état « starting » sont réassignées. Par défaut : 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Ancienneté du heartbeat (en secondes) au-delà de laquelle les tâches en état « running » d'un runner sont marquées comme échouées. Les valeurs inférieures à `offline_timeout_sec` sont ramenées à cette valeur. Par défaut : 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Fréquence (en secondes) à laquelle les tâches distribuées sont réconciliées avec l'état de vie des runners. Par défaut : 30 |
| **Équipes** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Autoriser les utilisateurs à inviter des membres dans les équipes. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Type d'invitation : `username` (par défaut), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Autoriser les membres à quitter les équipes. |
| **Base de données** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Chemin vers le fichier de base de données SQLite.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Hôte de la base de données MySQL.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nom de la base de données (schéma) MySQL.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | Nom d'utilisateur MySQL.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Mot de passe de l'utilisateur MySQL.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Hôte de la base de données Postgres.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nom de la base de données (schéma) Postgres.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Nom d'utilisateur Postgres.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Mot de passe de l'utilisateur Postgres.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Peut être `sqlite` (par défaut), `postgres` ou `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | Map JSON contenant les options de connexion à la base de données. |
| **Sécurité** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Clé encodée en Base64 utilisée pour chiffrer les clés d'accès stockées dans la base de données. Pour en savoir plus, consultez la [référence sur le chiffrement de la base de données](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Clé encodée en Base64 utilisée pour chiffrer les options de la base de données (la clé de signature JWT) avec l'ancien schéma à clé unique (sans rotation). Utilise la clé d'accès en repli lorsqu'elle n'est pas définie. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Clé HMAC encodée en Base64 utilisée pour signer les cookies. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Clé encodée en Base64 utilisée pour chiffrer les cookies. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Peut être utile si vous souhaitez utiliser Semaphore via un sous-chemin, par exemple : [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). N'ajoutez pas de `/` final. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Activer ou désactiver TLS (HTTPS) pour une communication sécurisée avec le serveur Semaphore. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Chemin vers le fichier de certificat TLS. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Chemin vers le fichier de clé TLS. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Adresse (`host[:port]`) de l'écouteur de redirection HTTP→HTTPS. Mutuellement exclusif avec `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Port pour rediriger le trafic HTTP vers HTTPS. Mutuellement exclusif avec `tls.http_redirect_addr`. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Activer l'authentification à deux facteurs via TOTP. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Libellé de l'émetteur (titre Semaphore) affiché dans les applications d'authentification TOTP. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Autoriser les utilisateurs à réinitialiser TOTP à l'aide d'un code de récupération. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Activer l'authentification multifacteur par e-mail. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Autoriser la connexion en tant qu'utilisateur externe (e-mail uniquement). |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Autoriser la création d'utilisateurs externes lors de la première connexion. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | Tableau JSON des domaines e-mail autorisés. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Désactiver la MFA par e-mail pour les utilisateurs authentifiés via OIDC. |
| **Chiffrement** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Chemin vers un fichier séparé contenant les trousseaux de clés de chiffrement (YAML ou JSON). Surveillé pour détecter les modifications — les changements sont appliqués sans redémarrer le serveur. Lorsqu'il n'est pas défini, l'ancien champ `access_key_encryption` est utilisé. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Fréquence à laquelle `keys_file` est vérifié pour détecter les modifications (une durée Go comme `15s`). `0` désactive la vérification (un SIGHUP force toujours le rechargement). Par défaut : 15s |
| **Processus** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Utilisateur sous lequel s'exécuteront les processus encapsulés (tels qu'Ansible, Terraform ou OpenTofu). |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID de l'utilisateur sous lequel s'exécuteront les processus encapsulés (tels qu'Ansible, Terraform ou OpenTofu). |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID du groupe sous lequel s'exécuteront les processus encapsulés (tels qu'Ansible, Terraform ou OpenTofu). |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Répertoire chroot pour les processus encapsulés. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Définir l'indicateur `no_new_privs` afin que les processus encapsulés ne puissent pas acquérir de nouveaux privilèges. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Isoler les UID/GID (`CLONE_NEWUSER`) pour les exécutions d'applications. Linux uniquement. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Masquer les points de montage de l'hôte tels que les tmpfs de secrets (`CLONE_NEWNS`) pour les exécutions d'applications. Linux uniquement. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Masquer les processus de l'hôte aux exécutions d'applications (`CLONE_NEWPID`). Linux uniquement. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Isoler les IPC SysV et les files de messages POSIX (`CLONE_NEWIPC`) pour les exécutions d'applications. Linux uniquement. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Isoler le nom d'hôte et le domaine (`CLONE_NEWUTS`) pour les exécutions d'applications. Linux uniquement. |
| **E-mail** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | Adresse e-mail de l'expéditeur. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Nom d'hôte du serveur SMTP. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Port du serveur SMTP. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Activer StartTLS pour transformer une connexion SMTP non chiffrée en connexion sécurisée et chiffrée. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Utiliser une connexion SSL ou TLS pour communiquer avec le serveur SMTP. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Version TLS minimale à utiliser pour la connexion. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Nom d'utilisateur pour l'authentification auprès du serveur SMTP. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Mot de passe pour l'authentification auprès du serveur SMTP. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Indicateur qui active les alertes par e-mail. |
| **Messageries** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Définir sur True pour activer l'envoi d'alertes vers Telegram. À utiliser en combinaison avec `telegram_chat` et `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Définir sur l'identifiant (Chat ID) de la conversation à laquelle envoyer les alertes.  Pour en savoir plus, consultez [Configuration des notifications Telegram](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Définir sur le token d'autorisation du bot qui recevra la charge utile de l'alerte.  Pour en savoir plus, consultez [Configuration des notifications Telegram](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Définir sur True pour activer l'envoi d'alertes vers Slack. À utiliser en combinaison avec `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | L'URL du webhook Slack. Semaphore l'utilisera pour envoyer en POST des alertes JSON au format Slack à l'URL fournie.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Indicateur qui active les alertes Microsoft Teams. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | URL du webhook Microsoft Teams. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Définir sur True pour activer l'envoi d'alertes vers Rocket.Chat. À utiliser en combinaison avec `rocketchat_url`. Disponible depuis la v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | L'URL du webhook Rocket.Chat. Semaphore l'utilisera pour envoyer en POST des alertes JSON au format Rocket.Chat à l'URL fournie. Disponible depuis la v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Activer les alertes Dingtalk. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | URL du webhook de la messagerie Dingtalk. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Activer les alertes Gotify. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL du serveur Gotify. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Token du serveur Gotify. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Indicateur qui active l'authentification LDAP. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Indicateur pour activer ou désactiver TLS pour les connexions LDAP. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | Le nom distinctif (DN) utilisé pour se lier au serveur LDAP lors de l'authentification. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | Le mot de passe utilisé pour se lier au serveur LDAP lors de l'authentification. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | Le nom d'hôte et le port du serveur LDAP (par ex. ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | Le nom distinctif (DN) de base utilisé pour rechercher les utilisateurs dans l'annuaire LDAP (par ex. dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | Le filtre utilisé pour rechercher les utilisateurs dans l'annuaire LDAP (par ex. (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | Attribut LDAP à utiliser comme correspondance du nom distinctif (DN) pour l'authentification des utilisateurs. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | Attribut LDAP à utiliser comme correspondance de l'adresse e-mail pour l'authentification des utilisateurs. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | Attribut LDAP à utiliser comme correspondance de l'identifiant utilisateur (UID) pour l'authentification des utilisateurs. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | Attribut LDAP à utiliser comme correspondance du nom commun (CN) pour l'authentification des utilisateurs. |
| **Journalisation** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Format du journal des événements. Peut être `json` ou vide pour du texte. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Activer ou désactiver la journalisation des événements. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | Map JSON contenant la configuration du logger d'événements. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Format du journal des tâches. Peut être `json` ou vide pour du texte. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Activer ou désactiver la journalisation des tâches. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | Map JSON contenant la configuration du logger de tâches. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | Map JSON contenant la configuration du logger de résultats de tâches. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Activer ou désactiver l'écriture des journaux vers le serveur syslog configuré. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protocole utilisé pour se connecter au serveur Syslog : `udp` ou `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Nom d'hôte et port du serveur Syslog. Exemple : `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Le tag utilisé pour marquer les enregistrements de Semaphore UI sur le serveur Syslog. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Format des messages Syslog. Peut être `rfc5424` ou vide pour le format par défaut. |
| **Débogage** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Ajouter un délai aux réponses de l'API (à des fins de débogage). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Répertoire des fichiers de dump pprof. |
| **Haute disponibilité (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Activer le mode haute disponibilité (HA). |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Identifiant unique du nœud HA. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Adresse du serveur Redis utilisé pour la HA. Exemple : `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Numéro de la base de données Redis. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Mot de passe du serveur Redis. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Nom d'utilisateur du serveur Redis. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Activer TLS pour la connexion Redis. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Ignorer la vérification du certificat TLS pour la connexion Redis. |

## Foire aux questions {#frequently-asked-questions}

### 1. Comment configurer une URL publique pour Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Si vous utilisez nginx ou un autre serveur web devant Semaphore, vous devez renseigner l'option de configuration `web_host`.

Par exemple, vous avez configuré NGINX sur le serveur pour qu'il relaie les requêtes vers Semaphore.

L'adresse du serveur est `https://example.com` et vous relayez toutes les requêtes `https://example.com/semaphore` vers Semaphore.

Votre `web_host` sera `https://example.com/semaphore`.
