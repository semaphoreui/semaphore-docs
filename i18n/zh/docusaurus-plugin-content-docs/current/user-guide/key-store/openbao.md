---
title: "OpenBao 密钥存储"
---

# OpenBao 密钥存储 <Pro />

Semaphore UI 支持使用 [OpenBao](https://openbao.org) 作为密钥存储。

OpenBao 是 HashiCorp Vault 的开源分支，并与其 API 兼容，因此该存储的工作方式与 [HashiCorp Vault 存储](/user-guide/key-store/hashicorp-vault)完全相同。

你可以提供以下选项：
- **Server URL**——OpenBao 服务器的地址。
- **Mount**——KV v2 secrets engine 的挂载路径（默认为 `secret`）。
- **Namespace**——OpenBao 命名空间（v2.3+），可选。
- **Token**——认证令牌。令牌可以：
    - 存储在数据库中。
    - 通过环境变量提供。
    - 通过文件提供。
      :::warning
      当令牌来自**文件**时，该文件必须位于 Semaphore 所使用的密钥目录**内部**。请通过 `dirs.secrets` 或 `SEMAPHORE_SECRETS_PATH` 环境变量配置该目录。为兼容旧配置，仍然接受旧的顶级 `secrets_path` 选项。如果都未设置，默认值为 `/tmp/semaphore`。优先级详情请参阅[密钥目录](/admin-guide/configuration/config-file#secrets-directory)。
      :::

该存储可以以只读模式工作。

## 使用方法 {#how-to-use}

1. 在项目（Project）中打开 **Key Store** → **Storages**，创建一个新的 **OpenBao** 存储（URL、挂载路径和令牌）。
2. 在密钥库（Key Store）中创建或编辑密钥时，选择你的 OpenBao 存储作为存储类型。
3. 提供凭据在 OpenBao 中应存放的密钥路径。

## 同步密钥 {#syncing-secrets}

存储在 OpenBao 中的密钥可以自动导入到密钥库并保持同步，方式与其他外部存储相同。请参阅[从远程存储同步密钥](/user-guide/key-store/secret-sync)。

## 变量组 {#variable-groups}

OpenBao 也可以用作[变量组（Variable Groups）](/user-guide/environment)的存储。编辑变量组时，选择你的 OpenBao 存储作为存储类型，并指定用于存放密钥的文件夹路径。
