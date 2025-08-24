# 🔐 Security

## Introduction

Security is a top priority in Semaphore UI. Whether you're automating critical infrastructure tasks or managing team access to sensitive systems, Semaphore UI is designed to provide robust, secure operations out of the box. This section outlines how Semaphore handles security and what you should consider when deploying it in production.

## Authentication & authorization

Semaphore supports secure authentication and flexible authorization mechanisms:

- **Login methods:**
  - **Username/password**<br>Default method using credentials stored in the Semaphore database. Passwords are hashed using a strong algorithm (bcrypt).

  - **LDAP**<br>Allows integration with enterprise directory services. Supports user/group filtering and secure connections via LDAPS.

  - **OpenID Connect (OIDC)**<br>Enables single sign-on with identity providers like Google, Azure AD, or Keycloak. Supports custom claims and group mappings.

- **Two-Factor authentication (2FA)**<br>TOTP-based 2FA is available and recommended for all users. It can be enabled per user and supports optional recovery codes. See configuration options `auth.totp.enabled` and `auth.totp.allow_recovery`.

- **Role-based access control**<br>You can assign different roles to users such as Admin, Maintainer, or Viewer, limiting access based on responsibility.

- **Session management**<br>Sessions are protected with secure HTTP cookies. Session expiration and logout mechanisms ensure minimal exposure.
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

## Secrets & credentials

Managing secrets securely is a core feature:

- **Encrypted key store**<br>Credentials and secret variables are encrypted at rest using AES encryption.

- **Environment isolation**<br>Secrets are only passed to jobs at runtime and are not exposed to the container environment directly.

- **SSH keys and tokens**<br>Users are responsible for uploading valid SSH keys and tokens. These are encrypted and only used when running tasks.
- **HashiCorp Vault integration (Pro)**<br>Secrets can be stored in an external Vault instance. Choose storage per-secret when creating or editing a secret.

## Running untrusted code / playbooks

Semaphore runs user-defined playbooks and commands, which can be risky:

- **Container isolation**<br>Tasks are executed in isolated Docker containers. These containers have no access to the host system.

- **Least privilege**<br>Containers run with minimal permissions and can be restricted further using Docker flags.

- **Chroot execution**<br>Semaphore can execute tasks inside a chroot jail to further isolate the execution environment from the host system.

- **Task process user**<br>Tasks can be executed under a dedicated non-root system user (e.g., `semaphore`) to reduce the impact of potential exploits. This is optional and can be configured based on system policies.
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## Secure Deployment

To ensure Semaphore is securely deployed:

- **Use HTTPS**<br>
    Semaphore supports HTTPS both via its **built-in TLS support** and through a **reverse proxy like Nginx**. It is strongly recommended to enable HTTPS in production.

    To enable built-in HTTPS support add following block to **config.json**:
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

- **Run behind a firewall**<br>Limit access to the Semaphore UI and database to only trusted IPs.

- **Database security**<br>Use strong passwords and restrict database access to Semaphore only.

## Updates & patch management

Security updates are published regularly:

- **Stay updated**<br>Always use the latest stable release.

- **Changelog**<br>Review changes on GitHub before updating.

- **Automatic updates**<br>If using Docker, consider automation pipelines for regular updates.

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

## Reporting Vulnerabilities

Found a vulnerability? Help us keep Semaphore secure:

- **Responsible disclosure**<br>Please email us at `security@semaphoreui.com`.
 
### Vulnerability resolution targets

We aim to resolve reported vulnerabilities within the following target windows:

- Critical: within 30 days
- High: within 60 days
- Medium: within 90 days
- Low: best effort, typically within 180 days

Out-of-cycle patches may be released for actively exploited issues affecting latest stable releases.

### Code security tooling

We use CodeQL, Codacy, Snyk and Renovate to analyze the codebase and dependencies, and to automate dependency updates.
- **No public exploits**<br>Do not share vulnerabilities publicly until patched.

- **Acknowledgments**<br>Security researchers may be acknowledged in release notes if desired.

