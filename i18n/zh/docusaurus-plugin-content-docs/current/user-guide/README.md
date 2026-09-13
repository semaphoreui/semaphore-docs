---
title: 用户指南
description: 面向在 Semaphore 项目中工作的工程师：资源、任务模板、任务、计划任务和团队访问。
---

# 用户指南

本节面向已经拥有 Semaphore 项目访问权限的人。这里的所有操作都在 Web 界面中或通过
项目 API 完成。服务器的安装、配置以及接入身份提供方请参阅[管理员指南](/admin-guide)。

Semaphore 中的工作遵循同一条链路。**项目**承载其他一切。在项目内部，你要注册一次
运行所需的资源：存放 playbook 或脚本的**仓库**、用于访问仓库和主机的**密钥**、目标
机器的**清单**，以及包含取值和机密的**变量组**。**任务模板**把这些组合成对运行内容
的定义，而该模板的每一次运行就是一个**任务**。计划任务、工作流和传入的 Webhook 会
替你启动模板。

## 搭建项目 {#set-up-a-project}

请按此顺序进行，因为每一步都依赖上一步。

| 页面 | 涵盖内容 |
|---|---|
| [项目](/user-guide/projects) | 创建项目、侧边栏中的各个区域，以及备份与恢复。 |
| [团队](/user-guide/team) | 四种内置角色，以及 Enterprise 版的自定义角色。 |
| [密钥库](/user-guide/key-store) | SSH 密钥、登录凭据和外部机密存储。 |
| [仓库](/user-guide/repositories) | 存放自动化代码的 Git 仓库和本地路径。 |
| [清单](/user-guide/inventory) | Ansible 的主机与连接设置，Terraform 的工作区。 |
| [变量组](/user-guide/environment) | 传入任务、可复用的变量和机密。 |

## 定义并运行工作 {#define-and-run-work}

| 页面 | 涵盖内容 |
|---|---|
| [任务模板](/user-guide/task-templates) | 模板表单的每个字段，以及模板类型。 |
| [应用](/user-guide/apps) | 每种应用运行什么：Ansible、Terraform、OpenTofu、Terragrunt 和脚本。 |
| [任务](/user-guide/tasks) | 启动任务、任务状态、日志、停止和重新运行。 |
| [计划任务](/user-guide/schedules) | 按 cron 计划运行模板。 |
| [工作流](/user-guide/workflows) | 通过审批和分支把模板串联起来。 |
| [集成](/user-guide/integrations) | 通过传入的 Webhook 启动任务。 |
| [项目运行器](/user-guide/projects/runners) | 把项目的任务发送到你自己的运行器。 |
| [您的账户](/user-guide/account) | 个人设置和 API 令牌。 |

## 从哪里开始 {#where-to-start}

如果有人刚把你加入一个项目，请先阅读[项目](/user-guide/projects)熟悉界面，然后阅读
[任务](/user-guide/tasks)运行一个任务并查看它的日志。如果你要从零搭建一个项目，
请按上面表格的顺序进行。

完全没用过 Semaphore？请从[快速入门](/getting-started)开始。
