---
title: 什么是 Semaphore
description: Semaphore UI 做什么、它解决哪些问题、适合哪些人，以及在哪些场景下其他工具是更好的选择。
---

# 什么是 Semaphore

Semaphore UI 是一个自托管的 Web 界面和 REST API，用来运行你已经拥有的自动化内容。
你把它指向一个存放 Ansible playbook、Terraform 配置或 shell 脚本的 Git 仓库，
告诉它使用哪些凭据和主机，它就会成为团队运行这些自动化、保存所需密钥、
并记录每一次运行的统一入口。

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
- **没有 CI/CD 平台的小团队**：需要定时和按需的运维作业，但并不需要构建流水线。
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

## 什么时候不该使用它 {#when-not-to-use-it}

了解它的边界可以省下以后的时间。

- **构建和测试源代码。** Semaphore 没有构建产物、没有矩阵构建、没有合并请求检查，
  也没有容器镜像仓库。这些请使用 GitHub Actions、GitLab CI 或 Jenkins，
  并在流水线需要操作基础设施时[从它们启动 Semaphore 任务](/admin-guide/cicd)。
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
