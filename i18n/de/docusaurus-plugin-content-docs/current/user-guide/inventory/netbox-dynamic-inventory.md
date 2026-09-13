# Integration eines dynamischen Netbox-Inventory mit Semaphore

![Ansible-Badge](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Netbox-Badge](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Hauptfunktionen {#-key-features}

Dieses Repository zeigt die Verwendung des Plugins `netbox.netbox.nb_inventory` zum Erstellen eines dynamischen Inventory in Semaphore. Es ermöglicht die automatische Synchronisierung von Daten aus Netbox und vereinfacht so die Verwaltung Ihrer Infrastruktur und die Ausführung von Ansible-Playbooks.

## 🔧 Einrichtung {#-setup}

### Anforderungen {#requirements}

- Zugriff auf Semaphore
- Zugriff auf Netbox mit konfigurierter API

### 🔑 Netbox-Einrichtung {#-netbox-setup}

Stellen Sie sicher, dass Ihr Netbox konfiguriert und für die API-Interaktion erreichbar ist. Beschaffen Sie ein API-Token, das zur Authentifizierung der Anfragen verwendet wird.

### 📡 Konfiguration in Semaphore {#-configuration-in-semaphore}

1. Gehen Sie in Semaphore zum Bereich Inventory.
2. Erstellen Sie ein neues Inventory.
3. Geben Sie die folgenden Einstellungen für die Plugin-Konfiguration ein:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Ersetzen Sie `http://your_netbox_url_here` und `YOUR_NETBOX_API_TOKEN` durch die tatsächlichen Daten Ihrer Netbox-Instanz.

## 🚀 Verwendung {#-usage}

Nach der Konfiguration können Sie Ansible-Playbooks in Semaphore mit dem dynamischen Inventory ausführen, das die Host-Daten automatisch aus Ihrem Netbox aktualisiert.

## 📚 Weiterführende Dokumentation {#-further-documentation}

Weitere Informationen zum Plugin `netbox.netbox.nb_inventory` und seinen Möglichkeiten finden Sie in der [offiziellen Ansible-Dokumentation](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
