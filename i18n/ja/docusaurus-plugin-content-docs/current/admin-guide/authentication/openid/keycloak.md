
# Keycloak の設定

```yaml title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```

## IdP 起点のログイン {#idp-initiated-login}

ユーザーが Keycloak の **Account Console** のアプリケーションランチャーから Semaphore を起動できるようにするには、
プロバイダーで [IdP 起点のログイン](/admin-guide/authentication/openid#idp-initiated-login)を有効にします。

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

次に、Keycloak の管理コンソールでクライアントを開き、**Home URL**(Keycloak 19 以降。古いバージョンでは
*Base URL* と呼ばれます)を次のように設定します。

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

ユーザーがランチャーでアプリケーションをクリックすると、Keycloak は `iss` パラメータを付けてこの URL にリダイレクトします。Semaphore は
`iss` を `provider_url`(レルムの issuer)と照合して検証し、通常の認可コードフローを開始します。


## 関連する GitHub Issue {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Keycloak サーバーの証明書検証を無効にする方法  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — TLS 検証を無効にするオプション  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Semaphore からログアウトしたときに Keycloak セッションからもログアウトする  

[Keycloak 関連のすべての Issue を見る →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## 関連する GitHub ディスカッション {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — OpenID でユーザー名が `preferred_username` と異なる
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML のサポートは?

[Keycloak 関連のすべてのディスカッションを見る →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)