# 数据库迁移

`semaphore migrate` 命令将 Semaphore 数据库架构更新或回滚到与指定
Semaphore 版本相匹配的状态。可用于升级和降级。

```bash
semaphore migrate --help
```

:::info
您很少需要手动运行 `migrate`。`semaphore server`、`semaphore setup`
以及其他所有涉及数据库的 CLI 命令都会在运行前自动应用待处理的迁移。
`migrate` 用于在不启动服务器的情况下应用迁移，或用于回滚。
:::

:::warning
在应用或回滚迁移之前，务必备份数据库。
:::

## 应用迁移 {#applying-migrations}

应用所有待处理的迁移，将数据库更新到最新：

```bash
semaphore migrate --config /path/to/config.json
```

仅应用到某个特定版本为止的迁移：

```bash
semaphore migrate --apply-to 2.15.1
```

## 回滚迁移 {#rolling-back-migrations}

撤销迁移，回退到之前的版本：

```bash
semaphore migrate --undo-to 2.13
```

请使用您要降级到的 Semaphore 版本号。运行 `migrate` 的二进制文件
必须知道所有被撤销的迁移，因此请先用**较新的**二进制文件运行它，
然后再安装旧版本。

## 选项 {#options}

| 参数 | 说明 |
|------|-------------|
| `--apply-to <version>` | 应用迁移直到并包含此版本（例如 `2.15` 或 `2.14.4`）。 |
| `--undo-to <version>` | 回滚迁移直到此版本。 |

`--apply-to` 与 `--undo-to` 互斥；同时传入两者会报错。
不带任一参数时，应用所有待处理的迁移。

完成后，该命令会打印其所使用的数据库连接。

:::note
为保持向后兼容，`semaphore migrate` 仍接受 `--err-log-size`、`--skip-task-output` 和
`--merge-existing-users`，但在 2.19 及更高版本中它们不再有任何作用。
它们属于下文所述的 BoltDB 导入功能。
:::

## 从 BoltDB 迁移到 SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*仅在 2.17 和 2.18 版本中可用*

BoltDB 自 2.16 版本起已弃用，并且**在 2.19 版本中移除了支持**。
`--from-boltdb` 参数和 `SEMAPHORE_MIGRATE_FROM_BOLTDB`
环境变量在 2.19+ 中已不存在，并且 `semaphore setup` 会拒绝
配置 BoltDB 数据库。

:::warning
如果您仍在使用 BoltDB，请在升级到 2.19 或更高版本**之前**完成迁移。
请安装 Semaphore **2.17 或 2.18**，执行下文的迁移步骤，然后再
升级到更新的版本。
:::

迁移时，请先安装 Semaphore 2.17 或 2.18 版本，然后在 `config.json` 中
配置目标数据库（SQLite、MySQL 或 PostgreSQL）。之后，
运行以下命令，将旧 BoltDB 文件中的所有数据导入
新数据库：

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

该命令从 BoltDB 读取所有项目、模板、清单、代码仓库、密钥、
用户和任务历史，并将它们写入当前 Semaphore 配置中指定的
数据库。原始 BoltDB 文件不会被
修改。

附加参数（仅限 2.17 和 2.18）：

| 参数 | 说明 |
|------|-------------|
| `--err-log-size <n>` | 输出中显示的错误行数上限。 |
| `--skip-task-output` | 不导入任务输出。 |
| `--merge-existing-users` | 按用户名匹配并复用现有用户，而不是在冲突时失败。 |

如果您使用 Semaphore UI 的 Docker 容器，可以设置
`SEMAPHORE_MIGRATE_FROM_BOLTDB` 环境变量来自动导入
现有的 BoltDB 数据库。导入仅在容器首次启动时执行一次。
示例：

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## 故障排查 {#troubleshooting}

- 如果迁移失败，请查看日志了解详情，并确保 CLI 二进制文件
  与 Semaphore 服务器版本一致。
- 确保 CLI 使用与服务器相同的配置文件（从而使用相同的
  数据库）。参见
  [配置文件的查找方式](/admin-guide/cli#how-the-configuration-file-is-found)。
