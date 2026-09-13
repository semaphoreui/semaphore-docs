---
title: 管理员指南
description: 面向为团队安装、配置、加固并运维 Semaphore 服务器的管理员。
---

# 管理员指南

本节面向为他人安装和运维 Semaphore 的管理员。这里的所有内容都需要访问服务器本身：
配置文件、环境变量、命令行，或运行 Semaphore 的那台机器。通过 Web 界面在项目内部
完成的工作请参阅[用户指南](/user-guide)。

Semaphore 是一个带有 Web 界面和 REST API 的单一 Go 二进制文件。它把数据存放在
SQLite、MySQL 或 PostgreSQL 中，对凭据加密保存，并在服务器本身或独立的运行器上执行
任务。因此，一次可用的安装归结为四个决定：如何安装、数据库放在哪里、用户如何登录，
以及任务在哪里执行。

## 搭建 {#set-up}

在启动服务器之前以及围绕启动所做的全部配置。

| 页面 | 涵盖内容 |
|---|---|
| [安装](/admin-guide/installation) | 包管理器、Docker、二进制文件、Kubernetes 以及手动安装。 |
| [配置](/admin-guide/configuration) | `config.json` 文件、环境变量以及所有受支持的选项。 |
| [升级](/admin-guide/upgrading) | 迁移到更新的版本，以及首先要检查什么。 |
| [反向代理](/admin-guide/reverse-proxy) | 在 nginx、Apache 或 Caddy 后面提供 Semaphore 服务，并启用 TLS。 |
| [安全](/admin-guide/security) | 密码哈希、机密加密、网络加固以及任务 JWT。 |
| [LDAP 与 AD](/admin-guide/ldap) | 使用目录服务登录。 |
| [OpenID Connect](/admin-guide/openid) | 通过 GitHub、Google、Keycloak、Okta 以及另外九家提供方实现单点登录。 |
| [运行器](/admin-guide/runners) | 在服务器以外的机器上执行任务。 |
| [高可用](/admin-guide/ha) | 让多个 Semaphore 节点共用一个数据库运行。 |

## 运维 {#operate}

在已经运行的服务器上所做的一切。

| 页面 | 涵盖内容 |
|---|---|
| [CLI](/reference/cli) | 在命令行中管理用户、项目、密钥保险库、运行器和数据库迁移。 |
| [API](/reference/api) | 使用令牌进行身份验证，并以编程方式驱动 Semaphore。 |
| [CI/CD 集成](/admin-guide/cicd) | 从外部流水线启动 Semaphore 任务。 |
| [日志](/admin-guide/logs) | 服务器日志、任务日志，以及把它们转发到别处。 |
| [指标](/admin-guide/metrics) | Prometheus 端点及其暴露的指标。 |
| [通知](/admin-guide/notifications) | 告警的投递渠道：电子邮件、Telegram、Slack 等。 |
| [许可证](/admin-guide/license) | 激活 Pro 或 Enterprise 订阅。 |

## 从哪里开始 {#where-to-start}

如果你是第一次安装 Semaphore，请阅读[安装](/admin-guide/installation)并选择一种
方式，然后阅读[配置](/admin-guide/configuration)了解如何提供各项选项。在其他人开始
使用之前，先把服务器放到启用了 TLS 的[反向代理](/admin-guide/reverse-proxy)后面。

想了解付费订阅带来了什么，请参阅[版本](/editions)。
