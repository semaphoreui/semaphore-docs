# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/) 是 Terraform 和 OpenTofu 的封装工具，可以让配置保持 DRY，并管理模块之间的依赖关系。Semaphore 运行它的方式与 [Terraform/OpenTofu](./terraform) 相同，只有本文所述的少数差异。

## 前置条件 {#prerequisites}

1. 在 Semaphore 服务器或执行任务的[运行器](/admin-guide/runners)（Runner）上安装 `terragrunt` 二进制文件以及 `terraform` 或 `tofu` 二进制文件。
2. 启用 **Terragrunt Code** 应用（App）：它默认处于禁用状态。从账户菜单打开 **Applications**，并打开对应开关，参见[应用](/user-guide/apps)。

## 创建 Terragrunt 模板 {#creating-a-terragrunt-template}

1. 进入**任务模板**（Task Templates），点击 **New Template**。
2. 选择 **Terragrunt Code** 作为应用。
3. 设置**仓库**（Repository）以及包含 `terragrunt.hcl` 的子目录。
4. 在清单（Inventory）字段中选择或创建一个**工作区**（Workspace）。Terragrunt 模板使用类型为 `terragrunt-workspace` 的清单，参见[工作区](./terraform/workspaces)。
5. 点击 **Create**，然后点击 **Run**。

![Terragrunt 模板](/assets/templates-list.webp)

## 运行任务 {#running-tasks}

新建任务（Task）对话框提供与 Terraform 相同的选项：**Plan**、**Destroy**、**Auto Approve**、**Upgrade** 和 **Reconfigure**。

Semaphore 调用 `terragrunt run -- <terraform arguments>`，并通过 `--tf-path` 传入 Terraform 或 OpenTofu 二进制文件，除非你已在模板的 CLI 参数中设置了 `--tf-path`。工作区的选择通过 `terragrunt run -- workspace select -or-create=true <name>` 完成。

所选**变量组**（Variable Groups）中的变量会作为环境变量传递，因此输入变量请使用 `TF_VAR_` 前缀。额外变量和调查变量会以 `-var name=value` 参数的形式传递。

## 说明 {#notes}

- `terragrunt` 会在每条命令之前自动运行 `init`。
- HTTP 状态后端以及 **Workspaces** 选项卡上的状态列表与 Terraform 的工作方式相同，参见 [HTTP 后端](./terraform/states)。
- 若要跨多个模块使用 `run-all`，请在模板的 **CLI args** 中添加相应参数。
