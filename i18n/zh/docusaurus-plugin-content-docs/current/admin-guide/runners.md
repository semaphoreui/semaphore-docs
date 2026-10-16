# 运行器

运行器（Runner）允许在独立于 Semaphore UI 的另一台服务器上执行任务（Task）。

Semaphore 运行器的工作原理与 GitLab 或 GitHub Actions 的运行器相同：

- 你在一台独立的服务器上启动运行器，并指定 Semaphore 服务器的地址和认证令牌。
- 运行器连接到 Semaphore，并表明自己已准备好接受任务。
- 当出现新任务时，Semaphore 将所有必要信息提供给运行器，运行器随后克隆仓库（Repository）并运行 Ansible、Terraform、PowerShell 等。
- 运行器将任务执行结果发送回 Semaphore。

对最终用户而言，使用或不使用运行器时，Semaphore 的使用体验是一样的。

未定义任何运行器时，Semaphore UI 服务器本身充当运行器。所有任务都在 Semaphore UI 服务器的上下文中执行，并可以访问其文件系统。

使用运行器具有以下优势：
- 更安全地执行任务。例如，运行器可以放置在封闭子网内或隔离的 Docker 容器中。
- 将工作负载分散到多台服务器。你可以启动多个运行器，任务会随机分配给它们。

## 设置 {#set-up}

### 设置服务器 {#set-up-a-server}

要让服务器支持运行器，你需要在 Semaphore 服务器配置中添加以下选项：

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

或者使用环境变量：

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### 设置运行器 {#setup-a-runner}

要设置运行器，请使用以下命令：

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

该命令会在 `/path/to/your/config/file.json` 创建一个配置文件。

但在使用此命令之前，你需要了解运行器是如何在服务器上注册的。

### 在服务器上注册运行器 {#registering-the-runner-on-the-server}

在 Semaphore 服务器上注册运行器有两种方式：
1) 通过 Web 界面或 API 添加。
2) 使用命令行的 `semaphore runner register` 命令。

#### 通过 Web UI 添加运行器 {#adding-the-runner-via-the-web-ui}

![运行器图片](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### 通过 CLI 注册 {#registering-via-cli}

要以这种方式注册运行器，你需要在 Semaphore 服务器的配置文件中添加 `runner_registration_token` 选项。该选项应设置为任意字符串。请选择足够复杂的字符串以避免安全问题。

当 `semaphore runner setup` 命令询问你是否已有运行器令牌时，回答 No。然后使用以下命令注册运行器：

`semaphore runner register --config /path/to/your/config/file.json`

或

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### 配置文件 {#configuration-file}

运行 `semaphore runner setup` 命令后，会创建一个类似下面的配置文件：

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs.
    // Default: 5. Raise this when many runners share one server.
    "check_interval_seconds": 5

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

你可以手动编辑此文件，而无需再次调用 `semaphore runner setup`。

要重新注册运行器，可以使用 `semaphore runner register` 命令。这会覆盖配置中指定文件里的令牌。

## 运行运行器 {#running-the-runner}

现在你可以使用以下命令启动运行器：

```
semaphore runner start --config /path/to/your/config/file.json
```

你的运行器已准备好执行任务。

### 在 Docker 中运行运行器 {#running-the-runner-in-docker}

`semaphoreui/runner` 镜像会自动启动运行器。通过环境变量传入服务器 URL 和注册令牌：

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

如果你的 playbook 需要额外的 Python 包，请将 `requirements.txt` 挂载到 `/etc/semaphore/requirements.txt`。容器每次启动时都会在运行器连接服务器之前用 `pip3` 安装它：

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

关于包的安装位置以及安装失败时的处理方式，请参阅[安装额外的 Python 依赖](/admin-guide/installation/docker#installing-additional-python-dependencies)。

### 轮询间隔（`check_interval_seconds`） {#poll-interval-check_interval_seconds}

每个运行器都会按固定间隔轮询 Semaphore 服务器以获取新任务。
可在运行器配置文件中进行配置：

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| 值 | 效果 |
|-------|--------|
| **1** | 任务在大约一秒内被领取；最适合低延迟的运行。 |
| **5**（默认） | 在领取延迟与请求量之间取得平衡。 |
| **更大的值**（例如 10–30） | 在一台服务器上运行大量运行器时可减少 HTTP 流量。任务可能会稍晚一些开始。 |

Semaphore UI 的运行器页面在生成设置代码片段（配置文件、Docker 以及
环境变量示例）时，会在**高级选项**下提供此设置。

无效值或零值将回退到默认的 5 秒。

任务进度的上报有自己固定的一秒节奏，与此设置无关：进度请求同时充当运行器的
心跳。

### 请求超时（`connection.timeout_seconds`） {#request-timeout-connection-timeout_seconds}

运行器发往服务器的每个请求都有时间上限：TCP 连接、TLS 握手以及等待响应头各自
拥有这么多秒的预算。如果没有它，一个接受了连接随后却不再响应的服务器会让运行器
一直挂住，直到操作系统放弃；而且卡住的请求会让运行器跳过后续的轮询周期，于是心跳
停止，服务器便会将该运行器判定为离线。

```json
{
  "runner": {
    "connection": {
      "timeout_seconds": 3
    }
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_RUNNER_CONNECTION_TIMEOUT_SECONDS=3
```

默认值为 3 秒。请将它保持在 `check_interval_seconds` 之下，这样卡住的请求就不会
比启动它的轮询周期活得更久。当运行器通过缓慢或拥塞的链路连接服务器，并且运行器
日志中出现 `timeout awaiting response headers` 时，可以增大该值；超时的进度上报
会保留其日志记录并在下一个周期重试，因此不会丢失任务输出。

请求体的上传有意不设上限，因此大批量的任务日志绝不会在传输中途被截断。

### 运行器标签（Pro） {#runner-tags-pro}

你可以为项目（Project）运行器分配一个或多个标签。任务模板（Task Templates）随后可以要求特定标签，使任务仅在匹配的运行器上运行。在项目 UI 中添加运行器时配置标签，并在模板设置中设置所需的标签。

## 注销运行器 {#runner-deregistration}

你可以通过 Web 界面移除运行器。

![运行器图片](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

或者通过 CLI 注销运行器：

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## 安全 {#security}

运行器使用注册时签发的不透明持有者令牌
（`X-Runner-Token`）向服务器进行认证。请像保护其他凭据一样保护此令牌——
将其存放在受限的配置文件或密钥管理器中。

:::warning
请使用 HTTPS 进行服务器与运行器之间的通信，尤其是当它们
不在同一私有网络中时。对于自签名证书或内部 CA
证书，请在运行器上配置 `runner.connection.server_ca_cert_file`。
不要在生产环境中使用 `runner.connection.skip_tls_verify`。
:::
