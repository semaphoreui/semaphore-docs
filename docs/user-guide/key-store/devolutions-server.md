# Devolutions Server secret storage

Semaphore UI supports Devolutions Server as a storage for secrets. 

![](/assets/dvls1.webp)

You can provide the following options:
- **Devolutions Server URL** — address of your Devolutions server.
- **Vault ID** — the identifier of the vault where secrets are stored.
- **App Key** — the application key used for authentication.
- **Token** — authentication token. The token can be:
    - Stored in the database.
    - Provided via an environment variable.
    - Provided via a file.

The storage can work in read-only mode.
