# 任务 JWT

当[服务器上启用了 JWT 签发](/admin-guide/security/jwt)时，
模板可以为它创建的每个任务（Task）签发一个短期有效的签名令牌。
该令牌以 `SEMAPHORE_JWT` 环境变量的形式暴露给正在运行的 playbook 或脚本，
可以用来向任何支持 JWT 认证的系统换取凭据，
例如 OpenBao 或 HashiCorp Vault。

相比存储在[密钥库](/user-guide/key-store)中的长期密钥，
其优势在于每个任务都会获得一个**标识具体任务运行的全新令牌**
（项目、模板、用户 ID），并在任务结束后不久过期。

## 在模板上启用 JWT {#enabling-jwts-on-a-template}

在模板表单中滚动到 **JWT** 区域（只有在管理员[启用了 JWT 签发](/admin-guide/security/jwt)后才会显示），
然后勾选 **JWT enabled**。

你可以为每个模板配置以下选项：

| 字段 | 说明 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | 写入 `aud` 声明的一个或多个字符串。将其设置为下游系统期望的标识符（例如 OpenBao 服务器 URL）。最多支持 32 个条目。 |
| TTL | 以时长表示的令牌有效期（`30s`、`10m`、`1h` 等）。留空时使用全局的 `jwt.default_ttl`。TTL 不得超过全局的 `jwt.max_ttl`。 |

## 令牌声明 {#token-claims}

每个令牌都携带以下声明，你可以在下游系统中授予访问权限时依赖它们：

| 声明 | 示例 | 说明 |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | 由管理员配置。 |
| `aud` | `https://bao.example.com` | 来自模板的 audience 列表。 |
| `sub` | `task:1234` | 每次任务运行唯一。 |
| `iat` / `nbf` / `exp` | | 标准时间声明。 |
| `jti` | | 唯一的令牌标识符。 |
| `project_id` | `7` | 模板所属的项目。 |
| `template_id` | `42` | 生成该任务的模板。 |
| `user_id` | `67` | 启动任务的用户（计划任务/集成运行时省略） |

使用这些声明在消费端**限定**访问范围。例如，一个只接受 `project_id = 7`
和特定 `template_id` 令牌的 OpenBao 角色。

## 在任务中使用令牌 {#using-the-token-inside-a-task}

Semaphore 在任务进程的环境中将令牌导出为 `SEMAPHORE_JWT`。

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## 示例：OpenBao {#example-openbao}

以下演示将配置 OpenBao 信任 Semaphore 的 JWT，并用它们换取一个演示密码。
请将 `semaphore.example.com` 和 `bao.example.com` 替换为你自己的主机名。

### 1. 配置 JWT 认证方法 {#1-configure-the-jwt-auth-method}

启用 JWT 认证方法，并将其指向你的 Semaphore 实例的 JWKS 端点。
OpenBao 使用从该端点获取的公钥来验证每个令牌。

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. 定义策略 {#2-define-a-policy}

授予任务所需的权限。下面的示例允许读取位于 `kv/data/semaphore/demo` 下的演示凭据：

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. 定义绑定到模板的 OpenBao 角色 {#3-define-an-openbao-role-bound-to-a-template}

OpenBao 角色决定**哪些 Semaphore 任务**可以使用哪个策略。
将 Semaphore 特有的声明（`project_id`、`template_id` 等）用作 `bound_claims`，
这样只有目标模板才能使用该角色：

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

请始终至少使用 `project_id` 或 `template_id` 声明来限制每个角色。
如果没有绑定，你的 Semaphore 实例签发的**任何** JWT 都可以使用该角色。

支持的配置参数的完整列表请参阅[此处](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. 配置模板 {#4-configure-the-template}

在运行部署 playbook 的 Semaphore 模板上：

- 勾选 **JWT enabled**。
- 将 **Audience** 设置为 `https://bao.example.com` —— 这与 OpenBao 角色中的
  `bound_audiences` 匹配。
- 可选地将 **TTL** 设置为 `15m`，使令牌在任务结束后不久过期。

### 5. 在任务中使用令牌 {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

现在，任务无需任何预共享密钥即可向 OpenBao 进行认证 :tada:
