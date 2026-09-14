# 构建与部署模板

除了普通的 **Task** 模板之外，Semaphore 还有两种模板类型，它们组成一条简单的流水线：**Build** 创建带版本号的制品，**Deploy** 将所选版本发布到服务器。这两种类型都在模板表单中选择，并会改变用户在启动任务（Task）时看到的内容。

## 构建模板 {#build-templates}

构建模板生成制品：tarball、容器镜像或软件包。每个构建任务都会获得一个自动递增的版本号，从模板的 **Start Version** 开始（例如 `1.0.0`）。版本号显示在模板列表的 **Version** 列和任务历史中。

<div class="DialogScreenshot">
  ![构建模板的 New Task 对话框](/assets/task-new-build.webp)
</div>

在 playbook 中通过 `semaphore_vars.task_details.target_version` 使用该版本号来命名制品。

## 部署模板 {#deploy-templates}

部署模板通过 **Build Template** 字段与构建模板关联。当用户点击 **Deploy** 时，New Task 对话框会询问要部署的 **Build Version**；默认预选最近一次成功的构建。

<div class="DialogScreenshot">
![部署模板的 New Task 对话框](/assets/task-new-deploy.webp)
</div>

在部署模板中启用 **Autorun**，即可在每次构建成功后自动启动部署。要部署的版本在 playbook 中以 `semaphore_vars.task_details.incoming_version` 的形式提供。

## `semaphore_vars` 变量 {#the-semaphore_vars-variable}

Semaphore 会将 `semaphore_vars` 变量传递给它运行的每个 Ansible playbook。使用它可以获知运行的任务类型、应构建或部署的版本、任务的运行者以及任务消息。

`build` 任务的示例：

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

`deploy` 任务的示例：

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

对于 **Bash**、**PowerShell** 和 **Python** 模板，Semaphore 以环境变量的形式提供相同的 `task_details` 值：

| `task_details` 字段 | 环境变量 | 说明 |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` 或 `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | 启动任务的用户 |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | 任务消息 |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | 在 `build` 任务中提供 |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | 在 `deploy` 任务中提供 |

Bash 示例：

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

PowerShell 示例：

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Python 示例：

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## 示例流水线 {#example-pipeline}

一个 `build` Ansible 角色：

1. 从 GitHub 获取应用源代码。
2. 编译源代码。
3. 将二进制文件打包为 `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`。
4. 将 tarball 上传到 S3 存储桶。

一个 `deploy` Ansible 角色：

1. 从 S3 存储桶下载 `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` 到目标服务器。
2. 将其解压到目标目录。
3. 创建或更新配置文件。
4. 重启应用服务。

如需串联两个以上的步骤、添加审批或在失败时分支，请使用[工作流](../workflows)。
