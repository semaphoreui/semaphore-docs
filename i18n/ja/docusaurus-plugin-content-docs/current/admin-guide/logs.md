# ログ

Semaphore はサーバーログを **stdout** に書き出し、**タスク**ログと**アクティビティ**ログを**データベース**に保存します。これにより重要なログ情報が一元化され、ログファイルを個別にバックアップする必要がなくなります。ファイルシステムに保存されるのはキャッシュデータのみです。

---

## サーバーログ {#server-log}

Semaphore はファイルにログを書き込みません。代わりに、すべてのアプリケーションログは **stdout** に出力されます。  
Semaphore を systemd サービスとして実行している場合は、次のコマンドでログを確認できます。

```bash
journalctl -u semaphore.service -f
```

Semaphore を Docker コンテナで実行している場合は、次のコマンドでログを確認できます。
```
docker logs -f my-semaphore-container
```

これにより、ログをライブ(ストリーミング)で表示できます。

---

## アクティビティログ {#activity-log}

アクティビティログは、Semaphore で実行されたユーザー操作を記録します。たとえば次のような操作です。

- リソース(テンプレート、インベントリ、リポジトリなど)の追加または削除。
- チームメンバーの追加または削除。

### Pro バージョン 2.10 以降 <Pro /> {#pro-version-210-and-later}

**Semaphore Pro** 2.10 以降では、アクティビティログとタスクログをファイルに書き出せます。有効にするには、`config.json` に次の設定を追加します。

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


または、次の環境変数を使用して設定することもできます。

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### アクティビティ(イベント)ログのオプション {#activity-events-logging-options}

アクティビティ(イベント)ログのオプションでは、Semaphore がユーザー操作やシステムイベントをファイルに記録する方法を設定できます。これらの設定は、有効化の有無、ログエントリの形式、ロガー固有の設定など、イベントログの動作を制御します。有効にすると、テンプレートの作成やチームの管理などのユーザー操作が、これらの設定に従って指定されたログファイルに書き込まれます。

| パラメータ             | 環境変数 | 説明           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | イベントログのファイル出力を有効にします。 |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | ログレコードの形式。raw 形式では空のままにするか、`json` を指定します。 |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [ロガーのオプション](#logger-options)。 |

#### タスクログのオプション {#tasks-logging-options}

タスクログのオプションでは、Semaphore がタスク実行の詳細をファイルに記録する方法を設定できます。これらの設定は、タスクの開始、完了、実行ステータスなど、タスク関連イベントのログ出力を制御します。有効にすると、すべてのタスク操作とその結果が、これらの設定に従って指定されたログファイルに書き込まれ、タスク実行履歴の詳細な監査証跡が得られます。

| パラメータ             | 環境変数 | 説明           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | タスクログのファイル出力を有効にします。 |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | ログレコードの形式。raw 形式では空のままにするか、`json` を指定します。 |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [ロガーのオプション](#logger-options)。 |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | ロガーのオプション。 |



#### ロガーのオプション {#logger-options}

| パラメータ             | 型 | 説明           |
| --------------------- | ------- | --------------------- |
| `filename`     | 文字列  | ログを書き込むファイルのパスと名前。バックアップログファイルは同じディレクトリに保持されます。空の場合は、一時ディレクトリ内の `processname`-lumberjack.log が使用されます。 |
| `maxsize`      | 整数 | ローテーションされるまでのログファイルの最大サイズ(メガバイト単位)。デフォルトは 100 メガバイトです。 |
| `maxage`       | 整数 | ファイル名に含まれるタイムスタンプに基づいて、古いログファイルを保持する最大日数。1 日は 24 時間として定義されるため、夏時間やうるう秒などの影響で暦日と正確には一致しない場合があります。デフォルトでは、経過日数に基づく古いログファイルの削除は行われません。 |
| `maxbackups`   | 整数 | 保持する古いログファイルの最大数。デフォルトではすべての古いログファイルを保持します(ただし、MaxAge によって削除される場合があります)。 |
| `localtime`    | 真偽値 | バックアップファイルのタイムスタンプの整形に、コンピュータのローカル時刻を使用するかどうかを指定します。デフォルトでは UTC 時刻を使用します。 |
| `compress`     | 真偽値 | ローテーションされたログファイルを gzip で圧縮するかどうかを指定します。デフォルトでは圧縮は行われません。 |



ファイル内の各行は次の形式に従います。

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## タスク履歴 {#task-history}

Semaphore はタスク実行に関する情報をデータベースに保存します。タスク履歴では、実行されたすべてのタスクについて、ステータスやログを含む詳細を確認できます。Web インターフェースから、タスクをリアルタイムで監視したり、過去のログを確認したりできます。

### タスク保持数の設定 {#configuring-task-retention}

デフォルトでは、Semaphore はすべてのタスクをデータベースに保存します。多数のタスクを実行すると、ディスク容量を大量に消費する可能性があります。

テンプレートごとに保持するタスク数は、次のいずれかの方法で設定できます。

1. **環境変数**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **`config.json` オプション**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

タスク数がこの上限を超えると、最も古いタスクログが自動的に削除されます。

---

## Syslog プロトコルのサポート <Enterprise /> {#syslog-protocol-support}

Semaphore は、長期保存や集中監視のために、アクティビティログとタスクログのエントリを外部の syslog コレクターに転送できます。syslog 転送はデフォルトでは無効です。

`config.json` で syslog のサポートを設定します。

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

JSON ファイルを編集したくない場合は、同じオプションを環境変数で指定することもできます。

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Syslog のオプション {#syslog-options}

| パラメータ             | 環境変数 | 説明           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | syslog 転送のオン/オフを切り替えます。 |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | コレクターへの接続に使用するプロトコル(`udp` や `tcp` など)。 |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | `host:port` 形式のコレクターアドレス。 |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | すべてのメッセージの先頭に付加される任意の識別子。 |


これらの値を変更した後は、新しい syslog の送信先を適用するために Semaphore サービスを再起動してください。

---

## SIEM 連携 {#siem-integration}

サインインとアカウントの変更(新しいユーザー、ロール、API トークンなど)は[監査ログ](/admin-guide/audit-log)に記録できます。
Semaphore Pro は監査ログを [SIEM に送信](/admin-guide/audit-log#siem-export)できます。

## まとめ {#summary}

- **サーバーログ:** stdout に書き出されます。systemd 配下で実行している場合は `journalctl` で確認できます。  
- **アクティビティログとタスクログ:** すべてのユーザー操作を記録します。**Pro 2.10 以降**では、オプションでファイルに書き出すこともできます。  
- **タスク履歴:** リアルタイムおよび過去のタスク実行ログを保存します。保持数はテンプレートごとに設定できます。
- **監査ログ:** サインインとアカウントの変更を記録します。既定では無効です。

これらのガイドラインに従うことで、ストレージ使用量とログの保持を制御しつつ、Semaphore UI の動作を適切に把握できます。
