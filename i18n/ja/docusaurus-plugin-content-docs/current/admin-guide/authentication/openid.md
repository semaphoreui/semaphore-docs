# OpenID Connect

Semaphore は OpenID Connect(OIDC)による認証をサポートしています。

リンク:

* [GitHub の設定](/admin-guide/authentication/openid/github)
* [Google の設定](/admin-guide/authentication/openid/google)
* [GitLab の設定](/admin-guide/authentication/openid/gitlab)
* [Authelia の設定](/admin-guide/authentication/openid/authelia)
* [Authentik の設定](/admin-guide/authentication/openid/authentik)
* [Keycloak の設定](/admin-guide/authentication/openid/keycloak)
* [Okta の設定](/admin-guide/authentication/openid/okta)
* [PingFederate の設定](/admin-guide/authentication/openid/pingfederate)
* [Azure の設定](/admin-guide/authentication/openid/azure)
* [Zitadel の設定](/admin-guide/authentication/openid/zitadel)
* [Pocket-ID の設定](/admin-guide/authentication/openid/pocket-id)

SSO プロバイダー設定の例:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### 環境変数による設定 {#configure-via-environment-variable}

コンテナで実行する場合は、単一の環境変数でプロバイダーを設定すると便利です。

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

この値は、上記の `oidc_providers` の構造に一致する有効な JSON 文字列である必要があります。

SSO プロバイダーのすべてのオプション:

| パラメータ             | 説明                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | ログイン画面に表示されるプロバイダー名。                                                              |
| `icon`                | ログイン画面でプロバイダー名の前に表示される [MDI アイコン](https://pictogrammers.com/library/mdi/)。 |
| `color`               | ログイン画面に表示されるプロバイダー名。                                                              |
| `client_id`           | プロバイダーのクライアント ID。                                                                                         |
| `client_id_file`      | プロバイダーのクライアント ID が保存されているファイルのパス。`client_id` より優先度が低くなります。           |
| `client_secret`       | プロバイダーのクライアントシークレット。                                                                                     |
| `client_secret_file`  | プロバイダーのクライアントシークレットが保存されているファイルのパス。`client_secret` より優先度が低くなります。   |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | ユーザー名クレーム式[\*](#claim-expression)。                               |
| `email_claim`         | メールクレーム式[\*](#claim-expression)。                                  |
| `name_claim`          | プロフィール名クレーム式[\*](#claim-expression)。                           |
| `order`               | サインイン画面でのプロバイダーボタンの位置。                                                      |
| `allow_idp_initiated` | このプロバイダーで [IdP 起点のログイン](#idp-initiated-login)を有効にします。デフォルトは `false`。                       |
| `return_via_state`    | ログイン後の戻り先パスを、リダイレクト URL ではなく OAuth の `state` パラメータで渡します。デフォルトは `true`。 |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*クレーム式 {#claim-expression}

クレーム式の例:

```
email | {{ .username }}@your-domain.com
```

Semaphore はまず email フィールドの取得を試みます。それが空の場合は、その後に続く式が実行されます。

<div class="warning">
  式 <code>"username_claim": "|"</code> は、このプロバイダーでログインする各ユーザーに対してランダムな <code>username</code> を生成します。
</div>

## IdP 起点のログイン {#idp-initiated-login}

デフォルトでは、Semaphore は **SP 起点**のサインインのみをサポートしています。ユーザーが Semaphore を開き、プロバイダーのボタンをクリックすると、
アイデンティティプロバイダー(IdP)にリダイレクトされます。

**IdP 起点**のログインでは、代わりにアイデンティティプロバイダー側から開始できます。たとえば、Okta のダッシュボード、Azure の *My Apps*、
または Keycloak / Authentik のアプリケーションランチャーで Semaphore のタイルをクリックする、といった流れです。

Semaphore はこれを標準の **Third-Party Initiated Login** の仕組み
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin))を使って実装しています。IdP が
ブラウザを専用の **Initiate Login URI** にリダイレクトし、その後 Semaphore が通常の認可コードフローを開始します。
実際の認証は依然として完全で安全なコード交換であり、Semaphore が要求していないトークンを受け入れることはありません。

### 有効化 {#enabling-it}

プロバイダーの `allow_idp_initiated` を `true` に設定します。

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### アイデンティティプロバイダーの設定 {#configuring-the-identity-provider}

IdP 側で、アプリケーションの **Initiate Login URI** を次のように設定します。

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

ここで `<provider-id>` は `oidc_providers` 配下のキーです(例: `mysso`)。

IdP はこのエンドポイントに `iss`(issuer)パラメータを送信する必要があります。Semaphore は、`iss` が設定済みのプロバイダーと一致しない
リクエストを拒否します。任意の `login_hint` パラメータは IdP に転送され、任意の `target_link_uri` パラメータは
ログイン後に開くページを指定します(Semaphore を指している必要があり、それ以外の場合は無視されます)。

プロバイダー固有の注意事項:

- **Okta** — *Login initiated by* を *Either Okta or App*(または *App Only*)に設定し、*Initiate login URI* を入力します。Okta は
  `iss` と `target_link_uri` の両方を送信します。
- **Keycloak / Authentik / Ping / OneLogin** — アプリケーションの起動 URL / ホーム URL を Initiate Login URI に設定します。
- **Azure AD / Entra** — *My Apps* は SP 起点の開始 URL を使用し、`iss` を常に送信するとは限りません。代わりに開始 URL を
  `https://your-domain.com/api/auth/oidc/<provider-id>/login` に向けてください。

### セキュリティ {#security}

- IdP 起点のログインは**デフォルトで無効**であり、プロバイダーごとに有効にする必要があります。
- `iss` パラメータは、プロバイダーの取り違えを防ぐために、設定済みの issuer と照合して検証されます。
- `target_link_uri` は Semaphore を指している場合にのみ受け入れられます(オープンリダイレクトは発生しません)。
- このフローは CSRF 対策の `state` と `nonce` を伴う完全な認可コード交換を経由するため、盗まれたトークンやリプレイされた
  トークンをサインインに使用することはできません。

## サインイン画面 {#sign-in-screen}

設定された各プロバイダーごとに、ログインページに追加のログインボタンが表示されます。

![Semaphore のログインページのスクリーンショット。2 つのログインボタンがあり、1 つは「Sign In」、もう 1 つは「Sign in with MySSO」と表示されている](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
