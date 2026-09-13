# 运行器

`semaphore runner` 命令以**运行器模式**运行 Semaphore，并管理运行器（Runner）在
服务器上的注册。运行器在与 Semaphore 服务器分离的机器上执行任务（Task）。

```bash
semaphore runner --help
```

:::tip
关于运行器的工作原理以及如何配置服务器端，请参阅
[运行器](/admin-guide/runners)指南。
:::

不带子命令运行 `semaphore runner` 只会打印帮助信息。它有以下
子命令：

| 命令 | 用途 |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | 交互式创建运行器配置文件（若提供了令牌则同时完成注册）。 |
| [`runner register`](#registering-a-runner-runner-register) | 使用注册令牌在服务器上注册运行器。 |
| [`runner start`](#starting-a-runner-runner-start) | 以运行器模式运行并开始接受任务。 |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | 从服务器上移除该运行器的注册。 |

所有子命令都接受全局 `--config <path>` 参数来指定运行器
配置文件（以及 `--no-config`，表示仅从环境变量运行）。

## 交互式设置（`runner setup`） {#interactive-setup-runner-setup}

引导你完成交互式设置，写入运行器配置文件；如果有可用的
注册令牌（在提示中输入或通过
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN` 设置），则会立即
向服务器注册运行器。

```bash
semaphore runner setup --config /path/to/config.runner.json
```

传入 `--config <path>` 可选择配置文件的写入位置。
不传时，设置过程会询问输出目录（默认：当前
目录），并在其中写入 `config.runner.json`。

完成后会打印启动运行器的命令，例如：

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

之后你可以手动编辑生成的配置文件，而无需
重新运行设置。

### 运行器配置选项 {#runner-configuration-options}

配置文件中 `runner` 块的字段：

| 字段 | 环境变量 | 说明 |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | 运行器认证令牌（注册时颁发）。 |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | 注册令牌。仅支持环境变量；永远不会写入文件。 |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | 包含注册令牌的文件路径。 |
| `name` | `SEMAPHORE_RUNNER_NAME` | 在服务器上显示的运行器名称。 |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | 用于项目运行器路由的标签 JSON 数组。 |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | 当有任务排队等待此运行器时，服务器调用的 URL。 |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | 运行器是否接受任务。 |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | 项目级运行器所属的项目（Project）ID。全局运行器请省略。 |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | 轮询间隔（秒）。默认：1。 |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | 最大并发任务数。默认：9999。 |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | 处理完一个作业后退出。适用于由 webhook 按需启动的运行器。 |

设置细节请参阅[运行器](/admin-guide/runners)，完整选项列表请参阅
[配置](/admin-guide/configuration)。

## 注册运行器（`runner register`） {#registering-a-runner-runner-register}

在服务器上注册运行器，并将颁发的运行器令牌存入
配置文件（覆盖任何已有令牌）。服务器必须已配置
`runner_registration_token`；你在此处传入的就是同一个令牌。

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| 参数 | 说明 |
|------|-------------|
| `--registration-token-file <path>` | 从文件读取注册令牌。 |
| `--stdin-registration-token` | 从标准输入读取注册令牌。 |
| `--name <name>` | 注册时使用的运行器名称。 |
| `--tags <tags>` | 运行器标签，以逗号分隔或重复传入该参数（例如 `--tags a,b` 或 `--tags a --tags b`）。 |
| `--webhook <url>` | 运行器 webhook URL。 |
| `--enabled` | 在服务器上启用或禁用该运行器。默认为 `true`；传入 `--enabled=false` 可注册一个已禁用的运行器。 |
| `--project-id <id>` | 注册为指定项目的项目级运行器。省略（或为 `0`）时，运行器注册为全局运行器。 |

只有你实际传入的参数才会生效；`--name`、`--webhook`、`--tags`
和 `--enabled` 仅在命令行中设置时才会覆盖配置文件和
环境变量中的对应值。

### 注册令牌的来源 {#where-the-registration-token-comes-from}

注册时，Semaphore 按以下顺序从第一个可用来源
解析注册令牌：

1. `--registration-token-file` 参数。
2. 配置文件中的 `registration_token_file` 设置（或
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`）。
3. 标准输入，当传入 `--stdin-registration-token` 时。
4. `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` 环境变量。

令牌文件存在但为空会被视为错误。如果没有任何来源提供
令牌，则会在不带令牌的情况下尝试注册，而服务器会拒绝该请求。

## 启动运行器（`runner start`） {#starting-a-runner-runner-start}

启动运行器，连接到服务器，并开始接受任务。这是
让已注册的运行器保持在线所需运行的命令。

```bash
semaphore runner start --config /path/to/config.runner.json
```

| 参数 | 说明 |
|------|-------------|
| `--auto-register` | 如果运行器尚未注册（即配置中没有运行器令牌），则在启动前先注册。 |
| `--register` | `--auto-register` 的别名。 |

使用 `--auto-register` 时，如果配置中没有 `token`，Semaphore 会从
`registration_token_file`（或
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`）或
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN` 读取注册令牌，然后每 5
秒重试一次注册直到成功，再重新加载配置并启动。这对于
首次启动时自行注册的运行器（例如在容器中）
非常方便。

`runner start` 不接受 `--registration-token-file` 或
`--stdin-registration-token`；这两个参数仅属于 `runner register`。

## 注销运行器（`runner unregister`） {#unregistering-a-runner-runner-unregister}

使用配置文件中的运行器令牌，从服务器上移除
该运行器的注册。

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
