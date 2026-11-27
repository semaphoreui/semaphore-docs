---
title: 二要素認証
description: Semaphore における TOTP 二要素認証の仕組みと、サーバーでの有効化、アカウントへの設定、コードによるサインイン、復旧の方法について説明します。
---

# 二要素認証

二要素認証 (2FA) は、最初のサインイン手順の後に 2 つ目の証明として、ユーザーのスマートフォンの
認証アプリが表示する 6 桁のコードを求めます。これにより、パスワードを盗まれただけでは
サインインできなくなります。

Semaphore は二要素目を TOTP（時間ベースのワンタイムパスワード）で実装しています。これは
Google Authenticator、Microsoft Authenticator、Aegis、1Password、Bitwarden などのアプリが
採用している標準規格です。すべてのエディションで利用できます。

## 仕組み {#how-it-works}

サインイン時にコードが求められるかどうかは、2 つのスイッチで決まります。

- **サーバー**が TOTP を許可している必要があります。これは `mfa.totp.enabled` オプションで、
  デフォルトでは無効です。
- **アカウント**に TOTP が設定されている必要があります。各ユーザーが自分のアカウントで有効に
  するもので、全員に強制されるものではありません。

両方が有効な場合、サインインは 2 段階で行われます。

1. ユーザーは通常どおりサインインします。パスワード、LDAP、OpenID Connect プロバイダーの
   いずれでも構いません。二要素目は 3 つすべてに適用されます。
2. Semaphore はセッションを開きますが、未検証として扱い、コードを求めます。コードが受け付け
   られるまで、そのセッションでの API 呼び出しはすべて `401` と
   `{"error":"TOTP_REQUIRED"}` で拒否されます。
3. ユーザーはアプリに表示されたコードを入力します。Semaphore はアカウントに保存されたシークレットと
   照合し、正しいコードであればセッションが検証され、サインインが完了します。

コードは 30 秒ごとに変わり、アプリはアカウントの設定時に一度だけ受け取ったシークレットから
コードを計算します。Semaphore とスマートフォンが通信することはないため、スマートフォンに
ネットワーク接続は不要です。必要なのは、おおよそ正しい時計だけです。

## サーバーで有効にする {#turn-it-on-for-the-server}

設定ファイルに `mfa.totp` セクションを追加し、Semaphore を再起動します。

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

