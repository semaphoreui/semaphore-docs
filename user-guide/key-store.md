# Key Store

The Key store in Semaphore is used for storing credentials for acessing remote repositories, accessing remote hosts, storing sudo credentials, and ansible vault passwords.

It is helpful that you have configured all required access keys before setting up other resources like inventories, repositories, and tasks templates so you do not have to edit them later.

## Types

### SSH
SSH Keys are used for access remote servers as well as remote repositories.

At this time semaphore does support using SSH keys that are password protected.

If you need assistance quickly generating a key and placing it on your host [here is a quick guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

For git repositories that use SSH authenication you will need to add the public for the private key generated added to semaphore added to your profile.

Below are links to the docs for some people git repositories

[github](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

[gitlab](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

[bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### Login With Password
Login with password is a username and password/access token combination that can be used to do the follwing
* authenicate to remote hosts although this is less secure than using ssh keys
* sudo credentials on remote hosts
* authenicate to remote git repos over HTTPS although SSH is more secure 
* unlock ansible vaults

### Personal Access Token

### None
This is used as a filler for repos that do not require autentication like an open source repo on gitlab.