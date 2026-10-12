---
title: JWT プロキシ認証
description: Pomerium などの認証リバースプロキシが付与する署名付き JWT でユーザーをサインインさせる方法を、すべての auth.jwt オプションとログアウトの設定とあわせて説明します。
---

# JWT プロキシ認証

Semaphore を認証リバースプロキシ（Pomerium、Cloudflare Access、OAuth2 Proxy など）の背後で動かす場合、プロキシは署名付き JWT ヘッダーでユーザーのアイデンティティを渡すことができます。Semaphore は JWKS エンドポイントを使って JWT を検証し、ユーザーを自動的に検索または作成します。

これにより、プロキシと Semaphore の両方で OIDC の設定を重複して行う必要がなくなります。

## 仕組み {#how-it-works}

1. リバースプロキシがユーザーを認証し、設定された HTTP ヘッダーに署名付き JWT を追加します。
2. Semaphore はすべてのリクエストでこのヘッダーを確認します。ヘッダーがあれば、トークンを JWKS エンドポイントで検証します。
3. トークンが有効であれば、LDAP や OIDC と同じ方法でユーザーを探します。まずトークンの `sub` クレームに対して保存された外部アイデンティティで探し、次に `external_auth_email_matching` が許す範囲でメールアドレスで探し、見つからなければ新しい外部ユーザーを作成します。[ユーザーレコードが作成される仕組み](/admin-guide/authentication#how-a-user-record-comes-to-exist)を参照してください。
4. ヘッダーがあってもトークンが無効な場合、Semaphore はただちに `401 Unauthorized` を返します。既存のベアラートークン認証やセッション認証は試行されません。
5. ヘッダーがない場合は、通常の認証（ベアラートークン、セッション Cookie）がそのまま行われます。

JWT 認証で作成されたユーザーは **外部** ユーザーとしてマークされ、そのアイデンティティはプロバイダー ID `jwt` とトークンの `sub` クレームで保存されます。`sub` クレームのないトークンは拒否されます。ローカル（外部ではない）ユーザーがメールアドレスで照合されることはありません。

プロキシがトークンに入れるメールアドレスは信頼されます。`external_auth_email_matching` がデフォルトの `auto` であれば、以前のバージョン（JWT ユーザーをメールアドレスだけで照合していました）で作成されたユーザーは、次のリクエスト時に自分の `sub` と紐付けられます。`never` の場合、そうしたユーザーは照合されず、新しいアカウントがそのメールアドレスを再利用することになるためリクエストは失敗します。`never` に切り替える前に、`auto` の状態で一度サインインしてもらってください。

## セキュリティ上の考慮事項 {#security-considerations}

Semaphore は、設定されたヘッダーに有効なトークンを持つリクエストであれば、誰でも
サインインさせます。署名によってクライアントがトークンを偽造することは防げますが、
すでに持っているトークンを再送することは防げません。そのため、プロキシを唯一の入り口にする必要があります。

- プロキシを経由せずに Semaphore にアクセスできないようにしてください。プライベートアドレスに
  バインドするか、ポートをファイアウォールで保護します。[ネットワークセキュリティ](/admin-guide/security/network)を参照してください。
- クライアントから届くリクエストの JWT ヘッダーをプロキシで削除し、ユーザーを認証した後に
  のみプロキシがそのヘッダーを設定するように構成してください。
- `audience` には、プロキシが Semaphore 用に使う値を設定してください。設定しないと、同じ鍵で
  署名され、プロキシが別のアプリケーション向けに発行したトークンも受け入れられてしまいます。

## 設定 {#configuration}

JWT 認証を有効にする場合、`header` と `jwks_url` の両方が必須です。Semaphore は起動時にこれを検証します。

### 設定ファイル {#config-file}

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "header": "X-Pomerium-Jwt-Assertion",
      "jwks_url": "https://auth.example.com/.well-known/pomerium/jwks.json",
      "audience": "https://semaphore.example.com",
      "issuer": "https://auth.example.com"
    }
  }
}
```

### 環境変数 {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker の例 {#docker-example}

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_JWT_AUTH_ENABLED=true \
  -e SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion \
  -e SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json \
  -e SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com \
  -e SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com \
  semaphoreui/semaphore:latest
```

## オプション {#options}

| パラメーター | 環境変数 | 説明 |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | JWT プロキシ認証を有効にします。 |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | JWT を含む HTTP ヘッダー。**必須。** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | 署名検証に使う JWKS エンドポイントの URL。**必須。** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | 期待される `aud` クレーム。空の場合、audience は検証されません。 |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | 期待される `iss` クレーム。空の場合、issuer は検証されません。 |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | ユーザーのメールアドレスを表す JWT クレーム。デフォルト: `email`。 |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | ユーザーの表示名を表す JWT クレーム。デフォルト: `name`。 |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | ユーザー名を表す JWT クレーム。デフォルト: `email`。 |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | Semaphore のセッションを消去した後、ログアウトリンクのリダイレクト先となる URL。[ログアウト](#logout)を参照してください。 |

## サポートされるアルゴリズム {#supported-algorithms}

Semaphore は **ES256**、**ES384**、**ES512**、**RS256**、**RS384**、**RS512** で署名されたトークンを受け入れます。すべてのトークンには `exp` クレームが必要で、ないトークンは拒否されます。

## ログアウト {#logout}

Semaphore でログアウトをクリックすると Semaphore のセッション Cookie は消去されますが、リバースプロキシのセッションには影響しません。そのため、次のリクエストで同じユーザーがすぐに再認証されます。

ユーザーを完全にサインアウトさせるには、`signout_url` にプロキシのサインアウトエンドポイントを設定します。Semaphore のセッションを消去した後、ブラウザーはそこへリダイレクトされます。

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "signout_url": "https://auth.example.com/.pomerium/sign_out"
    }
  }
}
```

主なプロキシの例:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## JWKS の可用性 {#jwks-availability}

Semaphore は起動時に JWKS を取得します。JWKS エンドポイントに到達できなくても、サーバーは起動します。鍵セットはバックグラウンドで 1 時間ごとに更新されるほか、Semaphore が見たことのない鍵 ID でトークンが署名されていた場合にも、最大で 5 分に 1 回更新されます。鍵が利用可能になるまで、JWT 認証はエラーを返します。
