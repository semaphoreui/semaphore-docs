---
title: Docker 执行器
description: 在本地或远程守护进程上为运行器的每个任务启动一个全新的 Docker 容器，包含配置示例、安全说明和故障排除。
sidebar_custom_props:
  edition: pro
---

# Docker 执行器 <FeatureState feature="docker-executor" />

使用 Docker 执行器时，运行器在新容器中启动每个任务，并在任务结束时删除该容器。
运行器通过 API 与 Docker 守护进程通信：守护进程可以在同一主机上，也可以是通过 TLS
连接的远程守护进程。

容器任务如何运行、容器内有什么以及哪些功能不受支持，请参见
[执行器](./#how-a-container-task-runs)。本页介绍 Docker 的设置。

## 开始之前 {#before-you-begin}

- 拥有 Pro 或 Enterprise 许可证的 Semaphore 服务器。
- 已在服务器上注册的运行器，参见[运行器](/admin-guide/runners)。请使用
  `semaphoreui/runner` 镜像或官方 `semaphore` 二进制文件。
- 运行器可以访问 Docker Engine，并具有使用权限：属于 `docker` 组、可访问挂载的
  socket，或拥有 TLS 客户端证书。
- 守护进程可以拉取 `semaphoreui/job` 和 `semaphoreui/helper`（或你自己的镜像）。

## 快速开始 {#quick-start}

将执行器添加到运行器配置中并重启运行器：

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

没有其他选项时，运行器使用本地 socket（如果设置了 `DOCKER_HOST` 则使用它，
否则使用 `unix:///var/run/docker.sock`）、构建镜像 `semaphoreui/job:latest` 和
`bridge` 网络。

运行任意一个路由到该运行器的任务。任务日志以如下内容开头：

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

任务运行期间，可以查看它的容器：

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## 示例 {#examples}

### Docker 主机上的运行器二进制文件 {#runner-binary-on-a-docker-host}

运行器作为 systemd 服务运行在 Docker 所在的同一主机上。为其用户授予 socket 访问权限：

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### 在容器中运行运行器并使用主机 socket {#runner-in-a-container-with-the-host-socket}

运行器容器通过挂载的 socket 控制主机守护进程；任务容器与运行器是同级容器，而不是
嵌套在其中。运行器镜像以 UID `1001` 运行，因此请将其加入拥有该 socket 的组：

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

`semaphore-runner-data` 卷保存注册时颁发的运行器令牌，因此运行器重启后不会再次注册。

使用 Docker Compose 的等效配置：

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

机密信息通过守护进程上的命名卷传递给任务，从不经过运行器的文件系统，因此无需在
运行器和主机之间共享其他路径。

### 通过 TLS 连接远程 Docker 守护进程 {#remote-docker-daemon-over-tls}

运行器和守护进程位于不同的机器上。使用双向 TLS 保护守护进程端口（参见
[Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/)），
并将客户端文件放到运行器上：

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

设置 `cert_path` 后，运行器使用 `ca.pem` 校验守护进程证书，并使用 `cert.pem` 和
`key.pem` 进行身份验证。文件名是固定的。

:::warning
不设置 `cert_path` 时，`tcp://` 连接是明文 HTTP，任何能访问该端口的人都能控制守护
进程。仅设置 `tls_verify` 不会启用 TLS（⚠️ 2026-11-05：该选项会被读取但不会生效）；
对于远程守护进程，请始终设置 `cert_path`。
:::

### 用于内部服务的网络 {#a-network-for-internal-services}

默认情况下任务容器加入 `bridge` 网络。若要让任务通过容器名访问服务，或将它们隔离在
单独的网络中，请创建一个网络并进行设置：

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` 接受 Docker 支持的任何网络模式：网络名称、`bridge`、`host` 或 `none`。
克隆容器加入同一网络，因此使用 `none` 时无法克隆仓库。

### 来自私有镜像仓库的镜像 {#images-from-a-private-registry}

执行器拉取镜像时不使用镜像仓库凭据。对于私有镜像，请在守护进程主机上登录并拉取，
并保持一个不会重新拉取的拉取策略：

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

与 `if-not-present` 搭配时，请使用版本标签而不是 `latest`：守护进程上已存在的标签
永远不会刷新。`never` 会让缺失的镜像直接导致任务失败，而不是尝试拉取。

### 将整个块作为一个变量 {#the-whole-block-as-one-variable}

对于仅通过环境变量配置的部署，可以将执行器块作为 JSON 传入：

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## 配置参考 {#configuration-reference}

所有选项都位于运行器配置的 `runner.executor.docker` 下。

| 选项 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`，其次是平台 socket | 守护进程地址：`unix:///path`、`tcp://host:port` 或 `npipe:////./pipe/name`。 |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | 包含 `ca.pem`、`cert.pem` 和 `key.pem` 的目录，用于双向 TLS。设置后即启用 TLS。 |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | 尚未生效；请使用 `cert_path`。 |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | 构建镜像。模板的 **Executor image** 会覆盖它。 |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | 用于克隆容器和填充机密卷的镜像。 |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | 克隆容器和构建容器的网络。 |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`、`if-not-present` 或 `never`。未知值回退为 `if-not-present`。 |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | 无限制 | 每个容器的 CPU 数，类似 `docker run --cpus`。允许小数：`0.5`。 |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | 无限制 | 每个容器的内存：字节数，或带 `k`、`m`、`g`（`512m`、`2g`）。无法解析的值表示无限制。 |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | 以 `--privileged` 运行容器。参见[安全](#security)。 |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | 点击 **Stop** 后 `docker stop` 在强制终止容器前等待的秒数。 |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | 未使用：执行器等待容器退出，而不是轮询。 |

资源限制、网络和 `privileged` 同时适用于克隆容器和构建容器。

## 安全 {#security}

- **访问守护进程即等于拥有其主机的 root 权限。** 控制运行器的人——或逃逸出容器的
  任务——可以控制该守护进程上的所有容器。请为任务容器使用专用的 Docker 主机或虚拟机，
  而不是 Semaphore 服务器或数据库所在的主机。
- **保持 `privileged` 关闭。** 特权容器可以完全访问主机设备和内核。仅在专用、
  可随时丢弃且不运行其他任何内容的守护进程上启用。
- **机密文件**（SSH 密钥、vault 密码、额外变量）写入守护进程上每个任务独立的卷，
  以只读方式挂载，并随任务一起删除。它们从不接触运行器的磁盘。
- **机密环境变量**（类型为 *Environment variable* 的变量组机密以及 `SEMAPHORE_JWT`）
  设置在构建容器上。容器运行期间，任何有权访问守护进程的人都可以通过 `docker inspect`
  读取它们。
- **网络。** 在 `bridge` 上，任务可以访问守护进程主机能访问的所有地址。请使用独立
  网络和防火墙规则限制任务可访问的范围。
- **远程守护进程**必须使用 [TLS](#remote-docker-daemon-over-tls)。

## 停止与清理 {#stop-and-clean-up}

UI 中的 **Stop** 会向正在运行的容器发送 `docker stop`，最多等待
`cleanup_grace_seconds`，然后删除容器和两个卷。

如果运行器进程在任务期间被终止，其容器和卷会留在守护进程上；运行器下次启动时不会
回收它们。执行器创建的所有对象都带有 `com.semaphoreui.runner=semaphore` 标签，
`com.semaphoreui.task-id` 保存任务 ID。在该守护进程上没有任务运行时清理残留：

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## 故障排除 {#troubleshooting}

| 消息 | 原因与解决方法 |
|---|---|
| `docker executor is only available in the proprietary build`（运行器日志） | 运行器是 Community 构建。请使用 `semaphoreui/runner` 或官方二进制文件。 |
| `docker executor: daemon not reachable` | `host` 错误、守护进程未运行，或运行器用户无法打开 socket（`permission denied`）。以运行器用户执行 `docker -H <host> info` 检查；将该用户加入 socket 所属组。 |
| `pull image ...: ... unauthorized` 或 `not found` | 镜像是私有的或名称拼写错误。请先在守护进程主机上拉取，参见[私有镜像仓库](#images-from-a-private-registry)。 |
| `git clone exited with status 128` | 仓库 URL、分支或 SSH 密钥错误，或网络阻止了 Git 主机。该行上方的克隆输出会显示 Git 错误。 |
| `interpreter python3 not found in image; set a runner image that provides it` | 构建镜像缺少应用二进制文件。请在运行器或模板的 **Executor image** 中设置包含它的镜像。 |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | 镜像中没有 OpenSSH 客户端；Ansible 无法使用清单密钥。请安装 `openssh-client`。 |
| `/workspace` 下的 `Permission denied` | 自定义镜像以无法写入 `/workspace` 的用户运行。参见[构建自定义镜像](./#build-a-custom-image)。 |
| `build container exited with status N` | 应用以退出码 `N` 失败；原因见上方日志。 |
| `inventory login_password authentication is not supported` | 参见[限制](./#limitations)。 |

## 相关页面 {#related-pages}

- [执行器](/admin-guide/executors)：容器任务如何运行、镜像、限制。
- [Kubernetes 执行器](./kubernetes)：在集群上使用相同的模型。
- [运行器](/admin-guide/runners)：注册和启动运行器。
- [执行器镜像](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)：为单个模板使用不同的镜像。
