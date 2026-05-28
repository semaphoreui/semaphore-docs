# Task JWTs

When [JWT issuance is enabled on the server](/admin-guide/security/jwt),
a template can mint a short-lived, signed token for every task it spawns.
The token is exposed to the running playbook or script as the
`SEMAPHORE_JWT` environment variable and can be exchanged for credentials
with any system that supports JWT authentication –
such as OpenBao or HashiCorp Vault.

The advantage over a long-lived secret stored in the
[key store](/user-guide/key-store) is that every task gets a **fresh token
that identifies the exact task run** (project, template, user id) and
expires shortly after the task finishes.

## Enabling JWTs on a template

In the template form, scroll to the **JWT** section (it only appears when the
administrator has [enabled JWT issuance](/admin-guide/security/jwt)) and
tick **JWT enabled**.

You can configure the following options per template:

| Field | Description |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | One or more strings emitted in the `aud` claim. Set this to the identifier(s) your downstream system expects (for example the OpenBao server URL). Up to 32 entries are supported. |
| TTL | Token lifetime as a duration (`30s`, `10m`, `1h`, ...). When left empty, the global `jwt.default_ttl` is used. The TTL must not exceed the global `jwt.max_ttl`. |

## Token claims

Each token carries the following claims that you can rely on when granting
access in the downstream system:

| Claim | Example | Notes |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Configured by the administrator. |
| `aud` | `https://bao.example.com` | From the template's audience list. |
| `sub` | `task:1234` | Unique per task run. |
| `iat` / `nbf` / `exp` | | Standard timing claims. |
| `jti` | | Unique token identifier. |
| `project_id` | `7` | Project the template lives in. |
| `template_id` | `42` | The template that produced the task. |
| `user_id` | `67` | User who launched the task (omitted for scheduled / integration runs) |

Use these claims to **scope** access on the consuming side. For example an
OpenBao role that only accepts tokens with `project_id = 7` and a specific
`template_id`.

## Using the token inside a task

Semaphore exports the token as `SEMAPHORE_JWT` in the environment of the
task process.

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## Example: OpenBao

The following walk-through configures OpenBao to trust Semaphore's JWTs and
exchanges them for a demo password.
Replace `semaphore.example.com` and `bao.example.com` with your own hostnames.

### 1. Configure the JWT auth method

Enable the JWT auth method and point it at the JWKS endpoint of your
Semaphore instance. OpenBao uses the public key it fetches there to verify
every token.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Define a policy

Grant the permissions a task needs. The example below allows reading the
demo credential located under `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Define an OpenBao role bound to a template

An OpenBao role decides **which Semaphore tasks** are allowed to assume which
policy. Use the Semaphore-specific claims (`project_id`, `template_id`, ...)
as `bound_claims` so that only the intended template can use the role:

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

Always restrict each role with at least a `project_id` or `template_id`
claim. Without a binding, **any** JWT issued by your Semaphore instance
could assume the role.

A full list of supported configuration parameters can be found [here](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Configure the template

On the Semaphore template that runs the deploy playbook:

- Tick **JWT enabled**.
- Set **Audience** to `https://bao.example.com` – this matches
  `bound_audiences` in the OpenBao role.
- Optionally set **TTL** to `15m` so the token expires shortly after the
  task finishes.

### 5. Use the token in the task

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

The task now authenticates against OpenBao without any pre-shared secret :tada:
