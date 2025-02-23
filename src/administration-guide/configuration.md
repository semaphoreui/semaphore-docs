# Configuration

There are following ways to configure Semaphore:

* [Configuration file](./configuration/config-file.md)
* [Envrioment variables](./configuration/env-vars.md)
* [Interactive setup](./configuration/snap.md)
* [Snap configuration (deprecated)](./configuration/snap.md)


## Configuration options

Full list of available configuration options:

| Config file option / Environment variable     | Description                        |
| ----------------------- | --------------------------------------------------------- |
| <br>`bolt.host` <hr> `SEMAPHORE_DB_HOST`<br><br> | Path to the BoltDB database file.   |
| <br>`mysql.host` <hr> `SEMAPHORE_DB_HOST`<br><br> | MySQL database host.                |
| <br>`mysql.name` <hr> `SEMAPHORE_DB_NAME`<br><br> | MySQL database (schema) name.       |
| <br>`mysql.user` <hr>`SEMAPHORE_DB_USER`<br><br> | MySQL user name.                    |
| <br>`mysql.pass` <hr> `SEMAPHORE_DB_PASS`<br><br> | MySQL user's password.              |
| <br>`postgres.host` <hr> `SEMAPHORE_DB_HOST`<br><br> | Postgres database host.             |
| <br>`postgres.name` <hr> `SEMAPHORE_DB_NAME`<br><br> | Postgres database (schema) name.    |
| <br>`postgres.user` <hr> `SEMAPHORE_DB_USER`<br><br> | Postgres user name.                 |
| <br>`postgres.pass` <hr> `SEMAPHORE_DB_PASS`<br><br> | Postgres user's password.           |
| <br>`dialect`       <hr> `SEMAPHORE_DB_DIALECT`<br><br> | Can be `mysql`, `postgres `or `bolt`   |
| <br>`git_client`      <hr> `SEMAPHORE_GIT_CLIENT`<br><br> |  |
| <br>`ssh_config_path` <hr> `SEMAPHORE_SSH_PATH`<br><br> |  |
| <br>`port`           <hr> `SEMAPHORE_PORT`<br><br> | TCP port on which the web interface will be available. Default: 3000 |
| <br>`interface`      <hr> `SEMAPHORE_INTERFACE`<br><br> | Useful if your server has multiple network interfaces      |
| <br>`tmp_path`       <hr> `SEMAPHORE_TMP_PATH`<br><br> | Path to directory where cloned repositories and generated files are stored. Default: /tmp/semaphore |
| <br>`access_key_encryption` <hr> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br><br> | Secret key used for encrypting access keys in database. Read more in [Database encryption reference](./security.md#database-encryption). |
| <br>`web_host`       <hr> `SEMAPHORE_WEB_ROOT`<br><br> | Can be useful if you want to use Semaphore by the subpath, for example: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Do not add a trailing `/`. |
| <br>`tls.enabled`    <hr> `SEMAPHORE_TLS_ENABLED`<br><br> |  |
| <br>`tls.cert_file`  <hr> `SEMAPHORE_TLS_CERT_FILE`<br><br> |  |
| <br>`tls.key_file`   <hr> `SEMAPHORE_TLS_KEY_FILE`<br><br> |  |
| <br>`email_sender`   <hr> `SEMAPHORE_EMAIL_SENDER`<br><br> |   |
| <br>`email_host`     <hr> `SEMAPHORE_EMAIL_HOST`<br><br> |   |
| <br>`email_port`     <hr> `SEMAPHORE_EMAIL_PORT`<br><br> |   |
| <br>`email_secure`   <hr> `SEMAPHORE_EMAIL_SECURE`<br><br> |   |
| <br>`email_username` <hr> `SEMAPHORE_EMAIL_USERNAME`<br><br> |   |
| <br>`email_password` <hr> `SEMAPHORE_EMAIL_PASSWORD`<br><br> |   |
| <br>`email_alert`    <hr> `SEMAPHORE_EMAIL_ALERT`<br><br> |   |
| <br>`telegram_alert` <hr> `SEMAPHORE_TELEGRAM_ALERT`<br><br> |   |
| <br>`telegram_chat`  <hr> `SEMAPHORE_TELEGRAM_CHAT`<br><br> |   |
| <br>`telegram_token` <hr> `SEMAPHORE_TELEGRAM_TOKEN`<br><br> |   |
| <br>`slack_alert`    <hr> `SEMAPHORE_SLACK_ALERT`<br><br> | Set to True to enable pushing alerts to slack. It should be used in combination with `slack_url`                          |
| <br>`slack_url`      <hr> `SEMAPHORE_SLACK_URL`<br><br> | The slack webhook url. Semaphore will used it to POST Slack formatted json alerts to the provided url.    |
| <br>`microsoft_teams_alert` <hr> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br><br> | Set to True to enable pushing alerts to teams. It should be used in combination with `microsoft_teams_url`.              |
| <br>`microsoft_teams_url`   <hr> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br><br> | The teams webhook url. Semaphore will used it to POST alerts.                           |
| <br>`rocketchat_alert`      <hr> `SEMAPHORE_ROCKETCHAT_ALERT` <br><br> | Set to True to enable pushing alerts to Rocket.Chat. It should be used in combination with `rocketchat_url`. Available since v2.9.56.  |
| <br>`rocketchat_url`        <hr> `SEMAPHORE_ROCKETCHAT_URL` <br><br> | The rocketchat webhook url. Semaphore will used it to POST Rocket.Chat formatted json alerts to the provided url. Available since v2.9.56. |
| <br>`ldap_enable`           <hr> `SEMAPHORE_LDAP_ENABLE` <br><br> |   |
| <br>`ldap_needtls`          <hr> `SEMAPHORE_LDAP_NEEDTLS` <br><br> |   |
| <br>`ldap_binddn`           <hr> `SEMAPHORE_LDAP_BIND_DN` <br><br> |   |
| <br>`ldap_bindpassword`     <hr> `SEMAPHORE_LDAP_BIND_PASSWORD` <br><br> |   |
| <br>`ldap_server`           <hr> `SEMAPHORE_LDAP_SERVER` <br><br> |   |
| <br>`ldap_searchdn`         <hr> `SEMAPHORE_LDAP_SEARCH_DN` <br><br> |   |
| <br>`ldap_searchfilter`     <hr> `SEMAPHORE_LDAP_SEARCH_FILTER` <br><br> |   |
| <br>`max_parallel_tasks`    <hr> `SEMAPHORE_MAX_PARALLEL_TASKS` <br><br> | Max allowed parallel tasks for whole Semaphore instance.                     |
| <br>`max_task_duration_sec` <hr> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br><br> | Max allowed parallel tasks for whole Semaphore instance.                     |
| <br>`max_tasks_per_template`<hr> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br><br> | Max allowed parallel tasks for whole Semaphore instance.                     |
| <br>`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red)    | OpenID provider settings. You can provide multiple OpenID providers. More about OpenID configuration read in [OpenID](./openid.md). <br><br> |
| <br>`password_login_disable` <hr> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br><br> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br><br> | Disable login with using password. Only LDAP and OpenID. |
| <br>`non_admin_can_create_project`      <hr> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br><br> |   |
| <br>`env_vars`               <hr> `SEMAPHORE_ENV_VARS` <br><br> |   |
| <br>`forwarded_env_vars`     <hr> `SEMAPHORE_FORWARDED_ENV_VARS` <br><br> |   |
| <br>`apps`                   <hr> `SEMAPHORE_APPS` <br><br> |   |
| <br>`use_remote_runner`      <hr> `SEMAPHORE_USE_REMOTE_RUNNER` <br><br> |   |
| <br>`use_remote_runner`      <hr> `SEMAPHORE_USE_REMOTE_RUNNER` <br><br> |   |
| <br>`runner_registration_token` <hr> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br><br> |   |

## Public URL

If you use nginx or other web server before Semaphore, you should provide configuration option `web_host`.

For example you configured NGINX on the server which proxies queries to Semaphore.

Server address `https://exmaple.com` and you proxies all queries `https://exmaple.com/semaphore` to Semaphore.

Your `web_host` will be `https://exmaple.com/semaphore`.


