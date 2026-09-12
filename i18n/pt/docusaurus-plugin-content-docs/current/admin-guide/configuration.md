# Configuração

O Semaphore pode ser configurado de várias maneiras:

* [Configurador online](https://semaphoreui.com/install) &mdash; interface web para gerar a configuração online.
* [Arquivo de configuração](/admin-guide/configuration/config-file) &mdash; a forma principal e mais flexível de configurar o Semaphore.
* [Variáveis de ambiente](/admin-guide/configuration/env-vars) &mdash; úteis para implantações em contêineres ou cloud-native.


## Opções de configuração {#configuration-options}

Lista completa das opções de configuração disponíveis:

| Opção do arquivo de configuração / Variável de ambiente     | Descrição                        |
| ----------------------- | --------------------------------------------------------- |
| **Comuns** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Tipo de cliente Git. Pode ser `cmd_git` (padrão) ou `go_git`. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Quantas vezes um git clone ou pull é tentado antes de a tarefa falhar. Usa backoff exponencial (1s, depois 2s, 4s, … até 60s) entre as tentativas. Padrão: `4`. Defina como `1` para desativar as novas tentativas. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Caminho para um arquivo de configuração SSH personalizado. Padrão: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Porta TCP na qual a interface web ficará disponível. Padrão: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Endereço de bind (vazio = todas as interfaces). Útil se o seu servidor tiver várias interfaces de rede. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Caminho para o diretório onde os repositórios clonados e os arquivos gerados são armazenados. Padrão: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Caminho para o diretório onde os segredos são armazenados (por exemplo, arquivos de token do Vault). Padrão: `/tmp/semaphore`. A opção legada de nível superior `secrets_path` ainda é aceita quando `dirs.secrets` não está definida ou mantém o valor padrão. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Caminho para o diretório onde os repositórios são armazenados. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Caminho para o diretório onde os sockets do agente SSH são armazenados. Padrão: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Controla como a variável de ambiente HOME é definida para as tarefas. Opções: `template_dir` (padrão), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Número máximo de tarefas paralelas que podem ser executadas no servidor. Padrão: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Duração máxima de uma tarefa em segundos. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Número máximo de tarefas recentes armazenadas no banco de dados para cada template. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Fuso horário usado para agendar tarefas e jobs cron. Padrão: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Configurações do provedor OpenID. Você pode informar vários provedores OpenID. Leia mais sobre a configuração do OpenID em [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Bloqueia o login por senha. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Permite que usuários não administradores criem projetos. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | Mapa JSON que contém as variáveis de ambiente expostas às execuções de tarefas. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | Array JSON de variáveis de ambiente do host que serão repassadas às execuções de tarefas. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | Mapa JSON que contém a configuração dos aplicativos. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Ative para usar um runner remoto. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Token de bootstrap usado pelos runners para se registrar no servidor. |
| **Assinatura** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Chave ou token da assinatura. Quando definida, desativa a ativação pela interface web. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Caminho para o arquivo com a chave ou o token da assinatura. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL do servidor de assinatura / cobrança. Padrão: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Quando ativado, o Semaphore emite um JWT de curta duração para cada execução de tarefa e expõe sua chave pública em `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Valor emitido na claim `iss` dos JWTs gerados. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Tempo de vida padrão de um JWT de tarefa emitido, como uma duração do Go (por exemplo, `30m`, `1h`). Padrão: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Limite máximo absoluto para o TTL do JWT por template, como uma duração do Go. Padrão: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Caminho para o arquivo que contém o token de registro do runner. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Token de autenticação do runner. Mutuamente exclusivo com `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Caminho para o arquivo de token para o registro do runner. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Caminho para o arquivo de chave privada do runner. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | O runner processa um único job e encerra. Útil para runners dinâmicos. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Ativa o runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | URL do webhook do runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Nome do runner. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | Array JSON de tags do runner. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Número máximo de tarefas paralelas para o runner. Padrão: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Com que frequência o runner consulta o servidor em busca de novos jobs e reporta o progresso, em segundos. Padrão: 1. Valores maiores reduzem o volume de requisições ao custo de uma captura de jobs um pouco mais lenta. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Restringe o runner a um único projeto. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | Bundle PEM usado para verificar o certificado do servidor Semaphore, além do repositório de confiança do sistema. Defina quando o servidor usar um certificado autoassinado ou de uma CA interna. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Desativa completamente a verificação do certificado do servidor. Inseguro (vulnerável a MITM) — use apenas para testes. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | Objeto JSON com a configuração completa do executor do runner (`type` mais as configurações aninhadas de `docker` ou `k8s`). Use quando quiser definir todo o bloco do executor a partir de uma única variável de ambiente. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Estratégia que o runner usa para executar cada tarefa: `local` (padrão), `k8s` ou `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Caminho para um arquivo kubeconfig. Vazio = configuração in-cluster. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace onde os Pods efêmeros das tarefas são criados. Padrão: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Imagem de contêiner padrão para o contêiner de build. Padrão: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Imagem usada para o init container de git-clone. Padrão: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Service account com a qual os Pods das tarefas são executados. Padrão: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Lista separada por vírgulas de imagePullSecrets anexados a cada Pod. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Com que frequência o executor consulta o status do Pod, em segundos. Padrão: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Período de carência ao excluir Pods, em segundos. Padrão: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL do daemon do Docker (`unix://`, `tcp://` ou `npipe://`). Vazio = ambiente padrão (`DOCKER_HOST`) e socket padrão da plataforma. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Ativa a verificação do certificado TLS para conexões `tcp://`. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Diretório que contém ca.pem, cert.pem e key.pem para TLS mútuo. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Imagem padrão para o contêiner de build. Padrão: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Imagem usada para o contêiner transitório de git-clone. Padrão: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Rede Docker à qual o contêiner de build se conecta. Padrão: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Política de pull de imagens: `always`, `if-not-present` (padrão) ou `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Quando > 0, limita a CPU do contêiner de build (passado como `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Quando não vazio, limita a memória do contêiner de build (por exemplo, `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Com que frequência o status do contêiner é consultado, em segundos. Padrão: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Tempo limite passado ao `docker stop`, em segundos. Padrão: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Executa o contêiner de build com `--privileged`. Perigoso; desativado por padrão. |
| **Runners (frota no lado do servidor)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Tempo (em segundos) sem heartbeat após o qual um runner é considerado offline. Suas tarefas em estado "starting" são reatribuídas. Padrão: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Tempo (em segundos) sem heartbeat após o qual as tarefas em estado "running" de um runner são marcadas como falhas. Valores abaixo de `offline_timeout_sec` são ajustados para esse valor. Padrão: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Com que frequência (em segundos) as tarefas despachadas são reconciliadas com a disponibilidade dos runners. Padrão: 30 |
| **Equipes** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Permite que usuários convidem membros para as equipes. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Tipo de convite: `username` (padrão), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Permite que membros saiam das equipes. |
| **Banco de dados** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Caminho para o arquivo do banco de dados SQLite.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host do banco de dados MySQL.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nome do banco de dados (schema) MySQL.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | Nome do usuário MySQL.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Senha do usuário MySQL.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host do banco de dados Postgres.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nome do banco de dados (schema) Postgres.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Nome do usuário Postgres.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Senha do usuário Postgres.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Pode ser `sqlite` (padrão), `postgres` ou `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | Mapa JSON que contém as opções de conexão com o banco de dados. |
| **Segurança** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Chave codificada em Base64 usada para criptografar as chaves de acesso armazenadas no banco de dados. Leia mais em [Referência de criptografia do banco de dados](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Chave codificada em Base64 usada para criptografar as opções do banco de dados (a chave de assinatura do JWT) com o esquema antigo de chave única (sem rotação). Recorre à chave de acesso quando não definida. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Chave HMAC codificada em Base64 usada para assinar cookies. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Chave codificada em Base64 usada para criptografar cookies. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Pode ser útil se você quiser usar o Semaphore em um subcaminho, por exemplo: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Não adicione `/` ao final. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Ativa ou desativa o TLS (HTTPS) para comunicação segura com o servidor Semaphore. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Caminho para o arquivo do certificado TLS. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Caminho para o arquivo da chave TLS. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Endereço (`host[:port]`) do listener de redirecionamento HTTP→HTTPS. Mutuamente exclusivo com `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Porta para redirecionar o tráfego HTTP para HTTPS. Mutuamente exclusivo com `tls.http_redirect_addr`. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Ativa a autenticação de dois fatores usando TOTP. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Rótulo do emissor (título do Semaphore) exibido nos aplicativos autenticadores TOTP. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Permite que os usuários redefinam o TOTP usando um código de recuperação. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Ativa a autenticação multifator baseada em e-mail. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Permite o login como usuário externo (somente e-mail). |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Permite criar usuários externos no primeiro login. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | Array JSON de domínios de e-mail permitidos. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Desativa o MFA por e-mail para usuários autenticados via OIDC. |
| **Criptografia** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Caminho para um arquivo separado que contém os keyrings de criptografia (YAML ou JSON). Monitorado quanto a alterações — as edições são aplicadas sem reiniciar o servidor. Quando não definido, o campo legado `access_key_encryption` é usado. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Com que frequência o `keys_file` é verificado quanto a alterações (uma duração do Go, como `15s`). `0` desativa a verificação (um SIGHUP ainda força a recarga). Padrão: 15s |
| **Processo** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Usuário com o qual os processos encapsulados (como Ansible, Terraform ou OpenTofu) serão executados. |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID do usuário com o qual os processos encapsulados (como Ansible, Terraform ou OpenTofu) serão executados. |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID do grupo com o qual os processos encapsulados (como Ansible, Terraform ou OpenTofu) serão executados. |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Diretório chroot para os processos encapsulados. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Define a flag `no_new_privs` para que os processos encapsulados não possam obter novos privilégios. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Isola UIDs/GIDs (`CLONE_NEWUSER`) para as execuções de aplicativos. Somente Linux. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Oculta pontos de montagem do host, como tmpfs de segredos (`CLONE_NEWNS`), para as execuções de aplicativos. Somente Linux. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Oculta os processos do host das execuções de aplicativos (`CLONE_NEWPID`). Somente Linux. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Isola o IPC SysV e as filas de mensagens POSIX (`CLONE_NEWIPC`) para as execuções de aplicativos. Somente Linux. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Isola o hostname e o domínio (`CLONE_NEWUTS`) para as execuções de aplicativos. Somente Linux. |
| **E-mail** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | Endereço de e-mail do remetente. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Hostname do servidor SMTP. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Porta do servidor SMTP. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Ativa o StartTLS para promover uma conexão SMTP não criptografada a uma conexão segura e criptografada. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Usa conexão SSL ou TLS para a comunicação com o servidor SMTP. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Versão mínima do TLS a ser usada na conexão. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Nome de usuário para autenticação no servidor SMTP. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Senha para autenticação no servidor SMTP. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Flag que ativa os alertas por e-mail. |
| **Mensageiros** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Defina como True para ativar o envio de alertas ao Telegram. Deve ser usado em combinação com `telegram_chat` e `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Defina como o Chat ID do chat para o qual os alertas serão enviados.  Leia mais em [Configuração de notificações do Telegram](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Defina como o token de autorização do bot que receberá o payload do alerta.  Leia mais em [Configuração de notificações do Telegram](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Defina como True para ativar o envio de alertas ao Slack. Deve ser usado em combinação com `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | A URL do webhook do Slack. O Semaphore a usará para enviar via POST alertas em JSON no formato do Slack para a URL informada.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Flag que ativa os alertas do Microsoft Teams. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | URL do webhook do Microsoft Teams. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Defina como True para ativar o envio de alertas ao Rocket.Chat. Deve ser usado em combinação com `rocketchat_url`. Disponível desde a v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | A URL do webhook do Rocket.Chat. O Semaphore a usará para enviar via POST alertas em JSON no formato do Rocket.Chat para a URL informada. Disponível desde a v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Ativa os alertas do Dingtalk. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | URL do webhook do mensageiro Dingtalk. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Ativa os alertas do Gotify. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL do servidor Gotify. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Token do servidor Gotify. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Flag que ativa a autenticação LDAP. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Flag para ativar ou desativar o TLS nas conexões LDAP. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | O nome distinto (DN) usado para fazer bind no servidor LDAP para autenticação. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | A senha usada para fazer bind no servidor LDAP para autenticação. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | O hostname e a porta do servidor LDAP (por exemplo, ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | O nome distinto (DN) base usado para pesquisar usuários no diretório LDAP (por exemplo, dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | O filtro usado para pesquisar usuários no diretório LDAP (por exemplo, (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | Atributo LDAP a ser usado como mapeamento do nome distinto (DN) para a autenticação de usuários. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | Atributo LDAP a ser usado como mapeamento do endereço de e-mail para a autenticação de usuários. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | Atributo LDAP a ser usado como mapeamento do ID do usuário (UID) para a autenticação de usuários. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | Atributo LDAP a ser usado como mapeamento do nome comum (CN) para a autenticação de usuários. |
| **Logs** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Formato do log de eventos. Pode ser `json` ou vazio para texto. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Ativa ou desativa o log de eventos. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | Mapa JSON que contém a configuração do logger de eventos. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Formato do log de tarefas. Pode ser `json` ou vazio para texto. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Ativa ou desativa o log de tarefas. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | Mapa JSON que contém a configuração do logger de tarefas. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | Mapa JSON que contém a configuração do logger de resultados de tarefas. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Ativa ou desativa a gravação de logs no servidor syslog configurado. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protocolo usado para conectar ao servidor Syslog: `udp` ou `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Hostname e porta do servidor Syslog. Exemplo: `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | A tag usada para marcar os registros do Semaphore UI no servidor Syslog. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Formato das mensagens Syslog. Pode ser `rfc5424` ou vazio para o padrão. |
| **Depuração** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Adiciona um atraso às respostas da API (para fins de depuração). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Diretório para os arquivos de dump do pprof. |
| **Alta disponibilidade (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Ativa o modo de alta disponibilidade (HA). |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Identificador único do nó HA. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Endereço do servidor Redis usado para HA. Exemplo: `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Número do banco de dados Redis. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Senha do servidor Redis. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Nome de usuário do servidor Redis. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Ativa o TLS para a conexão com o Redis. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Ignora a verificação do certificado TLS na conexão com o Redis. |

## Perguntas frequentes {#frequently-asked-questions}

### 1. Como configurar uma URL pública para o Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Se você usa o nginx ou outro servidor web na frente do Semaphore, deve informar a opção de configuração `web_host`.

Por exemplo, você configurou o NGINX no servidor que encaminha as requisições para o Semaphore.

O endereço do servidor é `https://example.com` e você encaminha todas as requisições de `https://example.com/semaphore` para o Semaphore.

Seu `web_host` será `https://example.com/semaphore`.
