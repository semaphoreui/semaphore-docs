# Netbox 动态清单与 Semaphore 的集成

![Ansible 徽章](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Netbox 徽章](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 主要特性 {#-key-features}

本仓库演示如何使用 `netbox.netbox.nb_inventory` 插件在 Semaphore 中创建动态清单（Inventory）。它可以自动同步来自 Netbox 的数据，从而简化基础设施的管理以及 Ansible 剧本的执行。

## 🔧 设置 {#-setup}

### 要求 {#requirements}

- 能够访问 Semaphore
- 能够访问已配置 API 的 Netbox

### 🔑 Netbox 设置 {#-netbox-setup}

确保你的 Netbox 已配置完成并可通过 API 访问。获取一个 API 令牌，用于对请求进行认证。

### 📡 在 Semaphore 中配置 {#-configuration-in-semaphore}

1. 在 Semaphore 中，进入清单部分。
2. 创建一个新的清单。
3. 为插件配置输入以下设置：

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   将 `http://your_netbox_url_here` 和 `YOUR_NETBOX_API_TOKEN` 替换为你 Netbox 的实际数据。

## 🚀 使用 {#-usage}

配置完成后，你就可以在 Semaphore 中使用该动态清单运行 Ansible 剧本，它会自动从你的 Netbox 更新主机数据。

## 📚 更多文档 {#-further-documentation}

在 [Ansible 官方文档](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html)中了解更多关于 `netbox.netbox.nb_inventory` 插件及其功能的信息。
