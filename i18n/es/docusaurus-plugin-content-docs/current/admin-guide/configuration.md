# Configuración

Semaphore puede configurarse de varias formas:

* [Configurador en línea](https://semaphoreui.com/install) &mdash; interfaz web para generar la configuración en línea.
* [Archivo de configuración](/admin-guide/configuration/config-file) &mdash; la forma principal y más flexible de configurar Semaphore.
* [Variables de entorno](/admin-guide/configuration/env-vars) &mdash; útiles para despliegues en contenedores o nativos de la nube.


## Opciones de configuración {#configuration-options}

Lista completa de las opciones de configuración disponibles:

| Opción del archivo de configuración / Variable de entorno     | Descripción                        |
| ----------------------- | --------------------------------------------------------- |
| **Comunes** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Tipo de cliente de Git. Puede ser `cmd_git` (predeterminado) o `go_git`. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Cuántas veces se intenta un clone o un pull de git antes de que la tarea falle. Usa retroceso exponencial (1 s, luego 2 s, 4 s, … hasta 60 s) entre intentos. Predeterminado: `4`. Establézcalo en `1` para desactivar los reintentos. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Ruta a un archivo de configuración SSH personalizado. Predeterminado: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Puerto TCP en el que estará disponible la interfaz web. Predeterminado: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Dirección de escucha (vacío = todas las interfaces). Útil si su servidor tiene varias interfaces de red. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Ruta al directorio donde se almacenan los repositorios clonados y los archivos generados. Predeterminado: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Ruta al directorio donde se almacenan los secretos (por ejemplo, los archivos de token de Vault). Predeterminado: `/tmp/semaphore`. La opción heredada de nivel superior `secrets_path` se sigue aceptando cuando `dirs.secrets` no está definido o mantiene su valor predeterminado. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Ruta al directorio donde se almacenan los repositorios. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Ruta al directorio donde se almacenan los sockets del agente SSH. Predeterminado: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Controla cómo se establece la variable de entorno HOME para las tareas. Opciones: `template_dir` (predeterminado), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Número máximo de tareas paralelas que pueden ejecutarse en el servidor. Predeterminado: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Duración máxima de una tarea, en segundos. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Número máximo de tareas recientes almacenadas en la base de datos para cada plantilla. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Zona horaria usada para programar tareas y trabajos cron. Predeterminado: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Ajustes de los proveedores de OpenID. Puede indicar varios proveedores de OpenID. Encontrará más información sobre la configuración de OpenID en [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Denegar el inicio de sesión con contraseña. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Permitir que los usuarios que no son administradores creen proyectos. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | Mapa JSON que contiene las variables de entorno expuestas a las ejecuciones de tareas. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | Array JSON con las variables de entorno del anfitrión que se reenviarán a las ejecuciones de tareas. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | Mapa JSON que contiene la configuración de las aplicaciones. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Actívelo para usar un runner remoto. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Token de arranque que usan los runners para registrarse en el servidor. |
| **Suscripción** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Clave o token de suscripción. Cuando se define, desactiva la activación desde la interfaz web. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Ruta al archivo con la clave o el token de suscripción. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL del servidor de suscripción o facturación. Predeterminado: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Cuando está habilitado, Semaphore emite un JWT de corta duración para cada ejecución de tarea y expone su clave pública en `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Valor emitido en la reclamación `iss` de los JWT generados. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Duración predeterminada de un JWT de tarea emitido, como duración de Go (p. ej. `30m`, `1h`). Predeterminado: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Límite superior estricto del TTL del JWT por plantilla, como duración de Go. Predeterminado: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Ruta al archivo que contiene el token de registro del runner. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Token de autenticación del runner. Mutuamente excluyente con `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Ruta al archivo de token para el registro del runner. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Ruta al archivo de clave privada del runner. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | El runner procesa un solo trabajo y termina. Útil para runners dinámicos. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Habilitar el runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | URL del webhook del runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Nombre del runner. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | Array JSON con las etiquetas del runner. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Número máximo de tareas paralelas del runner. Predeterminado: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Cada cuántos segundos consulta el runner al servidor en busca de nuevos trabajos e informa del progreso. Predeterminado: 1. Los valores más altos reducen el volumen de peticiones a costa de recoger los trabajos algo más despacio. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Restringir el runner a un único proyecto. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | Paquete PEM usado para verificar el certificado del servidor de Semaphore, además del almacén de confianza del sistema. Configúrelo cuando el servidor use un certificado autofirmado o de una CA interna. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Desactiva por completo la verificación del certificado del servidor. Inseguro (vulnerable a ataques MITM): úselo solo para pruebas. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | Objeto JSON con la configuración completa del ejecutor del runner (`type` más los ajustes anidados de `docker` o `k8s`). Úselo cuando quiera definir todo el bloque del ejecutor desde una sola variable de entorno. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Estrategia que usa el runner para ejecutar cada tarea: `local` (predeterminado), `k8s` o `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Ruta a un archivo kubeconfig. Vacío = configuración dentro del clúster. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace donde se crean los Pods efímeros de las tareas. Predeterminado: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Imagen de contenedor predeterminada para el contenedor de compilación. Predeterminado: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Imagen usada para el contenedor de inicialización que clona el repositorio git. Predeterminado: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Cuenta de servicio con la que se ejecutan los Pods de las tareas. Predeterminado: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Lista separada por comas de imagePullSecrets asociados a cada Pod. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Cada cuántos segundos consulta el ejecutor el estado de los Pods. Predeterminado: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Periodo de gracia al eliminar Pods, en segundos. Predeterminado: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL del demonio de Docker (`unix://`, `tcp://` o `npipe://`). Vacío = entorno estándar (`DOCKER_HOST`) y socket predeterminado de la plataforma. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Habilitar la verificación del certificado TLS para las conexiones `tcp://`. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Directorio que contiene ca.pem, cert.pem y key.pem para TLS mutuo. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Imagen predeterminada del contenedor de compilación. Predeterminado: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Imagen usada para el contenedor temporal que clona el repositorio git. Predeterminado: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Red de Docker a la que se une el contenedor de compilación. Predeterminado: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Política de descarga de imágenes: `always`, `if-not-present` (predeterminado) o `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Cuando es > 0, limita la CPU del contenedor de compilación (se pasa como `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Cuando no está vacío, limita la memoria del contenedor de compilación (p. ej. `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Cada cuántos segundos se consulta el estado del contenedor. Predeterminado: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Tiempo de espera pasado a `docker stop`, en segundos. Predeterminado: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Ejecutar el contenedor de compilación con `--privileged`. Peligroso; desactivado de forma predeterminada. |
| **Runners (flota en el servidor)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Antigüedad del latido (en segundos) tras la cual se considera que un runner está desconectado. Sus tareas en estado «starting» se reasignan. Predeterminado: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Antigüedad del latido (en segundos) tras la cual las tareas «running» de un runner se marcan como fallidas. Los valores inferiores a `offline_timeout_sec` se ajustan a este. Predeterminado: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Cada cuántos segundos se reconcilian las tareas despachadas con la disponibilidad de los runners. Predeterminado: 30 |
| **Equipos** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Permitir que los usuarios inviten miembros a los equipos. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Tipo de invitación: `username` (predeterminado), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Permitir que los miembros abandonen los equipos. |
| **Base de datos** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Ruta al archivo de base de datos SQLite.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host de la base de datos MySQL.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nombre de la base de datos (esquema) MySQL.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | Nombre de usuario de MySQL.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Contraseña del usuario de MySQL.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Host de la base de datos Postgres.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Nombre de la base de datos (esquema) Postgres.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Nombre de usuario de Postgres.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Contraseña del usuario de Postgres.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Puede ser `sqlite` (predeterminado), `postgres` o `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | Mapa JSON que contiene las opciones de conexión a la base de datos. |
| **Seguridad** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Clave codificada en Base64 usada para cifrar las claves de acceso almacenadas en la base de datos. Encontrará más información en la [referencia de cifrado de la base de datos](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Clave codificada en Base64 usada para cifrar las opciones de la base de datos (la clave de firma de JWT) con el antiguo esquema de clave única (sin rotación). Si no se define, se usa la clave de acceso. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Clave HMAC codificada en Base64 usada para firmar las cookies. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Clave codificada en Base64 usada para cifrar las cookies. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Puede resultar útil si desea usar Semaphore en una subruta, por ejemplo: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). No añada una `/` final. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Habilitar o deshabilitar TLS (HTTPS) para una comunicación segura con el servidor de Semaphore. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Ruta al archivo de certificado TLS. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Ruta al archivo de clave TLS. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Dirección (`host[:port]`) del servicio de redirección de HTTP a HTTPS. Mutuamente excluyente con `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Puerto para redirigir el tráfico HTTP a HTTPS. Mutuamente excluyente con `tls.http_redirect_addr`. |
| <br />`auth.max_session_life_hours` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <hr /> `SEMAPHORE_AUTH_MAX_SESSION_LIFE_HOURS` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <br /><br /> | Duración absoluta de una sesión de inicio de sesión, en horas, contada desde el inicio de sesión. Una vez superada, el usuario debe volver a iniciar sesión, incluso si la sesión ha estado activa recientemente. `0` (predeterminado) significa que no hay límite absoluto; en ese caso, las sesiones solo caducan tras 7 días sin actividad. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Habilitar la autenticación de dos factores mediante TOTP. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Etiqueta del emisor (título de Semaphore) que se muestra en las aplicaciones de autenticación TOTP. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Permitir que los usuarios restablezcan TOTP mediante un código de recuperación. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Habilitar la autenticación multifactor basada en correo electrónico. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Permitir el inicio de sesión como usuario externo (solo con correo electrónico). |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Permitir la creación de usuarios externos en el primer inicio de sesión. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | Array JSON con los dominios de correo electrónico permitidos. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Deshabilitar la MFA por correo electrónico para los usuarios autenticados mediante OIDC. |
| **Cifrado** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Ruta a un archivo independiente que contiene los conjuntos de claves de cifrado (YAML o JSON). Se vigilan sus cambios: las modificaciones se aplican sin reiniciar el servidor. Si no se define, se usa el campo heredado `access_key_encryption`. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Cada cuánto se comprueba si `keys_file` ha cambiado (una duración de Go como `15s`). `0` desactiva la comprobación (un SIGHUP sigue forzando la recarga). Predeterminado: 15s |
| **Proceso** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Usuario con el que se ejecutarán los procesos encapsulados (como Ansible, Terraform u OpenTofu). |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID del usuario con el que se ejecutarán los procesos encapsulados (como Ansible, Terraform u OpenTofu). |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID del grupo con el que se ejecutarán los procesos encapsulados (como Ansible, Terraform u OpenTofu). |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Directorio chroot para los procesos encapsulados. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Establecer la marca `no_new_privs` para que los procesos encapsulados no puedan obtener nuevos privilegios. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Aislar los UID/GID (`CLONE_NEWUSER`) en las ejecuciones de aplicaciones. Solo en Linux. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Ocultar los puntos de montaje del anfitrión, como el tmpfs de secretos (`CLONE_NEWNS`), en las ejecuciones de aplicaciones. Solo en Linux. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Ocultar los procesos del anfitrión a las ejecuciones de aplicaciones (`CLONE_NEWPID`). Solo en Linux. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Aislar la IPC de SysV y las colas de mensajes POSIX (`CLONE_NEWIPC`) en las ejecuciones de aplicaciones. Solo en Linux. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Aislar el nombre de host y el dominio (`CLONE_NEWUTS`) en las ejecuciones de aplicaciones. Solo en Linux. |
| **Correo electrónico** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | Dirección de correo electrónico del remitente. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Nombre de host del servidor SMTP. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Puerto del servidor SMTP. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Habilitar StartTLS para convertir una conexión SMTP sin cifrar en una conexión segura y cifrada. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Usar una conexión SSL o TLS para comunicarse con el servidor SMTP. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Versión mínima de TLS que se usará en la conexión. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Nombre de usuario para la autenticación en el servidor SMTP. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Contraseña para la autenticación en el servidor SMTP. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Marca que habilita las alertas por correo electrónico. |
| **Mensajería** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Establézcalo en True para habilitar el envío de alertas a Telegram. Debe usarse junto con `telegram_chat` y `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Establézcalo con el ID del chat al que se enviarán las alertas.  Encontrará más información en [Configuración de notificaciones de Telegram](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Establézcalo con el token de autorización del bot que recibirá el contenido de la alerta.  Encontrará más información en [Configuración de notificaciones de Telegram](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Establézcalo en True para habilitar el envío de alertas a Slack. Debe usarse junto con `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | La URL del webhook de Slack. Semaphore la usará para enviar por POST alertas en formato JSON de Slack a la URL indicada.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Marca que habilita las alertas de Microsoft Teams. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | URL del webhook de Microsoft Teams. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Establézcalo en True para habilitar el envío de alertas a Rocket.Chat. Debe usarse junto con `rocketchat_url`. Disponible desde la v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | La URL del webhook de Rocket.Chat. Semaphore la usará para enviar por POST alertas en formato JSON de Rocket.Chat a la URL indicada. Disponible desde la v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Habilitar las alertas de DingTalk. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | URL del webhook de la mensajería DingTalk. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Habilitar las alertas de Gotify. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL del servidor de Gotify. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Token del servidor de Gotify. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Marca que habilita la autenticación LDAP. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Marca para habilitar o deshabilitar TLS en las conexiones LDAP. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | El nombre distinguido (DN) usado para conectarse al servidor LDAP con fines de autenticación. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | La contraseña usada para conectarse al servidor LDAP con fines de autenticación. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | El nombre de host y el puerto del servidor LDAP (p. ej., ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | El nombre distinguido (DN) base usado para buscar usuarios en el directorio LDAP (p. ej., dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | El filtro usado para buscar usuarios en el directorio LDAP (p. ej., (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | Atributo LDAP que se usará como asignación del nombre distinguido (DN) para la autenticación de usuarios. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | Atributo LDAP que se usará como asignación de la dirección de correo electrónico para la autenticación de usuarios. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | Atributo LDAP que se usará como asignación del ID de usuario (UID) para la autenticación de usuarios. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | Atributo LDAP que se usará como asignación del nombre común (CN) para la autenticación de usuarios. |
| **Registro** ||
| <br />`log.events.format`      <Pro /> <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Formato del registro de eventos. Puede ser `json` o vacío para texto. |
| <br />`log.events.enabled`     <Pro /> <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Habilitar o deshabilitar el registro de eventos. |
| <br />`log.events.logger`      <Pro /> <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | Mapa JSON que contiene la configuración del registrador de eventos. |
| <br />`log.tasks.format`       <Pro /> <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Formato del registro de tareas. Puede ser `json` o vacío para texto. |
| <br />`log.tasks.enabled`      <Pro /> <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Habilitar o deshabilitar el registro de tareas. |
| <br />`log.tasks.logger`       <Pro /> <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | Mapa JSON que contiene la configuración del registrador de tareas. |
| <br />`log.tasks.result_logger`  <Pro /> <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | Mapa JSON que contiene la configuración del registrador de resultados de tareas. |
| <br />`syslog.enabled` <Pro /> <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Habilitar o deshabilitar la escritura de registros en el servidor syslog configurado. |
| <br />`syslog.network` <Pro /> <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protocolo usado para conectarse al servidor Syslog: `udp` o `tcp`. |
| <br />`syslog.address` <Pro /> <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Nombre de host y puerto del servidor Syslog. Ejemplo: `localhost:514`. |
| <br />`syslog.tag` <Pro /> <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | La etiqueta usada para marcar los registros de Semaphore UI en el servidor Syslog. |
| <br />`syslog.format` <Pro /> <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Formato de los mensajes de Syslog. Puede ser `rfc5424` o vacío para el valor predeterminado. |
| **Depuración** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Añadir retardo a las respuestas de la API (con fines de depuración). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Directorio para los archivos de volcado de pprof. |
| **Alta disponibilidad (HA)** ||
| <br />`ha.enabled` <Enterprise /> <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Habilitar el modo de alta disponibilidad (HA). |
| <br />`ha.node_id` <Enterprise /><hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Identificador único del nodo de HA. |
| <br />`ha.redis.addr` <Enterprise /> <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Dirección del servidor Redis usado para HA. Ejemplo: `localhost:6379`. |
| <br />`ha.redis.db` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Número de la base de datos de Redis. |
| <br />`ha.redis.pass` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Contraseña del servidor Redis. |
| <br />`ha.redis.user` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Nombre de usuario del servidor Redis. |
| <br />`ha.redis.tls` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Habilitar TLS para la conexión con Redis. |
| <br />`ha.redis.tls_skip_verify` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Omitir la verificación del certificado TLS en la conexión con Redis. |

## Preguntas frecuentes {#frequently-asked-questions}

### 1. Cómo configurar una URL pública para Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Si usa nginx u otro servidor web delante de Semaphore, debe indicar la opción de configuración `web_host`.

Por ejemplo, suponga que ha configurado NGINX en el servidor para que redirija las consultas a Semaphore.

La dirección del servidor es `https://example.com` y redirige todas las consultas de `https://example.com/semaphore` a Semaphore.

Su `web_host` será `https://example.com/semaphore`.
