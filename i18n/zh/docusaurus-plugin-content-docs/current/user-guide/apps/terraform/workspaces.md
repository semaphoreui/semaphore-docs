
# 工作区

![模板的工作区标签页](/assets/template-workspaces.webp)

Semaphore 内置了对 Terraform 工作区的支持，让您可以在单个项目（Project）中管理多个环境和配置。此功能有助于为开发、预发布和生产等不同环境维护独立的状态文件。

## 功能 {#features}

- **工作区管理**：直接在 Semaphore UI 中创建、切换和删除工作区。
- **状态隔离**：每个工作区维护自己的状态文件，避免环境之间的冲突。
- **环境变量**：配置工作区专属的环境变量。
- **工作区选择**：运行 Terraform 命令时选择目标工作区。

## 在 Semaphore 中使用工作区 {#using-workspaces-in-semaphore}

### 创建工作区 {#creating-a-workspace}

在需要添加工作区的 Terraform/OpenTofu 模板的**工作区**（Workspaces）部分，按以下步骤操作：

1. 点击 ➕ 按钮。  
2. 在弹出的菜单中选择**新建工作区**（New Workspace）。  
3. 在模态对话框中输入工作区名称，并选择用于克隆模块的 SSH 密钥。  
4. 点击**创建**（Create）按钮，将新工作区添加到模板。  
5. 现在您可以使用此工作区运行任务。


### 切换工作区 {#switching-workspaces}

点击**设为默认**（MAKE DEFAULT）按钮，可以为 Terraform/OpenTofu 模板设置默认工作区。


### 工作区专属变量 {#workspace-specific-variables}

Semaphore 目前不支持工作区专属变量。
