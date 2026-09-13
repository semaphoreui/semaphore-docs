# 任务

任务（Task）是[任务模板](./task-templates)的一次执行：运行一次 Ansible playbook、一个 Terraform/OpenTofu/Terragrunt 配置，或一个 Bash、PowerShell 或 Python 脚本。每个任务都保留自己的日志、状态和详情，因此你始终可以看到运行了什么、何时运行、由谁运行，以及使用了仓库（Repository）的哪个修订版本。

## 启动任务 {#starting-a-task}

你需要在项目（Project）中拥有 **Task Runner** 或更高角色（请参阅[团队](./team)）。可以在以下两个位置之一启动任务：

- 在**任务模板（Task Templates）**中，点击模板所在行的 **play** 按钮。
- 在模板页面，点击右上角的按钮。按钮的标签取决于模板类型：**Run**、**Build** 或 **Deploy**。

两者都会打开 **New Task** 对话框。对话框的内容取决于应用（App）以及模板中启用的选项。

![Ansible 模板的 New Task 对话框](/assets/task-new-ansible.webp)

| 字段 | 显示条件 | 说明 |
|---|---|---|
| **Message** | 所有模板 | 可选备注，随任务保存，并显示在历史记录和告警中。 |
| **Build Version** | 部署模板 | 要部署的构建版本。默认选择最新的成功构建。请参阅[构建与部署模板](./task-templates/build-deploy)。 |
| 调查变量 | 带有[调查变量](./task-templates/survey-vars)的模板 | 每个变量一个输入框；必填变量必须填写。 |
| **Dry Run** `--check`、**Diff** `--diff` | Ansible | 以检查模式运行 playbook，或显示文件变更。其他 Ansible 提示（Limit、Tags、Skip tags、Debug）在模板中启用后才会显示，请参阅[提示](./task-templates/prompts)。 |
| **Plan**、**Destroy**、**Auto Approve**、**Upgrade**、**Reconfigure** | Terraform、OpenTofu、Terragrunt | 只运行 `plan`，或添加 `-destroy`、`-auto-approve`、`-upgrade` 或 `-reconfigure`。请参阅 [Terraform/OpenTofu](./apps/terraform)。 |
| **Branch**、**Inventory**、**CLI args** | 任意应用 | 为本次运行覆盖模板中的值。每项覆盖都必须在模板设置中允许。 |

![Terraform 模板的 New Task 对话框](/assets/task-new-terraform.webp)

点击 **Run**（或 **Build** / **Deploy**）将任务放入队列。

### 队列与并行执行 {#queue-and-parallel-execution}

除非模板中启用了 **Allow parallel tasks**，同一模板的任务会依次运行。项目还可以通过[项目设置](./projects/settings)中的 **Max number of parallel tasks** 限制同时运行的任务总数。需要等待的任务会保持 `waiting` 状态，并在有空闲槽位时自动启动。

## 任务窗口 {#task-window}

在 UI 中的任意位置点击任务都会打开任务窗口。窗口头部显示模板、任务编号、仓库修订版本的提交信息、状态徽章、任务的启动者和启动时间，以及持续时间。箭头图标可将窗口展开为全屏。

![任务日志](/assets/task-log.webp)

| 选项卡 | 内容 |
|---|---|
| **Log** | 带时间戳的任务实时输出。任务运行期间日志会持续流式传输。**Raw log** 在新的浏览器标签页中打开未经处理的输出。 |
| **Details** | 模板信息（应用、模板）、提交信息（提交消息和哈希），以及运行信息：消息、创建时间、开始时间、结束时间、持续时间，以及（如果设置了）本次运行使用的运行器（Runner）、分支、limit 和变量。 |
| **Summary**（Pro） | 对于 Ansible 任务：显示多少台主机成功完成、多少台失败，并附带每台服务器上失败任务的表格。 |

![任务详情](/assets/task-details.webp)

![任务摘要](/assets/task-summary.webp)

## 任务状态 {#task-statuses}

| 状态 | 含义 |
|---|---|
| `waiting` | 任务在队列中：同一模板的另一个任务正在运行、已达到项目限制，或尚无可用的运行器。 |
| `starting` | 运行器已接手任务，正在准备仓库和环境。 |
| `waiting_confirmation` | 工具提出了问题并等待用户响应，例如未启用 **Auto Approve** 的 `terraform apply`，或读取输入的脚本。在任务窗口中使用 **Confirm** 或 **Reject**。 |
| `confirmed` | 用户已确认该问题；任务继续执行。 |
| `rejected` | 用户拒绝了该问题；任务结束。 |
| `running` | playbook 或脚本正在执行。 |
| `stopping` | 已请求停止，进程正在被终止。 |
| `stopped` | 任务已被用户停止。 |
| `success` | 以退出码 0 结束。 |
| `error` | 以非零退出码结束，或启动失败。在 UI 中显示为 **Failed**。 |

## 停止任务 {#stopping-tasks}

打开正在运行的任务的任务窗口，点击 **Stop**。Semaphore 会发送终止信号，任务在进程退出期间进入 `stopping` 状态。如果进程没有响应，按钮会变为 **Force Stop**；点击它可立即杀死进程。

要停止某个模板的所有正在运行和排队中的任务，打开模板页面并使用 **Stop all**。下拉菜单同时提供 **Stop** 和 **Force stop**。

<div style={{maxWidth: 200}}>

![Stop all 菜单](/assets/task-stop-all-menu.webp)

</div>

## 重新运行任务 {#running-a-task-again}

在模板的 **Tasks** 选项卡中，每一行都有一个 **rerun** 按钮。它会打开 New Task 对话框，并预先填入该任务的消息和参数。

![带重新运行按钮的模板任务列表](/assets/template-tasks.webp)

## 任务的列出位置 {#where-tasks-are-listed}

- **Dashboard → History**：项目的所有任务，请参阅[历史记录](./projects/history)。
- **模板页面 → Tasks**：单个模板的任务。
- **任务模板**：点击左侧的箭头展开某一行，无需离开列表即可查看该模板的最新任务。

## 日志保留 {#log-retention}

默认情况下，任务和日志会永久保留。使用 `max_tasks_per_template` 可以只保留每个模板的最新任务，请参阅[历史记录](./projects/history#task-retention)。