同じ設定は環境変数でも指定できます。

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| オプション | 環境変数 | 効果 |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | ユーザーが TOTP を設定できるようにし、サインイン時にコードを求めるようにします。これがないと、この設定は誰にも表示されません。 |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | TOTP の設定時に各ユーザーへ 1 回限りの[リカバリーコード](#recovery-code)を発行し、スマートフォンを紛失したときにそれでサインインできるようにします。 |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | 認証アプリがアカウントの横に表示する発行者名。デフォルトは `Semaphore` です。下の警告を参照してください。 |

:::warning ⚠️ `app_name` は Web インターフェイスでは使われません (2026-11-27)
Web インターフェイスから設定したアカウントは、`mfa.totp.app_name` の値にかかわらず、認証アプリでは
常に `Semaphore:<email>` と表示されます。設定した名前を使うのは
[`semaphore users totp enable`](#manage-the-second-factor-from-the-command-line) だけです。
Semaphore を複数運用している場合、ユーザーはメールアドレスで項目を見分けるか、アプリ側で
項目の名前を変更してください。
:::

すべてのオプションは[設定リファレンス](/reference/configuration)にも
掲載されています。

## 自分のアカウントに TOTP を設定する {#set-up-totp-for-your-account}

まずスマートフォンに認証アプリをインストールします。その後、次の手順を行います。

1. プロジェクトを開き、サイドバー下部の自分の名前をクリックして、**Edit Account** を
   選択します。
2. **Security** タブを開きます。
3. **Two-factor authentication** の下で **Time-based one-time password** をオンにします。
   Semaphore はその場でシークレットを作成し、QR コードとして表示します。
4. 認証アプリでアカウントを追加し、QR コードをスキャンします。アプリに `Semaphore` の 6 桁の
   コードが表示されるようになります。
5. QR コードの下に **Recovery code** が表示された場合は、横のボタンでコピーし、パスワード
   マネージャーや紙など安全な場所に保管してください。表示されるのはこのときだけです。
6. ダイアログを閉じます。

<div style={{maxWidth: 450}}>

![二要素認証をオンにした Edit User ダイアログの Security タブ: スキャン用の QR コードと、その下のリカバリーコード](/assets/two-factor-enrol.webp)

</div>

スイッチは即座に反映されます。押す **Save** ボタンも、入力するテストコードもありません。
サインアウトする前に、アプリに Semaphore のコードが表示されていることを確認してください。
次回のサインインでそのコードが求められます。

後で **Security** タブを再び開けば、別のデバイスで QR コードをスキャンできます。リカバリー
コードは再表示されません。

## コードでサインインする {#sign-in-with-a-code}

パスワード、LDAP、またはシングルサインオンの手順の後、Semaphore は **Two-step verification** を
表示します。

![認証アプリの 6 桁のコードを求める Two-step verification 画面](/assets/two-factor-verify.webp)

アプリに現在表示されている 6 桁を入力します。6 桁目を入力するとフォームは自動的に送信されます。
コードが間違っているか古い場合はエラーが表示され、同じ画面のままになります。次のコードを
待ってからやり直してください。

**Return to login** を押すと、このサインインを中止して最初からやり直します。

## リカバリーコードを使う {#recovery-code}

スマートフォンを紛失したりリセットしたりした場合でも、リカバリーコードがあればユーザーは
自力でサインインできます。

1. 通常どおりパスワードでサインインします。
2. **Two-step verification** で **Use recovery code** をクリックします。
3. リカバリーコードを入力し、**Send** をクリックします。

Semaphore はサインインを完了し、**アカウントから TOTP を削除します**。リカバリーコードも
同時に使用済みになります。[前述](#set-up-totp-for-your-account)の手順ですぐに TOTP を
設定し直し、新しいシークレットと新しいリカバリーコードを取得してください。

**Use recovery code** は、サーバーで `mfa.totp.allow_recovery` が有効な場合にのみ
表示されます。リカバリーコードは 16 文字で、bcrypt ハッシュとしてのみ保存されるため、
管理者を含め誰も後からユーザーのコードを読み出すことはできません。

## 二要素目を削除する {#remove-the-second-factor}

**自分のアカウント。** **Edit Account** の **Security** タブで **Time-based one-time password** を
オフにします。TOTP は即座に削除され、次回のサインインでは最初の手順だけが求められます。
認証アプリからも Semaphore の項目を削除してください。もう何にも対応していません。

**他のユーザーのアカウント。** スマートフォンを紛失し、リカバリーコードも持っていないユーザーは、
自分で TOTP を削除できません。管理者、またはグローバルロールでユーザー管理が許可されている
ユーザーが **Users** を開いてそのユーザーを編集し、**Security** タブでスイッチをオフにします。
ユーザーはパスワードだけでサインインし、TOTP を設定し直します。

### コマンドラインで二要素目を管理する {#manage-the-second-factor-from-the-command-line}

サーバー上では、同じ操作を Web インターフェイスなしで行えます。唯一の管理者がスマートフォンを
紛失した場合に役立ちます。

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` はユーザーに TOTP を設定し、`otpauth://` URL、
QR コード、リカバリーコードをターミナルに出力します。`show` は既存の設定の URL と QR コードを
出力します。どちらもシークレットそのものを出力するため、他人がターミナルを見られない場所でのみ
実行し、QR コードは本人に直接渡してください。完全な構文は
[`semaphore users`](/reference/cli/users#totp-management) にあります。

## サーバーで無効にする {#turn-it-off-for-the-server}

`mfa.totp.enabled` を `false` にするかセクションを削除して、再起動します。するとサインイン時に
コードが求められなくなり、**Security** から **Two-factor authentication** の設定が
消えます。

誰の設定も削除されません。オプションを再び有効にすると、TOTP を設定していたすべてのアカウントで
同じシークレットのまま再びコードが求められます。もう一度スキャンする必要はありません。

## 知っておくべきこと {#things-to-know}

- **API トークンは二要素目を経由しません。** `Authorization: Bearer` トークン付きのリクエストで
  コードが求められることはありません。トークンは完全にサインインしたセッションからしか作成
  できませんが、TOTP を設定する前から存在していたトークンは引き続き使えます。TOTP を有効にした
  後は **API Tokens** ページでトークンを見直してください。
- **Semaphore はコードの試行回数を制限しません。** 6 桁は組み合わせが少ないため、
  [リバースプロキシ](/admin-guide/reverse-proxy)で `POST /api/auth/verify` と
  `POST /api/auth/recovery` にレート制限をかけてください。
- **シークレットはデータベースにそのまま保存されます。** `user__totp` テーブルやデータベースの
  バックアップを読める人は、すべてのアカウントの有効なコードを生成できます。バックアップは
  設定ファイルと同様に保護してください。
- **TOTP を必須にすることはできません。** Semaphore には、ユーザーに設定を強制するオプションは
  ありません。ポリシーで全員に二要素目が求められる場合は、ID プロバイダー側で強制し、ユーザーを
  [OpenID Connect](/admin-guide/authentication/openid) 経由でサインインさせてください。

二要素目の設定、削除、使用は、`iam.mfa` および `auth.mfa` イベントとして
[監査ログ](/admin-guide/audit-log)に記録されます。一覧は[監査イベント](/reference/audit-events)を
参照してください。

## 次のステップ {#whats-next}

- [ローカルアカウント](/admin-guide/authentication/local) — パスワード、セッションの有効期間、
  パスワードによるサインインの無効化。
- [セキュリティ](/admin-guide/security) — ハッシュ化パラメーター、暗号化、ハードニング。
- [`semaphore users`](/reference/cli/users#totp-management) — TOTP のコマンド。
