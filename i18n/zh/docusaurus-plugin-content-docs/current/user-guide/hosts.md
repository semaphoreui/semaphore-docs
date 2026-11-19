---
title: Hosts
description: 你的 Ansible 任务触达了哪些主机，每台主机上的任务结果如何，以及主机失败或始终未被触达时该看哪里。
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

项目的 **Hosts** 页面列出该项目的 Ansible 任务触达过的每台主机，以及最近一次运行在该主机上的结果。当你想知道哪些主机失败、哪些无法连接、哪些主机已有一段时间没有任务触达，而又不想逐个打开任务日志时，请打开此页面。

## 工作原理 {#how-it-works}

你不需要手动添加主机。每个 Ansible 任务结束后，Semaphore 会记录 play 中的每台主机及其在该主机上的结果：`ok`、`changed`、`failed` 或 `unreachable`。在服务器、runner 以及 Docker 或 Kubernetes 执行器上运行的任务都会计入。其他应用的任务，例如 Terraform 或 Bash，不会添加主机。

主机以其 inventory 名称标识。两个 inventory 中的 `web-01` 是同一台主机，`Web-01` 与 `web-01` 也是同一台主机。如果多个项目的任务都触达了某台主机，它会在每个项目中列出，并显示该项目自己的数据。主机离开 inventory 后仍会保留在列表中，连同它的历史记录。

## 查找主机 {#find-a-host}

- **Search** 按名称查找主机。
- **Failing now** 显示最近一次运行失败的主机。**Unreachable** 显示 Ansible 无法连接的主机。**Not seen 30 days** 显示一个月内没有任务触达的主机。
- **Template** 将列表缩小到某个模板的主机。

点击主机可打开其卡片：首次出现的时间、运行次数、最近 10 次运行中失败的次数，以及触达该主机的任务和在该主机上的结果。点击任务可打开其日志。

任务的 **Summary** 选项卡显示单次运行的同样信息：选择 **All servers** 可查看该任务的每台主机及其计数。

## 下一步 {#whats-next}

- [管理员的 Hosts](/admin-guide/hosts) — 所有项目、许可证计数和停用。
- [Inventory](/user-guide/inventory) — 定义任务运行所针对的主机。
