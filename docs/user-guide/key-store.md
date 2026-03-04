# Key Store

The Key Store in Semaphore is used to store credentials for accessing remote Repositories, accessing remote hosts, sudo credentials, and Ansible vault passwords.

## Types

### 1. SSH
SSH Keys are used to access remote servers as well as remote Repositories.

If you need assistance quickly generating a key and placing it on your host, [here is a quick guide.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

For Git Repositories that use SSH authentication, the Git Repository you are trying to clone from needs to have your public key associated to the private key.

Below are links to the docs for some common Git Repositories:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Login With Password
Login With Password is a username and password/access token combination that can be used to do the following:
* Authenticate to remote hosts (although this is less secure than using SSH keys)
* Sudo credentials on remote hosts
* Authenticate to remote Git Repositories over HTTPS (although SSH is more secure)
* Unlock Ansible vaults

:::tip
    This type of secret can be used as Personal Access Token (PAT) or secret string. Simply leave the Login field empty.
:::

### 3. None
This is used as a filler for Repos that do not require authentication, like an Open-Source Repository on GitLab.


## Secret Storages

Semaphore UI supports different storages for secrets. You can choose the storage per-secret when creating or editing a secret.

### Database

Secrets are stored in the database in encrypted form by default. The encryption key is configured via the configuration option
`access_key_encryption` or `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (must be generated using `head -c32 /dev/urandom | base64`).

### HashiCorp Vault

Secrets can be stored in an external HashiCorp Vault instance instead of the database.

[Read more...](/user-guide/key-store/hashicorp-vault)

### Devolutions Server

Secrets can be stored in an external Devolutions Server instance instead of the database.

[Read more...](/user-guide/key-store/devolutions-server)
