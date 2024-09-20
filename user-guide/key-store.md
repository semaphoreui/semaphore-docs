# Key Store

The Key Store in Semaphore is used to store credentials for accessing remote Repositories, accessing remote hosts, sudo credentials, and Ansible vault passwords.

It is helpful to have configured all required access keys before setting up other resources like Inventories, Repositories, and tasks templates so you do not have to edit them later.

## Types

### SSH
SSH Keys are used to access remote servers as well as remote Repositories.

If you need assistance quickly generating a key and placing it on your host, [here is a quick guide.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

For Git Repositories that use SSH authentication, the Git Repository you are trying to clone from needs to have your public key associated to the private key.

Below are links to the docs for some common Git Repositories:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### Login With Password
Login With Password is a username and password/access token combination that can be used to do the following:
* Authenticate to remote hosts (although this is less secure than using SSH keys)
* Sudo credentials on remote hosts
* Authenticate to remote Git Repositories over HTTPS (although SSH is more secure)
* Unlock Ansible vaults

{% hint style="info" %}
This type of secret can be used as Personal Access Token (PAT) or secret string. Simply leave the Login field empty.
{% endhint %}

### None
This is used as a filler for Repos that do not require authentication, like an Open-Source Repository on GitLab.
