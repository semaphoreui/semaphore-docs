# 项目

`semaphore projects` 命令将项目（Project）导出和导入为备份文件。
一个备份是单个 JSON 文档，包含项目的模板、清单、代码仓库、
环境、密钥、计划任务及相关设置。

```bash
semaphore projects --help
```

> `project` 是 `projects` 的别名。

它有两个子命令：

| 命令 | 用途 |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | 将项目的备份写入文件（或标准输出）。 |
| [`projects import`](#importing-projects-projects-import) | 从备份文件恢复一个或多个项目。 |

## 导出项目（`projects export`） {#exporting-a-project-projects-export}

导出单个项目，可通过其数字 ID 或名称指定。

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| 参数 | 说明 |
|------|-------------|
| `--project-id <id>` | 要导出的项目 ID。 |
| `--project-name <name>` | 要导出的项目名称（不区分大小写匹配）。 |
| `--file <path>` | 将备份写入此文件。省略时，备份会输出到标准输出。 |

`--project-id` 和 `--project-name` 必须且只能提供其中一个——同时提供两者
或两者都不提供都会报错。

## 导入项目（`projects import`） {#importing-projects-projects-import}

导入一个或多个项目备份。您可以导入单个文件，或导入某个目录中找到的
所有备份。每个导入的项目都会作为一个**新**项目创建，归属于一个现有的
管理员（数据库中的第一个管理员，若不存在管理员则为第一个用户），
因此导入永远不会覆盖现有
项目。

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| 参数 | 说明 |
|------|-------------|
| `--file <path>` | 要导入的单个备份文件的路径。 |
| `--dir <path>` | 要扫描备份文件的目录。以 `.json`、`.backup` 或 `.bk` 结尾的文件会按排序顺序导入。 |
| `--project-name <name>` | 覆盖导入项目的名称。仅可与 `--file` 搭配使用。 |

`--file` 和 `--dir` 必须且只能提供其中一个——同时提供两者或两者都不提供
都会报错。`--project-name` 只能与 `--file` 组合使用。

导入目录时，导入失败的文件会被报告并跳过；
命令会继续处理其余文件，并且仅在没有任何文件被成功导入时
才以非零状态退出。
