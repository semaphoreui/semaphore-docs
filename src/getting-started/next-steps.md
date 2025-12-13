# Next Steps

Turn a successful smoke test into a durable deployment. This checklist helps you transition from a local install to a shared production instance.

## Harden and scale

1. **Secure transport** – Place Semaphore behind a reverse proxy (NGINX, Apache, Traefik) with TLS. Use our [reverse proxy guides](../administration-guide/security/nginx.md) and [Apache instructions](../administration-guide/security/apache.md).
2. **External database** – Move from the embedded BoltDB to PostgreSQL or MySQL for reliability and backups. Follow the [database configuration guide](../administration-guide/configuration/config-file.md#database-settings).
3. **High availability** – Register additional [runners](../administration-guide/runners.md) to isolate workloads and provide redundancy. Label runners for production vs. staging tasks.

## Configure authentication and authorization

1. Integrate with your identity provider using [OpenID Connect](../administration-guide/openid.md) or [LDAP](../administration-guide/ldap.md).
2. Map groups/claims to Semaphore roles so new users inherit the correct access automatically.
3. Define project-level roles (viewer, operator, admin) and limit who can create templates vs. run tasks.

## Establish automation practices

1. **Version control** – Store playbooks and infrastructure code in Git. Branch protection keeps production templates stable.
2. **Code reviews** – Use pull requests and testing (lint, syntax) before updating templates. Consider running validation tasks via the [CLI](../administration-guide/cli.md) or CI pipelines.
3. **Secrets management** – Rotate keys in the [Key Store](../user-guide/key-store.md), use environment variables for non-secret configuration, and document ownership.

## Operationalize monitoring and alerts

1. Set up [notifications](../administration-guide/notifications.md) for critical projects (Slack, Teams, email, etc.).
2. Export logs to your observability stack or enable structured logging via configuration flags.
3. Define on-call or escalation procedures backed by Semaphore task history.

## Document and train

1. Capture the workflow for creating new projects or templates. Link your runbooks directly to relevant sections in the [User Guide](../user-guide/README.md).
2. Share the [UI Tour](./ui-tour.md) with operators so they build confidence quickly.
3. Encourage teams to contribute to this documentation. mdBook makes it easy to submit pull requests with updates.

---

Need help? Join the [Discord community](https://discord.gg/5R6k7hNGcH) or open an issue on [GitHub](https://github.com/semaphoreui/semaphore) to discuss best practices with the maintainers and community.
