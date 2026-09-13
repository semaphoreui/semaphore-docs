---
title: 前置条件
description: 安装 Semaphore 之前需要准备什么——主机、数据库、网络访问、凭据，以及任务所调用的自动化工具。
---

# 前置条件

Semaphore 自身的硬性要求很少。你需要准备的大部分东西，属于它将要运行的自动化内容
以及它周围的环境。在进行[安装](/admin-guide/installation)之前先过一遍本页，
安装本身只需要几分钟。

## 一台主机 {#a-host}

Semaphore 以单个二进制文件和容器镜像的形式发布，可在 Linux、
macOS 和 Windows 上运行。软件包、Docker 镜像和 Helm chart 面向的是 Linux，
大多数部署也都使用它。

该服务本身很轻量：它只是一个提供 Web 界面的 Go 进程。真正消耗内存和 CPU 的是
Ansible、Terraform 以及你在同一台机器上并行运行的脚本。请按工作负载而不是按
Semaphore 来规划主机规格，并用项目设置**最大并行任务数**限制并发——
或者把执行挪到[运行器](/admin-guide/runners)上，改为按运行器规划规格。

要为两处准备持久化存储：数据库，以及 `tmp_path` 指向的、用于克隆仓库的目录。
在 Docker 中这意味着一个卷；没有卷的容器在重建时会丢失数据。

## 一个数据库 {#a-database}

请在安装前做出选择，因为之后更换意味着要迁移数据。

| 引擎 | 适用场景 |
|---|---|
| **SQLite** | 一台服务器、一个团队。已内置，无需任何配置，是默认选项。 |
| **PostgreSQL** 或 **MySQL/MariaDB** | 该服务对多于少数几个人很重要、你希望沿用现有数据库平台的备份和监控，或者你计划运行多个节点。 |

[高可用](/admin-guide/ha)需要 PostgreSQL 或 MySQL 以及 Redis，
不能使用 SQLite。如果 HA 在你的规划中，请一开始就用 PostgreSQL。

安装前先创建好数据库和对它拥有权限的用户；Semaphore 会在首次启动时
以及每次升级时创建自己的表。

## 网络访问 {#network-access}

| Semaphore 必须能访问 | 用于 |
|---|---|
| 你的 Git 远程仓库 | 克隆模板所指向的仓库。 |
| 你要自动化的主机和云 API | 真正执行工作。 |
| 你的身份提供方（如果使用） | [LDAP](/admin-guide/authentication/ldap) 或 [OpenID Connect](/admin-guide/authentication/openid) 登录。 |
| 你的通知渠道 | 电子邮件、Telegram、Slack 等等。 |

除非你更改端口，用户通过 `3000` 端口访问 Web 界面。请在任何人登录之前，
在它前面加上 [TLS](/admin-guide/reverse-proxy)：会话和 API 令牌都经由它传输。

如果由运行器执行任务，那么需要访问 Git 远程仓库和目标主机的是*它*，
并且它需要到 Semaphore 服务器的出站访问权限。服务器从不主动连接运行器。

## 自动化工具 {#automation-tooling}

任务运行的东西，必须安装在它实际运行的地方——服务器上、运行器上，
或者执行器所使用的容器镜像中。

- Docker 镜像自带 Ansible、Terraform、OpenTofu 以及常用依赖。
  额外的 Python 包放在挂载的 `requirements.txt` 中；参见
  [安装额外的 Python 依赖](/admin-guide/installation/docker#installing-additional-python-dependencies)。
- 通过软件包或二进制文件安装时只会得到 Semaphore 本身。请自行安装 Git、Python、Ansible
  以及所需的 collection 或 provider；参见
  [手动安装](/admin-guide/installation_manually)。

在用某个 playbook 或配置创建模板之前，先确认它能以 Semaphore 所用的用户身份
在那台机器的 shell 中运行。几乎每一条"本地能跑"的反馈，最终都归结为缺少某个
collection、provider 或 Python 包。

## 需要准备好的凭据 {#credentials-to-have-ready}

请在创建第一个模板之前收集齐这些，否则每一项都会成为一次单独的中断：

- Semaphore 将要克隆的每个仓库的**部署密钥或令牌**。
- 用于访问你所管理主机的 **SSH 密钥或登录信息**。
- 你的 Terraform 或模块所需的任何**云凭据**。
- 如果你的 playbook 是加密的，还需要 **Ansible Vault 密码**。

它们都应放在[密钥库](/user-guide/key-store)中，而不是仓库里。

## 需要先做的决定 {#decisions-to-make-first}

有三个选择现在做代价很低，以后做代价很高：

1. **数据库引擎**，如上所述。
2. **用户将使用的 URL。** 把它设置为 `web_host`。反向代理、OIDC 重定向
   URI、Webhook 目标和通知链接都由它推导而来。
3. **`access_key_encryption`。** 在安装时生成它，单独备份，
   并且绝不要随意轮换：每一个已存储的密钥都是用它加密的。

```bash
head -c32 /dev/urandom | base64
```

## 下一步 {#whats-next}

- [安装](/admin-guide/installation) —— 选择一种方式并完成安装。
- [配置](/admin-guide/configuration) —— 选项如何提供以及它们的含义。
- [快速上手](/getting-started) —— 从装好的服务器到第一个任务。
