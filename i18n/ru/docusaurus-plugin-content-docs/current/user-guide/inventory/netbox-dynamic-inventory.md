# Интеграция динамического инвентаря Netbox с Semaphore

![Ansible Badge](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Netbox Badge](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Ключевые возможности {#-key-features}

В этом руководстве показано использование плагина `netbox.netbox.nb_inventory` для создания динамического инвентаря в Semaphore. Он обеспечивает автоматическую синхронизацию данных из Netbox, упрощая управление инфраструктурой и запуск playbook Ansible.

## 🔧 Настройка {#-setup}

### Требования {#requirements}

- Доступ к Semaphore
- Доступ к Netbox с настроенным API

### 🔑 Настройка Netbox {#-netbox-setup}

Убедитесь, что ваш Netbox настроен и доступен для взаимодействия через API. Получите API-токен, который будет использоваться для аутентификации запросов.

### 📡 Настройка в Semaphore {#-configuration-in-semaphore}

1. В Semaphore перейдите в раздел инвентаря.
2. Создайте новый инвентарь.
3. Укажите следующие настройки для конфигурации плагина:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Замените `http://your_netbox_url_here` и `YOUR_NETBOX_API_TOKEN` на реальные данные вашего Netbox.

## 🚀 Использование {#-usage}

После настройки вы можете запускать playbook Ansible в Semaphore, используя динамический инвентарь, который автоматически обновляет данные о хостах из вашего Netbox.

## 📚 Дополнительная документация {#-further-documentation}

Подробнее о плагине `netbox.netbox.nb_inventory` и его возможностях читайте в [официальной документации Ansible](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
