---
title: Key Store
description: Semaphore Key Store 凭据、SSH 密钥对生成、登录密码、令牌机密和外部密钥存储的综合指南。
---

# Key Store

**Key Store** 是 Semaphore 的集中式凭据库。它负责管理克隆远程 Git 仓库、连接目标基础设施主机、提升权限（`sudo`/`become`）以及解密 Ansible Vault 机密所需的身份验证资料。

![Key Store](/assets/key-store-keys.webp)

Key Store 分为两个主要视图：
* **Keys 标签页**：列出为当前项目配置的所有凭据，包括名称、存储后端、凭据类型和同步状态。
* **Storages 标签页 (Pro)**：配置外部机密后端（例如 HashiCorp Vault、OpenBao、AWS Secrets Manager 或 CyberArk），以实现动态机密解析和自动化同步。

---

## 凭据类型 {#types}

Semaphore 将存储的凭据分为四种基本类型：

### 1. SSH 密钥 {#1-ssh}
SSH 密钥提供非对称加密身份验证，用于连接 Linux/UNIX 节点并通过 SSH（`git@github.com:...`）克隆 Git 仓库。

配置 SSH 密钥凭据时，可以指定：
* **Key Name**：在项目清单和模板中标识该凭据的描述性标签。
* **Username (Optional)**：建立 SSH 连接时使用的默认远程用户账户（例如 `ansible` 或 `ubuntu`）。
* **Passphrase (Optional)**：解密加密私钥所需的密码短语。密码短语输入包含可见性切换图标（`眼睛`），默认处于遮蔽状态。
* **Private Key**：原始 PEM/OpenSSH 私钥文本。

#### 内置 SSH 密钥生成器 {#built-in-ssh-key-generator}

无需在外部机器上手动执行 `ssh-keygen`，Semaphore 在模态框中直接集成了**内置的一键式 SSH 密钥对生成器**：

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. 在 **Type** 下拉菜单中选择 **SSH Key**。
2. 勾选 **Generate SSH Key** 复选框。
3. 手动输入的 **Private Key** 文本区域将自动禁用并锁定。
4. 点击 **Create**。Semaphore 将自动生成密码学安全的密钥对（ED25519/RSA），将私钥加密保存至数据库中，并在弹出窗口中显示公钥：

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

使用内置的 **Copy to Clipboard** 按钮复制公钥，并将其直接粘贴到 Git 提供商的 Deploy Keys 或目标节点的 `~/.ssh/authorized_keys` 文件中。

#### 后续提取公钥（公钥抽屉） {#extracting-public-keys-later}

如果您关闭了对话框或以后需要检索公钥，无需重新生成密钥对。编辑使用生成器创建的现有密钥时，Semaphore 提供了一个可展开的 **Public key** 抽屉：

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* 点击 **Show** / **Hide** 预览原始公钥字符串。
* 点击剪贴板图标即可即时复制公钥。

#### 将 Deploy Keys 关联至常用 Git 托管平台

