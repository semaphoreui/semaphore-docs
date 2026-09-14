
# Shell/Bash 脚本

Semaphore 可以使用 `/bin/bash` 运行 shell 脚本。为此，请创建一个 **Bash Script** 任务模板（Task Template）。

## 创建 Bash 模板 {#creating-a-bash-template}

1. 进入**任务模板**（Task Templates）部分，点击**新建模板**（New Template）按钮。
2. 选择 **Bash** 作为应用类型。
3. 配置模板：

| 字段 | 说明 |
|---|---|
| **名称（Name）** | 模板的描述性名称 |
| **仓库（Repository）** | 包含 shell 脚本的仓库 |
| **Playbook / 脚本（Playbook / Script）** | 脚本的相对路径，例如 `scripts/deploy.sh` |
| **变量组（Variable Groups）** | 其值将作为环境变量注入的变量组 |

4. 点击**创建**（Create）。
5. 点击**运行**（Run）执行模板。脚本模板的新建任务对话框只包含可选的消息，以及模板定义的调查变量和提示（如果有）。

<div class="DialogScreenshot">

![Bash 模板的新建任务对话框](/assets/task-new-bash.webp)

</div>

## 向脚本传递变量 {#passing-variables-to-scripts}

所选**变量组**中的变量会作为环境变量注入。在脚本中通过 `$VARIABLE_NAME` 访问它们：

```bash
#!/bin/bash
echo "Deploying to $TARGET_HOST"
```

## 注意事项 {#notes}

- 确保脚本可执行（`chmod +x`），或以有效的 shebang（`#!/bin/bash`）开头。
- 脚本以非交互方式运行。避免等待用户输入的提示。
- 退出码 `0` 表示成功；任何非零退出码都会将任务标记为失败。
- 如果非常短的脚本没有产生日志输出，请参阅故障排除指南中的 [Bash 脚本输出缺失或不完整](/faq/troubleshooting#bash-script-output-is-missing-or-incomplete)。
- 要在远程主机上运行命令，请改用 [Ansible](./ansible)。
