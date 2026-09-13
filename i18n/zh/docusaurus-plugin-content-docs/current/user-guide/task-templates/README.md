# 任务模板

任务模板（Task Template）定义要运行什么以及如何运行：应用、仓库和要执行的文件、清单、变量组、凭据，以及用户在启动任务时可以更改的选项。每个[任务](../tasks)都是从模板创建的。

模板支持以下应用：

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) 和 [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

管理员可以启用或禁用应用（App）并添加自己的应用，参见[应用](/user-guide/apps)。

## 模板列表 {#template-list}

**Task Templates** 区域列出项目（Project）的所有模板。

![模板列表](/assets/templates-list.webp)

| 列 | 内容 |
|---|---|
| **Name** | 模板名称及应用图标。**play** 按钮启动新任务。 |
| **Version** | 对于构建和部署模板，显示最新的构建版本；否则显示最后一个任务的结果图标。 |
| **Status** | 最后一个任务的状态徽章，或 *Not launched*。 |
| **Last Task** | 最后一个任务的编号及启动者。 |
| **Playbook** | 模板运行的文件。 |
| **Inventory**、**Variable Groups**、**Repository** | 附加到模板的资源。 |

列表上方的选项卡是[视图](./views)：即命名的模板分组。右上角的齿轮图标让你选择显示哪些列。点击行左侧的箭头可展开该模板的最新任务。

![展开的模板行](/assets/templates-list-expanded.webp)

## 模板页面 {#template-page}

点击模板名称可打开其页面。右上角的按钮用于启动任务（根据类型显示为 **Run**、**Build** 或 **Deploy**），**Stop all** 会停止该模板所有正在运行或排队中的任务。

| 选项卡 | 内容 |
|---|---|
| **Tasks** | 此模板的任务，每行都有一个 **rerun** 按钮。 |
| **Details** | playbook、类型、清单（Inventory）、变量组（Variable Groups）和仓库（Repository），以及任务状态图表，其筛选条件与[统计](../projects/stats)相同。 |
| **Workspaces** | 仅限 Terraform、OpenTofu 和 Terragrunt 模板：工作区列表，参见[工作区](../apps/terraform/workspaces)。 |

![模板详情](/assets/template-details.webp)

## 模板类型 {#template-types}

| 类型 | 用途 |
|---|---|
| **Task** | 普通运行。默认类型。 |
| **Build** | 生成制品并为其分配自动递增的版本号。 |
| **Deploy** | 部署由构建模板生成的某个版本。 |

构建和部署模板以及它们传递给 playbook 的 `semaphore_vars` 在[构建与部署模板](./build-deploy)中介绍。

## 模板表单 {#template-form}

拥有 **Manager** 或更高角色的用户可以通过 **New Template** 和铅笔图标创建和编辑模板。表单按以下分组组织。标有应用名称的字段仅对该应用显示。

### 通用字段 {#common-fields}

| 字段 | 说明 |
|---|---|
| **Name** | 必填。模板名称。 |
| **Description** | 可选文本，显示在名称下方。 |
| **App** | 要运行的应用。 |
| **Repository** | 包含 playbook 或脚本的仓库，参见[仓库](../repositories)。 |
| **Branch** | 要检出的 Git 分支。留空表示使用仓库中配置的分支。 |
| **Playbook / Script filename** | 文件相对于仓库根目录的路径。对于 Terraform 应用：包含配置的子目录。 |
| **Different working directory** | 从仓库的另一个目录运行工具。 |
| **Inventory** | Ansible 清单，对于 Terraform 应用则为工作区。 |
| **Variable Groups** | 一个或多个变量组，其变量和密钥会注入到任务中，参见[变量组](../environment)。 |
| **Vault password**（Ansible） | 用于解锁 Ansible Vault 的密钥，参见[多个 vault 密码](../apps/ansible#multiple-vault-passwords)。 |
| **View** | 在哪个[视图](./views)选项卡中显示该模板。 |
| **CLI args** | 以 JSON 数组形式提供的额外命令行参数，例如 `["-vvv"]`。 |

### 类型专用字段 {#type-specific-fields}

| 字段 | 类型 | 说明 |
|---|---|---|
| **Start Version** | Build | 要分配的第一个版本号，例如 `1.0.0`。 |
| **Build Template** | Deploy | 此模板所部署制品对应的构建模板。 |
| **Autorun** | Deploy | 每次构建成功后自动启动部署。 |

### 高级选项 {#advanced-options}

| 字段 | 说明 |
|---|---|
| **Allow parallel tasks** | 允许此模板的多个任务同时运行，参见[并行任务](#parallel-tasks)。 |
| **Alerts**、**Send on success**、**Send on error** | 是否为此模板的任务发送通知，以及在哪些结果下发送。通知还需要在[项目设置](../projects/settings)中启用 **Allow alerts for this project**。 |
| **Runner tag**（Pro） | 仅在带有此标签的运行器（Runner）上运行任务，参见[项目运行器](../projects/runners)。 |
| **Executor image** | 用于 Docker 和 Kubernetes 运行器的容器镜像，参见[执行器镜像](#executor-image-docker-and-kubernetes-runners)。 |
| **Issue JWT to task runner**、**JWT audience**、**JWT TTL** | 为任务提供签名令牌，参见[任务 JWT](./jwt)。 |
| **Auto-run task if new git commit have been found** | 按给定的时间间隔轮询仓库，并在分支有新提交时启动任务。 |
| **Survey variables** | 用户在启动任务时填写的输入项，参见[调查变量](./survey-vars)。 |

### 提示 {#prompts}

提示（Prompts）是一组复选框，允许用户在 New Task 对话框中更改内置选项：分支、清单、CLI 参数，以及对于 Ansible 的 limit、tags、skip tags、调试级别和 Galaxy 安装。参见[提示](./prompts)。

### 应用选项 {#application-options}

- **Ansible**：limit、tags、skip tags 和 Galaxy 安装选项，参见 [Ansible](../apps/ansible)。
- **Terraform/OpenTofu/Terragrunt**：自动批准和后端覆盖，参见 [Terraform/OpenTofu](../apps/terraform) 和 [HTTP 后端](../apps/terraform/states)。

---

## 并行任务 {#parallel-tasks}

默认情况下，同一模板的任务按顺序执行。要允许同一模板并发运行，请在模板设置中启用 "Allow parallel tasks" 选项。

## 执行器镜像（Docker 和 Kubernetes 运行器） {#executor-image-docker-and-kubernetes-runners}

当项目运行器使用 **Docker**（Pro）或 **Kubernetes**（Enterprise）执行器时，每个任务通常在运行器上配置的默认作业镜像（例如 `semaphoreui/job:latest`）中运行。你可以按模板覆盖该镜像。

1. 打开模板设置
2. 将 **Executor image** 设置为容器镜像引用（例如 `my-registry/ansible:2.16` 或 `semaphoreui/job:latest`）
3. 保存模板

**行为**：
- 只有 **Docker** 和 **Kubernetes** 运行器执行器会遵循此字段；本地执行器会忽略它
- 将字段留空则使用运行器的默认镜像，即 `runner.executor.docker.image` 或 `runner.executor.k8s.image`
- 在 UI 中清空该字段即可移除覆盖

**使用场景**：
- 需要不同工具链的模板（旧版本 Ansible、特定版本的 Terraform、内置于自定义镜像中的额外操作系统软件包）
- 为安全敏感的模板使用隔离镜像，而无需更改运行器范围的默认值

默认镜像设置参见[运行器配置](/admin-guide/configuration)，执行器设置参见[项目运行器](/user-guide/projects/runners)。
