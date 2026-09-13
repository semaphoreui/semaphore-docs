# CLI

`semaphore` バイナリは、サーバーであると同時に完全な管理ツールでもあります。引数なしで
(または `semaphore help` を) 実行すると、すべてのコマンドが一覧表示されます:

```bash
semaphore help
```

すべてのコマンドとフラグを網羅した生成済みの一覧は
[コマンドリファレンス](/reference/cli/commands)を参照してください。ほとんどの管理タスクには専用のコマンドグループがあります:

| コマンドグループ | 用途 |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | ユーザーの追加、変更、削除、参照。API トークンと TOTP (2FA) の管理。 |
| [`semaphore projects`](/reference/cli/projects) | プロジェクトのエクスポートとインポート (バックアップ)。 |
| [`semaphore vaults`](/reference/cli/vaults) | 保存されたシークレットの再暗号化と、暗号化キーの使用状況の確認。 |
| [`semaphore runner`](/reference/cli/runners) | ランナーモードでの実行と、ランナーの登録/登録解除。 |
| [`semaphore migrate`](/reference/cli/migrations) | データベースマイグレーションの適用またはロールバック。 |

いくつかのコマンドグループには短いエイリアスがあります: `users`/`user`、`projects`/`project`、
`vaults`/`vault`、`server`/`service`。

:::info
データベースにアクセスするすべてのコマンド (`users`、`projects`、`vaults`、`migrate`、
`server`) は、実行前に保留中のスキーママイグレーションを適用します。新しいバージョンの
Semaphore の CLI を既存のデータベースに対して実行する前に、データベースのバックアップを
取得してください。
:::

## グローバルオプション {#global-options}

これらのフラグはすべてのコマンドで使用できます:

| オプション | 説明 |
|--------|-------------|
| `--config <path>` | 設定ファイルのパス。 |
| `--no-config` | 設定ファイルを一切読み込まず、環境変数のみを使用します。 |
| `--log-level <level>` | ログの詳細度: `DEBUG`、`INFO`、`WARN`、`ERROR`、`FATAL`、`PANIC` のいずれか。未指定の場合は環境変数 `SEMAPHORE_LOG_LEVEL` が使用されます。 |
| `--debug-filter <spec>` | `DEBUG` 出力を特定の名前空間に絞り込みます。例: `'runner,task_*'` や `'*,-db'`。ログレベルが `DEBUG` の場合にのみ有効です。未指定の場合は `SEMAPHORE_DEBUG_FILTER` が使用されます。 |

### 設定ファイルの検索方法 {#how-the-configuration-file-is-found}

`--config` が省略された場合、Semaphore は次の順序でファイルを探し、最初に見つかったものを
使用します:

1. 環境変数 `SEMAPHORE_CONFIG_PATH` に指定されたパス。
2. カレントディレクトリの `config.json`、`config.yaml`、または `config.yml`。
3. `/usr/local/etc/semaphore/config.json` (または `.yaml` / `.yml`)。
4. `/etc/semaphore/config.json` (または `.yaml` / `.yml`)。

環境変数はファイルの上に適用されるため、ファイルの値を上書きします。`--no-config` を
指定した場合は、環境変数とデフォルト値のみが使用されます。オプションの全一覧は
[設定](/admin-guide/configuration)を参照してください。

## バージョン {#version}

現在のバージョンを表示します。

```bash
semaphore version
```

## 対話型セットアップ {#interactive-setup}

初回設定に使用します。シークレットを生成し、対話型の質問に順に答えていくことで
設定ファイルを書き出し、データベースマイグレーションを実行して、最初の管理者ユーザーを
作成します。

```bash
semaphore setup
```

設定ファイルの書き出し先を選択するには `--config <path>` を渡します。指定しない場合、
セットアップは出力ディレクトリ (デフォルト: カレントディレクトリ) を尋ね、そこに
`config.json` を書き出します。

入力したユーザー名またはメールアドレスがすでに存在する場合、セットアップは新しいユーザーを
作成せず、既存のユーザーをそのまま使用します。

完了すると、サーバーを起動するためのコマンドが表示されます。例:

```bash
./semaphore server --config /path/to/config.json
```

## サーバーモード {#server-mode}

Semaphore サーバー (Web UI と API) を起動します。`service` は `server` のエイリアスです。

```bash
semaphore server --config /path/to/config.json
```

サーバーは起動時に保留中のデータベースマイグレーションを適用し、使用している
データベース、一時パス、インターフェース、ポートを表示します。

## ランナーモード {#runner-mode}

Semaphore をタスクランナーとして実行します。サブコマンドの全一覧 (`setup`、`register`、
`start`、`unregister`) は[ランナー](/reference/cli/runners)を参照してください。

```bash
semaphore runner start --config /path/to/runner-config.json
```

## データベースマイグレーション {#database-migration}

データベーススキーマを最新の状態にします。特定のバージョンへの適用またはロールバックに
ついては[データベースマイグレーション](/reference/cli/migrations)を参照してください。

```bash
semaphore migrate --config /path/to/config.json
```
