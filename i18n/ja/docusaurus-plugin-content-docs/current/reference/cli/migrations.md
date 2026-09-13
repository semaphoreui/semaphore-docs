# データベースマイグレーション

`semaphore migrate` コマンドは、指定した Semaphore のバージョンに合わせて Semaphore の
データベーススキーマを更新またはロールバックします。アップグレードとダウングレードに使用します。

```bash
semaphore migrate --help
```

:::info
`migrate` を手動で実行する必要はほとんどありません。`semaphore server`、`semaphore setup`、
およびデータベースにアクセスするその他すべての CLI コマンドは、実行前に保留中の
マイグレーションを自動的に適用します。`migrate` は、サーバーを起動せずにマイグレーションを
適用する場合や、ロールバックする場合に使用します。
:::

:::warning
マイグレーションを適用またはロールバックする前に、必ずデータベースをバックアップしてください。
:::

## マイグレーションの適用 {#applying-migrations}

保留中のすべてのマイグレーションを適用し、データベースを最新の状態にします:

```bash
semaphore migrate --config /path/to/config.json
```

特定のバージョンまでのマイグレーションのみを適用します:

```bash
semaphore migrate --apply-to 2.15.1
```

## マイグレーションのロールバック {#rolling-back-migrations}

以前のバージョンまでマイグレーションを取り消します:

```bash
semaphore migrate --undo-to 2.13
```

ダウングレード先の Semaphore のバージョンを指定してください。`migrate` を実行するバイナリは、
取り消すすべてのマイグレーションを認識している必要があるため、古いバイナリをインストールする
前に**新しい**バイナリで実行してください。

## オプション {#options}

| フラグ | 説明 |
|------|-------------|
| `--apply-to <version>` | このバージョンまで (このバージョンを含む) のマイグレーションを適用します (例: `2.15` や `2.14.4`)。 |
| `--undo-to <version>` | このバージョンまでマイグレーションをロールバックします。 |

`--apply-to` と `--undo-to` は同時に指定できません。両方を渡すとエラーになります。
どちらのフラグも指定しない場合は、保留中のすべてのマイグレーションが適用されます。

完了すると、コマンドは使用したデータベース接続を表示します。

:::note
`semaphore migrate` は後方互換性のために `--err-log-size`、`--skip-task-output`、
`--merge-existing-users` を引き続き受け付けますが、2.19 以降では効果がありません。
これらは以下で説明する BoltDB からのインポート用のものでした。
:::

## BoltDB から SQLite/MySQL/PostgreSQL への移行 {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*バージョン 2.17 および 2.18 でのみ利用可能*

BoltDB はバージョン 2.16 から非推奨となり、**バージョン 2.19 でサポートが削除されました**。
`--from-boltdb` フラグと環境変数 `SEMAPHORE_MIGRATE_FROM_BOLTDB` は 2.19 以降には存在せず、
`semaphore setup` は BoltDB データベースの設定を拒否します。

:::warning
まだ BoltDB を使用している場合は、2.19 以降にアップグレードする**前に**移行してください。
Semaphore **2.17 または 2.18** をインストールし、以下の移行を実施してから、
新しいバージョンにアップグレードしてください。
:::

移行するには、まず Semaphore バージョン 2.17 または 2.18 をインストールし、次に
`config.json` で移行先のデータベース (SQLite、MySQL、または PostgreSQL) を設定します。
その後、次のコマンドを実行して、古い BoltDB ファイルからすべてのデータを新しい
データベースにインポートします:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

このコマンドは、すべてのプロジェクト、テンプレート、インベントリ、リポジトリ、キー、
ユーザー、タスク履歴を BoltDB から読み取り、現在の Semaphore 設定で指定された
データベースに書き込みます。元の BoltDB ファイルは変更されません。

追加の引数 (2.17 および 2.18 のみ):

| フラグ | 説明 |
|------|-------------|
| `--err-log-size <n>` | 出力に表示するエラー行の最大数。 |
| `--skip-task-output` | タスクの出力をインポートしません。 |
| `--merge-existing-users` | 競合時に失敗するのではなく、ユーザー名が一致する既存のユーザーを再利用します。 |

Semaphore UI の Docker コンテナを使用している場合は、環境変数
`SEMAPHORE_MIGRATE_FROM_BOLTDB` を設定することで、既存の BoltDB データベースを自動的に
インポートできます。インポートはコンテナの初回起動時に一度だけ実行されます。例:

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

## トラブルシューティング {#troubleshooting}

- マイグレーションが失敗した場合は、ログで詳細を確認し、CLI バイナリが Semaphore サーバーと
  同じバージョンであることを確認してください。
- CLI がサーバーと同じ設定ファイル (したがって同じデータベース) を使用していることを
  確認してください。
  [設定ファイルの検索方法](/reference/cli#how-the-configuration-file-is-found)を参照してください。
