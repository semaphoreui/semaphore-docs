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

The storage can work in read-only mode.

## How to use

1. Configure the HashiCorp Vault connection in the Semaphore settings (URL, mount path, and token).
2. When creating or editing a key in the Key Store, select **HashiCorp Vault** as the storage type.
3. Provide the secret path in Vault where the credential should be stored.

![](/assets/vault2.webp)

## Variable Groups

HashiCorp Vault can also be used as a storage for [Variable Groups](/user-guide/environment). When editing a variable group, select **HashiCorp Vault** as the storage type and specify the path of the folder where secrets will be stored.

![](/assets/vault3.webp)
