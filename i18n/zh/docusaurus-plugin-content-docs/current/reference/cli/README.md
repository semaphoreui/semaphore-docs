# CLI

`semaphore` 二进制文件既是服务器，也是一个完整的管理工具。不带参数运行它
（或运行 `semaphore help`）即可列出所有命令：

```bash
semaphore help
```

所有命令和参数的完整生成列表见[命令参考](/reference/cli/commands)。大多数管理任务都有专门的命令组：

| 命令组 | 用途 |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | 添加、修改、删除和查看用户；管理 API 令牌和 TOTP（双因素认证）。 |
| [`semaphore projects`](/reference/cli/projects) | 导出和导入项目（备份）。 |
| [`semaphore vaults`](/reference/cli/vaults) | 重新加密已存储的密钥并查看加密密钥的使用情况。 |
| [`semaphore runner`](/reference/cli/runners) | 以运行器（Runner）模式运行，以及注册/注销运行器。 |
| [`semaphore migrate`](/reference/cli/migrations) | 应用或回滚数据库迁移。 |

若干命令组有更短的别名：`users`/`user`、`projects`/`project`、
`vaults`/`vault` 以及 `server`/`service`。

:::info
每个涉及数据库的命令（`users`、`projects`、`vaults`、`migrate`、
`server`）在运行前都会应用所有待处理的架构迁移。在使用较新版本的
Semaphore CLI 操作已有数据库之前，请先备份数据库。
:::

## 全局选项 {#global-options}

所有命令都接受以下参数：

| 选项 | 说明 |
|--------|-------------|
| `--config <path>` | 配置文件的路径。 |
| `--no-config` | 不读取任何配置文件——仅使用环境变量。 |
| `--log-level <level>` | 日志级别：`DEBUG`、`INFO`、`WARN`、`ERROR`、`FATAL` 或 `PANIC`。未指定时回退到 `SEMAPHORE_LOG_LEVEL` 环境变量。 |
| `--debug-filter <spec>` | 将 `DEBUG` 输出限定到特定命名空间，例如 `'runner,task_*'` 或 `'*,-db'`。仅当日志级别为 `DEBUG` 时生效。未指定时回退到 `SEMAPHORE_DEBUG_FILTER`。 |

### 配置文件的查找方式 {#how-the-configuration-file-is-found}

省略 `--config` 时，Semaphore 按以下顺序查找配置文件，并使用
第一个存在的文件：

1. `SEMAPHORE_CONFIG_PATH` 环境变量中指定的路径。
2. 当前目录下的 `config.json`、`config.yaml` 或 `config.yml`。
3. `/usr/local/etc/semaphore/config.json`（或 `.yaml` / `.yml`）。
4. `/etc/semaphore/config.json`（或 `.yaml` / `.yml`）。

环境变量会在文件之上生效，因此它们会覆盖文件中的值。使用
`--no-config` 时，仅使用环境变量和默认值。完整选项列表请参阅
[配置](/admin-guide/configuration)。

## 版本 {#version}

打印当前版本。

```bash
semaphore version
```

## 交互式设置 {#interactive-setup}

用于首次配置。它会生成密钥、引导您完成交互式问答、写入配置文件、
运行数据库迁移并创建第一个管理员用户。

```bash
semaphore setup
```

传入 `--config <path>` 可指定配置文件的写入位置。
不传入时，setup 会询问输出目录（默认为当前目录），
并在该目录中写入 `config.json`。

如果您输入的用户名或邮箱已存在，setup 会保留现有用户，
而不是新建一个。

完成后，它会打印启动服务器的命令，例如：

```bash
./semaphore server --config /path/to/config.json
```

## 服务器模式 {#server-mode}

启动 Semaphore 服务器（Web 界面和 API）。`service` 是 `server` 的别名。

```bash
semaphore server --config /path/to/config.json
```

服务器启动时会应用待处理的数据库迁移，并打印所使用的数据库、
临时路径、监听接口和端口。

## 运行器模式 {#runner-mode}

将 Semaphore 作为任务运行器运行。完整的子命令列表
（`setup`、`register`、`start`、`unregister`）请参阅[运行器](/reference/cli/runners)。

```bash
semaphore runner start --config /path/to/runner-config.json
```

## 数据库迁移 {#database-migration}

将数据库架构更新到最新。有关应用或回滚到特定版本的说明，
请参阅[数据库迁移](/reference/cli/migrations)。

```bash
semaphore migrate --config /path/to/config.json
```
