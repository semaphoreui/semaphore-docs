# Inventory

An Ivnetory is a file that that stores a list of hosts that for Ansible to run plays against.
An inventory also stores variables that can be used by playbooks. Iventories can be stored in yaml, json, on toml.
More information about inventories can be found in the [Ansible Documentation](https://docs.Ansible.com/Ansible/latest/user_guide/intro_inventory.html)

Ansible Semaphore Can either Read an Ivnetory from a file on the server the Semaphore user has read access to or a static inventory that is edited via the web GUI.
Each Inventory also has a at least one credential tied to it.
The User credential which is required and is what Ansible uses to login to hosts in for that inventory, and Sudo credentials which are used for escilating prilveges on that host.
It is required to have a user credential that is either a username with a login or an SSH configured in the key store to create an inventory.
Information about credentials can be found in the [key store](key-store.md) section of this site 

## Creating an Inventory 
1. Click on the key store tab and confirm you have a key that is a login_password or ssh  type
2. Click on the inventory tab and click new inventory
3. Name the inventory and select the correct user credential from the dropdown, and select the correct sudo credential if needed
4. Select the inventory type.
  * if you select file use the absolute path to the file
  * if you select static paste in or type your inventory into the form
5. Click create

## Updating an Inventory
1. Click on the Inventory tab
2. Click the Pencil Icon next to the inventory you want to edit
3. make your changes
4. click save

## Deleting an inventory
Before you removing an inventory you must remove all resources tied to it.
If you are not sure which resources an are using an inventory follow steps 1 and 2 below and it will show you which resources are using it with links to those resources.

1. Click on the Inventory tab
2. Click the trash can icon next to the inventory
3. Click yes if you are sure you want to remove the inventory