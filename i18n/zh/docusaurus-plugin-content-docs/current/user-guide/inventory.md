# 清单

![清单列表](/assets/inventory-list.webp)

清单（Inventory）是一个包含主机列表的文件，Ansible 会针对这些主机运行 play。
清单还存储可供剧本使用的变量。清单可以以 YAML、JSON 或 TOML 格式存储。
关于清单的更多信息，请参阅 [Ansible 文档。](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI 既可以从服务器上 Semaphore 用户拥有读取权限的文件中读取清单，也可以使用通过 Web 界面编辑的静态清单。
每个清单还至少关联一个凭据。
用户凭据是必需的，Ansible 使用它登录该清单中的主机。Sudo 凭据用于在主机上提升权限。
要创建清单，必须在密钥库（Key Store）中配置一个用户凭据，其类型为带登录名的用户名或 SSH。
关于凭据的信息，请参阅本站的[密钥库](key-store)部分。

## 清单类型 {#inventory-types}

| 类型 | 说明 |
|---|---|
| `static` | 在 Web UI 中编辑的 INI 格式清单。 |
| `static-yaml` | 在 Web UI 中编辑的 YAML 格式清单。用于插件清单，例如 [NetBox](./inventory/netbox-dynamic-inventory) 或 [Consul](./inventory/consul-dynamic-inventory)。 |
| `file` | 清单文件的路径。相对路径指向模板所用仓库（Repository）中的文件，绝对路径指向服务器上的文件。如果文件位于另一个 Git 仓库中，可以选择单独的**清单仓库**（Inventory repository）。 |
| `terraform-workspace`、`tofu-workspace`、`terragrunt-workspace` | 不是 Ansible 清单：供 [Terraform/OpenTofu](./apps/terraform/workspaces) 和 [Terragrunt](./apps/terragrunt) 模板使用的工作区。 |

## 创建清单 {#creating-an-inventory}
1. 点击 Key Store 选项卡，确认你已拥有 login_password 或 ssh 类型的密钥
2. 点击 Inventory 选项卡，然后点击 New Inventory
3. 为清单命名，并从下拉列表中选择正确的用户凭据。如有需要，选择正确的 sudo 凭据
4. 选择清单类型
  * 如果选择 file，请使用文件的绝对路径。如果该文件位于你的 Git 仓库中，则使用相对路径。例如 `inventory/linux-hosts.yaml`
  * 如果选择 static 或 static-yaml，请在表单中粘贴或输入你的清单
5. 点击 Create。

## 更新清单 {#updating-an-inventory}
1. 点击 Inventory 选项卡
2. 点击要编辑的清单旁边的铅笔图标
3. 进行修改
4. 点击 Save

## 删除清单 {#deleting-an-inventory}
在删除清单之前，必须先删除与其关联的所有资源。
如果不确定某个环境正被哪些资源使用，请按照下面的步骤 1 和 2 操作。它会显示正在使用的资源，并附带指向这些资源的链接。

1. 点击 Inventory 选项卡
2. 点击清单旁边的垃圾桶图标
3. 如果确定要删除该清单，请点击 Yes
