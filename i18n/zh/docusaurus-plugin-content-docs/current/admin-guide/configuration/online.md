---
title: 使用在线配置器
description: 通过 Semaphore 在线配置器生成二进制安装的设置命令或 Docker Compose 文件。
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 使用在线配置器

填写表单即可生成新 Semaphore 服务器的设置命令。编辑时预览会自动更新；请在自己的服务器上应用结果以完成设置。

## 开始之前 {#before-you-begin}

- 选择二进制或 Docker 安装方式及 Semaphore 版本。下面的链接和视频使用 **2.19**；请在网站上选择你的版本。
- 使用 MySQL 或 Postgres 时，请准备好连接信息。使用 SQLite 时，请选择 Semaphore 服务用户具有写入权限的数据库文件路径。
- 请使用自己的管理员密码。视频中的值仅用于演示。

## 步骤 {#steps}

按照与你的安装方式对应的部分操作。

### 二进制安装 {#binary-installation}

1. 打开[二进制安装页面](https://semaphoreui.com/install/binary/2_19/install)。找到对应的平台、架构和包类型。点击该行显示命令，复制后在服务器上执行，或使用 **Download** 下载软件包。
2. 打开 [Server setup](https://semaphoreui.com/install/binary/2_19/config)。在 **Database settings** 中选择 **SQLite**、**MySQL** 或 **Postgres**，并填写文件路径或连接信息。在 **Admin user** 中填写登录名、密码、姓名和邮箱。
3. 返回 **Config file** 并点击复制图标。检查生成的命令后，在服务器上可写的目录中执行。命令会创建 `config.json`、添加管理员并启动 Semaphore。请保留配置及生成的加密密钥，以便之后启动时使用。

![展开 Linux amd64 deb 行后显示的安装命令](/img/admin-guide/configuration/online/binary-install.png)

![填写演示值后的数据库和管理员设置字段](/img/admin-guide/configuration/online/binary-settings.png)

视频演示了选择软件包、填写服务器设置和复制命令。

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="视频演示了选择软件包、填写服务器设置和复制命令。">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Docker 安装 {#docker-installation}

1. 打开 [Docker 配置器](https://semaphoreui.com/install/docker/2_19)。在 **Container settings** 中设置名称和主机端口。在 **Docker volumes** 中启用数据卷和配置卷，以便替换容器时保留它们。
2. 选择数据库并填写 **Admin user**，包括自己的密码。对于外部数据库，请使用容器可以访问的主机地址。
3. 选择 **Docker Compose** 并点击下载图标。将结果保存为部署目录中的 `docker-compose.yml`，检查内容，然后在该目录运行 `docker compose up -d`。也可以选择 **Docker command** 并复制生成的 `docker run` 命令。

![启用了持久化数据卷和配置卷的 Docker 容器设置](/img/admin-guide/configuration/online/docker-settings.png)

视频演示了容器设置、持久化卷和下载 Docker Compose。

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="视频演示了容器设置、持久化卷和下载 Docker Compose。">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## 后续步骤 {#whats-next}

在浏览器中打开服务器，例如本地运行时访问 `http://localhost:3000`，然后使用填写的管理员凭据登录。

- [将二进制文件作为服务运行](/admin-guide/installation/binary-file#run-as-a-service).
- [Docker 部署详情](/admin-guide/installation/docker).
- [所有配置选项](/reference/configuration).