对于需要 SSH 身份验证的 Git 仓库，请将生成的公钥添加为只读 Deploy Key：
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. 密码登录 {#2-login-with-password}

**Login with password** 凭据类型既支持传统的用户名/密码身份验证，也支持独立的机密字符串：

* **主机与 sudo 认证**：提供基于密码的 SSH 访问及目标主机上的 `sudo` 提权凭据。
* **HTTPS Git 认证**：使用用户名和个人访问令牌（PAT）通过 HTTPS 对远程仓库进行身份验证。
* **Ansible Vault 密码**：在运行时解锁加密的 Ansible Vault 文件和变量。

:::tip 机密字符串与个人访问令牌 (PAT)
若要存储纯机密字符串（例如 API Bearer 令牌或 Webhook 密钥），请使用下文的 **字符串** 类型。Ansible Vault 密码和 HTTPS Git 令牌仍然需要登录名留空的 **密码登录** 类型，因为这些使用方只接受该类型。
:::

#### 机密遮蔽与防覆盖保护 {#secret-masking-and-override-protection}

为保护凭据免遭未授权查看和意外篡改：
* 密码和密码短语输入在界面中进行遮蔽，并提供可见性显示切换。
* 编辑现有凭据时，敏感机密输入框默认处于禁用状态。
* 若要更新或替换现有机密，必须显式勾选表单底部的 **Override** 复选框。此安全门机制可防止在日常维护编辑中意外覆盖凭据。

---

### 3. 无 {#3-none}

**None** 凭据作为显式的空身份验证占位符。它用于无需 SSH 密钥或密码的公共开源 Git 仓库（例如 GitHub 或 GitLab 上的公共仓库）以及本地未授权的 Playbook 执行。

---

### 4. 字符串 {#4-string}

**字符串** 凭据保存一个不带登录名的机密值：API 令牌、Webhook 密钥或单独的密码。它与其他凭据一样加密存储，API 不会返回它，表单也不会再次显示它，只能通过勾选 **Override** 来替换。

使用场景：
* **集成**：作为 Token、HMAC、GitHub 和 Bitbucket 认证方式的 *Auth secret*，参见[集成](/user-guide/integrations#hmac-authentication)。

在不适用的地方，凭据选择器根本不会提供它：仓库或清单的 SSH 密钥、sudo 凭据和 Ansible Vault 密码都需要 SSH 密钥或登录名/密码。

通过 API 创建同类凭据时使用 `"type": "string"`：

```bash
curl -X POST "https://semaphore.example.com/api/project/1/keys" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "name": "webhook-secret", "type": "string", "string": "s3cr3t"}'
```

---

## 密钥存储 {#secret-storages}

Semaphore 支持解耦的机密存储架构。在创建或编辑凭据时，可以通过源存储标签页选择基础机密资料的存放位置：

| 存储来源标签页 | 支持版本 | 说明 |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | 密钥受信封加密保护，直接存储在 Semaphore 数据库中。 |
| **Storage** | Pro | 密钥引用外部机密引擎（例如 HashiCorp Vault、AWS Secrets Manager）。 |
| **Env** | Open Source & Pro | 密钥在运行时从 Semaphore 服务器上的环境变量动态解析。 |
| **File** | Open Source & Pro | 密钥从服务器配置的密钥目录中的受保护文件读取。 |

![密钥存储](/assets/key-store-storages.webp)

### 数据库存储 (Local) {#database}

默认情况下，密钥通过对称 AES 加密后存储在应用程序数据库中。主密钥通过服务器设置进行配置：
* 配置项：`access_key_encryption`
* 环境变量：`SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning 生成主加密密钥
在启动生产实例前，请生成密码学安全的 32 字节 base64 加密密钥：
```bash
head -c32 /dev/urandom | base64
```
请务必安全备份此密钥。如果加密密钥丢失，数据库中现有的机密将无法恢复。
:::

### 环境变量与文件源（只读存储） {#environment-variable-or-file}

选择 **Env** 或 **File** 来源标签页时，Semaphore 会将该存储视为外部只读来源。界面会显示明确提示：

> **Read-only secret storage chosen.**

![只读密钥存储](/assets/key-store-env-readonly-storage.webp)

* **Env 来源**：提供在 Semaphore 服务器主机或容器上导出的环境变量的确切名称（例如 `SEMAPHORE_EXTERNAL_VAULT_TOKEN`）。
* **File 来源**：提供相对于配置的密钥路径（`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`，默认值为 `/tmp/semaphore`）的相对文件路径。

对于结构化密钥，文件和环境变量内容必须格式化为有效的 JSON 对象。有关详细信息，请参阅[环境和文件源](/user-guide/key-store/env-and-file-sources)。

### 外部企业级机密引擎 (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro 和 Enterprise 通过连接主要企业密钥管理器的原生连接器扩展了 Key Store：

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**：通过 AppRole 或令牌认证连接以读取和写入 KV v1/v2 机密。
* **[OpenBao](/user-guide/key-store/openbao)**：HashiCorp Vault 的开源 API 兼容分支。
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />：与 AWS IAM 角色或静态凭据集成。
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**：与集中式特权访问管理集成。
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />：使用 CyberArk PVWA REST API 读取和写入机密。

---

## 从远程存储同步密钥 {#syncing-secrets-from-remote-storages}

无需逐个手动注册凭据，Semaphore 支持从外部机密保险库进行自动化同步。

当密钥通过同步维护时：
* 它在 Key Store 表格中标记有活跃的 **synchronized** 徽章。
* 界面中对密钥内容的手动编辑将被禁用，以保持外部保险库作为唯一的真实数据来源。
* 外部机密引擎中的任何更新或轮换都会根据配置的同步时间间隔自动传播到 Semaphore。

有关详细配置步骤，请参阅[密钥同步](/user-guide/key-store/secret-sync)。
