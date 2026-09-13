# Integración de inventario dinámico de Netbox con Semaphore

![Insignia de Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Insignia de Netbox](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Características principales {#-key-features}

Este repositorio demuestra el uso del plugin `netbox.netbox.nb_inventory` para crear un inventario dinámico en Semaphore. Permite la sincronización automática de datos desde Netbox, lo que simplifica la gestión de su infraestructura y la ejecución de playbooks de Ansible.

## 🔧 Configuración {#-setup}

### Requisitos {#requirements}

- Acceso a Semaphore
- Acceso a Netbox con la API configurada

### 🔑 Configuración de Netbox {#-netbox-setup}

Asegúrese de que su Netbox esté configurado y accesible para la interacción con la API. Obtenga un token de API que se usará para autenticar las solicitudes.

### 📡 Configuración en Semaphore {#-configuration-in-semaphore}

1. En Semaphore, vaya a la sección de inventario.
2. Cree un nuevo inventario.
3. Introduzca los siguientes ajustes para la configuración del plugin:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Sustituya `http://your_netbox_url_here` y `YOUR_NETBOX_API_TOKEN` por los datos reales de su Netbox.

## 🚀 Uso {#-usage}

Una vez configurado, puede ejecutar playbooks de Ansible en Semaphore usando el inventario dinámico, que actualiza automáticamente los datos de los hosts desde su Netbox.

## 📚 Documentación adicional {#-further-documentation}

Obtenga más información sobre el plugin `netbox.netbox.nb_inventory` y sus capacidades en la [documentación oficial de Ansible](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
