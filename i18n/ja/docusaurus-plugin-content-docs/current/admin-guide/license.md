---
title: "ライセンスの有効化"
---

# ライセンスの有効化 <Pro />

Semaphore Pro および Enterprise の機能は、ライセンスキーで有効化されます。ライセンスは Web UI から有効化することも、自動化されたデプロイメント向けにサーバー設定でキーを指定することもできます。

## 始める前に {#before-you-start}

- Pro または Enterprise を有効化するために、Semaphore UI を再インストールしたり別のビルドに切り替えたりする必要はありません。現在お使いの Semaphore UI のバージョンをライセンスキーで有効化できます。最新の Pro または Enterprise 機能を利用したい場合は、最新バージョンに更新してください。
- 管理者アカウントでサインインしてください。
- ライセンスキーを用意してください。ライセンスキーは購入時のメール、または [Semaphore UI ポータル](https://portal.semaphoreui.com/auth/login)で確認できます。

## Web UI から有効化する {#activate-from-the-web-ui}

1. 管理者として Semaphore UI にサインインします。

![Semaphore UI のログイン画面](/assets/subscription-login-screen.png)

2. 左下のユーザーエリアから管理メニューを開きます。

![左下にある管理メニューのトリガー](/assets/subscription-admin-menu-trigger.png)

3. **Upgrade to PRO or EE** を選択します。

![Upgrade to PRO or EE 項目がある管理メニュー](/assets/subscription-upgrade-menu-item.png)

4. 有効化ダイアログにライセンスキーを貼り付け、**ACTIVATE NEW KEY** をクリックします。

![Semaphore Pro の有効化ダイアログ](/assets/subscription-activation-dialog.png)

有効化が成功すると、Semaphore UI は **サブスクリプションと請求** ダイアログに現在のライセンスの詳細を表示します。

![有効化成功後のサブスクリプションと請求ダイアログ](/assets/subscription-activation-success.png)

## 設定から有効化する {#activate-from-configuration}

Docker、Kubernetes、systemd、その他の自動化されたデプロイメントでは、UI で入力する代わりに、サーバー設定でライセンスキーを指定します。設定オプション名には `subscription.*` を使用します。

`config.json` の場合:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

または環境変数として:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

キーをファイルに保存することもできます。

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

または:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

ライセンスキーが設定で管理されている場合、Semaphore UI は **サブスクリプションと請求** ダイアログの編集および有効化のコントロールを無効にします。サーバーは起動時にキーファイルを読み込んで実行時のライセンスキーとして使用するため、これは `subscription.key` と `subscription.key_file` の両方に適用されます。

## ライセンス検証の仕組み {#how-license-validation-works}

Semaphore UI はライセンスを Semaphore UI ポータルに対して検証します。アドレスは `subscription.server_url` で指定し、既定値は `https://portal.semaphoreui.com/billing` です。

### Semaphore UI の接続先 {#what-semaphore-ui-connects-to}

| タイミング | リクエスト |
| --- | --- |
| キーのアクティベーション | `POST {server_url}/subscriptions/{key}/activate` |
| ライセンスの検証と更新 | `POST {server_url}/subscriptions/{key}/validate` |

いずれも単純な JSON リクエストで、1 回のリクエストは 20 秒で打ち切られます。アクティベーションのリクエストはライセンスキーを送信し、検証のリクエストはサーバーがその時点で保持しているライセンストークンを送信します。それ以外のものがインストール環境から出ることはありません。ユーザーアカウント、プロジェクト名、インベントリ、ホスト名、タスクの出力はこれらのリクエストに含まれません。

どちらの応答も **ライセンストークン** で、ポータルが RSA 鍵で署名した JWT です。Semaphore UI はサーバーのバイナリに組み込まれた対応する公開鍵で署名を検証するため、トークンを偽造したり書き換えたりすることはできません。クレームにはライセンスで許可される内容、すなわちプラン、サブスクリプションの状態、会社名、有効期限、Pro ユーザー数、ノード数、UI 数が含まれます。サーバーはキーとトークンをデータベースのオプション `subscription_key` と `subscription_token` に保存します。

### 検証が実行されるタイミング {#when-the-check-runs}

| きっかけ | 動作 |
| --- | --- |
| サーバーの起動時 | ライセンストークンが 1 回更新されます。 |
| 毎日 01:00（サーバー時刻） | ライセンストークンが更新されます。 |
| Web インターフェイスまたは `subscription.key` によるキーのアクティベーション | キーがアクティベートされ、最初のトークンが返されます。 |
| **サブスクリプションと請求** ダイアログの **再読み込み** | ライセンストークンが必要に応じて更新されます。 |

これらの呼び出しの合間に Semaphore UI がポータルへ接続することはありません。Pro 機能が有効かどうか、Pro ユーザー・ランナー・Terraform/OpenTofu の HTTP バックエンドのステートをもう 1 つ追加できるかどうかといったライセンスの判定は、すべて保存済みのトークンをローカルで読み取って行われます。

### ポータルに接続できない場合 {#when-the-portal-cannot-be-reached}

更新に失敗すると `subscription` コンテキストでサーバーログに記録され、保存済みのトークンはそのまま残ります。そのため、ネットワーク障害やポータルの停止によって Pro 機能が無効になることはありません。トークン自体の有効期限を過ぎるまでインストール環境は動作し続けます。期限切れのトークンも読み込めますが、その状態は `expired` になり、Pro 機能は停止します。

### オンラインキーとオフラインキー {#online-and-offline-keys}

- **オンラインキー** は `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` の形式の UUID です。アクティベーション時にポータルを呼び出し、毎日の更新で最新の状態が保たれます。UUID でない値は、リクエストを送る前に拒否されます。
- **オフラインキー** はライセンストークンそのもので、インターネットに接続できない環境向けに発行される長い署名付き文字列です。Semaphore UI はこれをローカルで検証し、ポータルを呼び出すことは一切ないため、毎日の更新でもリクエストは発生しません。オフラインライセンスを更新するには、新たに発行されたキーに置き換えてください。

### 高可用性 {#high-availability}

各サーバーノードは自分の起動時と自分の日次スケジュールでライセンスを更新し、結果を共有データベースに書き込みます。そのため、クラスターのすべてのノードが同じライセンストークンを読み取ります。追加の設定は不要です。

## プロキシ経由でライセンスサーバーに接続する {#reach-the-license-server-through-a-proxy}

:::info v2.20 以降
プロキシは **Semaphore 2.20** 以降で利用できます。
:::

キーのアクティベーション、ライセンストークンの更新、毎日のトークン更新はいずれも `subscription.server_url` の Semaphore UI ポータルを呼び出します。サーバーがインターネットに直接アクセスできないネットワークでは、これらの通信を HTTP プロキシ経由にします。

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

または環境変数で指定します。

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

注意:

- `http`、`https`、`socks5`、`socks5h` のスキームに対応しています。プロキシアドレスが不正な場合、サーバーは起動時に停止します。
- `username` と `password` は省略可能で、`url` に含めた認証情報より優先されます。分けて指定すると、Semaphore UI がログに記録するプロキシアドレスにパスワードが含まれません。
- プロキシはライセンスサーバーへのリクエストにのみ適用されます。タスク、Git のクローン、その他の外向き通信には影響しません。
- `subscription.proxy` を設定しない場合、ライセンスサーバーへの接続は従来どおりサーバープロセスのプロキシ変数（`HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY`）に従います。
- インターネットから切り離された環境では、プロキシではなくオフラインライセンスキーが必要です。その場合サーバーはポータルを一切呼び出しません。

## ライセンスキーの管理と置き換え {#manage-or-replace-a-license-key}

ライセンスを更新、置き換え、または確認するには、管理メニューを開いて **サブスクリプションと請求** を選択します。

![サブスクリプションと請求項目がある管理メニュー](/assets/subscription-billing-menu-item.png)

Web UI から管理されているライセンスキーの場合は、**サブスクリプションと請求** ダイアログのアクションメニューを開いて、キーの再読み込み、アップロード、またはリセットを行います。

![キー操作メニューがあるサブスクリプションと請求ダイアログ](/assets/subscription-key-actions-menu.png)

キーがサーバー側で設定されている場合:

1. `subscription.key` の値を置き換えるか、`subscription.key_file` で参照されているファイルの内容を更新します。
2. サーバーがライセンスキーを再読み込みするように、Semaphore UI を再起動します。
3. 期待どおりの Pro または Enterprise のオプションが Semaphore UI で利用可能になっていることを確認します。
