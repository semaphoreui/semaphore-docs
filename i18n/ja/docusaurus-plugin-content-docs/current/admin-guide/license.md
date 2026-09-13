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

## ライセンスキーの管理と置き換え {#manage-or-replace-a-license-key}

ライセンスを更新、置き換え、または確認するには、管理メニューを開いて **サブスクリプションと請求** を選択します。

![サブスクリプションと請求項目がある管理メニュー](/assets/subscription-billing-menu-item.png)

Web UI から管理されているライセンスキーの場合は、**サブスクリプションと請求** ダイアログのアクションメニューを開いて、キーの再読み込み、アップロード、またはリセットを行います。

![キー操作メニューがあるサブスクリプションと請求ダイアログ](/assets/subscription-key-actions-menu.png)

キーがサーバー側で設定されている場合:

1. `subscription.key` の値を置き換えるか、`subscription.key_file` で参照されているファイルの内容を更新します。
2. サーバーがライセンスキーを再読み込みするように、Semaphore UI を再起動します。
3. 期待どおりの Pro または Enterprise のオプションが Semaphore UI で利用可能になっていることを確認します。
