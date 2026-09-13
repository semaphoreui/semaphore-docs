# 变量组

![变量组列表](/assets/variable-groups-list.webp)

Semaphore 的变量组（Variable Groups）部分用于为清单（Inventory）存放额外的变量，这些变量必须以 JSON 格式存储。

所有任务模板（Task Templates）都要求定义一个变量组，即使它是空的。

## 创建变量组 {#create-a-variable-group}
1. 点击 Variable Group 选项卡。
2. 点击 New Variable Group 按钮。
3. 为变量组命名，然后输入或粘贴有效的 JSON 变量。如果只需要一个空的变量组，请输入 ```{}```。

## 更新变量组 {#updating-a-variable-group}
1. 点击 Variable Groups 选项卡。
2. 点击铅笔图标。
3. 进行修改并点击保存。

## 删除变量组 {#deleting-the-variable-group}
在删除变量组之前，必须先删除与其关联的所有资源。
如果不确定某个变量组正被哪些资源使用，请按照下面的步骤 1 和 2 操作。它会显示正在使用的资源，并附带指向这些资源的链接。

1. 点击该变量组。
2. 点击变量组旁边的垃圾桶图标。
3. 如果确定要删除该变量组，请点击 Yes。

## 使用变量组 - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
当你想在 Terraform 模板中使用已存储的变量组变量或密钥时，必须为名称添加 `TF_VAR_` 前缀，Terraform 脚本才能使用它。

**示例**
将 Hetzner Cloud API 密钥传递给 OpenTofu/Terraform 剧本。

1. 点击 Variable Group
2. 点击 `New Group`
3. 点击 `Secrets` 选项卡
4. 添加 `TF_VAR_hcloud_token`，并在隐藏字段中填入你的 `secret`
5. 点击 Save

我们将在 hetzner.tf 中以 `var.hcloud_token` 的形式引用密钥
`TF_VAR_hcloud_token`
```
terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

# Declare the variable
variable "hcloud_token" {
  type        = string
  description = "Hetzner Cloud API token"
  sensitive   = true  # This prevents the token from being displayed in logs
}

provider "hcloud" {
  token = var.hcloud_token
}

# Create a new server running debian
resource "hcloud_server" "webserver" {
  name        = "webserver"
  image       = "ubuntu-24.04"
  server_type = "cpx11" 
  location    = "ash"
  ssh_keys = [ "mysshkey" ]
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
}
``` 
