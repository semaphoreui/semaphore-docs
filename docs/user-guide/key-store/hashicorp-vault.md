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

The storege can work in readonly mode.
