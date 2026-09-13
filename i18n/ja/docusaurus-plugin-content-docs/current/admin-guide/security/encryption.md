---
id: encryption
title: 暗号化キー
sidebar_label: 暗号化キー
description: Semaphore がシークレットを暗号化する仕組み、暗号化キーの設定方法、およびダウンタイムなしでキーをローテーションする方法。
---

# 暗号化キー

Semaphore は、保存するデータの中で最も機密性の高いもの — **アクセスキーのシークレット**
(SSH 秘密鍵、ログイン/パスワードのペア、シークレット文字列) と **JWT 署名
キー** — を AES‑256‑GCM で暗号化します。このページでは、これらのキーの設定方法、
ローテーションの仕組み、および安全に運用する方法について説明します。

:::info 2 つのキー、2 つの用途

| キー | 保護対象 | アクティブポインター |
|-----|----------|----------------|
| **シークレットキー** | データベースに保存されたアクセスキーのシークレット | `active.secret_key` |
| **オプションキー** | 暗号化された DB オプション (JWT 署名キー) | `active.option_key` |

オプションキーが設定されていない場合、オプションはシークレットキーにフォールバックします。
:::

---

## クイックスタート {#quick-start}

最も簡単な構成は、メイン設定で 1 つのキーを指定する方法です。

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

キーは次のコマンドで生成します。

```bash
openssl rand -base64 32
```

これだけです — Semaphore は `key1` でシークレットを暗号化するようになります。同じキーが
JWT 署名キーにも使用されます (オプションはシークレットキーにフォールバックします)。

:::tip 本番環境
インラインの `value:` よりも **`file:` 参照**または **`keys_folder`** (下記参照) を
優先し、キー素材が設定ファイルではなくマウントされたシークレットに置かれるようにしてください。
:::

---

## キーの識別方法 {#how-keys-are-identified}

各キーには、キー素材そのものから導出された**キー ID** — フィンガープリント
`base64url(sha256(key))[:8]` — があります。暗号化された各値と一緒に保存されるのは
(キーではなく) この ID なので、復号は書き込みに使われたまさにそのキーの直接的なルックアップになります。

これは次のことを意味します。

- **ラベルは自由に変更できます。** `key1`、`secrets_key_primary.txt` — これらは
  人間のためのものです。データベースにはフィンガープリントだけが保存され、ラベルは保存されません。
- **キーが誤って参照されることはありません。** キーのバイト列を変更すると*新しい*
  ID になり、古いデータは古い ID を参照し続けます。
- **キーを削除すると明示的に失敗します**。静かに失敗することはありません — 見つからないキー ID は明示的な
  エラーになり、不正な出力が返されることはありません。

ID を手動で設定することはありません。Semaphore が計算します。

---

## キーファイル {#the-keys-file}

`encryption.keys_file` は、**キーのレジストリ**と用途ごとのアクティブなキーへの
**ポインター**を内容とするファイルを指します。**ファイル拡張子に関係なく、YAML または JSON
として**解析されます。

レジストリを指定する方法は 2 つあります — インラインマップ、ファイルのフォルダー、または
その両方の組み合わせです。

### インラインマップ {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

