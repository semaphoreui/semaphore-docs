# 来自环境变量和文件的密钥

除了把密钥保存在数据库中，密钥库（Key Store）中的条目还可以在任务运行时从 Semaphore 服务器上的
**文件**，或从 Semaphore 服务器进程的**环境变量**中读取其值。
当凭据已经在 Semaphore 之外完成配置时，这非常有用，例如：

* 以 Docker 或 Kubernetes secret 的形式挂载到 Semaphore 容器中的 SSH 密钥；
* 由某个代理（HashiCorp Vault Agent、cert-manager 等）写入磁盘并定期轮换的令牌；
* 由编排器注入到容器环境中的密码。

Semaphore 不会把该值复制到自己的数据库中。每当任务需要该密钥时，服务器都会重新读取文件或变量，
因此在磁盘上轮换凭据后，下一个任务就会生效。

:::info
文件或变量由 **Semaphore 服务器**读取，而不是由运行器（Runner）读取。使用远程运行器时，
请把文件挂载到服务器主机上；服务器解析密钥后再交给运行器。
:::

## 选择来源 {#choosing-the-source}

创建或编辑密钥时（**Key Store → New Key**），表单顶部有来源选项卡：

| 选项卡 | 值的来源 | 需要填写的内容 |
|-----|---------------------------|---------------|
| **Local** | Semaphore 数据库（加密存储） | 在表单中填写登录名、密码或私钥 |
| **Storage** <Pro /> | 外部密钥存储，例如 [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | 存储以及密钥路径 |
| **Env** | Semaphore 服务器进程的环境变量 | 变量名，例如 `PROD_SSH_KEY` |
| **File** | Semaphore 服务器上的文件 | 文件的**绝对**路径，例如 `/var/lib/semaphore/secrets/prod.json` |

选择 **Env** 或 **File** 后，登录名、密码和私钥字段会消失。完整的凭据（包括 SSH 和
Login With Password 类型密钥的登录名）都必须放在文件或变量中。

## 1. 允许目录 {#allow-the-directory}

出于安全考虑，Semaphore 只读取位于其**密钥目录**内的密钥文件。任务启动时，其他任何路径都会被拒绝：

```
Failed to install inventory: file path must be inside secrets path
```

默认的密钥目录是 `/tmp/semaphore`。请通过 `config.json` 中的 `dirs.secrets` 或
`SEMAPHORE_SECRETS_PATH` 环境变量把它指向存放密钥文件的目录。
优先级规则请参阅[密钥目录](/admin-guide/configuration/config-file#secrets-directory)。

下面的 Docker Compose 示例挂载了一个主机目录并允许读取它：

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

等效的 `config.json` 片段：

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

在 **File** 选项卡中填写的路径须遵守以下规则：

* 必须是绝对路径（`/var/lib/semaphore/secrets/prod.json`，而不是 `prod.json`）；
* 不得包含 `..` 片段；
* 解析后必须位于密钥目录内（子目录也可以）；
* 文件必须可被运行 Semaphore 的用户读取（在官方 Docker 镜像中该用户是 `semaphore`，UID 1001）。

环境变量没有此类限制；服务器只是从自身环境中读取指定名称的变量。

## 2. 设置值的格式 {#format-the-value}

文件内容（或变量的值）取决于密钥类型。文件末尾的单个换行符会被忽略；其余内容按原样使用。

### SSH 密钥 {#ssh-key}

Semaphore 期望的是一个 **JSON 文档**，而不是原始的 PEM 或 OpenSSH 私钥文件：

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login`——SSH 用户名，以 `--user` 参数传给 Ansible。留空则由清单（Inventory）决定（`ansible_user`）。对于 Git 仓库，登录名为空时默认使用 `git`。
* `passphrase`——私钥的口令，或空字符串。
* `private_key`——私钥内容，换行符编码为 `\n`。

可以用 `jq` 从现有密钥生成该封装格式，它会自动处理转义：

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

然后创建一个类型为 **SSH** 的密钥，打开 **File** 选项卡，输入 `/var/lib/semaphore/secrets/prod_ssh.json`
（即容器**内部**看到的路径）。

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
把 **File** 选项卡指向原始私钥（例如 `~/.ssh/id_ed25519`）是行不通的。
该文件会被按 JSON 解析，任务在加载清单时会失败。
:::

### Login With Password {#login-with-password}

同样是一个 JSON 文档：

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

将 `login` 留空即可把该密钥用作普通令牌或密码，例如用作 Ansible vault 密码。

## 环境变量示例 {#environment-variable-example}

**Env** 选项卡使用相同的 JSON 格式。在 Docker Compose 中：

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

创建一个 **SSH** 密钥，选择 **Env** 选项卡，并输入 `PROD_SSH_KEY` 作为变量名。

:::tip
环境变量对容器内的每个进程都可见，而且经常会出现在编排器的元数据和日志中。
在可能的情况下，优先使用 **File** 选项卡配合挂载的 secret。
:::

## 故障排查 {#troubleshooting}

| 错误 | 原因 | 解决方法 |
|-------|-------|-----|
| `file path must be absolute` | 填写了相对路径 | 填写以 `/` 开头的完整路径 |
| `file path must not contain traversal segments` | 路径中包含 `..` | 填写解析后的路径 |
| `file path must be inside secrets path` | 文件位于 `dirs.secrets` 之外 | 把 `SEMAPHORE_SECRETS_PATH` 设为文件所在目录，或移动文件 |
| `no such file or directory` | 路径错误，或未挂载到容器中 | 检查卷挂载，并使用容器内的路径 |
| `permission denied` | Semaphore 进程无法读取该文件 | 修正文件的所有者或权限 |
| `invalid character '-' looking for beginning of value` | 提供的是原始私钥而不是 JSON 封装 | 按上文所示封装密钥 |
