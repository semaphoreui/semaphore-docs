# Vault

`semaphore vault` コマンドは、Semaphore がデータベースに保存するシークレット、すなわち
**アクセスキーのシークレット** (SSH キー、ログイン名/パスワードの組、シークレット文字列) と
**JWT 署名キー**の暗号化を管理します。

```bash
semaphore vault --help
```

> `vault` は `vaults` のエイリアスです。

2 つのサブコマンドがあります:

| コマンド | 用途 |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | 保存されているすべてのシークレットをアクティブな暗号化キーで再暗号化します。 |
| [`vault check`](#checking-key-usage-vault-check) | 保存されている各シークレットがどのキー ID で暗号化されているかを報告します (読み取り専用)。 |

暗号化キーの設定とローテーションの方法については、
[暗号化キー](/admin-guide/security/encryption)を参照してください。

## シークレットの再暗号化 (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

ローカルに保存されているすべてのシークレット (アクセスキーのシークレットと JWT 署名キー) を
**アクティブな**暗号化キーで再暗号化し、そのキーの ID を各値に記録します。外部の
シークレットストレージに保存されているシークレットはスキップされます (Semaphore の
キーリングでは暗号化されていないため)。

```bash
semaphore vault rekey
```

### ダウンタイムなしのキーローテーション {#zero-downtime-key-rotation}

アクティブなキーは新しい書き込みを暗号化し、キーセット内の他のすべてのキーは引き続き古い
データを復号できます。したがってローテーションは、キーを追加し、アクティブポインターを
切り替え、バックグラウンドで再暗号化し、その後古いキーを削除する、という手順になります。

1. キーセットに新しいキーを追加し (`keys_folder` 内のファイル、または `keys:` エントリ)、
   アクティブポインター (`active.secret_key` または `secret_key_file`) をそのキーに向けます。
   変更は `keys_poll_interval` (デフォルト `15s`) 以内に適用されます。`kill -HUP <pid>` で
   即時に適用することもできます。再起動は不要です。
2. `semaphore vault rekey` を実行して、既存のデータを新しいキーで再暗号化します。
3. [`semaphore vault check`](#checking-key-usage-vault-check) を実行します。古いキーが
   `0 rows` と表示されたら、キーセットから安全に削除できます。

### オプション {#options}

| フラグ | 説明 |
|------|-------------|
| `--old-key <key>` | レガシーな単一キーからの移行用に、古い暗号化キーを明示的に指定します。古いキーがすでにセカンダリとしてキーセットに含まれている場合は不要です。キー ID が記録されていないプレフィックスなしの (レガシーな) データの復号に使用されます。 |
| `--backup <file>` | 再暗号化の前に、現在のアクセスキーの暗号文のバックアップを `<file>` に書き出します。 |
| `--rollback <file>` | 再暗号化する代わりに、バックアップファイルからアクセスキーの暗号文を復元します。 |

### バックアップとロールバック {#backup-and-rollback}

再暗号化の前に現在の暗号文のスナップショットを取得し、問題が発生した場合に復元します:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

バックアップは JSON Lines ファイルで、アクセスキーごとに 1 エントリ (`project_id`、
`key_id`、`secret`) が含まれます。ロールバックはこれらの暗号文をそのまま書き戻します。

### レガシーな単一キーからの移行 {#legacy-single-key-migration}

データが、単一の `access_key_encryption` キーを使用していた (ローテーションもキー ID の
記録もない) 古い Semaphore で暗号化されている場合は、そのキーを明示的に渡すことで、
アクティブなキーで再暗号化する前に復号できるようにします:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

古いキーがキーセットに含まれていれば、この操作は不要です。Semaphore は各値を記録された
ID で検索し、対応するキーで自動的に復号します。

## キーの使用状況の確認 (`vault check`) {#checking-key-usage-vault-check}

読み取り専用です。キー ID ごとに、そのキーで暗号化されているローカル保存のアクセスキー
シークレット (および JWT 署名キー) の数と、JWT 署名キーの状態を報告します。`vault rekey` の
後に実行して、廃止したキーを安全に削除できることを確認します。参照数がゼロのキーは
キーセットから削除できます。

```bash
semaphore vault check
```

出力例:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

各キー ID は、次のいずれかのステータスとともに報告されます:

| ステータス | 意味 |
|--------|---------|
| `active` | 現在、新しい書き込みの暗号化に使用されているキーです。 |
| `retired, rekey pending` | まだ一部の行を暗号化しているキーです。`vault rekey` を実行して、それらをアクティブなキーに移してください。 |
| `retired, SAFE TO REMOVE` | このキーを参照する行がありません (`0 rows`)。キーセットから削除できます。 |
| `legacy (no id)` | キー ID が導入される前に暗号化された行です。rekey を実行して ID を記録してください。 |
| `MISSING KEY (cannot decrypt)` | 参照されているキー ID がキーセットに存在しません。 |

最後の行は、どのキーが JWT 署名キーを暗号化しているかを報告します。まだ生成されていない
場合は `JWT signing key: not set` と表示されます。

キーセットに存在しないキー ID を参照するシークレットがある場合、コマンドはそれらの行を
指摘し、**非ゼロのステータスで終了します**。そのデータを復号できるようにするには、
不足しているキーをキーセットに戻してください。