各エントリは [`KeySource`](#keysource) です。`value` (インラインの base64) **または**
`file` (base64 キーを含むファイルへのパス) のいずれかで、両方を指定することはできません。

### キーファイルのフォルダー {#folder-of-key-files}

`keys_folder` でディレクトリを指定すると、**すべての通常ファイルが 1 つのキー**として、
ファイル名をラベルにして扱われます。マウントされた Docker/Kubernetes シークレットに最適です。

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Kubernetes フレンドリー
`keys_folder` はドットで始まるエントリ (`..data`、`..2024_*`) をスキップし、
シンボリックリンクをたどるため、Kubernetes が `Secret`/`ConfigMap` ボリュームをマウントする
方式でそのまま動作します。
:::

### 組み合わせ {#combined}

`keys` と `keys_folder` は 1 つのレジストリにマージされます。`active` はラベル
*または*ファイル名で指定できます。

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## ローテーション (ダウンタイムなし) {#rotation-zero-downtime}

アクティブなキーは**新しい**書き込みを暗号化し、レジストリ内の他のすべてのキーは引き続き
古いデータを**復号**できます。したがってローテーションは、キーを追加し、ポインターを切り替え、
バックグラウンドで再暗号化し、その後古いキーを削除する、という手順になります。

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

どの手順でもプロセスの再起動は不要です。

### 再起動なしでの変更の適用 {#applying-changes-without-a-restart}

Semaphore はキーファイル (およびそこから参照されるキーファイル) を再読み込みし、
メモリ上のキーをアトミックに入れ替えます。トリガーは 2 つあります。

| トリガー | 動作 |
|---------|-----------|
| **ファイルウォッチャー** | `encryption.keys_poll_interval` (デフォルト `15s`) ごとにポーリングします。`"0"` に設定すると無効になります。 |
| **`SIGHUP`** | `kill -HUP <pid>` で即時の再読み込みを強制します (Unix のみ)。 |

:::caution Windows
Windows には `SIGHUP` がありません。**ポーラー** (デフォルト) を利用するか — すべての
プラットフォームで動作します — サービスを再起動してください。
:::

再読み込みではまず新しいキーが検証され、エラーがあれば実行中のキーは
そのまま維持されます。

---

## CLI コマンド {#cli-commands}

### `vault check` {#vault-check}

読み取り専用です。キー ID ごとに、そのキーで暗号化されている保存済みシークレットの数を報告するため、
アクティブなキーにあるものと安全に削除できるものを確認できます。

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

ステータス: `active`、`retired, rekey pending`、`retired, SAFE TO REMOVE`、
`legacy (no id)`、および `MISSING KEY` (参照されているキーが存在しない — 終了コード 1)。

### `vault rekey` {#vault-rekey}

保存されているすべてのシークレット (および JWT 署名キー) をアクティブなキーで再暗号化します。

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## 後方互換性 {#backward-compatibility}

アップグレードは安全で、**データ移行は不要**です。

- **`access_key_encryption`** (または
  環境変数 `SEMAPHORE_ACCESS_KEY_ENCRYPTION`) を設定している既存のインストールは、そのまま動作し続けます — そのフラットな
  キーがアクティブなシークレットキーになります。
- 古いバージョンの Semaphore で書き込まれたデータ (キー ID なし) も引き続き復号できます。次回の書き込み時、
  または `vault rekey` の実行後に、キー ID が付与されます。
- **暗号化をまったく行っていない場合** (キー未設定) も、引き続きシークレットを
  プレーンな base64 で保存し、同じ方法で復号します。

古い単一キーのインストールをキーファイルに移行するには、古いキーを
レジストリに含めるだけです。

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

古いデータは `old` で復号されます。`vault rekey` を実行して、すべてを `new` に移行してください。

---

## Kubernetes と Docker {#kubernetes--docker}

キーを `Secret` ボリュームとしてマウントし、`keys_folder` でそれを指定します。

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

`Secret` を更新すると、Kubernetes がマウントされたファイルを更新し、
ポーラーが `keys_poll_interval` 以内に変更を適用します — Pod の再起動は不要です。

---

## セキュリティのベストプラクティス {#security-best-practices}

:::danger キーファイルを保護する
- パーミッションを制限する: `chmod 0400`、所有者は Semaphore のサービスユーザー。
- **実際のキーをバージョン管理にコミットしない** — ファイルを `.gitignore` に追加する。
- 安全にバックアップする。**すべてのキーを失うと、暗号化されたデータをすべて失います。**
- インラインの `value:` よりもマウントされたシークレット (`file:` / `keys_folder`) を優先し、
  それが無理なら環境変数を使う — `value:` はキーを設定ファイル内に残します。
:::

---

## リファレンス {#reference}

### `encryption` (メイン設定) {#encryption-main-config}

| フィールド | 環境変数 | デフォルト | 説明 |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | キーファイル (YAML/JSON) へのパス。 |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | キーファイルをポーリングする間隔。`"0"` でポーリングを無効化。 |

### レガシーのフラットキー (メイン設定) {#legacy-flat-keys-main-config}

| フィールド | 環境変数 | 説明 |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | 単一のシークレットキー。ローテーションなし。`keys_file` が未設定の場合に使用。 |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | 単一のオプションキー。ローテーションなし。シークレットキーにフォールバック。 |

### キーファイル {#keys-file}

| フィールド | 説明 |
|-------|-------------|
| `keys` | `label → KeySource` のマップ (インラインレジストリ)。 |
| `keys_folder` | キーファイルのディレクトリ (通常ファイル 1 つにつき 1 キー、ファイル名がラベル)。 |
| `active.secret_key` | アクティブなシークレットキーのラベル (`keys` 内)。 |
| `active.option_key` | アクティブなオプションキーのラベル。 |
| `active.secret_key_file` | アクティブなシークレットキーの `keys_folder` 内のファイル名 (相対)。 |
| `active.option_key_file` | アクティブなオプションキーの `keys_folder` 内のファイル名 (相対)。 |

### KeySource {#keysource}

| フィールド | 説明 |
|-------|-------------|
| `value` | インラインの base64 キー素材。 |
| `file` | base64 キーを含むファイルへのパス。 |

`value` と `file` は排他的です。キーは **16、24、または 32
バイト** (AES‑128/192/256) の base64 である必要があります。

---

## トラブルシューティング {#troubleshooting}

| 症状 | 原因 / 対処 |
|---------|-------------|
| 起動時にパニック: `encryption_keys… not found` / `invalid` | キーファイルまたは参照されているキーファイルが存在しないか不正な形式であるか、キーが 16/24/32 バイトの有効な base64 ではありません。ファイルを修正してください。起動は意図的に早期失敗します。 |
| `vault check` が `MISSING KEY <id>` を表示する (終了コード 1) | レジストリに存在しなくなったキーでデータが暗号化されています。復号できるようにするには、そのキーを再度追加してください。 |
| `cannot decrypt access key, perhaps encryption key was changed` | レガシー (プレフィックスなし) の値が、設定されたどのキーでも復号できません。元のキーが (レジストリまたは `access_key_encryption` に) 存在することを確認してください。 |
| ローテーションが適用されない | `keys_poll_interval` (`"0"` でないこと) と、キーファイルが実際に変更されたことを確認してください。または `SIGHUP` を送信してください。 |
| `active.secret_key: no key labelled "…"` | アクティブポインターが `keys`/`keys_folder` に存在しないラベル/ファイル名を指定しています。 |
