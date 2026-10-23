---
title: CyberArk 密钥存储
description: 通过 PVWA REST API 在 CyberArk Privileged Access Manager 中读取和存储 Key Store 密钥的 Enterprise 选项。
sidebar_custom_props:
  edition: pro
---

# CyberArk 密钥存储 <Enterprise />

Semaphore UI Enterprise 支持使用 **CyberArk Privileged Access Manager**（PAM Self-Hosted 或 Privilege Cloud）作为 Key Store 密钥的外部存储，以替代数据库存储。Semaphore 与 Password Vault Web Access (PVWA) REST API 进行通信：每个 Semaphore 密钥映射到 **Safe** 内的 CyberArk **账户**。

## 配置选项 {#configuration-options}

在 **Key Store → Storages** 下创建 **CyberArk** 存储时，请配置以下参数：

| 字段 | 说明 |
|------|------|
| **服务器 URL** | PVWA 基础地址，例如 `https://pvwa.example.com`。支持带有结尾的 `/PasswordVault`。必填。 |
| **跳过 TLS 证书验证** | 禁用证书验证。仅适用于测试环境。 |
| **认证方式** | Semaphore 用户的 PVWA 登录方式：`CyberArk`（默认）、`LDAP`、`RADIUS` 或 `Windows`。 |
| **用户名** | Semaphore 用于登录的 PVWA 用户名。必填。 |
| **密码** | 该用户的密码。可以存储在数据库中、从环境变量读取或从文件加载。 |
| **默认 Safe** | 当密钥引用不带 Safe 前缀的账户时使用的 Safe，同时也是默认同步路径。 |
| **新账户平台 ID** | 分配给 Semaphore 所创建账户的平台（例如 `UnixSSH`）。仅在存储非只读且从 Semaphore 创建密钥时必填。 |
| **新账户地址** | Semaphore 创建的账户的可选地址属性。某些平台需要此属性。 |

该存储可以工作在只读模式。在该模式下，Semaphore 仅读取和同步账户，绝不会在 Vault 中创建、更新或删除任何内容。

### 所需 PVWA 权限 {#required-pvwa-permissions}

为 Semaphore 用户授予所用每个 Safe 的以下权限：

| 操作 | Safe 权限 |
|------|-----------|
| 读取密钥、同步 | **列出账户**、**检索账户** |
| 从 Semaphore 创建密钥 | **添加账户** |
| 从 Semaphore 更新密钥 | **更新密码值**、**更新账户属性** |
| 从 Semaphore 删除密钥 | **删除账户** |

Semaphore 始终请求并发 PVWA 会话（`concurrentSession`），因此多个 Semaphore 节点或正在运行的任务与定期同步可以共享同一用户而不会互相踢出。这需要 PVWA 11.3 或更高版本。

:::warning
请勿对 Semaphore 使用的 Safe 启用“需要理由”或工单系统集成。Semaphore 发送固定的理由，但无法提供工单编号。
:::

## 使用方法 {#how-to-use}

1. 在项目中打开 **Key Store → Storages** 并创建 **CyberArk** 存储。
2. 创建或编辑密钥时，选择该存储并将账户输入为 `Safe/AccountName`。账户名是 PVWA 中显示的对象名称。如果存储配置了默认 Safe，只需提供 `AccountName` 即可。
3. 可选配置[同步路径](/user-guide/key-store/secret-sync)，按计划自动导入整个 Safe。

### 密钥类型映射 {#key-type-mapping}

| Semaphore 密钥类型 | CyberArk 账户 |
|--------------------|---------------|
| **密码登录** | 密码账户：`userName` 成为登录名，账户密钥成为密码。 |
| **SSH** | 密钥账户（`secretType: key`）：`userName` 成为登录名，账户密钥为私钥。带密码短语的 SSH 密钥不能存储在 CyberArk 中。 |
| **机密 / 字符串** | 无用户名的密码账户。账户密钥按原样使用。 |

当 Semaphore 创建账户时，Central Policy Manager (CPM) 的自动管理将被禁用，以防止 CyberArk 轮换 Semaphore 刚写入的密钥。如果您希望 CyberArk 轮换凭据，请在 PVWA 中管理该账户并将 Semaphore 中的存储标记为只读。

## 同步密钥 {#syncing-secrets}

同步路径是 Safe 的名称。Semaphore 将 Safe 的每个账户作为以账户命名的密钥导入（带有可选前缀）。密钥类型根据账户自动检测：密钥账户成为 SSH 密钥，带有用户名的密码账户成为密码登录密钥，没有用户名的密码账户成为纯机密。请参阅[从远程存储同步密钥](/user-guide/key-store/secret-sync)。
