# Netbox Dynamic Inventory Integration with Semaphore

![Ansible Badge](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Netbox Badge](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white)

## 🌟 Introduction

This project was inspired by my lengthy search for a reliable way to integrate Netbox's dynamic inventory into Semaphore. Throughout my research, I found many suggested methods to be either overly complex or unstable. Finally, I discovered a simple and effective use of the `netbox.netbox.nb_inventory` plugin built into Ansible, which greatly simplified the process.

## 🛠 Key Features

This repository demonstrates the use of the `netbox.netbox.nb_inventory` plugin to create a dynamic inventory in Semaphore. It enables automatic synchronization of data from Netbox, simplifying the management of your infrastructure and the execution of Ansible playbooks.

## 🔧 Setup

### Requirements

- Access to Semaphore
- Access to Netbox with configured API

### 🔑 Netbox Setup

Ensure your Netbox is configured and accessible for API interaction. Obtain an API token which will be used to authenticate requests.

### 📡 Configuration in Semaphore

1. In Semaphore, go to the inventory section.
2. Create a new inventory.
3. Enter the following settings for the plugin configuration:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Replace `http://your_netbox_url_here` and `YOUR_NETBOX_API_TOKEN` with the actual data from your Netbox.

## 🚀 Usage

Once configured, you can run Ansible playbooks in Semaphore using the dynamic inventory which automatically updates host data from your Netbox.

## 📚 Further Documentation

Learn more about the `netbox.netbox.nb_inventory` plugin and its capabilities in the [official Ansible documentation](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
