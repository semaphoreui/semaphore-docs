# Repositories

A Repository is a place to store and manage Ansible content like playbooks and roles

Semaphore understands repositories that are a local git repository (git://), a local folder (file://), or a remote git repository that is accessed over HTTPS (https://) or SSH(ssh://).

All Task templates require a repository in order to run.

## Authenication
If you are using a remote repository that requires authenication you will need to configure key in the key store section of semaphore.

For remote repositories that use SSH you will your key will be an SSH key. 

For Remote repositories that do not have authenication you can create a key with the type of None.

## Creating a New Repository
1. make sure you have configured the key for the repository you are about to add in the key store section.
2. go to the repositories section of Semaphore click the new repository button in the upper right hand corner
3. Configure the repository
  * Name Repository
  * add the url must start with the following
    * https:// for a remote git repository accessed  over https
    * ssh:// for a remote git repository accessed over ssh
    * file:// for a local folder on the file system
    * git:// for a local git repository
  * set the branch of the repository if you are not sure what to put it is probably master. 
  * selct the access key you configured prior to setting up this repository.
4. click save once everything is configured.

## Editing an Exisiting Repository
1. go to the repositories section of Semaphore
2. Click on the pencil icon next to the repository you wish to change, and you will be presented with the same option as when you created the repository

## Deleting a repository
Make sure the repository that is about to be delete is not in use by any task templates. 
A repository cannot be deleted if it is used in any task templates. 
1. go to the repositories section of Semaphore
2. Click on the trashcan icon on of the repository you wish to delete.
3. click yes on the confirmation popup if you are sure you want this repository to be deleted. 