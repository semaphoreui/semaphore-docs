# Integrazione dell'inventory dinamico Netbox con Semaphore

![Badge Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Badge Netbox](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Funzionalità principali {#-key-features}

Questo repository dimostra l'utilizzo del plugin `netbox.netbox.nb_inventory` per creare un inventory dinamico in Semaphore. Consente la sincronizzazione automatica dei dati da Netbox, semplificando la gestione dell'infrastruttura e l'esecuzione dei playbook Ansible.

## 🔧 Configurazione {#-setup}

### Requisiti {#requirements}

- Accesso a Semaphore
- Accesso a Netbox con API configurata

### 🔑 Configurazione di Netbox {#-netbox-setup}

Assicurarsi che Netbox sia configurato e accessibile per l'interazione tramite API. Ottenere un token API che verrà utilizzato per autenticare le richieste.

### 📡 Configurazione in Semaphore {#-configuration-in-semaphore}

1. In Semaphore, andare nella sezione inventory.
2. Creare un nuovo inventory.
3. Inserire le seguenti impostazioni per la configurazione del plugin:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Sostituire `http://your_netbox_url_here` e `YOUR_NETBOX_API_TOKEN` con i dati effettivi del proprio Netbox.

## 🚀 Utilizzo {#-usage}

Una volta configurato, è possibile eseguire playbook Ansible in Semaphore utilizzando l'inventory dinamico, che aggiorna automaticamente i dati degli host dal proprio Netbox.

## 📚 Documentazione aggiuntiva {#-further-documentation}

Per saperne di più sul plugin `netbox.netbox.nb_inventory` e sulle sue funzionalità, consultare la [documentazione ufficiale di Ansible](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
