---
title: "项目运行器"
sidebar_custom_props:
  edition: pro
---

# 项目运行器 <Pro />

运行器（Runner）在 Semaphore 服务器以外的机器上执行任务：更靠近目标基础设施、位于另一个网络区域，或拥有不同的工具链。**全局运行器**由管理员注册，服务于所有项目。**项目运行器**属于某一个项目（Project），由该项目的团队在 **Runners** 分区中管理。

![项目运行器](/assets/project-runners-list.webp)

| 列 | 内容 |
|---|---|
| 开关 | 启用或禁用运行器。被禁用的运行器不会接收任务。只有项目运行器有该开关；全局运行器由管理员管理。 |
| **Name** | 运行器名称。**Global** 标记表示该运行器由所有项目共享。 |
| **Tag** | 运行器的标签。设置了 **Runner tag** 的模板只会在拥有该标签的运行器上运行。 |
| **Status** | 运行器最近轮询过服务器时为 **Online**，否则为 **Offline**。 |

## 添加运行器 {#adding-a-runner}

你需要 **Manager** 或更高的角色。点击 **New Runner** 并填写表单。

<div style={{maxWidth: 420}}>

![新建运行器对话框](/assets/project-runner-new.webp)

</div>

| 字段 | 说明 |
|---|---|
| **Name** | 在列表和任务详情中显示的运行器名称。 |
| **Tags** | 可选。一个或多个标签。设置了 **Runner tag** 的模板只由带有该标签的运行器执行。 |
| **Is default** | 带有此标记的运行器还会接收没有运行器标签的模板的任务。既没有此标记也没有标签的运行器永远不会接收任务。 |
| **Register** | 勾选：运行器以已注册状态创建，对话框会显示需要放入运行器配置的运行器令牌。不勾选：运行器以未注册状态创建，你会得到一个一次性的**注册令牌**；运行器通过 `semaphore runner register` 或 `semaphore runner start --auto-register` 自行注册。 |
| **Webhook** | 可选。当任务分配给该运行器时 Semaphore 调用的 URL。可用它来启动按需（一次性）运行器，例如通过云函数。 |
| **Max number of parallel tasks** | 可选。该运行器同时可执行的任务数量。 |
| **Enabled** | 运行器是否接收任务。 |

创建完成后，点击运行器可再次查看其令牌或注册令牌，并复制配置片段。

## 安装运行器 {#installing-the-runner}

运行器就是以运行器模式启动的同一个 `semaphore` 二进制文件或 `semaphoreui/runner` Docker 镜像。安装、配置文件、注册命令、执行器（本地、Docker、Kubernetes）以及安全性在管理员指南中有详细说明：[运行器](/admin-guide/runners)和 [CLI：运行器](/reference/cli/runners)。

## 将任务路由到运行器 {#routing-tasks-to-runners}

1. 为运行器设置一个或多个 **Tags**，例如 `windows-qa-server`。
2. 在模板表单中，把 **Runner tag** 设为相同的值。
3. 该模板的任务会保持 `waiting` 状态，直到拥有该标签的运行器上线。

没有运行器标签的模板会交给标记为 **Is default** 的运行器，包括全局默认运行器。执行任务的运行器会显示在[任务窗口](../tasks#task-window)的 **Details** 选项卡中。

## 安全性 {#security}

- 运行器主动连接服务器，而不是反过来，因此运行器可以位于 NAT 之后或私有网络中。
- 来自运行器的每个请求都使用其令牌进行认证。删除或禁用运行器即可将其撤销。
- 在运行器和服务器之间使用 HTTPS；请参阅[网络安全](/admin-guide/security/network)。
