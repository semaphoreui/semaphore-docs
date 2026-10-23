---
title: Key Store
description: Comprehensive guide to credentials in the Semaphore Key Store, SSH keypair generation, login passwords, token secrets, and external secret storages.
---

# Key Store

The **Key Store** serves as Semaphore's centralized credential repository. It manages authentication materials required for cloning remote Git repositories, connecting to target infrastructure hosts, elevating privileges (`sudo`/`become`), and decrypting Ansible Vault secrets.

![Key Store](/assets/key-store-keys.webp)

The Key Store is partitioned into two primary views:
* **Keys Tab**: Lists all credentials provisioned for the current project, showing their name, storage backend, credential type, and synchronization state.
* **Storages Tab (Pro)**: Configures external secret backends (such as HashiCorp Vault, OpenBao, AWS Secrets Manager, or CyberArk) to enable dynamic secret resolution and automated synchronization.

---

## Credential Types {#types}

Semaphore categorizes stored credentials into three foundational types:

### 1. SSH Keys {#1-ssh}
SSH Keys provide asymmetric cryptographic authentication used to connect to remote Linux/UNIX nodes and clone Git repositories over SSH (`git@github.com:...`).

When configuring an SSH key credential, you can specify:
* **Key Name**: A descriptive label for the credential across your project inventories and templates.
* **Username (Optional)**: The default remote user account used during SSH connection establishment (for example, `ansible` or `ubuntu`).
* **Passphrase (Optional)**: The passphrase required to decrypt encrypted private keys. Passphrase inputs include a visibility toggle (`eye` icon) and are masked by default.
* **Private Key**: The raw PEM/OpenSSH private key text.

#### Built-in SSH Key Generator {#built-in-ssh-key-generator}

Rather than manually running `ssh-keygen` on external machines, Semaphore includes a **built-in, one-click SSH keypair generator** directly inside the credential modal:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Select **SSH Key** from the **Type** dropdown.
2. Check the **Generate SSH Key** checkbox.
3. Notice that the manual **Private Key** textarea is automatically disabled and locked down.
4. Click **Create**. Semaphore will automatically generate a cryptographically secure keypair (ED25519/RSA), encrypt the private key directly into the database, and display the public key in a dedicated modal dialog:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Use the built-in **Copy to Clipboard** button to copy the public key and paste it directly into your Git provider's deploy keys or your target nodes' `~/.ssh/authorized_keys` file.

#### Extracting Public Keys Later (Public Key Drawer) {#extracting-public-keys-later}

If you close the dialog or need to retrieve the public key at a later time, you do not need to regenerate the keypair. When editing any existing key that was created with the generator, Semaphore provides an expandable **Public key** drawer:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Click **Show** / **Hide** to preview the raw public key string.
* Click the clipboard icon to copy the public key instantly.

#### Linking Deploy Keys to Common Git Hosts

For Git repositories requiring SSH authentication, add the generated public key as a read-only deploy key:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Login With Password {#2-login-with-password}

The **Login with password** credential type supports both traditional username/password authentication and standalone secret strings:

* **Host & Sudo Authentication**: Provides password-based SSH access and `sudo` privilege escalation credentials on target hosts.
* **HTTPS Git Authentication**: Authenticates to remote repositories over HTTPS using username and personal access tokens (PAT).
* **Ansible Vault Passwords**: Unlocks encrypted Ansible Vault files and variables at runtime.

:::tip Secret Strings & Personal Access Tokens (PAT)
To store a pure secret string (such as an API Bearer token, Ansible Vault passphrase, or Personal Access Token), **leave the Login / Username field blank**. Semaphore will treat the entry strictly as an isolated secret string without appending an associated user identifier.
:::

#### Secret Masking & Override Protection {#secret-masking-and-override-protection}

To protect credentials from unauthorized exposure and accidental modification:
* Password and passphrase inputs are strictly masked in the interface with optional visibility reveal controls.
* When editing an existing credential, sensitive secret inputs are disabled by default.
* To update or replace an existing secret, you must explicitly check the **Override** checkbox at the bottom of the form. This safety gate prevents unintended secret overwrites during routine administrative edits.

---

### 3. None {#3-none}

The **None** credential acts as an explicit null authentication placeholder. It is used for public open-source Git repositories (such as public repositories on GitHub or GitLab) and local unauthenticated playbook executions where no SSH keys or passwords are required.

---

## Secret Storages {#secret-storages}

Semaphore supports decoupled secret storage architectures. When creating or editing any credential, you can select where the underlying secret material resides via the source storage tabs:

| Storage Source Tab | Availability | Description |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | Secret is stored directly in the Semaphore relational database, protected by envelope encryption. |
| **Storage** | Pro | Secret references an external secrets engine (e.g. HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | Secret is dynamically resolved at runtime from an environment variable on the Semaphore server. |
| **File** | Open Source & Pro | Secret is read from a protected file residing in the server's configured secrets directory. |

![Secret storages](/assets/key-store-storages.webp)

### Database Storage (Local) {#database}

By default, secrets are stored in the application database in encrypted form using symmetric AES encryption. The master key is configured via the server setting:
* Configuration key: `access_key_encryption`
* Environment variable: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Master Encryption Key Generation
Generate a cryptographically secure 32-byte base64 encryption key before starting production instances:
```bash
head -c32 /dev/urandom | base64
```
Ensure this key is backed up securely. If the encryption key is lost, existing database secrets cannot be recovered.
:::

### Environment Variable & File Sources (Read-Only Storages) {#environment-variable-or-file}

When you select the **Env** or **File** source tab, Semaphore treats the storage as an external, read-only origin. The UI renders an informative notice:

> **Read-only secret storage chosen.**

![Read-only Secret Storage](/assets/key-store-env-readonly-storage.webp)

* **Env Source**: Provide the exact name of the environment variable exported on the Semaphore server host or container (e.g., `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **File Source**: Provide the file path relative to the configured secrets path (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, default `/tmp/semaphore`).

For structured keys (such as SSH keypairs with passphrases or login/password pairs), file and environment variable contents must be formatted as valid JSON objects. See [Env and File Sources](/user-guide/key-store/env-and-file-sources) for schema details.

### External Enterprise Secret Engines (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro and Enterprise extend the Key Store with native connectors to premier enterprise secret managers:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: Connects via AppRole or Token authentication to read and write KV v1/v2 secrets.
* **[OpenBao](/user-guide/key-store/openbao)**: Open-source, API-compatible fork of HashiCorp Vault.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** `<Enterprise />`: Integrates with AWS IAM roles or static credentials.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: Integrates with centralized privileged access management.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** `<Enterprise />`: Reads and writes secrets using CyberArk PVWA REST APIs.

---

## Syncing Secrets from Remote Storages {#syncing-secrets-from-remote-storages}

Rather than manually registering credentials one by one, Semaphore supports automated bidirectional and read-only synchronization from external secret vaults.

When a secret is maintained via synchronization:
* It is marked with an active **synchronized** badge in the Key Store table.
* Manual editing of the secret material in the UI is disabled to preserve the external vault as the single source of truth.
* Any updates or rotations in the external secrets engine automatically propagate into Semaphore based on the configured synchronization interval.

For comprehensive configuration steps, see [Secret Synchronization](/user-guide/key-store/secret-sync).
