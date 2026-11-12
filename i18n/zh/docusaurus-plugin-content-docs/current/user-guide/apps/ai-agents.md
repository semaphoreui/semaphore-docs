---
title: AI 智能体
description: 创建 Claude Code 或 Codex 智能体模板，及其提示词与提示词表达式、API 密钥、MCP 服务器、CLI 参数和任务日志。
---

# AI 智能体

使用 Semaphore UI 可以运行 AI 编程智能体：[Claude Code](https://docs.claude.com/en/docs/claude-code/overview) 和 [Codex](https://developers.openai.com/codex/cli)。智能体模板会在仓库的某个目录中启动智能体的命令行工具，并向它提供提示词。智能体独立工作，没有人回答它的问题，并把自己所做的事情报告到任务日志中。

:::note

AI 智能体模板自 **Semaphore 2.21** 起可用。

:::

凡是您原本会向同事描述的工作，都可以交给智能体模板：审查最近一次提交、找出并修复失败的测试、更新某个依赖并发起 pull request。与其他模板一样，它可以手动启动，也可以由[计划任务](/user-guide/schedules)、[集成](/user-guide/integrations)或[工作流](/user-guide/workflows)启动。

## 开始之前 {#before-you-begin}

- **智能体的命令行工具已安装**在执行任务的机器上：Semaphore 服务器或[运行器（Runner）](/admin-guide/runners)。

  | 应用 | ID | 命令 | 安装 |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore 启动时如果在 `PATH` 中找到某个应用的命令，就会启用该应用。管理员也可以在[应用](/user-guide/apps#managing-applications)页面启用它并设置可执行文件的路径。
- 模型提供商的 **API 密钥**，参见 [API 密钥](#api-key)。
- 智能体工作所在的**仓库**，需已添加到[仓库](/user-guide/repositories)中。

## 创建模板 {#create-a-template}

1. 进入**任务模板**（Task Templates）部分，点击**新建模板**（New Template），然后选择 **Claude Code Agent** 或 **Codex Agent**。

![包含 Claude Code Agent 和 Codex Agent 两项的新建模板菜单](/assets/agent-template-new.webp)

2. 设置模板。

![Claude Code Agent 模板的编辑器](/assets/agent-template-editor.webp)

模板允许您指定以下参数：

| 字段 | 说明 |
|---|---|
| **仓库（Repository）** | 智能体工作所在的仓库。与其他模板一样，Semaphore 会在任务开始前克隆或更新它。 |
| **子目录路径（Subdirectory path）** | 可选。启动智能体的仓库目录。若省略，智能体在仓库根目录启动。 |
| **MCP 服务器（MCP servers）** | 可选。一个 MCP 清单，其中的服务器所提供的工具可供智能体调用，参见 [MCP 服务器](#mcp-servers)。 |
| **变量组（Variable Groups）** | 供智能体使用的变量和机密：API 密钥、[提示词表达式](#prompt-expressions)的取值、智能体进程的环境变量。 |
| **提示词（Prompt）** | 智能体运行时所依据的指令，参见[提示词](#prompt)。 |
| **CLI 参数（CLI args）** | 智能体命令的额外参数，参见 [CLI 参数](#cli-arguments)。 |
| **调查变量（Survey Variables）** | 启动任务时提出的问题。答案可以放入提示词中。 |
| **提示词**（Prompt）复选框 | 位于 **Claude Code 提示**（Claude Code prompts）或 **Codex 提示**（Codex prompts）下。允许启动任务的人替换提示词，参见[任务的提示词](#prompt-of-a-task)。 |

3. 点击**保存**（Save），然后用**运行**（Run）按钮运行模板。

## API 密钥 {#api-key}

智能体从环境变量中获取 API 密钥。请将密钥作为**机密环境变量**添加到模板的[变量组](/user-guide/environment)（Variable Group）中：

| 应用 | 变量 | 同样接受 |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

运行 Semaphore 的用户的登录信息不会被使用：每个任务都有自己独立的、空的智能体配置目录，因此变量组中的密钥是唯一的认证方式。

如果这些变量一个都没有设置，任务日志会指出应添加哪一个，随后智能体自身会以它自己的错误失败：

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## 提示词 {#prompt}

提示词就是您会输入给智能体的内容：纯文本，长度不限。它通过标准输入传给智能体，因此不会出现在进程列表中。

提示词是必填的，除非**提示词**（Prompt）复选框允许任务自带提示词。

### 提示词表达式 {#prompt-expressions}

模板的提示词可以从模板的变量组中取值。像在 GitHub Actions 中那样用双花括号书写表达式，Semaphore 会在任务启动时将其替换：

| 表达式 | 值 |
|---|---|
| `${{ vars.extra.NAME }}` | 变量组的额外变量。 |
| `${{ vars.env.NAME }}` | 变量组的环境变量。 |
| `${{ secrets.extra.NAME }}` | 变量组的机密额外变量。 |
| `${{ secrets.env.NAME }}` | 变量组的机密环境变量。 |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

规则如下：

- **调查变量**属于额外变量：调查变量 `version` 的答案是 `${{ vars.extra.version }}`，机密的调查变量则是 `${{ secrets.extra.NAME }}`。以环境变量形式传递的调查变量位于 `env` 下。未回答的调查变量得到空字符串。
- **变量不存在会使任务失败**，此时智能体尚未启动，错误消息会指出相应的表达式。Semaphore 不会让智能体带着有缺口的提示词运行。
- **拼写错误的表达式在保存模板时会被拒绝**：`${{ secrets.TOKEN }}` 中没有 `extra` 或 `env`。
- **其他表达式保持原样**。只有 `vars.…` 和 `secrets.…` 属于 Semaphore，因此提示词可以要求智能体编写一个包含 `${{ github.sha }}` 的工作流。要让 `vars` 或 `secrets` 表达式保留为文本，请在它前面再加一个美元符号：`$${{ secrets.env.NAME }}`。
- **值按原样填入**。字符串按书写的内容使用，列表或对象以 JSON 形式填入。填入的值不会再次被查找表达式。
- **填入提示词的机密会被遮蔽**：无论智能体在何处重复它，任务日志中都不会显示。

:::warning

提示词中的机密会随提示词的其余部分一起发送给模型提供商，智能体可以按提示词允许的任何方式使用它。建议把机密交给智能体的工具：作为变量组的机密环境变量，或作为 [MCP 服务器](#mcp-servers)的令牌。

:::

### 任务的提示词 {#prompt-of-a-task}

启用**提示词**（Prompt）复选框后，任务表单会显示模板的提示词，并允许您为单次运行修改它。计划任务、集成或工作流步骤也可以用同样的方式保存各自的提示词。通过 API 调用时，请在任务参数中发送它：

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

任务提供的提示词会完全按其书写的内容使用：**只有存储在模板中的提示词才会替换提示词表达式**。这样，只能运行任务的人就接触不到项目的变量和机密。如果模板不允许，自带提示词的任务会被拒绝。

## MCP 服务器 {#mcp-servers}

智能体可以调用远程 [MCP](https://modelcontextprotocol.io) 服务器的工具：问题跟踪系统、文档搜索、您自己的服务。这些服务器保存在 **MCP Inventory** 类型的清单中，同一个清单可同时供 Claude Code 和 Codex 模板使用。

1. 进入**清单**（Inventory）部分，点击**新建清单**（New Inventory），然后选择 **MCP Inventory**。
2. 添加服务器并点击**保存**（Save）。
3. 在模板的 **MCP 服务器**（MCP servers）字段中选择该清单。

![包含三个服务器的 MCP 清单表单](/assets/agent-mcp-inventory.webp)

| 字段 | 说明 |
|---|---|
| 开关 | 被关闭的服务器仍保留在列表中，但不会提供给智能体。 |
| **名称（Name）** | 智能体识别该服务器所用的名称：最多 64 个字母、数字、`-` 和 `_`。它在任务日志中显示在工具名称之前。 |
| **URL** | 通过 HTTP 或 SSE 使用 MCP 协议的服务器的 `http` 或 `https` 地址。不接受 URL 中带有用户名或密码。 |
| **令牌（Token）** | 可选。智能体将它作为 bearer 令牌放在 `Authorization` 请求头中发送。 |

已保存的令牌以加密形式存储，且不会再次显示：输入新令牌即可替换它，或点击叉号将其删除。令牌以智能体进程的环境变量的形式传给智能体；它不会被写入智能体的配置文件、命令行或任务日志。

所选服务器的工具会被预先批准，因为没有人在场确认调用。智能体得到的正是这些服务器：为运行 Semaphore 的用户配置的 MCP 服务器不会被使用。

## CLI 参数 {#cli-arguments}

**CLI 参数**（CLI args）会追加到智能体的命令中，位于 Semaphore 自行设置的参数之后。请将每个词元作为单独的参数输入：

```json
["--model", "claude-sonnet-5-5"]
```

用它们来设置智能体自身命令行所提供的选项：模型、限制、权限。智能体在无人值守的情况下运行，因此需要请求确认的工具会直接被拒绝；智能体可以不经询问使用哪些工具，由它的参数决定。您所用版本的选项请参见 [Claude Code CLI 参考](https://docs.claude.com/en/docs/claude-code/cli-reference)和 [Codex CLI 参考](https://developers.openai.com/codex/cli/reference)。

在**提示**（Prompts）下启用 **CLI 参数**（CLI args）后，任务可以添加自己的参数。

变量组中的变量和机密不会被添加到智能体的命令行中，因为进程列表会显示它们。环境变量和机密环境变量会传递给智能体的进程。

## 智能体如何运行 {#how-the-agent-runs}

Semaphore 在仓库目录或其**子目录路径**（Subdirectory path）中启动智能体，并通过标准输入传入提示词：

| 应用 | 命令 |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **每个任务都有自己的智能体配置目录**（`CLAUDE_CONFIG_DIR`、`CODEX_HOME`），它为该任务创建，并在任务结束后删除。运行 Semaphore 的用户的设置、登录信息和 MCP 服务器不会传到智能体，变量组中的变量也无法重定向该目录。
- **任务之间不保留任何内容**：每次运行都是智能体的一个新会话。需要在运行之后保留下来的东西应放在仓库中：一次提交、一个 pull request、一个文件。
- **智能体会读取仓库中的指令文件**，即它的命令行工具在工作目录中自行读取的那些文件，例如 `CLAUDE.md` 或 `AGENTS.md`。
- **在 Docker 和 Kubernetes 运行器上**，智能体在容器中运行，因此[执行器镜像](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)必须包含 `claude` 或 `codex` 命令。

## 任务日志 {#task-log}

任务日志会实时显示智能体的工作过程：

![Claude Code 任务的日志：模型、工具调用、子智能体、摘要](/assets/agent-task-log.webp)

- 智能体的**文本**，逐行显示。Codex 在一条消息完成后才输出它。
- **工具调用**，每次调用占一行：状态、MCP 服务器和工具、参数。点击某一行可查看参数和结果。失败的调用一开始就是展开的。
- **子智能体**：子智能体的行会标有它的名称。
- Claude Code 运行的**第一行**列出模型和 MCP 服务器，未能连接的服务器以红色显示。
- 末尾的**摘要**：轮次数、耗时、token 用量和费用，以智能体报告的内容为准。

**Raw log** 以纯文本形式显示同一份日志。

## 安全 {#security}

- **智能体会执行命令**。在其命令行工具授予的权限范围内，智能体可以读取和修改仓库目录、以执行任务的用户身份运行程序，并调用其 MCP 服务器的工具。给予智能体模板的访问权限，应与您给予他人编写的脚本的权限相同：权限刚好够完成工作的仓库和令牌，以及一个单独的[运行器](/admin-guide/runners)，用于您希望与服务器隔离开的工作。
- **提示词以及智能体读取的内容会发送给模型提供商**：仓库中的文件、命令的输出、工具的结果。
- **仓库可以向智能体下达指令**。智能体读取的文件、某个 issue 或工具结果中的文本都可能改变智能体的行为。不要让持有高权限令牌的智能体去处理您无法控制的内容。
- **令牌和机密在任务日志中会被遮蔽**：MCP 服务器的令牌和填入提示词的机密会被替换为 `********`。
- **只有存储在模板中的提示词才能使用变量和机密**，参见[任务的提示词](#prompt-of-a-task)。
