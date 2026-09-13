# プロジェクト

`semaphore projects` コマンドは、プロジェクトをバックアップファイルとしてエクスポートおよび
インポートします。バックアップは、プロジェクトのテンプレート、インベントリ、リポジトリ、
環境、キー、スケジュール、および関連する設定を含む単一の JSON ドキュメントです。

```bash
semaphore projects --help
```

> `project` は `projects` のエイリアスです。

2 つのサブコマンドがあります:

| コマンド | 用途 |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | プロジェクトのバックアップをファイル (または標準出力) に書き出します。 |
| [`projects import`](#importing-projects-projects-import) | バックアップファイルから 1 つ以上のプロジェクトを復元します。 |

## プロジェクトのエクスポート (`projects export`) {#exporting-a-project-projects-export}

数値の ID または名前で指定した単一のプロジェクトをエクスポートします。

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| フラグ | 説明 |
|------|-------------|
| `--project-id <id>` | エクスポートするプロジェクトの ID。 |
| `--project-name <name>` | エクスポートするプロジェクトの名前 (大文字と小文字は区別しません)。 |
| `--file <path>` | バックアップをこのファイルに書き出します。省略した場合、バックアップは標準出力に表示されます。 |

`--project-id` と `--project-name` のいずれか一方を必ず指定してください。両方を指定した場合、
またはどちらも指定しない場合はエラーになります。

## プロジェクトのインポート (`projects import`) {#importing-projects-projects-import}

1 つ以上のプロジェクトバックアップをインポートします。単一のファイル、またはディレクトリ内で
見つかったすべてのバックアップをインポートできます。インポートされた各プロジェクトは、既存の
管理者 (データベース内の最初の管理者、管理者が存在しない場合は最初のユーザー) を所有者とする
**新しい**プロジェクトとして作成されるため、インポートによって既存のプロジェクトが
上書きされることはありません。

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| フラグ | 説明 |
|------|-------------|
| `--file <path>` | インポートする単一のバックアップファイルのパス。 |
| `--dir <path>` | バックアップファイルを検索するディレクトリ。`.json`、`.backup`、`.bk` で終わるファイルが、ソートされた順にインポートされます。 |
| `--project-name <name>` | インポートするプロジェクトの名前を上書きします。`--file` と組み合わせた場合のみ有効です。 |

`--file` と `--dir` のいずれか一方を必ず指定してください。両方を指定した場合、またはどちらも
指定しない場合はエラーになります。`--project-name` は `--file` とのみ組み合わせることができます。

ディレクトリをインポートする場合、インポートに失敗したファイルは報告されてスキップされます。
コマンドは残りのファイルの処理を続行し、何もインポートされなかった場合にのみ非ゼロの
ステータスで終了します。
