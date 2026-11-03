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
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | グループを検索するスコープ。[グループマッピング](#project-roles-from-groups)を有効にします。`ldap_providers` では `group_search_dn` です。 |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | グループの検索式。デフォルト: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`。`ldap_providers` では `group_search_filter` です。 |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | グループ名を持つ属性。デフォルト: `cn`。`ldap_providers` では `group_name_attribute` です。 |


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


## グループによるプロジェクトのロール <Enterprise /> {#project-roles-from-groups}

:::info
グループマッピングは **Semaphore Enterprise** エディションで利用できます。
:::

グループマッピングは、ディレクトリのグループに属するすべてのユーザーにプロジェクトのロールを付与します。たとえば、`devops` グループのメンバーに `Infrastructure` プロジェクトの **マネージャー** ロールを付与できます。

### ディレクトリからグループを読み取る {#read-groups-from-the-directory}

`ldap_group_search_dn` に、グループがある場所を設定します。`ldap_providers` では `group_search_dn` を使います。設定しない場合、ログインはグループマッピングによるロールを変更しません。

Active Directory と OpenLDAP では、次の 1 行だけで十分です。

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

ほかに 2 つのオプションがありますが、どちらも省略できます。

- `ldap_group_search_filter` はユーザーのグループを検索します。デフォルトでは、ユーザーを `member`、`uniqueMember`、`memberUid` のいずれかとして含むグループを検索します。
- `ldap_group_name_attribute` はグループ名を持つ属性です。デフォルトは `cn` です。

フィルター内の `{{ .dn }}` はユーザーの DN、`{{ .username }}` はユーザーのログイン名(`uid` マッピングの値)です。Semaphore はどちらの値もエスケープします。

名前の属性に DN が入っている場合、グループ名はその最初の部分になります。たとえば、`CN=DevOps,OU=Groups,DC=corp,DC=com` からはグループ名 `DevOps` が得られます。

#### Active Directory のネストされたグループ {#nested-groups-in-active-directory}

ほかのグループを含むグループも対象にするには、matching rule in chain を使います。

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### ユーザーエントリーのグループ {#groups-from-the-user-entry}

ユーザーエントリーにグループが列挙されている場合(たとえば `memberOf`)、グループではなくユーザーを検索します。この例は Active Directory 用です。`memberOf` オーバーレイを使う OpenLDAP では、代わりに `(uid={{ .username }})` をフィルターにします。

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### グループマッピングを作成する {#create-a-group-mapping}

OpenID Connect の場合と同じ方法でマッピングを作成します。[手順](/admin-guide/authentication/openid#create-a-group-mapping)を参照してください。LDAP プロバイダーを選び、ディレクトリが返すとおりにグループ名を入力します。

- ユーザーがプロバイダー経由でログインするたびに、Semaphore はグループマッピングによるロールを更新します。
- ログインのたびに、そのログインで使ったプロバイダーのマッピングが適用され、ほかのプロバイダーのマッピングによるロールは外されます。そのため、Okta でログインしたあと LDAP でログインしたユーザーには、LDAP 用にマッピングされたロールだけが残ります。
- どのグループにも見つからないユーザーには、グループマッピングによるロールは付与されません。
- `ldap_group_search_dn` を設定しない場合、ログインはグループマッピングによるロールを変更しません。
- サーバーが応答しない、フィルターに構文エラーがあるなどの理由でディレクトリがグループを返せない場合、ログインは拒否されます。理由はサーバーログに記録されます。
- 同じ ID を持つ OpenID Connect プロバイダーと LDAP プロバイダーは、グループマッピングを共有します。

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
