
# HTTP 后端（Pro）

Semaphore UI 的 Terraform HTTP 后端可在 Semaphore 内部直接安全地存储和管理 Terraform 状态文件。该功能在 Pro 版中提供，具有以下几项关键优势。

## 功能 {#features}

- **安全的状态存储**：状态文件<!-- encrypted and-->安全地存储在 Semaphore 内部。
- **状态锁定**：防止对同一状态文件的并发修改。
- **版本历史**：跟踪基础设施状态随时间的变化。
- **UI 集成**：直接通过 Semaphore 界面管理状态文件。

## 配置 {#configuration}

要开始使用内置 HTTP 后端，首先需要为 Terraform 任务模板（Task Template）创建一个工作区。

要添加工作区，请打开 Terraform/OpenTofu 模板的**工作区**（Workspaces）标签页。

创建工作区时，系统会提示您选择一个 SSH 密钥，用于克隆 Terraform 代码中使用的私有模块。如果不使用任何私有模块，直接选择 `None` 选项即可。

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### 在任务中使用 HTTP 后端 {#using-the-http-backend-in-tasks}

要使用内置 HTTP 后端存储 Terraform 任务的状态，您无需在 Terraform 代码中手动配置后端。Semaphore 可以在执行期间自动创建配置文件。要启用此功能，只需在任务模板设置中勾选**覆盖后端设置**（Override backend settings）选项，如下方截图所示。


您还可以选择指定执行期间动态创建的配置文件的名称。如果您的代码中已经包含后端配置文件，并且需要动态覆盖它以配合 Semaphore 的内置后端，这会很有用。

### 在 Semaphore 之外使用 HTTP 后端 {#using-the-http-backend-outside-semaphore}

内置 HTTP 后端不仅可以在 Semaphore 内运行任务时使用，也可以在 Semaphore 之外执行 Terraform 代码时使用，例如从本地终端执行。

为此，Semaphore 允许您为状态存储创建别名（唯一的 HTTP 端点）。通过这些别名，可以方便地从外部环境引用状态文件。

要进行设置，请打开**工作区**标签页，选择所需的工作区并添加别名。您还需要选择一个包含用户名和密码的密钥，用于对后端访问进行身份验证。

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

之后，您需要将后端设置添加到 Terraform 代码中：

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

现在，即使从终端运行，Terraform 也会使用 Semaphore 的内置 HTTP 后端：

```
terraform apply
```
