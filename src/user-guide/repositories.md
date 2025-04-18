# Repositories

A Repository is a place to store and manage Ansible content like playbooks and roles.

![](<../.gitbook/assets/repository.webp>)

Semaphore understands Repositories that are:
  * a local file system (`/path/to/the/repo`)
  * a local Git repository (`file://`)
  * a remote Git Repository that is accessed over HTTPS (`https://`), SSH(`ssh://`)
  * `git://` protocol supported, but it is not recommended for security reasons.

All Task Templates require a Repository in order to run.

## Authentication
If you are using a remote Repository that requires authentication, you will need to configure a key in the **Key Store** section of Semaphore.

For remote Repositories that use SSH, you will need to use your SSH key in the **Key Store**. 

For Remote Repositories that do not have authentication, you can create a Key with the type of `None`.

## Creating a New Repository
1. Make sure you have configured the key for the Repository you are about to add in the key store section.

2. Go to the Repositories section of Semaphore, click the **New Repository** button in the upper right hand corner.

3. Configure the Repository:
    * Name Repository
    * Add the URL. The URL must start with the following:
        * `/path/to/the/repo` for a local folder on the file system
        * `https://` for a remote Git Repository accessed over HTTPS
        * `ssh://` for a remote Git Repository accessed over SSH
        * `file://` for a local Git Repository
        * `git://` for a remote Git Repository accessed over Git protocol
    * Set the branch of the Repository, if you are not sure what it should be, it is probably master or main
    * Select the **Access Key** you configured prior to setting up this Repository.

4. Click Save once everything is configured.

## Editing an Existing Repository
1. Go to the Repositories section of Semaphore.

2. Click on the pencil icon next to the Repository you wish to change, then you will be presented with the Repository configuration.

## Deleting a Repository
Make sure the Repository that is about to be delete is not in use by any Task Templates.
A Repository cannot be deleted if it is used in any Task Templates:
1. Go to the Repositories section of Semaphore.

2. Click on the trash can icon on of the Repository you wish to delete.

3. Click Yes on the confirmation pop-up if you are sure you want this Repository to be deleted.
