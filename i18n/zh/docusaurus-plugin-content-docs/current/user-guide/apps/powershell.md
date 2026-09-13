
# PowerShell

Semaphore 可以在 Windows 主机上（或通过 Windows 运行器）运行 PowerShell 脚本。为此，请创建一个 **PowerShell** 任务模板（Task Template）。

## 创建 PowerShell 模板 {#creating-a-powershell-template}

1. 进入**任务模板**（Task Templates）部分，点击**新建模板**（New Template）按钮。
2. 选择 **PowerShell** 作为应用类型。
3. 配置模板：

| 字段 | 说明 |
|---|---|
| **名称（Name）** | 模板的描述性名称 |
| **仓库（Repository）** | 包含 `.ps1` 脚本的仓库 |
| **Playbook / 脚本（Playbook / Script）** | 脚本的相对路径，例如 `scripts/deploy.ps1` |
| **变量组（Variable Groups）** | 其值将作为环境变量注入的变量组 |

4. 点击**创建**（Create）。
5. 点击**运行**（Run）执行模板。

## 向脚本传递变量 {#passing-variables-to-scripts}

所选**变量组**中的变量会在脚本运行前作为环境变量注入。在 PowerShell 中通过 `$env:VARIABLE_NAME` 访问它们：

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## 在 Windows 主机上运行 {#running-on-windows-hosts}

PowerShell 模板需要满足以下条件之一：
- **Windows 运行器**（Runner）——部署在 Windows 主机上的 Semaphore 运行器。参见[运行器](/admin-guide/runners)。
- Semaphore 服务器本身运行在 Windows 上。

## 注意事项 {#notes}

- 脚本以非交互方式运行。避免需要用户输入的提示。
- 退出码 `0` 表示成功；任何非零退出码都会将任务标记为失败。
