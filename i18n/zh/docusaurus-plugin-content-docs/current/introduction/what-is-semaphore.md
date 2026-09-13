---
title: 什么是 Semaphore
description: Semaphore UI 做什么、它解决哪些问题、适合哪些人，以及在哪些场景下其他工具是更好的选择。
---

# 什么是 Semaphore

Semaphore UI 是一个自托管的 Web 界面和 REST API，用来运行你已经拥有的自动化内容。
你把它指向一个存放 Ansible playbook、Terraform 配置或 shell 脚本的 Git 仓库，
告诉它使用哪些凭据和主机，它就会成为团队运行这些自动化、保存所需密钥、
并记录每一次运行的统一入口。

你可以单独运行任务，也可以使用 [Workflows](/user-guide/workflows)（Pro）将它们组合成一条流水线，
串联构建、测试、部署和基础设施自动化。

Semaphore 不会取代 Ansible、Terraform 或你的脚本。它只是运行它们——在服务器上运行，
而不是在某个人的笔记本电脑上。

## 它解决的问题 {#the-problem-it-solves}

自动化通常始于一台工作站。某位工程师拥有 playbook、清单、SSH 密钥，并安装了合适版本的
Ansible。这在第二个人需要运行同样的东西之前都没问题，或者直到有人问起上周二某台主机上
到底改了什么。

Semaphore 把运行搬到一台共享服务器上，并补上了缺失的部分：

| 缺失的部分 | Semaphore 提供的能力 |
|---|---|
| 每个人都需要安装工具链 | 只有一台服务器（或一个运行器）需要安装；用户只需要浏览器。 |
| 凭据在各台笔记本之间来回复制 | 加密的[密钥库](/user-guide/key-store)把密钥交给运行过程，而不会交给用户。 |
| 没有谁运行了什么的记录 | 每个[任务](/user-guide/tasks)都保留其输出、退出状态、用户和时间。 |
| 不该为了跑一个 playbook 就给出 root 权限 | [角色](/user-guide/team)决定谁可以运行、编辑或只能查看。 |
| 只有有人记得时才会执行 | [定时计划](/user-guide/schedules)、[Webhook](/user-guide/integrations) 和 API 调用都能触发它们。 |

## 它适合哪些人 {#who-it-is-for}

- **基础设施与平台团队**：已经在使用 Ansible 或 Terraform，希望同事能够运行它们，
  而不必分发生产环境凭据。
- **构建 CI/CD 流水线的团队**：希望通过工作流连接构建、测试和部署任务，
  同时运行定时和按需的运维作业。
- **已有 CI/CD 平台的团队**：希望把运维类运行——重启、部署、证书续期——挪出构建系统，
  并且让那些不阅读流水线 YAML 的人也能看到。

Semaphore 是自托管的。它没有 SaaS 版本：你在自己的基础设施上运行二进制文件或容器，
你的密钥永远不会离开它。

## 它能运行什么 {#what-it-runs}

每个[任务模板](/user-guide/task-templates)都会选择一种应用：

- [Ansible](/user-guide/apps/ansible) —— 带有清单、vault 密码以及完整
  `ansible-playbook` 选项集的 playbook。
- [Terraform、OpenTofu 和 Terragrunt](/user-guide/apps/terraform) —— 使用工作区执行
  plan 和 apply，状态由你的后端保存。
- [Shell](/user-guide/apps/bash)、[PowerShell](/user-guide/apps/powershell) 和
  [Python](/user-guide/apps/python) —— 上述方式未覆盖的一切。

任务可以在服务器本身上运行，也可以在靠近被管理系统部署的[运行器](/admin-guide/runners)上运行。

[Workflows](/user-guide/workflows)（Pro）通过可视化编辑器将任务模板连接成流水线。
每个步骤都可以运行不同的应用：例如，使用 shell 脚本构建和测试源代码，
使用 Terraform 配置基础设施，然后使用 Ansible 部署。你可以添加审批步骤、
定时暂停，以及在成功或失败时执行的分支。满足条件后，Semaphore 会自动启动后续任务。

## 什么时候不该使用它 {#when-not-to-use-it}

了解它的边界可以省下以后的时间。

- **取代 Ansible 或 Terraform。** Semaphore 没有自己的执行引擎。如果你的 playbook
  在 shell 里跑不通，那么在 Semaphore 里同样跑不通。
- **充当 CMDB。** [清单](/user-guide/inventory)是你的运行所需要的清单，
  而不是关于你整套资产的可信数据源。请用动态清单从真正的数据源生成它们。
- **成为你组织的密钥管理系统。** 密钥在静态存储时是加密的，设计目的是供任务使用，
  而不是供人读回。如果你已经在运行 HashiCorp Vault 或其他存储，
  请[连接它](/user-guide/key-store)，而不是把密钥复制进来。
- **作为不允许任何停机的单节点服务运行。** 多个活动节点需要[高可用](/admin-guide/ha)，
  这是 Enterprise 功能，并且需要 PostgreSQL 或 MySQL 以及 Redis。

## 下一步 {#whats-next}

- [架构](/introduction/architecture) —— 进程、数据库，以及任务在哪里执行。
- [核心概念](/introduction/concepts) —— 界面期望你了解的十个词。
- [快速上手](/getting-started) —— 安装它并运行点什么。
