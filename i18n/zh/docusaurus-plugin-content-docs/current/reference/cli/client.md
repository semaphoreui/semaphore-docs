---
title: 客户端
description: 使用 semaphore client 在终端和脚本中管理 Semaphore 服务器——登录与上下文、配置优先级、输出格式、退出码，以及在 CI 中运行任务。
---

# 客户端

`semaphore client` 通过 REST API 操作正在运行的 Semaphore 服务器。它只需要
服务器 URL 和 API 令牌——无需访问数据库，也无需服务器配置文件——因此可以在
笔记本电脑、CI 作业或从未见过服务器 `config.json` 的主机上使用。

```bash
semaphore client --help
```

命令的形式为 `semaphore client <resource> <action> [id|name]`。
资源名称使用单数形式，复数形式是其别名
（`template list` 与 `templates list` 等价）。每种资源都有 `list`、
`get`、`create`、`update` 和 `delete`；任务还额外提供 `run`、`logs`、`wait`、`stop`
等操作。所有命令和参数的完整生成列表见
[命令参考](/reference/cli/commands#semaphore-client)。

| 命令组 | 用途 |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | 登录、检查令牌、打印令牌、退出登录。 |
| [`context`](/reference/cli/commands#semaphore-client-context) | 在一个配置文件中保存多个服务器，并在它们之间切换。 |
| [`project`](/reference/cli/commands#semaphore-client-project) | 项目及其成员、备份与恢复。 |
| [`template`](/reference/cli/commands#semaphore-client-template) | 任务模板，以及用于启动任务的 `template run`。 |
| [`task`](/reference/cli/commands#semaphore-client-task) | 任务的日志、等待、停止、确认和重新运行。 |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | 项目的其他资源。 |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | 服务器级资源（仅限管理员）。 |
| [`info`](/reference/cli/commands#semaphore-client-info) | 服务器版本和设置。 |

## 首次登录 {#first-login}

交互式登录：客户端会询问登录名、密码，以及在启用 TOTP 时的验证码，
然后创建并保存一个 API 令牌。密码只使用一次，从不保存。

```bash
semaphore client auth login --url https://semaphore.example.com
```

使用已有令牌登录（这也是登录仅提供单点登录的服务器的方式——请在个人资料的
**Tokens** 页面创建令牌）：

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

两种方式都会在 `~/.semaphore/client.yml` 中保存一个以服务器主机名命名的*上下文*，
并将其设为当前上下文。使用 `semaphore client auth status` 查看当前正在使用的配置。

## 配置 {#configuration}

每项设置都可以来自命令行参数、环境变量或当前上下文，优先级顺序为：
**参数 > 环境变量 > 上下文 > 默认值**。

| 参数 | 环境变量 | 含义 |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | 服务器 URL，例如 `https://semaphore.example.com`。 |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | 要使用的上下文名称，代替当前上下文。 |
| — | `SEMAPHORE_CLIENT_TOKEN` | API 令牌。特意没有提供 `--token` 参数：进程参数在 `ps` 和 shell 历史记录中可见。 |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | 保存令牌的文件（末尾的换行符会被忽略）。 |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | 项目级命令所用的项目 ID 或名称。 |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table`（默认）、`json` 或 `yaml`。 |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | 单个 HTTP 请求的超时时间，默认 `30s`。 |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | 包含签发服务器证书的 CA 的 PEM 文件。 |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | 跳过 TLS 验证。每次调用都会打印警告；建议改用 `--ca-cert`。 |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | 从不提示输入；需要回答的命令会直接失败。 |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | 将 HTTP 请求跟踪输出到 stderr。Authorization 和 Cookie 请求头会被遮蔽。 |
| — | `SEMAPHORE_CLIENT_CONFIG` | 配置文件路径，默认 `~/.semaphore/client.yml`。 |

只有当 URL 同样来自环境变量或命令行参数时，才会使用环境变量中的令牌。
这样，当有人使用 `--context other` 运行同一个作业时，CI 令牌不会被发送到其他服务器。

### 配置文件 {#the-configuration-file}

`~/.semaphore/client.yml` 保存命名的上下文。`auth login` 和 `context set`
会写入该文件；你也可以手动编辑它。

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # 或使用 token_file
    project: 3                # 默认项目，ID 或名称
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

客户端以 `0700` 权限创建目录，以 `0600` 权限创建文件。如果文件对所属组或其他用户可写，
客户端会拒绝使用并提示运行 `chmod 600`；如果文件对其他用户可读，则会打印警告。

## 输出 {#output}

数据输出到 stdout；消息、警告和进度输出到 stderr，因此脚本可以只捕获其中之一。

| 参数 | 效果 |
|------|--------|
| `-o json` | 不带任何修饰的有效 JSON。列表始终是数组，空列表为 `[]`。字段名与 API 一致。 |
| `-o yaml` | 以 YAML 格式输出相同的数据。 |
| `--fields id,name,status` | 只输出这些列或字段。嵌套字段用点号表示：`--fields id,params.limit`。 |
| `-q`, `--quiet` | 只输出 ID，每行一个——适用于 `xargs` 和循环。 |
| `--no-headers` | 输出不带表头行的表格。 |
| `--no-color` | 不使用颜色。当 stdout 不是终端或设置了 `NO_COLOR` 时，颜色也会关闭。 |

当 stdout 不是终端时，表格各列以制表符分隔，且从不截断。

对象可以通过数字 ID 或名称来指定。名称在项目内查找，不区分大小写；
当多个对象同名时，命令以退出码 5 结束，并在 stderr 中列出候选对象。

## 退出码 {#exit-codes}

| 退出码 | 含义 |
|------|---------|
| `0` | 成功。对于等待类命令：任务以 `success` 结束。 |
| `1` | 客户端或 API 错误——网络故障、服务器错误、意外的响应。 |
| `2` | 用法错误：未知参数、缺少参数、未指定项目，或在没有终端的情况下需要确认（请传入 `--yes`）。 |
| `3` | 所等待的任务以 `error` 状态结束。 |
| `4` | 认证失败（HTTP 401 或 403）。 |
| `5` | 未找到对象，或名称匹配到多个对象。 |
| `6` | 所等待的任务以 `stopped` 状态结束。 |
| `124` | `--wait-timeout` 已超时。任务仍在服务器上继续运行。 |
| `130` | 被 Ctrl+C 中断。客户端断开连接；除非指定了 `--stop-on-interrupt`，否则任务会继续运行。 |

## 在脚本中运行任务 {#running-tasks-from-scripts}

完全通过环境变量配置 CI 作业，并由退出码决定结果：

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# 启动任务，实时输出其日志，并根据最终状态以 0/3/6 退出
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# 现在启动，稍后等待
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` 和 `--extra-vars-file` 用于填写任务的额外变量；
`--inventory`、`--branch`、`--limit`、`--tags`、`--check` 和 `--diff` 用于覆盖
模板允许覆盖的设置。需要确认的模板会让任务停留在 `waiting_confirmation` 状态；
`task confirm <id>` 可让其继续执行。

对于表格中未显示的内容，可将 `-o json` 与 `jq` 结合使用：

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## 机密与令牌 {#secrets-and-tokens}

- 令牌从不被打印，`auth token` 除外：该命令的用途就是把令牌交给其他工具，
  并且在 stdout 是终端时会发出警告。
- 密码和密钥内容只能从文件或 stdin 读取：
  `key create --ssh-key-file`、`--password-file`、`--password-stdin`、
  `user create --password-stdin`。环境的机密通过
  `environment create --secrets-file` 传入。
- `environment get` 和 `key get` 在所有输出格式中都只显示机密的名称，从不显示其值。
- `auth logout --revoke` 会同时在服务器端和本地删除令牌。
- 破坏性命令在终端中会请求确认，在没有终端时则需要 `--yes`；
  `project delete` 需要通过 `--confirm` 提供项目名称。
