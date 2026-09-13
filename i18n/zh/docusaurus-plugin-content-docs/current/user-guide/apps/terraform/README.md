
# Terraform/OpenTofu

使用 Semaphore UI 可以运行 Terraform 代码。为此，您需要创建一个 **Terraform Code 模板**（Terraform Code Template）。

1. 进入**任务模板**（Task Templates）部分，点击**新建模板**（New Template）按钮。
2. 选择 **Terraform** 作为应用类型。
3. 设置模板并点击**创建**（Create）按钮。
4. 点击**运行**（Run）执行模板。

## 传递变量 {#passing-variables}

所选**变量组**（Variable Groups）中的变量会作为环境变量注入。为名称加上 `TF_VAR_` 前缀，Terraform 就会将它们作为输入变量读取：

| 变量组键 | Terraform 变量 |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

对于敏感值，请使用变量组中的**密文**（Secrets）标签页——它们在静态存储时是加密的。

## 工作区 {#workspaces}

Semaphore 原生支持 Terraform/OpenTofu 工作区。关于创建和切换工作区以及为私有模块使用 SSH 密钥，请参阅[工作区](./workspaces)。

## 后端覆盖与 HTTP 后端（Pro） {#backend-override-and-http-backend-pro}

您可以在模板中覆盖后端，从而在不修改 Terraform 代码的情况下使用内置的 HTTP 后端。详情请参阅 [HTTP 后端（Pro）](./states)。

## Destroy 标志与状态迁移 {#destroy-flag-and-state-migration}

任务运行对话框包含 `-destroy` 和 `-migrate-state` 开关。在拆除基础设施或迁移 Terraform 状态时使用它们。

## 注意事项 {#notes}

- Semaphore 会在每次运行前自动执行 `terraform init`。
- 除非使用内置的 HTTP 后端（Pro），否则状态由 Terraform 代码中配置的后端（local、S3、GCS 等）管理。
