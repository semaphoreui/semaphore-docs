
# Okta の設定

```yaml title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## IdP 起点のログイン {#idp-initiated-login}

ユーザーが Okta ダッシュボードのタイルからサインインを開始できるようにするには、
プロバイダーで [IdP 起点のログイン](/admin-guide/authentication/openid#idp-initiated-login)を有効にします。

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

次に、Okta の管理コンソールでアプリケーションの **General** 設定を開き、*Login* セクションを設定します。

1. **Login initiated by** を *Either Okta or App*(または *App Only*)に設定します。
2. **Initiate login URI** を次のように設定します。

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (任意)**Application visibility** で *Display application icon to users* を有効にすると、Okta ダッシュボードに
   タイルが表示されます。

Okta は `iss` と `target_link_uri` パラメータを送信します。Semaphore は `iss` を `provider_url` と照合して検証し、
通常の認可コードフローを開始します。


## 関連する GitHub Issue {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — OIDC Azure AD の設定/デバッグに関するヘルプ
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 で keycloak との oidc 認証が動作しなくなる
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — oidc_providers のテスト

[Okta 関連のすべての Issue を見る →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## 関連する GitHub ディスカッション {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — GitHub OpenID の設定時に、Email 以外を解析できない
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML のサポートは?

[Okta 関連のすべてのディスカッションを見る →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
