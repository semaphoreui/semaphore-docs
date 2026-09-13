---
title: "HashiCorp Vault 密钥存储"
---

# HashiCorp Vault 密钥存储 <Pro />

Semaphore UI 支持使用 HashiCorp Vault 作为密钥存储。

![](/assets/vault1.webp)

你可以提供以下选项：
- **HashiCorp Vault URL**——Vault 服务器的地址。
- **Mount**——secrets engine 的挂载路径。
- **Token**——认证令牌。令牌可以：
    - 存储在数据库中。
    - 通过环境变量提供。
    - 通过文件提供（适用于 Vault Agent）。
      :::warning
      当令牌来自**文件**时，该文件必须位于 Semaphore 所使用的密钥目录**内部**。请通过 `dirs.secrets` 或 `SEMAPHORE_SECRETS_PATH` 环境变量配置该目录。为兼容旧配置，仍然接受旧的顶级 `secrets_path` 选项。如果都未设置，默认值为 `/tmp/semaphore`。优先级详情请参阅[密钥目录](/admin-guide/configuration/config-file#secrets-directory)。

      `config.json` 片段示例：

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

该存储可以以只读模式工作。

## 使用方法 {#how-to-use}

1. 在 Semaphore 设置中配置 HashiCorp Vault 连接（URL、挂载路径和令牌）。
2. 在密钥库（Key Store）中创建或编辑密钥时，选择 **HashiCorp Vault** 作为存储类型。
3. 提供凭据在 Vault 中应存放的密钥路径。

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

除了直接存储 Vault 令牌，你还可以使用 [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) 自动处理令牌的获取和续期。

Vault Agent 作为 sidecar 进程与 Semaphore 一同运行，并把有效的令牌写入磁盘上的文件。然后 Semaphore 从该文件读取令牌。

设置步骤如下：

1. 使用合适的 [auto-auth 方法](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth)（例如 AppRole、Kubernetes、AWS IAM）配置并运行 Vault Agent。
2. 通过 `sink` 块让 Vault Agent 把令牌写入文件，例如：

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. 在 Semaphore 中配置 HashiCorp Vault 连接时，选择 **File** 作为令牌来源，并提供令牌文件的路径（例如 `/etc/vault/token`）。

这种方式避免了长期有效的静态令牌，并让 Vault Agent 自动处理认证和令牌续期。


## 变量组 {#variable-groups}

HashiCorp Vault 也可以用作[变量组（Variable Groups）](/user-guide/environment)的存储。编辑变量组时，选择 **HashiCorp Vault** 作为存储类型，并指定用于存放密钥的文件夹路径。

![](/assets/vault3.webp)
