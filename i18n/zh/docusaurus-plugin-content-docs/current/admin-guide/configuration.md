---
title: 配置
description: Semaphore 从配置文件和环境变量中读取设置。在线配置器可以通过表单帮助你生成这两种格式。请选择适合服务器运行方式的流程。
---

# 配置

Semaphore 从配置文件和环境变量中读取设置。在线配置器可以通过表单帮助你生成这两种格式。请选择适合服务器运行方式的流程。

## 本节内容 {#in-this-section}

| 方式 | 适用场景 |
|---|---|
| [在线配置生成器](/admin-guide/configuration/online) | 你希望通过表单生成二进制安装或 Docker 安装所需的配置和启动命令。 |
| [配置文件](/admin-guide/configuration/config-file) | 你希望将服务器设置保存在 `config.json` 文件中。 |
| [环境变量](/admin-guide/configuration/env-vars) | 你通过 Docker、服务定义或部署工具管理设置。 |

## 配置选项 {#configuration-options}

环境变量会覆盖配置文件中的对应值。两者都未设置时，使用内置默认值。如果修改文件后没有效果，请检查传递给 Semaphore 进程的环境变量。

[配置选项参考](/reference/configuration)列出了参数名称、环境变量、类型和默认值。该页面由 Semaphore 源代码生成；配置旧版服务器时，请使用对应版本的文档。

<span id="frequently-asked-questions" />

## 公开 URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

将 `web_host`（或 `SEMAPHORE_WEB_ROOT`）设为用户在浏览器中打开的地址。例如，反向代理通过 `https://example.com/semaphore` 提供 Semaphore 时，请使用包含 `/semaphore` 的完整地址。这是公开地址，而不是代理连接的内部地址。

## 从哪里开始 {#where-to-start}

对于新服务器，请打开上面的在线配置器指南，按照二进制或 Docker 步骤操作。对于现有服务器，请修改其服务使用的文件或环境变量，然后重启 Semaphore。
