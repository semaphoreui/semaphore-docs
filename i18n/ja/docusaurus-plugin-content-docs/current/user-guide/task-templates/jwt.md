# タスク JWT

[サーバーで JWT の発行が有効になっている](/admin-guide/security/jwt)場合、
テンプレートは生成する各タスクに対して、有効期間の短い署名付き token を発行できます。
この token は、実行中の playbook やスクリプトに
`SEMAPHORE_JWT` 環境変数として公開され、OpenBao や HashiCorp Vault など、
JWT 認証をサポートする任意のシステムで
資格情報と交換できます。

[キーストア](/user-guide/key-store)に保存された長期的なシークレットと比べた利点は、
各タスクが**その特定のタスク実行を識別する新しい token**（プロジェクト、テンプレート、ユーザー ID）を受け取り、
タスク終了後まもなく期限切れになることです。

## テンプレートで JWT を有効にする {#enabling-jwts-on-a-template}

テンプレートフォームで **JWT** セクションまでスクロールし（このセクションは管理者が
[JWT の発行を有効にした](/admin-guide/security/jwt)場合にのみ表示されます）、
**JWT を有効にする**にチェックを入れます。

テンプレートごとに次のオプションを設定できます。

| フィールド | 説明 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| オーディエンス | `aud` クレームに出力される 1 つ以上の文字列。下流のシステムが期待する識別子（例: OpenBao サーバーの URL）を設定します。最大 32 件まで指定できます。 |
| TTL | token の有効期間（`30s`、`10m`、`1h` などの期間）。空のままにすると、グローバルの `jwt.default_ttl` が使用されます。TTL はグローバルの `jwt.max_ttl` を超えてはいけません。 |

## Token のクレーム {#token-claims}

各 token には次のクレームが含まれており、下流のシステムでアクセスを許可する際に
利用できます。

| クレーム | 例 | 備考 |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | 管理者が設定します。 |
| `aud` | `https://bao.example.com` | テンプレートのオーディエンス一覧から取得されます。 |
| `sub` | `task:1234` | タスク実行ごとに一意です。 |
| `iat` / `nbf` / `exp` | | 標準の時刻関連クレームです。 |
| `jti` | | 一意の token 識別子です。 |
| `project_id` | `7` | テンプレートが属するプロジェクトです。 |
| `template_id` | `42` | タスクを生成したテンプレートです。 |
| `user_id` | `67` | タスクを起動したユーザーです（スケジュール実行やインテグレーション実行では省略されます） |

これらのクレームを使って、利用側でアクセスの**範囲を限定**してください。たとえば、
`project_id = 7` と特定の `template_id` を持つ token のみを受け入れる
OpenBao のロールを作成します。

## タスク内で token を使用する {#using-the-token-inside-a-task}

Semaphore は、タスクプロセスの環境に token を `SEMAPHORE_JWT` として
エクスポートします。

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## 例: OpenBao {#example-openbao}

以下の手順では、Semaphore の JWT を信頼するように OpenBao を設定し、
JWT をデモ用パスワードと交換します。
`semaphore.example.com` と `bao.example.com` は、ご自身のホスト名に置き換えてください。

### 1. JWT 認証メソッドを設定する {#1-configure-the-jwt-auth-method}

JWT 認証メソッドを有効にし、Semaphore インスタンスの JWKS エンドポイントを
指定します。OpenBao は、そこから取得した公開鍵を使って
すべての token を検証します。

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. ポリシーを定義する {#2-define-a-policy}

タスクに必要な権限を付与します。以下の例では、`kv/data/semaphore/demo` にある
デモ用の資格情報の読み取りを許可しています。

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. テンプレートにバインドされた OpenBao ロールを定義する {#3-define-an-openbao-role-bound-to-a-template}

OpenBao のロールは、**どの Semaphore タスク**がどのポリシーを引き受けられるかを
決定します。Semaphore 固有のクレーム（`project_id`、`template_id` など）を
`bound_claims` として使用し、意図したテンプレートだけがロールを使用できるようにします。

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

各ロールは、必ず少なくとも `project_id` または `template_id` クレームで
制限してください。バインディングがない場合、Semaphore インスタンスが発行した**すべての** JWT が
そのロールを引き受けられてしまいます。

サポートされている設定パラメーターの完全な一覧は[こちら](https://openbao.org/api-docs/auth/jwt/#createupdate-role)を参照してください

### 4. テンプレートを設定する {#4-configure-the-template}

デプロイ用 playbook を実行する Semaphore のテンプレートで、次の設定を行います。

- **JWT を有効にする**にチェックを入れます。
- **オーディエンス**に `https://bao.example.com` を設定します。これは OpenBao ロールの
  `bound_audiences` と一致します。
- 必要に応じて **TTL** を `15m` に設定し、タスク終了後まもなく token が
  期限切れになるようにします。

### 5. タスク内で token を使用する {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

これでタスクは、事前共有シークレットなしで OpenBao に対して認証できるようになりました :tada:
