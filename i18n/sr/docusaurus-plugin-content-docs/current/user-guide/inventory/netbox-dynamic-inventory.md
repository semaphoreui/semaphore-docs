# Integracija Netbox dinamičkog inventara sa Semaphore-om

![Ansible bedž](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Netbox bedž](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Ključne mogućnosti {#-key-features}

Ovaj repozitorijum (Repository) prikazuje upotrebu plugin-a `netbox.netbox.nb_inventory` za kreiranje dinamičkog inventara (Inventory) u Semaphore-u. Omogućava automatsku sinhronizaciju podataka iz Netbox-a, čime se pojednostavljuje upravljanje infrastrukturom i izvršavanje Ansible playbook-ova.

## 🔧 Podešavanje {#-setup}

### Zahtevi {#requirements}

- Pristup Semaphore-u
- Pristup Netbox-u sa podešenim API-jem

### 🔑 Podešavanje Netbox-a {#-netbox-setup}

Proverite da je vaš Netbox podešen i dostupan za API interakciju. Pribavite API token koji će se koristiti za autentifikaciju zahteva.

### 📡 Konfiguracija u Semaphore-u {#-configuration-in-semaphore}

1. U Semaphore-u idite na odeljak inventara.
2. Kreirajte novi inventar.
3. Unesite sledeća podešavanja za konfiguraciju plugin-a:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Zamenite `http://your_netbox_url_here` i `YOUR_NETBOX_API_TOKEN` stvarnim podacima iz vašeg Netbox-a.

## 🚀 Upotreba {#-usage}

Kada je podešeno, možete pokretati Ansible playbook-ove u Semaphore-u koristeći dinamički inventar koji automatski ažurira podatke o hostovima iz vašeg Netbox-a.

## 📚 Dodatna dokumentacija {#-further-documentation}

Saznajte više o plugin-u `netbox.netbox.nb_inventory` i njegovim mogućnostima u [zvaničnoj Ansible dokumentaciji](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
