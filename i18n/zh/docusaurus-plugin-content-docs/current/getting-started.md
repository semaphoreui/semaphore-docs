# 快速入门

本页带您从全新安装走到第一个成功运行的任务。每个步骤都链接到包含详细信息的页面。

## 从零到第一个任务 {#from-zero-to-first-task}

1. 使用您偏好的方式**安装 Semaphore**：[安装](/admin-guide/installation)。
2. **登录**：使用您在安装向导中创建的管理员用户，或在 Docker 中通过 `SEMAPHORE_ADMIN_*` 变量创建的用户。
3. **创建项目（Project）。** 项目将团队、基础设施或应用彼此隔离：[项目](/user-guide/projects)。
4. **连接自动化所需的资源：**
   - 包含 playbook、模块或脚本的源代码：[仓库（Repository）](/user-guide/repositories)。
   - SSH 密钥、令牌和密码：[密钥库（Key Store）](/user-guide/key-store)。
   - 目标主机和连接设置：[清单（Inventory）](/user-guide/inventory)。
   - 可复用的变量：[变量组（Variable Groups）](/user-guide/environment)。
5. **创建任务模板并运行。** 选择与您的工具对应的指南：[Ansible](/user-guide/apps/ansible)、[Terraform/OpenTofu](/user-guide/apps/terraform)、[Shell](/user-guide/apps/bash)、[PowerShell](/user-guide/apps/powershell) 或 [Python](/user-guide/apps/python)。然后运行并观察结果：[任务（Task）](/user-guide/tasks)。
6. **自动化并投入运营：**
   - 按计划运行：[计划任务（Schedule）](/user-guide/schedules)。
   - 控制谁能做什么：[团队（Team）与自定义角色](/user-guide/team)。
   - 获取结果告警：[通知](/admin-guide/notifications)。

## 核心概念 {#key-concepts}

这些术语在 UI 中随处可见。

| 术语 | 含义 |
|------|---------|
| **项目（Project）** | 最基本的隔离单元。每个项目都有自己的仓库、密钥、清单、模板和团队。[项目](/user-guide/projects) |
| **仓库（Repository）** | 存放 playbook、模块或脚本的 Git 仓库或本地路径。[仓库](/user-guide/repositories) |
| **清单（Inventory）** | 用于 Ansible 风格运行的主机、分组和连接设置。[清单](/user-guide/inventory) |
| **变量组（Variable Group）** | 可复用的变量和环境配置，也称为环境（Environment）。[变量组](/user-guide/environment) |
| **密钥库（Key Store）** | 加密存储的凭据，如 SSH 密钥、令牌和密码。[密钥库](/user-guide/key-store) |
| **任务模板（Task Template）** | 一次运行的定义：应用、仓库、清单、变量和选项。[任务模板](/user-guide/task-templates) |
| **任务（Task）** | 模板的一次执行，包含其日志和状态。[任务](/user-guide/tasks) |
| **工作流（Workflow）** | 由模板组成的图，支持分支、审批和延迟。Pro 功能。[工作流](/user-guide/workflows) |
| **运行器（Runner）** | 任务的执行位置：服务器本身或远程运行器。[运行器](/admin-guide/runners) |

## 后续步骤 {#next-steps}

- 通过[反向代理](/admin-guide/reverse-proxy)为 Semaphore 启用 TLS。
- 连接您的身份提供商：[LDAP](/admin-guide/authentication/ldap) 或 [OpenID Connect](/admin-guide/authentication/openid)。
- 通过 [API](/reference/api) 和 [CLI](/reference/cli) 从 CI 或脚本驱动 Semaphore。
