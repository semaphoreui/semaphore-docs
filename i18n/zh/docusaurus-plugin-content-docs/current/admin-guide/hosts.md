---
title: Hosts
description: 管理员视角下所有项目的主机、许可证的 Nodes 计数，以及如何停用你不再管理的主机。
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

管理员 **Hosts** 页面在一处列出所有项目的主机，并显示其中哪些计入许可证的 **Nodes**。打开左下角的管理员菜单，选择 **Hosts**。

主机如何进入列表、状态、搜索和主机卡片与项目页面相同。更多信息请参阅 [Hosts](/user-guide/hosts)。在这里，一台主机对所有项目只占一行，其卡片列出触达它的项目和任务。

## 许可证计数 {#license-count}

你的许可证包含一定数量的主机。**订阅与账单** 的 **Nodes** 行显示已使用多少台，例如 `42 / 50`。当 Ansible 任务在上个月内触达过某台主机且无人停用它时，该主机处于使用中。始终无法连接的主机不算使用中。

未在使用中的主机在列表中显示 **Not counted**。下次任务触达它们时，它们会自动重新计入。

当使用中的主机多于许可证包含的数量时，**Nodes** 行变红并显示 **(limit exceeded)**，此页面会显示警告。请停用你不再管理的主机，或扩展你的许可证。更多信息请参阅 [License activation](/admin-guide/license)。

## 停用主机 {#decommission}

当你已从基础设施中移除某台主机时，点击其行末的 **Decommission** 并确认。该主机立即退出计数，显示 **Decommissioned**，并在每个项目中保留其历史记录。如果之后有任务再次触达它，Semaphore 会移除该标记，主机重新处于使用中。

## 下一步 {#whats-next}

- [Hosts](/user-guide/hosts) — 项目页面、状态和主机卡片。
- [License activation](/admin-guide/license) — 激活和替换许可证密钥。
