# 安装

根据你的操作系统、环境和偏好，可以通过多种方式安装 Semaphore。

## 本节内容 {#in-this-section}

| 方式 | 适用场景 |
|---|---|
| [包管理器](/admin-guide/installation/package-manager) | 你希望使用适用于 Linux 发行版的原生软件包。 |
| [Docker](/admin-guide/installation/docker) | 你希望使用 Docker 或 Docker Compose 在容器中运行 Semaphore。 |
| [云](/admin-guide/installation/cloud) | 你正在云平台上部署，需要有关托管服务和基础设施的指导。 |
| [二进制文件](/admin-guide/installation/binary-file) | 你希望安装预编译的二进制文件，并自行管理进程。 |
| [Kubernetes（Helm chart）](/admin-guide/installation/k8s) | 你已经在使用 Kubernetes，并希望通过 Helm 管理部署。 |

## 安装额外的 Python 包 {#installing-additional-python-packages}

某些 Ansible 模块和角色需要额外的 Python 包才能运行。要安装额外的 Python 包，请创建一个 `requirements.txt` 文件并将其挂载到容器的 `/etc/semaphore` 目录中。例如，你可以在 `docker-compose.yml` 文件中添加以下几行：

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

每次容器启动时，requirements 文件中指定的包都会被安装到内置的 Ansible 虚拟环境中。同样的挂载方式也适用于 `semaphoreui/runner` 镜像。详情以及自定义镜像的替代方案请参阅[安装额外的 Python 依赖](/admin-guide/installation/docker#installing-additional-python-dependencies)。

有关 Python requirements 文件的更多信息，请参阅 [Pip Requirements 文件格式参考](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

## 从哪里开始 {#where-to-start}

从适合你的部署环境的指南开始。如果使用二进制文件安装，请按照服务运行说明操作，让 Semaphore 持续运行。有关服务用户、Python 依赖和 systemd 的配置，请参阅手动安装指南。

* [作为服务运行](/admin-guide/installation/binary-file#run-as-a-service)
* [手动安装](/admin-guide/installation_manually)
