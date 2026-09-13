# 🔐 安全

## 简介 {#introduction}

安全是 Semaphore UI 的首要任务。无论你是在自动化关键基础设施任务，还是在管理团队（Team）对敏感系统的访问，Semaphore UI 都旨在开箱即用地提供健壮、安全的运行方式。本节介绍 Semaphore 如何处理安全问题，以及在生产环境中部署时应考虑的事项。

## 认证与授权 {#authentication--authorization}

Semaphore 支持安全的认证和灵活的授权机制：

- **登录方式：**
  - **用户名/密码**<br />默认方式，使用存储在 Semaphore 数据库中的凭据。密码从不以明文存储；它们使用 Argon2id 进行哈希（参见[密码哈希](#password-hashing)）。

  - **LDAP**<br />允许与企业目录服务集成。支持用户/组过滤以及通过 LDAPS 的安全连接。

  - **OpenID Connect（OIDC）**<br />支持与 Google、Azure AD 或 Keycloak 等身份提供商的单点登录。支持自定义声明和组映射。

- **双因素认证（2FA）**<br />提供基于 TOTP 的 2FA，并建议所有用户启用。可按用户启用，并支持可选的恢复码。参见配置选项 `mfa.totp.enabled` 和 `mfa.totp.allow_recovery`。

- **基于角色的访问控制**<br />你可以为用户分配不同的角色，例如 Admin、Maintainer 或 Viewer，根据职责限制访问。

- **会话管理**<br />会话由安全的 HTTP Cookie 保护。会话过期和注销机制可将暴露风险降到最低。
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### 密码哈希 {#password-hashing}

:::info 自 v2.20 起
Argon2id 密码哈希自 **Semaphore 2.20** 起可用。更早的版本使用 bcrypt。
:::

本地用户的密码使用 **Argon2id** 进行哈希，这是 [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) 推荐用于密码存储的算法。Semaphore 使用 OWASP 的最低强度参数：

| 参数 | 值 |
|-----------|-------|
| 内存 | 19 MiB（`m=19456`） |
| 迭代次数 | 2（`t=2`） |
| 并行度 | 1（`p=1`） |
| 盐 | 每个密码 16 个随机字节 |
| 哈希长度 | 32 字节 |

哈希以标准的 [PHC 字符串格式](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md)存储，例如 `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`，因此每个哈希所使用的参数都随之一起记录。

这适用于设置密码的所有途径：Web UI、API 以及 CLI 命令 `semaphore user add`、`semaphore user change-by-login` 和 `semaphore setup`。

**从 2.20 之前的版本升级。** 2.20 之前的版本使用 bcrypt 对密码进行哈希。无需任何迁移步骤：

- 现有的 bcrypt 哈希在登录时仍然被接受，因此升级后所有用户都能继续正常使用。
- 首次成功登录时，密码会被透明地用 Argon2id 重新哈希，并替换掉 bcrypt 哈希。
- 如果未来版本中 Semaphore 的 Argon2id 参数得到加强，使用旧参数创建的哈希会在下次登录时以同样的方式升级。

由于重新哈希仅在登录时进行，从不再登录的用户会保留其 bcrypt 哈希。要强制升级此类账户，请使用 `semaphore user change-by-login --password ...` 或通过管理员 UI 重置其密码。

:::note
双因素认证的恢复码不是用户密码，仍继续使用 bcrypt。
:::

## 密钥与凭据 {#secrets--credentials}

安全地管理密钥是一项核心功能：

- **加密的密钥库（Key Store）**<br />凭据和机密变量使用 AES 加密静态存储。

- **环境隔离**<br />密钥仅在运行时传递给作业，不会直接暴露给容器环境。

- **SSH 密钥和令牌**<br />用户负责上传有效的 SSH 密钥和令牌。它们会被加密，且仅在运行任务（Task）时使用。
- **HashiCorp Vault 集成（Pro）**<br />密钥可以存储在外部 Vault 实例中。在创建或编辑密钥时可按密钥选择存储方式。

## 数据加密 {#data-encryption}

敏感数据以加密形式存储在数据库中。你应在配置文件中设置配置选项 `access_key_encryption` 以启用访问密钥加密。该值必须通过以下命令生成：

```bash
head -c32 /dev/urandom | base64
```

## 运行不受信任的代码/playbook {#running-untrusted-code--playbooks}

Semaphore 会运行用户定义的 playbook 和命令，这可能带来风险：

- **执行隔离**<br />默认情况下，任务是 Semaphore 服务器上的普通进程，拥有该服务器的文件系统和网络访问权限。隔离需要另行开启：把任务交给配置了 `docker` 或 `k8s` 执行器的[运行器](/admin-guide/runners)，每个任务都会获得一个新的容器或 Pod，结束后即被丢弃。

- **最小权限**<br />使用 Docker 和 Kubernetes 执行器时，镜像、网络和服务账户都由你选择，因此任务只会获得它所需要的东西。

- **Chroot 执行**<br />Semaphore 可以在 chroot 监狱中执行任务，进一步将执行环境与宿主机系统隔离。

- **任务进程用户**<br />任务可以在专用的非 root 系统用户（例如 `semaphore`）下执行，以降低潜在漏洞利用的影响。这是可选的，可根据系统策略进行配置。
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## 安全部署 {#secure-deployment}

为确保 Semaphore 的部署是安全的：

- **使用 HTTPS**<br />
    Semaphore 既支持通过其**内置 TLS 支持**，也支持通过 **Nginx 等反向代理**启用 HTTPS。强烈建议在生产环境中启用 HTTPS。

    要启用内置 HTTPS 支持，请在 **config.json** 中添加以下块：
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **在防火墙后运行**<br />将对 Semaphore UI 和数据库的访问仅限于受信任的 IP。

- **数据库安全**<br />使用强密码，并将数据库访问权限仅限于 Semaphore。

## 更新与补丁管理 {#updates--patch-management}

安全更新会定期发布：

- **保持更新**<br />始终使用最新的稳定版本。

- **变更日志**<br />更新前请在 GitHub 上查看变更内容。

- **自动更新**<br />如果使用 Docker，可考虑使用自动化流水线进行定期更新。

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## 报告漏洞 {#reporting-vulnerabilities}

发现了漏洞？请帮助我们保持 Semaphore 的安全：

- **负责任的披露**<br />请发送邮件至 `security@semaphoreui.com`。
 
### 漏洞修复目标 {#vulnerability-resolution-targets}

我们的目标是在以下时间窗口内修复已报告的漏洞：

- 严重（Critical）：30 天内
- 高危（High）：60 天内
- 中危（Medium）：90 天内
- 低危（Low）：尽力而为，通常在 180 天内

对于影响最新稳定版本且正在被主动利用的问题，可能会发布计划外补丁。

### 代码安全工具 {#code-security-tooling}

我们使用 CodeQL、Codacy、Snyk 和 Renovate 分析代码库和依赖项，并自动化依赖项更新。
- **不公开漏洞利用方式**<br />在修补之前，请勿公开分享漏洞。

- **致谢**<br />如有需要，安全研究人员可在发布说明中获得致谢。
