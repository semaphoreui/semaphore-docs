# 配置文件

## 创建配置文件 {#creating-configuration-file}

Semaphore 使用 `config.json` 文件作为其核心配置。你可以使用内置工具交互式地生成此文件，也可以通过基于网页的配置生成器来生成。

### 通过 CLI 生成 {#generate-via-cli}

使用以下命令交互式地生成配置文件：

* 对于 Semaphore 服务器：
  ```
  semaphore setup
  ```
* 对于 Semaphore 运行器（Runner）：
  ```
  semaphore runner setup
  ```
  
  :::tip
    有关运行器配置的更多详情，请参阅<a href="./../runners">运行器</a>一节。
  :::

### 在网站上生成 {#generate-on-the-website}

或者，你也可以使用基于网页的交互式配置生成器：
* [服务器配置生成器](https://semaphoreui.com/install/binary/2_13/config)
* [运行器配置生成器](https://semaphoreui.com/install/binary/2_13/runner)

## 配置文件示例 {#configuration-file-example}

Semaphore 使用的 `config.json` 配置文件内容如下：

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## 配置文件的使用 {#configuration-file-usage}

* 对于 Semaphore 服务器：

```bash
semaphore server --config ./config.json
```

* 对于 Semaphore 运行器：

```bash
semaphore runner start --config ./config.json
```

## 密钥文件目录 {#secrets-directory}

Semaphore 仅从一个可配置的目录中读取密钥文件（例如[基于文件的密钥库（Key Store）条目](/user-guide/key-store/env-and-file-sources)，或从磁盘读取的 HashiCorp Vault 和 OpenBao 令牌）。

| 选项 | 环境变量 | 说明 |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | 存放密钥文件的目录。默认值：`/tmp/semaphore`。 |
| `secrets_path`（旧版） | `SEMAPHORE_SECRETS_PATH` | 为向后兼容而保留的顶层设置。仅当 `dirs.secrets` 未设置或仍为默认路径时使用。 |

**优先级**：非默认值的 `dirs.secrets` 优先于旧版的 `secrets_path`。当你设置 `SEMAPHORE_SECRETS_PATH` 时，Semaphore 会将其同时应用到这两个字段。

使用当前布局的示例：

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

旧版安装可能仍在使用：

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

在密钥库表单的 **文件（File）** 标签页中选择的密钥文件，以及外部密钥存储所引用的令牌文件，都必须位于此目录内。位于该目录之外的路径会被拒绝，并提示 `file path must be inside secrets path`。请参阅[来自环境变量和文件的密钥](/user-guide/key-store/env-and-file-sources)。

## Git 操作 {#git-operations}

Semaphore 会在每次运行前克隆并更新任务仓库。有两个选项控制此行为：

| 选项 | 环境变量 | 说明 |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Git 客户端实现：`cmd_git`（默认，使用系统的 `git` 二进制文件）或 `go_git`（纯 Go 客户端）。 |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | 克隆和拉取操作在任务失败前的尝试次数。默认值：`4`。设为 `1` 表示只尝试一次、不重试。 |

当克隆或拉取失败且仍有剩余重试次数时，Semaphore 会按指数退避等待（从 1 秒开始，每次尝试翻倍，上限 60 秒），并记录类似 `Git pull failed (...), retrying in 2s` 的消息。重试仅适用于网络操作；检出失败或认证错误在所有尝试用尽后仍会导致任务失败。

如果你的 Git 服务器偶尔不可用，请增大 `git_attempts`。如果失败是即时且持续的（凭据错误、仓库不存在），请修复根本问题——重试无济于事。
