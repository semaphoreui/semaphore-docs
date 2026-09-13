# Konfiguracija

Semaphore se može konfigurisati na nekoliko načina:

* [Onlajn konfigurator](https://semaphoreui.com/install) &mdash; veb interfejs za generisanje konfiguracije onlajn.
* [Konfiguraciona datoteka](/admin-guide/configuration/config-file) &mdash; primarni i najfleksibilniji način konfigurisanja Semaphore-a.
* [Promenljive okruženja](/admin-guide/configuration/env-vars) &mdash; korisne za kontejnerizovana ili cloud-native okruženja.


## Konfiguracione opcije {#configuration-options}

Potpuna lista dostupnih konfiguracionih opcija:

| Opcija konfiguracione datoteke / Promenljiva okruženja     | Opis                        |
| ----------------------- | --------------------------------------------------------- |
| **Opšte** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Tip Git klijenta. Može biti `cmd_git` (podrazumevano) ili `go_git`. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Koliko puta se git clone ili pull pokušava pre nego što zadatak ne uspe. Između pokušaja se koristi eksponencijalno odlaganje (1s, zatim 2s, 4s, … do 60s). Podrazumevano: `4`. Postavite na `1` da isključite ponovne pokušaje. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Putanja do prilagođene SSH konfiguracione datoteke. Podrazumevano: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | TCP port na kome će veb interfejs biti dostupan. Podrazumevano: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Adresa za vezivanje (prazno = svi interfejsi). Korisno ako vaš server ima više mrežnih interfejsa. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Putanja do direktorijuma u kome se čuvaju klonirani repozitorijumi i generisane datoteke. Podrazumevano: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Putanja do direktorijuma u kome se čuvaju tajne (na primer datoteke sa Vault tokenima). Podrazumevano: `/tmp/semaphore`. Nasleđena opcija `secrets_path` najvišeg nivoa se i dalje prihvata kada `dirs.secrets` nije podešen ili je ostavljen na podrazumevanoj vrednosti. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Putanja do direktorijuma u kome se čuvaju repozitorijumi. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Putanja do direktorijuma u kome se čuvaju soketi SSH agenta. Podrazumevano: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Određuje kako se postavlja promenljiva okruženja HOME za zadatke. Opcije: `template_dir` (podrazumevano), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Maksimalan broj paralelnih zadataka koji se mogu izvršavati na serveru. Podrazumevano: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Maksimalno trajanje zadatka u sekundama. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Maksimalan broj nedavnih zadataka koji se čuvaju u bazi podataka za svaki šablon. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Vremenska zona koja se koristi za raspoređivanje zadataka i cron poslove. Podrazumevano: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Podešavanja OpenID provajdera. Možete navesti više OpenID provajdera. Više o OpenID konfiguraciji pročitajte u odeljku [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Zabranjuje prijavu lozinkom. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Dozvoljava korisnicima koji nisu administratori da kreiraju projekte. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | JSON mapa koja sadrži promenljive okruženja izložene izvršavanjima zadataka. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | JSON niz promenljivih okruženja hosta koje će biti prosleđene u izvršavanja zadataka. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | JSON mapa koja sadrži konfiguraciju aplikacija. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Uključite za korišćenje udaljenog runner-a. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Početni token koji runneri koriste za registraciju na serveru. |
| **Pretplata** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Ključ ili token pretplate. Kada je podešen, isključuje aktivaciju iz veb interfejsa. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Putanja do datoteke sa ključem ili tokenom pretplate. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL servera za pretplatu / naplatu. Podrazumevano: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Kada je uključeno, Semaphore izdaje kratkotrajni JWT za svako izvršavanje zadatka i izlaže njegov javni ključ preko `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Vrednost koja se upisuje u `iss` claim izdatih JWT-ova. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Podrazumevano trajanje izdatog JWT-a zadatka, kao Go duration (npr. `30m`, `1h`). Podrazumevano: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Stroga gornja granica JWT TTL-a po šablonu, kao Go duration. Podrazumevano: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Putanja do datoteke koja sadrži token za registraciju runner-a. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Token za autentifikaciju runner-a. Međusobno isključiv sa `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Putanja do datoteke sa tokenom za registraciju runner-a. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Putanja do datoteke sa privatnim ključem runner-a. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Runner obrađuje jedan posao i završava rad. Korisno za dinamičke runnere. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Uključuje runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | Webhook URL za runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Naziv runner-a. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | JSON niz oznaka runner-a. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Maksimalan broj paralelnih zadataka za runner. Podrazumevano: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Koliko često runner proverava server za nove poslove i prijavljuje napredak, u sekundama. Podrazumevano: 1. Veće vrednosti smanjuju broj zahteva po cenu nešto sporijeg preuzimanja poslova. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Ograničava runner na jedan projekat. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | PEM paket koji se koristi za proveru sertifikata Semaphore servera, pored sistemskog skladišta poverenja. Podesite kada server koristi samopotpisani sertifikat ili sertifikat internog CA. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Potpuno isključuje proveru sertifikata servera. Nebezbedno (ranjivo na MITM) — koristite samo za testiranje. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | JSON objekat sa kompletnom konfiguracijom izvršioca runner-a (`type` plus ugnežđena `docker` ili `k8s` podešavanja). Koristite kada želite da podesite ceo blok izvršioca iz jedne promenljive okruženja. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Strategija koju runner koristi za izvršavanje svakog zadatka: `local` (podrazumevano), `k8s` ili `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Putanja do kubeconfig datoteke. Prazno = konfiguracija unutar klastera. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace u kome se kreiraju privremeni Pod-ovi zadataka. Podrazumevano: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Podrazumevana slika kontejnera za build kontejner. Podrazumevano: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Slika koja se koristi za init kontejner za git kloniranje. Podrazumevano: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Servisni nalog pod kojim se izvršavaju Pod-ovi zadataka. Podrazumevano: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Lista imagePullSecrets razdvojenih zarezom koji se dodaju svakom Pod-u. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Koliko često izvršilac proverava status Pod-a, u sekundama. Podrazumevano: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Period tolerancije pri brisanju Pod-ova, u sekundama. Podrazumevano: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL Docker demona (`unix://`, `tcp://` ili `npipe://`). Prazno = standardno okruženje (`DOCKER_HOST`) i podrazumevani soket platforme. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Uključuje proveru TLS sertifikata za `tcp://` veze. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Direktorijum koji sadrži ca.pem, cert.pem i key.pem za uzajamni TLS. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Podrazumevana slika za build kontejner. Podrazumevano: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Slika koja se koristi za privremeni kontejner za git kloniranje. Podrazumevano: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Docker mreža kojoj se build kontejner pridružuje. Podrazumevano: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Politika preuzimanja slika: `always`, `if-not-present` (podrazumevano) ili `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Kada je > 0, ograničava CPU build kontejnera (prosleđuje se kao `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Kada nije prazno, ograničava memoriju build kontejnera (npr. `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Koliko često se proverava status kontejnera, u sekundama. Podrazumevano: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Vremensko ograničenje koje se prosleđuje komandi `docker stop`, u sekundama. Podrazumevano: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Pokreće build kontejner sa `--privileged`. Opasno; podrazumevano isključeno. |
| **Runneri (flota na strani servera)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Zastarelost heartbeat-a (u sekundama) nakon koje se runner smatra nedostupnim. Njegovi zadaci u stanju "starting" se dodeljuju drugom runner-u. Podrazumevano: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Zastarelost heartbeat-a (u sekundama) nakon koje se zadaci runner-a u stanju "running" označavaju kao neuspešni. Vrednosti manje od `offline_timeout_sec` se podižu na tu vrednost. Podrazumevano: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Koliko često (u sekundama) se dodeljeni zadaci usaglašavaju sa dostupnošću runnera. Podrazumevano: 30 |
| **Timovi** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Dozvoljava korisnicima da pozivaju članove u timove. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Tip pozivnice: `username` (podrazumevano), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Dozvoljava članovima da napuste timove. |
| **Baza podataka** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Putanja do datoteke SQLite baze podataka.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host MySQL baze podataka.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Naziv MySQL baze podataka (šeme).       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL korisničko ime.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Lozinka MySQL korisnika.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host Postgres baze podataka.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Naziv Postgres baze podataka (šeme).    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres korisničko ime.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Lozinka Postgres korisnika.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Može biti `sqlite` (podrazumevano), `postgres` ili `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | JSON mapa koja sadrži opcije veze sa bazom podataka. |
| **Bezbednost** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Base64 kodirani ključ koji se koristi za šifrovanje pristupnih ključeva sačuvanih u bazi podataka. Više pročitajte u [referenci za šifrovanje baze podataka](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Base64 kodirani ključ koji se koristi za šifrovanje opcija u bazi (ključa za potpisivanje JWT-a) po staroj šemi sa jednim ključem (bez rotacije). Ako nije podešen, koristi se pristupni ključ. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Base64 kodirani HMAC ključ koji se koristi za potpisivanje kolačića. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Base64 kodirani ključ koji se koristi za šifrovanje kolačića. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Može biti korisno ako želite da koristite Semaphore na potputanji, na primer: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Ne dodajte završni `/`. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Uključuje ili isključuje TLS (HTTPS) za bezbednu komunikaciju sa Semaphore serverom. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Putanja do datoteke TLS sertifikata. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Putanja do datoteke TLS ključa. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Adresa (`host[:port]`) za slušalac koji preusmerava HTTP→HTTPS. Međusobno isključiva sa `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Port za preusmeravanje HTTP saobraćaja na HTTPS. Međusobno isključiv sa `tls.http_redirect_addr`. |
| <br />`auth.max_session_life_hours` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <hr /> `SEMAPHORE_AUTH_MAX_SESSION_LIFE_HOURS` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <br /><br /> | Apsolutno trajanje sesije prijave u satima, računato od prijave. Kada se prekorači, korisnik mora ponovo da se prijavi, čak i ako je sesija nedavno bila aktivna. `0` (podrazumevano) znači da nema apsolutnog ograničenja; sesije tada ističu samo nakon 7 dana bez aktivnosti. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Uključuje dvofaktorsku autentifikaciju pomoću TOTP-a. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Oznaka izdavaoca (naziv Semaphore-a) koja se prikazuje u TOTP aplikacijama za autentifikaciju. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Dozvoljava korisnicima da resetuju TOTP pomoću koda za oporavak. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Uključuje višefaktorsku autentifikaciju putem e-pošte. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Dozvoljava prijavu kao eksterni korisnik (samo e-pošta). |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Dozvoljava kreiranje eksternih korisnika pri prvoj prijavi. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | JSON niz dozvoljenih domena e-pošte. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Isključuje MFA putem e-pošte za korisnike autentifikovane preko OIDC-a. |
| **Šifrovanje** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Putanja do zasebne datoteke koja sadrži privesce ključeva za šifrovanje (YAML ili JSON). Prate se izmene — one se primenjuju bez ponovnog pokretanja servera. Kada nije podešeno, koristi se nasleđeno polje `access_key_encryption`. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Koliko često se `keys_file` proverava na izmene (Go duration kao `15s`). `0` isključuje proveru (SIGHUP i dalje prisiljava ponovno učitavanje). Podrazumevano: 15s |
| **Proces** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Korisnik pod kojim će se izvršavati obuhvaćeni procesi (kao što su Ansible, Terraform ili OpenTofu). |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID korisnika pod kojim će se izvršavati obuhvaćeni procesi (kao što su Ansible, Terraform ili OpenTofu). |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID grupe pod kojom će se izvršavati obuhvaćeni procesi (kao što su Ansible, Terraform ili OpenTofu). |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Chroot direktorijum za obuhvaćene procese. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Postavlja fleg `no_new_privs` tako da obuhvaćeni procesi ne mogu da steknu nove privilegije. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Izoluje UID-ove/GID-ove (`CLONE_NEWUSER`) za izvršavanja aplikacija. Samo Linux. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Skriva tačke montiranja hosta kao što je tmpfs sa tajnama (`CLONE_NEWNS`) za izvršavanja aplikacija. Samo Linux. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Skriva procese hosta od izvršavanja aplikacija (`CLONE_NEWPID`). Samo Linux. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Izoluje SysV IPC i POSIX redove poruka (`CLONE_NEWIPC`) za izvršavanja aplikacija. Samo Linux. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Izoluje ime hosta i domen (`CLONE_NEWUTS`) za izvršavanja aplikacija. Samo Linux. |
| **E-pošta** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | E-adresa pošiljaoca. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Ime hosta SMTP servera. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Port SMTP servera. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Uključuje StartTLS za nadogradnju nešifrovane SMTP veze u bezbednu, šifrovanu vezu. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Koristi SSL ili TLS vezu za komunikaciju sa SMTP serverom. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Minimalna verzija TLS-a koja se koristi za vezu. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Korisničko ime za autentifikaciju na SMTP serveru. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Lozinka za autentifikaciju na SMTP serveru. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Fleg koji uključuje obaveštenja putem e-pošte. |
| **Mesindžeri** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Postavite na True da uključite slanje obaveštenja na Telegram. Treba ga koristiti u kombinaciji sa `telegram_chat` i `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Postavite na Chat ID ćaskanja u koje se šalju obaveštenja.  Više pročitajte u [Podešavanju Telegram obaveštenja](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Postavite na autorizacioni token bota koji će primati sadržaj obaveštenja.  Više pročitajte u [Podešavanju Telegram obaveštenja](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Postavite na True da uključite slanje obaveštenja na Slack. Treba ga koristiti u kombinaciji sa `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | Slack webhook URL. Semaphore će ga koristiti da POST metodom šalje JSON obaveštenja u Slack formatu na zadati URL.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Fleg koji uključuje Microsoft Teams obaveštenja. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft Teams webhook URL. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Postavite na True da uključite slanje obaveštenja na Rocket.Chat. Treba ga koristiti u kombinaciji sa `rocketchat_url`. Dostupno od v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | Rocket.Chat webhook URL. Semaphore će ga koristiti da POST metodom šalje JSON obaveštenja u Rocket.Chat formatu na zadati URL. Dostupno od v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Uključuje DingTalk obaveštenja. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | Webhook URL DingTalk mesindžera. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Uključuje Gotify obaveštenja. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL Gotify servera. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Token Gotify servera. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Fleg koji uključuje LDAP autentifikaciju. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Fleg za uključivanje ili isključivanje TLS-a za LDAP veze. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | Distinguished name (DN) koji se koristi za povezivanje (bind) sa LDAP serverom radi autentifikacije. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | Lozinka koja se koristi za povezivanje (bind) sa LDAP serverom radi autentifikacije. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | Ime hosta i port LDAP servera (npr. ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | Osnovni distinguished name (DN) koji se koristi za pretragu korisnika u LDAP direktorijumu (npr. dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | Filter koji se koristi za pretragu korisnika u LDAP direktorijumu (npr. (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | LDAP atribut koji se koristi kao mapiranje distinguished name-a (DN) za autentifikaciju korisnika. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | LDAP atribut koji se koristi kao mapiranje e-adrese za autentifikaciju korisnika. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | LDAP atribut koji se koristi kao mapiranje ID-a korisnika (UID) za autentifikaciju korisnika. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | LDAP atribut koji se koristi kao mapiranje common name-a (CN) za autentifikaciju korisnika. |
| **Logovanje** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Format loga događaja. Može biti `json` ili prazno za tekst. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Uključuje ili isključuje logovanje događaja. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | JSON mapa koja sadrži konfiguraciju logera događaja. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Format loga zadataka. Može biti `json` ili prazno za tekst. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Uključuje ili isključuje logovanje zadataka. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | JSON mapa koja sadrži konfiguraciju logera zadataka. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | JSON mapa koja sadrži konfiguraciju logera rezultata zadataka. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Uključuje ili isključuje upisivanje logova na konfigurisani syslog server. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protokol koji se koristi za povezivanje sa Syslog serverom: `udp` ili `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Ime hosta i port Syslog servera. Primer: `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Oznaka kojom se obeležavaju zapisi Semaphore UI-a na Syslog serveru. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Format Syslog poruka. Može biti `rfc5424` ili prazno za podrazumevani. |
| **Otklanjanje grešaka** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Dodaje kašnjenje API odgovorima (za potrebe otklanjanja grešaka). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Direktorijum za pprof dump datoteke. |
| **Visoka dostupnost (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Uključuje režim visoke dostupnosti (HA). |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Jedinstveni identifikator HA čvora. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Adresa Redis servera koji se koristi za HA. Primer: `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Broj Redis baze podataka. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Lozinka za Redis server. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Korisničko ime za Redis server. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Uključuje TLS za Redis vezu. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Preskače proveru TLS sertifikata za Redis vezu. |

## Često postavljana pitanja {#frequently-asked-questions}

### 1. Kako da podesim javni URL za Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Ako ispred Semaphore-a koristite nginx ili drugi veb server, treba da navedete konfiguracionu opciju `web_host`.

Na primer, konfigurisali ste NGINX na serveru koji prosleđuje upite Semaphore-u.

Adresa servera je `https://example.com` i sve upite ka `https://example.com/semaphore` prosleđujete Semaphore-u.

Vaš `web_host` će biti `https://example.com/semaphore`.
