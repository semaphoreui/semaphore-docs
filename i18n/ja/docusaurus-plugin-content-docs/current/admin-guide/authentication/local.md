---
title: ローカルアカウント
description: Semaphore のデータベースを使ったパスワードサインイン - パスワードの保存方法、TOTP による二要素認証、セッションの有効期間、パスワードの無効化について説明します。
---

# ローカルアカウント

ローカルアカウントは、パスワードを Semaphore のデータベースに保持します。すべてのインストールは
`semaphore setup` または `SEMAPHORE_ADMIN_*` 変数によって作成されたローカルアカウントを 1 つ
持った状態で始まり、ID プロバイダーが存在しない段階ではこのアカウントでサーバーにアクセスします。

シングルサインオンが動作するようになった後も、ローカル管理者を少なくとも 1 つは残してください。
ID プロバイダーに接続できなくなったときに戻る唯一の手段です。

## パスワードの保存方法 {#how-passwords-are-stored}

パスワードは OWASP の最小強度パラメーターを用いて **Argon2id** でハッシュ化され、そのパラメーターは
各ハッシュとともに
[PHC 文字列フォーマット](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md)
で記録されます。2.20 より前のリリースでは bcrypt を使用していました。これらのハッシュは引き続き
動作し、所有者が次にサインインに成功した時点でそれぞれ Argon2id のハッシュに置き換えられます。
二度とサインインしないアカウントは bcrypt のハッシュのままになるため、パスワードをリセットして
更新してください。

パラメーターの一覧表は[セキュリティ](/admin-guide/security#password-hashing)にあります。

Semaphore はパスワードポリシーを強制しません。最小長も、複雑さの要件も、有効期限もありません。
ポリシーが必要な場合は、ディレクトリまたは ID プロバイダーを使用してください。そうしたポリシーは
本来そちらに属するものです。

## アカウントを管理する {#manage-accounts}

管理者は Web インターフェイスでユーザーを管理します。同じ操作はコマンドラインでも利用でき、
スクリプト化や、誰もサインインできなくなったときの復旧に使えます。

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

すべてのフラグについては [`semaphore users`](/reference/cli/users) を、ロールによってユーザーが
何を行えるようになるかについては[チーム](/user-guide/team)を参照してください。

:::warning
コマンドラインに書いたパスワードは、シェルの履歴とマシンのプロセス一覧に残ります。最初の管理者の
作成時と復旧時にのみ使用し、その後は Web インターフェイスからパスワードを変更してください。
:::

## 二要素認証 {#two-factor-authentication}

Semaphore は TOTP、つまり Google Authenticator、Aegis、1Password などのアプリが生成する 6 桁の
コードをサポートしています。デフォルトでは無効で、有効にしたアカウントにのみ適用されます。
全員に強制されるものではありません。

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| オプション | 効果 |
|---|---|
| `mfa.totp.enabled` | ユーザーが自分のアカウントに TOTP を追加できるようにします。これがないと誰も登録できません。 |
| `mfa.totp.allow_recovery` | 登録時にリカバリーコードを 1 つ発行し、スマートフォンを紛失してもアカウントを失わないようにします。コードを入力すると **TOTP の登録が解除され**、ユーザーはサインインします。その後あらためて登録し直します。コードは bcrypt ハッシュとして保存されます。 |
| `mfa.totp.app_name` | 認証アプリに表示される発行者ラベル。Semaphore を複数運用している場合に設定してください。 |

ユーザーは自分のアカウントページから登録します。管理者は、デバイスを紛失したユーザーの
二要素目を確認したり削除したりできます。

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

`mfa.totp.enabled` を再び無効にしても、登録済みの設定が削除されることはありません。二要素目が
要求されなくなるだけです。再度有効にすれば、以前の登録がそのまま適用されます。

## セッションの有効期間 {#session-lifetime}

セッションは **7 日間操作がない**と期限切れになります。この無操作タイムアウトは組み込みで、
設定を変更できません。

一方、絶対的な上限は設定でき、最後のリクエストからではなくサインインした時点から計測されるため、
アクティブに使用しているセッションも終了します。

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

デフォルトの `0` は絶対的な上限なしを意味します。共用のワークステーションやコンプライアンス上の
規則によって、定期的な再認証が求められる場合に設定してください。

## パスワードによるサインインを無効にする {#turn-password-sign-in-off}

ID プロバイダーを設定し、実際のユーザーがそれ経由でサインインできることを確認したら、
`password_login_disable` によってパスワード方式を完全に拒否できます。

```json
{
  "password_login_disable": true
}
```

LDAP と OpenID Connect には影響しません。既存のローカルアカウントはロールと履歴を保持しますが、
認証する手段がなくなるだけです。

:::danger
このオプションは直ちに適用され、自分のものを含むすべてのローカルアカウントに影響します。設定する
前に、ログを読むのではなく実際にサインインして、シングルサインオンが動作することを確認してくだ
さい。誤って設定した場合の復旧には、サーバー上で設定ファイルを編集して再起動する必要があります。
:::

## 次のステップ {#whats-next}

- [LDAP と Active Directory](/admin-guide/authentication/ldap) — ディレクトリに対して認証します。
- [OpenID Connect](/admin-guide/authentication/openid) — ID プロバイダーによるシングルサインオン。
- [セキュリティ](/admin-guide/security) — ハッシュ化パラメーター、暗号化、ハードニング。
