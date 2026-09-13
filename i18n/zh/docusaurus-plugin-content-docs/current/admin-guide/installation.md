# 安装

根据你的操作系统、环境和偏好，可以通过多种方式安装 Semaphore：

* **包管理器**<br />
  使用适用于你所用发行版的原生软件包安装 Semaphore（例如 Debian/Ubuntu 上的 apt，或基于 RHEL 系统上的 dnf）。这是在 Linux 服务器上上手的最简单方式，并且能与系统服务良好集成。<br />
  [了解更多 »](/admin-guide/installation/package-manager)

* **Docker**<br />
  使用 Docker 或 Docker Compose 以容器方式运行 Semaphore。非常适合快速搭建、沙箱环境和 CI/CD 流水线。推荐给偏好基础设施即代码的用户。<br />
  [了解更多 »](/admin-guide/installation/docker)

* **云**<br />
  使用虚拟机、容器或带托管服务的 Kubernetes 将 Semaphore 部署到云平台的指南。<br />
  [了解更多 »](/admin-guide/installation/cloud)

* **二进制文件**<br />
  从发布页面下载预编译的二进制文件。非常适合手动安装或嵌入自定义工作流。支持 Linux、macOS 和 Windows（通过 WSL）。<br />
  [了解更多 »](/admin-guide/installation/binary-file)

* **Kubernetes（Helm chart）**<br />
  使用 Helm 将 Semaphore 部署到 Kubernetes 集群中。最适合生产级、可扩展的基础设施。支持通过 Helm values 轻松配置和升级。<br />
  [了解更多 »](/admin-guide/installation/k8s)

另请参阅：
* [作为服务运行](/admin-guide/installation/binary-file#run-as-a-service)
* [手动安装](/admin-guide/installation_manually)

----


### 安装额外的 Python 包 {#installing-additional-python-packages}

某些 Ansible 模块和角色需要额外的 Python 包才能运行。要安装额外的 Python 包，请创建一个 `requirements.txt` 文件并将其挂载到容器的 `/etc/semaphore` 目录中。例如，你可以在 `docker-compose.yml` 文件中添加以下几行：

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

每次容器启动时，requirements 文件中指定的包都会被安装到内置的 Ansible 虚拟环境中。同样的挂载方式也适用于 `semaphoreui/runner` 镜像。详情以及自定义镜像的替代方案请参阅[安装额外的 Python 依赖](/admin-guide/installation/docker#installing-additional-python-dependencies)。

有关 Python requirements 文件的更多信息，请参阅 [Pip Requirements 文件格式参考](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
