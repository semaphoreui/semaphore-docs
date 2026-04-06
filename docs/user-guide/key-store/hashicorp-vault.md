# HashiCorp Vault secret storage

Semaphore UI supports HashiCorp Vault as a storage for secrets.

![](/assets/vault1.webp)

You can provide the following options:
- **HashiCorp Vault URL** — address of your Vault server.
- **Mount** — the secrets engine mount path.
- **Token** — authentication token. The token can be:
    - Stored in the database.
    - Provided via an environment variable.
    - Provided via a file (useful for Vault Agent).
      :::warning
      When the token comes from a **file**, that file must be **inside** the secrets directory Semaphore uses. Configure that directory using either the `SEMAPHORE_SECRETS_PATH` environment variable or `dirs.secrets_path` in the Semaphore config. If neither is set, the default is `/tmp/semaphore`. See [Configuration](/admin-guide/configuration) for the full list of options.

      Example `config.json` fragment:

      ```json
      {
        "dirs": {
          "secrets_path": "/root/path/for/secrets"
        }
      }
      ```
      :::

The storage can work in read-only mode.

## How to use

1. Configure the HashiCorp Vault connection in the Semaphore settings (URL, mount path, and token).
2. When creating or editing a key in the Key Store, select **HashiCorp Vault** as the storage type.
3. Provide the secret path in Vault where the credential should be stored.

![](/assets/vault2.webp)

## HashiCorp Vault Agent

Instead of storing the Vault token directly, you can use [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) to automatically handle token retrieval and renewal.

Vault Agent runs as a sidecar process alongside Semaphore and writes a valid token to a file on disk. Semaphore then reads the token from that file.

To set this up:

1. Configure and run Vault Agent with an appropriate [auto-auth method](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) (e.g., AppRole, Kubernetes, AWS IAM).
2. Set Vault Agent to write the token to a file using a `sink` block, for example:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. In Semaphore, when configuring the HashiCorp Vault connection, select **File** as the token source and provide the path to the token file (e.g., `/etc/vault/token`).

This approach avoids long-lived static tokens and lets Vault Agent handle authentication and token renewal automatically.


## Variable Groups

HashiCorp Vault can also be used as a storage for [Variable Groups](/user-guide/environment). When editing a variable group, select **HashiCorp Vault** as the storage type and specify the path of the folder where secrets will be stored.

![](/assets/vault3.webp)
