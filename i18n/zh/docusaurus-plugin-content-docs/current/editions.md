---
title: 版本
description: Semaphore Community、Pro 和 Enterprise 各自包含的内容，以及哪些功能需要付费订阅。
---

import EditionsTable from '@site/src/components/EditionsTable';

# 版本

Semaphore 基于同一套代码库和同一套文档提供三个版本。除了页面或章节带有版本标记的
情况之外，本文档中描述的所有内容都可以在 **Community** 中使用。

| 版本 | 说明 |
|---|---|
| **Community** | 开源版本。免费、自托管、无需许可证密钥。包含下表未列出的所有功能。 |
| **Pro** | 增加工作流、项目级运行器、外部密钥存储、容器执行器以及结构化日志。 |
| **Enterprise** | 增加高可用、带自定义角色的扩展 RBAC、Kubernetes 执行器以及企业级密钥存储。 |

Pro 和 Enterprise 通过许可证密钥启用，请参阅[许可证激活](/admin-guide/license)。
服务器运行的版本会显示在账户菜单中，请参阅[您的账户](/user-guide/account)。

## 功能矩阵 {#feature-matrix}

需要付费版本的功能。未在此列出的功能在所有版本中都可用。

<EditionsTable />

## 本文档中如何标记版本 {#how-editions-are-marked}

标题旁的标记表示其下方的功能需要相应的版本：

- <Pro /> 表示 Pro 功能。
- <Enterprise /> 表示 Enterprise 功能。

标记还可能带有该功能出现的版本号，例如
<FeatureState feature="extended-rbac" />。点击标记即可返回本页面。
