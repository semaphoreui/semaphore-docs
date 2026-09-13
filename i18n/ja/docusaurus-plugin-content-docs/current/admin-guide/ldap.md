# LDAP と Active Directory

設定ファイルには、次の LDAP パラメーターがあります。

```json
{
  "ldap_binddn": "cn=admin,dc=example,dc=org",
  "ldap_bindpassword": "admin_password",
  "ldap_server": "localhost:389",
  "ldap_searchdn": "ou=users,dc=example,dc=org",
  "ldap_searchfilter": "(&(objectClass=inetOrgPerson)(uid=%s))",
  "ldap_mappings": {
    "dn": "",
    "mail": "uid",
    "uid": "uid",
    "cn": "cn"
  },
  "ldap_enable": true,
  "ldap_needtls": false,
}
```

SSO プロバイダーのすべてのオプション:

| パラメーター           | 環境変数 | 説明                                                                                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | バインドする LDAP ユーザーオブジェクトの名前。 |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Bind DN で定義した LDAP ユーザーのパスワード。 |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | ポートを含む LDAP サーバーのホスト。例: `localhost:389`。 |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | ユーザーを検索するスコープ。例: `ou=users,dc=example,dc=org`。 |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | ユーザーの検索式。デフォルト: `(&(objectClass=inetOrgPerson)(uid=%s))`。`%s` は入力されたログイン名に置き換えられます。 |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | ユーザーのメールアドレスのクレーム式[\*](#claim-expression)。 |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | ユーザーのログイン名のクレーム式[\*](#claim-expression)。 |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | ユーザー名のクレーム式[\*](#claim-expression)。 |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP を有効にします。 |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | SSL で LDAP サーバーに接続します。 |


### \*クレーム式 {#claim-expression}

クレーム式の例:

```
email | {{ .username }}@your-domain.com
```

Semaphore はまず email フィールドの取得を試みます。それが空の場合、その後に続く式が実行されます。

:::warning

式 <code>"username_claim": "|"</code> は、プロバイダー経由でログインする各ユーザーにランダムな <code>username</code> を生成します。

:::

### トラブルシューティング {#troubleshooting}

**BindDN** が機能するかどうかを確認するには、`ldapwhoami` ツールを使用します。
このツールは **openldap-clients** パッケージで提供されます。

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

対話的にパスワードの入力を求められ、リターンコード **0** を返して、指定した **DN** を出力するはずです。

:::warning

LDAP で問題が発生した場合は、 [トラブルシューティング](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof)のセクションをお読みください。

:::


## 例: OpenLDAP サーバーの使用 {#example-using-openldap-server}

次のコマンドを実行して、管理者アカウントと追加ユーザーを持つ独自の LDAP サーバーを起動します。

```
docker run -d --name openldap \
  -p 1389:1389 \
  -p 1636:1636 \
  -e LDAP_ADMIN_USERNAME=admin \
  -e LDAP_ADMIN_PASSWORD=pwd \
  -e LDAP_USERS=user1 \
  -e LDAP_PASSWORDS=pwd \
  -e LDAP_ROOT=dc=example,dc=org \
  -e LDAP_ADMIN_DN=cn=admin,dc=example,dc=org \
  bitnami/openldap:latest
```

Semaphore UI の LDAP 設定は次のようになります。

```json
{
	"ldap_binddn": "cn=admin,dc=example,dc=org",
	"ldap_bindpassword": "pwd",
	"ldap_server": "ldap-server.com:1389",
	"ldap_searchdn": "dc=example,dc=org",
	"ldap_searchfilter": "(&(objectClass=inetOrgPerson)(uid=%s))",
	"ldap_mappings": {
		"mail": "{{ .cn }}@ldap.your-domain.com",
		"uid": "|",
		"cn": "cn"
	},
	"ldap_enable": true,
	"ldap_needtls": false
}
```

Semaphore を Docker で実行するには、次の LDAP 設定を使用します。


```
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=bolt \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_LDAP_ENABLE=yes \
  -e SEMAPHORE_LDAP_SERVER=ldap-server.com:1389 \
  -e SEMAPHORE_LDAP_BIND_DN=cn=admin,dc=example,dc=org \
  -e SEMAPHORE_LDAP_BIND_PASSWORD=pwd \
  -e SEMAPHORE_LDAP_SEARCH_DN=dc=example,dc=org \
  -e 'SEMAPHORE_LDAP_SEARCH_FILTER=(&(objectClass=inetOrgPerson)(uid=%s))' \
  -e 'SEMAPHORE_LDAP_MAPPING_MAIL={{ .cn }}@ldap.your-domain.com' \
  -e 'SEMAPHORE_LDAP_MAPPING_UID=|' \
  -e 'SEMAPHORE_LDAP_MAPPING_CN=cn' \
  semaphoreui/semaphore:latest
```

<!-- docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=bolt \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_LDAP_ACTIVATED=yes \
  -e SEMAPHORE_LDAP_HOST=semaphore.run \
  -e SEMAPHORE_LDAP_PORT=1389 \
  -e SEMAPHORE_LDAP_DN_BIND=cn=admin,dc=example,dc=org \
  -e SEMAPHORE_LDAP_PASSWORD=pwd \
  -e SEMAPHORE_LDAP_DN_SEARCH=dc=example,dc=org \
  -e 'SEMAPHORE_LDAP_SEARCH_FILTER=(&(objectClass=inetOrgPerson)(uid=%s))' \
  -e 'SEMAPHORE_LDAP_MAPPING_MAIL={{ .cn }}@ldap.semaphore.run' \
  -e 'SEMAPHORE_LDAP_MAPPING_UID=|' \
  -e 'SEMAPHORE_LDAP_MAPPING_CN=cn' \
  semaphoreui/semaphore:latest -->
