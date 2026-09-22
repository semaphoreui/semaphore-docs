---
title: Environment variables
description: Overriding configuration with SEMAPHORE_* variables, passing or forwarding environment to app processes, and runner executor JSON.
---

# Environment variables

With using environment variables you can override any available configuration option.

You can use interactive evnvironment variables generator (for Docker):
* for [server](https://semaphoreui.com/install/docker/2_12/)
* for [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Application environment for apps (Ansible, Terraform, etc.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore can pass environment variables to application processes (Ansible, Terraform/OpenTofu, Python, PowerShell, etc.). There are two related options:

- `env_vars` / `SEMAPHORE_ENV_VARS`: static key-value pairs that will be set for app processes.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: a list of variable names the server will forward from its own process environment.

Example configuration file:

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

Equivalent with environment variables:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Notes:
- Forwarding is explicit: only variables listed in `forwarded_env_vars` are inherited by app processes.
- Secrets should be provided securely (for example via Docker/Kubernetes secrets) and then forwarded using `forwarded_env_vars`.
- The same list is used for the `git` processes that clone and update repositories, so anything `git` needs from the host environment has to be forwarded too.

---

## Running behind a corporate proxy {#running-behind-a-corporate-proxy}

Semaphore does not pass its own environment on to the processes it starts. Apart
from `PATH`, a variable reaches a task or a `git` clone only if it is listed in
`forwarded_env_vars` or set in `env_vars`.

This matters most for a package (systemd) installation. Proxy variables set in
the unit file apply to the Semaphore server itself, but not to `git`:

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

With the configuration above and nothing else, cloning a repository fails with:

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` never saw `NO_PROXY`, so it sent the request for the internal host through
the external proxy, which rejected it. Forward the three variables explicitly to
fix it:

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

Or, as an environment variable:

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Notes:
- Forward `NO_PROXY` alongside the proxy variables. Without it, traffic to
  internal Git servers is routed through the proxy as well.
- Many tools read the lowercase spellings (`http_proxy`, `https_proxy`,
  `no_proxy`). On Linux and macOS variable names are case sensitive, so list
  both spellings if your environment sets them in lowercase.
- Custom CA bundles work the same way. If your proxy terminates TLS, forward
  `GIT_SSL_CAINFO`, `SSL_CERT_FILE` or `REQUESTS_CA_BUNDLE` as needed rather
  than disabling certificate verification.
- Docker installations usually appear to "just work" here because the proxy
  variables are set for the whole container. Forwarding them explicitly is still
  recommended, so the same configuration behaves identically on both.

---

## Runner executor configuration {#runner-executor-configuration}

For runner deployments, the entire executor block can be set as a single JSON environment variable instead of individual keys:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

This is equivalent to setting `runner.executor.type` and nested `runner.executor.docker.*` fields in the configuration file. See [Configuration options](/admin-guide/configuration) for all runner executor settings.

---

## Secret environment variables in Variable Groups {#secret-environment-variables-in-variable-groups}

In addition to global environment variables, you can define per-project secrets in Variable Groups. Secret keys are masked in the UI and logs. See `User Guide → Variable Groups` for usage and Terraform integration with `TF_VAR_*` variables.
