# Environment variables

With using environment variables you can override any available configuration option.

You can use interactive evnvironment variables generator (for Docker):
* for [server](https://semaphoreui.com/install/docker/2_12/)
* for [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Application environment for apps (Ansible, Terraform, etc.)

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

---

## Secret environment variables in Variable Groups

In addition to global environment variables, you can define per-project secrets in Variable Groups. Secret keys are masked in the UI and logs. See `User Guide → Variable Groups` for usage and Terraform integration with `TF_VAR_*` variables.
