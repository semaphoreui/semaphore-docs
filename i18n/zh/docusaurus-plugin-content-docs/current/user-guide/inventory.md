# 清单

![清单列表](/assets/inventory-list.webp)

清单（Inventory）是一个包含主机列表的文件，Ansible 会针对这些主机运行 play。
清单还存储可供剧本使用的变量。清单可以以 YAML、JSON 或 TOML 格式存储。
关于清单的更多信息，请参阅 [Ansible 文档。](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI 既可以从服务器上 Semaphore 用户拥有读取权限的文件中读取清单，也可以使用通过 Web 界面编辑的静态清单。
托管清单把主机和变量保存为记录，并在 Web 界面中编辑。
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
| `managed` | 在 Web UI 中以记录的形式管理主机和变量。参见 [托管清单](#managed-inventory)。 |
| `terraform-workspace`、`tofu-workspace`、`terragrunt-workspace` | 不是 Ansible 清单：供 [Terraform/OpenTofu](./apps/terraform/workspaces) 和 [Terragrunt](./apps/terragrunt) 模板使用的工作区。 |

## 创建清单 {#creating-an-inventory}
1. 点击 Key Store 选项卡，确认你已拥有 login_password 或 ssh 类型的密钥
2. 点击 Inventory 选项卡，然后点击 New Inventory
3. 为清单命名，并从下拉列表中选择正确的用户凭据。如有需要，选择正确的 sudo 凭据
4. 选择清单类型
  * 如果选择 file，请使用文件的绝对路径。如果该文件位于你的 Git 仓库中，则使用相对路径。例如 `inventory/linux-hosts.yaml`
  * 如果选择 static 或 static-yaml，请在表单中粘贴或输入你的清单
  * 如果选择 managed，请先创建清单，然后在清单页面中添加主机和变量。请参阅[托管清单](#managed-inventory)
5. 点击 Create。

## 更新清单 {#updating-an-inventory}
1. 点击 Inventory 选项卡
2. 点击要编辑的清单旁边的铅笔图标
3. 进行修改
4. 点击 Save

要修改托管清单的主机和变量，请参阅[托管清单](#managed-inventory)。

## 删除清单 {#deleting-an-inventory}
在删除清单之前，必须先删除与其关联的所有资源。
如果不确定某个环境正被哪些资源使用，请按照下面的步骤 1 和 2 操作。它会显示正在使用的资源，并附带指向这些资源的链接。

1. 点击 Inventory 选项卡
2. 点击清单旁边的垃圾桶图标
3. 如果确定要删除该清单，请点击 Yes

## 托管清单 {#managed-inventory}

托管清单（Managed inventory）把主机保存为记录，而不是清单文本。如果你经常添加、修改或停用主机，又不想编辑一大段文本，可以使用它。

在列表中点击清单名称。页面有三个选项卡：

* **Hosts**：按名称搜索主机，按组筛选主机，添加、编辑和删除主机。**Groups** 列显示主机所属的组。**Variables** 列显示主机有多少个变量。
* **Groups**：主机组。参见[组](#managed-inventory-groups)。
* **Variables**：整个清单的变量。

主机包含名称、可选的描述和变量。名称就是 Ansible 看到的主机。它在清单内必须唯一，区分大小写，且不能包含空格、逗号、方括号或冒号。把地址和端口写入变量 `ansible_host` 和 `ansible_port`。

主机和清单的变量以映射的形式用 YAML 或 JSON 编写：

```yaml
ansible_host: 10.0.0.5
ansible_user: deploy
```

在主机上设置的值优先于在清单上设置的同名变量。不接受 YAML 锚点、别名和合并键。

要跳过某个主机，请在主机列表中关闭它的开关。之后创建的任务不会使用该主机。再次开启开关即可重新使用。

* 清单创建后，不能把类型改为 `managed`，也不能从 `managed` 改为其他类型。
* 托管清单的主机和变量包含在项目备份中。
* 只能查看项目的用户可以打开该页面，但不能修改。

### 组 {#managed-inventory-groups}

通过组，你可以在一部分主机上运行 playbook（例如使用 `hosts: web`），并为许多主机一次性设置变量。

在 **Groups** 选项卡中添加组。组包含名称、可选的描述、变量和子组。名称在清单内必须唯一，且名称 `all` 和 `ungrouped` 已被占用。子组的主机也属于父组。组不能成为自己的祖先。

要把主机加入组，请在添加或编辑主机时，在 **Groups** 字段中选择这些组。要一次修改多个主机，请在 **Hosts** 选项卡中选中它们，然后点击 **Add to groups** 或 **Remove from groups**。一个主机可以属于多个组。

要查看某个组的主机，请在 **Hosts** 选项卡的筛选器中选择该组。列表中也包含其子组的主机。

在主机上设置的值优先于在组上设置的同名变量，在组上设置的值优先于清单。以组为目标的任务会在该组中开关已开启的主机上运行。
