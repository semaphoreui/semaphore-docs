# Intégration de l'inventaire dynamique Netbox avec Semaphore

![Badge Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Badge Netbox](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Fonctionnalités clés {#-key-features}

Ce dépôt illustre l'utilisation du plugin `netbox.netbox.nb_inventory` pour créer un inventaire dynamique dans Semaphore. Il permet la synchronisation automatique des données depuis Netbox, ce qui simplifie la gestion de votre infrastructure et l'exécution des playbooks Ansible.

## 🔧 Mise en place {#-setup}

### Prérequis {#requirements}

- Accès à Semaphore
- Accès à Netbox avec une API configurée

### 🔑 Configuration de Netbox {#-netbox-setup}

Assurez-vous que votre Netbox est configuré et accessible pour les interactions via l'API. Obtenez un token d'API qui servira à authentifier les requêtes.

### 📡 Configuration dans Semaphore {#-configuration-in-semaphore}

1. Dans Semaphore, allez dans la section Inventaire.
2. Créez un nouvel inventaire.
3. Saisissez les paramètres suivants pour la configuration du plugin :

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Remplacez `http://your_netbox_url_here` et `YOUR_NETBOX_API_TOKEN` par les données réelles de votre Netbox.

## 🚀 Utilisation {#-usage}

Une fois la configuration terminée, vous pouvez exécuter des playbooks Ansible dans Semaphore à l'aide de l'inventaire dynamique, qui met automatiquement à jour les données des hôtes depuis votre Netbox.

## 📚 Documentation complémentaire {#-further-documentation}

Pour en savoir plus sur le plugin `netbox.netbox.nb_inventory` et ses fonctionnalités, consultez la [documentation officielle d'Ansible](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
