# 项目

项目（Project）是 Semaphore UI 中最主要的隔离单元。你使用的每个资源都恰好属于一个项目：任务模板（Task Templates）、任务（Task）、清单（Inventory）、变量组（Variable Groups）、密钥、仓库（Repository）、集成（Integration）、计划任务（Schedule）、运行器（Runner）以及团队（Team）成员。

项目之间彼此独立，因此你可以用它们在同一个 Semaphore 安装中组织互不相关的系统：不同的团队、基础设施、环境或应用。

## 项目导航 {#project-navigation}

打开项目后，左侧边栏顶部显示项目切换器，其下是项目的所有分区。在项目名称下方可以看到你在该项目中的角色（例如 `task_runner`）。角色决定了你可以修改哪些分区；请参阅[团队](./team)。

![显示 History 选项卡的项目仪表盘](/assets/project-dashboard-history.webp)

| 分区 | 内容 |
|---|---|
| **Dashboard** | 包含 [History](./projects/history)、[Stats](./projects/stats)、[Activity](./projects/activity) 选项卡，项目所有者还可看到 [Settings](./projects/settings) |
| **Task Templates** | 定义运行什么以及如何运行：[任务模板](./task-templates) |
| **Workflows**（Pro） | 带审批和分支的模板图：[工作流（Workflow）](./workflows) |
| **Schedule** | 模板的类 cron 计划：[计划任务](./schedules) |
| **Inventory** | Ansible 的主机和连接设置，Terraform 的工作区：[清单](./inventory) |
| **Variable Groups** | 注入到任务中的可复用变量和密钥：[变量组](./environment) |
| **Key Store** | 加密凭据和外部密钥存储：[密钥库（Key Store）](./key-store) |
| **Repositories** | 存放 playbook 和脚本的 Git 仓库或本地路径：[仓库](./repositories) |
| **Integrations** | 用于启动任务的入站 webhook：[集成](./integrations) |
| **Team** | 成员及其角色：[团队](./team) |
| **Runners**（Pro） | 附加到此项目的运行器：[项目运行器](./projects/runners) |

侧边栏底部是深色模式开关、语言切换器和你的[账户菜单](./account)。

## 创建项目 {#creating-a-project}

管理员可以创建项目。普通用户只有在服务器选项 `non_admin_can_create_project`（`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`）启用时才能创建项目，请参阅[配置](/admin-guide/configuration)。

1. 点击侧边栏顶部的项目名称，选择 **New Project**。
2. 填写表单：

| 字段 | 说明 |
|---|---|
| **Project Name** | 项目的显示名称。之后可以在[设置](./projects/settings)中修改。 |
| **Max number of parallel tasks** | 可选。此项目同时可运行的任务数量。留空表示不限制。超出限制的任务会以 `waiting` 状态在队列中等待。 |
| **Demo** | 用示例数据填充新项目：一个公开的演示仓库、一个清单、一个密钥和若干任务模板。可用于在不做任何配置的情况下试用 Semaphore。 |

3. 点击 **Create**。

创建项目的用户将成为该项目的**所有者（Owner）**。

## 切换项目 {#switching-between-projects}

点击侧边栏顶部的项目名称，可以查看你所属的所有项目并在它们之间切换。浏览器会记住最后打开的项目。

## 备份与恢复 {#backup-and-restore}

项目可以导出为 JSON 文件，并导入到同一个或另一个 Semaphore 实例中：

- **导出**：打开 **Dashboard → Settings**，点击 **Backup project**（请参阅[设置](./projects/settings)）。
- **导入**：点击侧边栏中的项目名称，选择 **Restore project**，然后上传备份文件。

这两项操作也可以通过命令行完成，请参阅 [CLI：项目](/admin-guide/cli/projects)。
