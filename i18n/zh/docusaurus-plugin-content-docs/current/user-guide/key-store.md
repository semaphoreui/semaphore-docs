# 密钥库

Semaphore 的密钥库（Key Store）用于存储访问远程仓库（Repository）、访问远程主机的凭据、sudo 凭据以及 Ansible vault 密码。

![密钥库](/assets/key-store-keys.webp)

**Keys** 选项卡列出项目（Project）的凭据及其类型。**Storages** 选项卡（Pro）列出为项目配置的外部密钥存储，参见[密钥存储](#secret-storages)。

## 类型 {#types}

### 1. SSH {#1-ssh}
SSH 密钥用于访问远程服务器以及远程仓库。

如果你需要快速生成密钥并将其放置到主机上，[这里有一份快速指南。](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

对于使用 SSH 认证的 Git 仓库，你要克隆的 Git 仓库需要关联与私钥对应的公钥。

以下是一些常见 Git 仓库托管服务的文档链接：
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. 密码登录 {#2-login-with-password}
密码登录（Login With Password）是用户名与密码/访问令牌的组合，可用于以下用途：
* 对远程主机进行认证（不过这比使用 SSH 密钥安全性更低）
* 远程主机上的 sudo 凭据
* 通过 HTTPS 对远程 Git 仓库进行认证（不过 SSH 更安全）
* 解锁 Ansible vault

:::tip
    此类密钥可用作个人访问令牌（PAT）或密钥字符串。只需将 Login 字段留空即可。
:::

### 3. 无 {#3-none}
用作不需要认证的仓库的占位项，例如 GitLab 上的开源仓库。


## 密钥存储 {#secret-storages}

Semaphore UI 支持多种密钥存储。你可以在创建或编辑密钥时为每个密钥选择存储。

外部存储在密钥库的 **Storages** 选项卡（Pro）中创建。每个存储都有名称和类型；密钥随后引用该存储以及密钥在其中的路径。

![密钥存储](/assets/key-store-storages.webp)

### 数据库 {#database}

默认情况下，密钥以加密形式存储在数据库中。加密密钥通过配置选项
`access_key_encryption` 或 `SEMAPHORE_ACCESS_KEY_ENCRYPTION` 进行配置（必须使用 `head -c32 /dev/urandom | base64` 生成）。

### 环境变量或文件 {#environment-variable-or-file}

密钥可以从 Semaphore 服务器的环境变量或服务器上的文件中读取其值
（例如挂载到容器中的 SSH 密钥）。密钥表单的 **Env** 和 **File** 选项卡用于选择此模式。

文件必须位于配置的密钥目录内（`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`，默认为 `/tmp/semaphore`），
并且 SSH 和密码登录密钥必须封装在一个小型 JSON 文档中。

[阅读更多...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

密钥可以存储在外部 HashiCorp Vault 实例中，而不是数据库中。

[阅读更多...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

密钥可以存储在外部 [OpenBao](https://openbao.org) 实例中（OpenBao 是 HashiCorp Vault 的开源且 API 兼容的分支）。

[阅读更多...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![静态徽章](https://img.shields.io/badge/enterprise-yellow)

密钥可以存储在 AWS Secrets Manager 中。使用 IAM 角色/实例配置文件或静态访问密钥进行认证。

[阅读更多...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

密钥可以存储在外部 Devolutions Server 实例中，而不是数据库中。

[阅读更多...](/user-guide/key-store/devolutions-server)

## 从远程存储同步密钥 {#syncing-secrets-from-remote-storages}

Semaphore 可以自动从外部密钥管理器（HashiCorp Vault、OpenBao、AWS Secrets Manager、Azure Key Vault 或 Devolutions Server）导入密钥并保持同步。同步路径让你可以选择导入哪些密钥以及如何命名它们。

[阅读更多...](/user-guide/key-store/secret-sync)
