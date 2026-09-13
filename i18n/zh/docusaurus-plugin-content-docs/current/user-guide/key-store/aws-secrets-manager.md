# AWS Secrets Manager 密钥存储

![静态徽章](https://img.shields.io/badge/enterprise-yellow)

Semaphore UI Enterprise 可以使用 **AWS Secrets Manager** 作为密钥库（Key Store）密钥的外部存储，以替代数据库。

## 配置选项 {#configuration-options}

在 **Key Store → Storages** 下创建 **AWS Secrets Manager** 存储时，请配置：

| 字段 | 说明 |
|-------|-------------|
| **Region** | 密钥所在的 AWS 区域（例如 `us-east-1`）。必填。 |
| **Endpoint URL** | 可选的自定义端点。留空则使用标准 AWS API 端点。适用于 LocalStack 或 VPC 端点。 |
| **Use IAM Role / Instance Profile** | 启用后，Semaphore 使用环境中的 AWS 凭据链（EC2 实例配置文件、ECS 任务角色、EKS IRSA 等），无需静态访问密钥。 |
| **Access Key ID** | 关闭 IAM 角色模式时必填。 |
| **Secret Access Key** | 关闭 IAM 角色模式时必填。可以存储在数据库中、从环境变量读取或从文件加载。 |

### IAM 角色与访问密钥 {#iam-role-vs-access-keys}

- **IAM 角色/实例配置文件**（在 AWS 上推荐）：启用 **Use IAM Role / Instance Profile**，并授予 Semaphore 服务器或运行器（Runner）主机读取所引用密钥的权限。Semaphore 中不会存储任何长期密钥。
- **访问密钥**：不勾选该复选框，并提供具有 `secretsmanager:GetSecretValue` 权限（以及同步所需的相关 list/describe 权限）的 IAM 用户或角色访问密钥对。

编辑已有存储时，如果未保存访问密钥 ID，Semaphore 会推断为 IAM 角色模式。

## 使用方法 {#how-to-use}

1. 在你的项目（Project）中，打开 **Key Store → Storages**，创建一个 **AWS Secrets Manager** 存储。
2. 创建或编辑密钥时，选择该存储，并提供 AWS Secrets Manager 中的密钥名称或 ARN。
3. 可选地配置[同步路径](/user-guide/key-store/secret-sync)，以按计划自动导入密钥。

该存储可以以只读模式工作。

## 同步密钥 {#syncing-secrets}

AWS Secrets Manager 中的密钥可以像其他外部存储一样导入到密钥库并保持同步。默认路径分隔符为 `/`。参见[从远程存储同步密钥](/user-guide/key-store/secret-sync)。
