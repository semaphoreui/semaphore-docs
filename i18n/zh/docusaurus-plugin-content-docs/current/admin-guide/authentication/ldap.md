# LDAP 与 Active Directory

配置文件包含以下 LDAP 参数：

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

所有 SSO 提供方选项：

| 参数                  | 环境变量              | 说明                                                                                                        |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | 用于绑定的 LDAP 用户对象名称。 |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Bind DN 中所定义 LDAP 用户的密码。 |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | LDAP 服务器主机（含端口）。例如：`localhost:389`。 |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | 搜索用户的范围。例如：`ou=users,dc=example,dc=org`。 |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | 用户搜索表达式。默认值：`(&(objectClass=inetOrgPerson)(uid=%s))`，其中 `%s` 会被替换为输入的登录名。 |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | 用户邮箱声明表达式[\*](#claim-expression)。 |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | 用户登录名声明表达式[\*](#claim-expression)。 |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | 用户姓名声明表达式[\*](#claim-expression)。 |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | 是否启用 LDAP。 |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | 通过 SSL 连接 LDAP 服务器。 |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | 搜索组的范围。启用[组映射](#project-roles-from-groups)。在 `ldap_providers` 中为 `group_search_dn`。 |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | 组搜索表达式。默认值：`(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`。在 `ldap_providers` 中为 `group_search_filter`。 |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | 包含组名的属性。默认值：`cn`。在 `ldap_providers` 中为 `group_name_attribute`。 |


### \*声明表达式 {#claim-expression}

声明表达式示例：

```
email | {{ .username }}@your-domain.com
```

Semaphore 会先尝试获取 email 字段。如果该字段为空，则执行其后的表达式。

:::warning

表达式 <code>"username_claim": "|"</code> 会为每个通过该提供方登录的用户生成一个随机的 <code>username</code>。

:::

### 故障排查 {#troubleshooting}

使用 `ldapwhoami` 工具检查你的 **BindDN** 是否有效：
该工具由 **openldap-clients** 软件包提供。

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

它会以交互方式询问密码，并应返回代码 **0** 且输出所指定的 **DN**。

:::warning

如果你在使用 LDAP 时遇到问题，请阅读[故障排查](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof)章节。

:::


## 根据组授予项目角色 <Enterprise /> {#project-roles-from-groups}

:::info
组映射在 **Semaphore Enterprise** 版中可用。
:::

组映射会为目录中某个组的每个用户授予一个项目角色。例如，一个组映射可以为 `devops` 组的成员授予 `Infrastructure` 项目中的 **Manager** 角色。

### 从目录读取组 {#read-groups-from-the-directory}

将 `ldap_group_search_dn` 设置为组所在的位置。在 `ldap_providers` 中，使用 `group_search_dn`。如果不设置，登录不会更改来自组映射的角色。

在 Active Directory 和 OpenLDAP 中，只需这一行：

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

另外两个选项是可选的：

- `ldap_group_search_filter` 用于查找用户所属的组。默认值会查找将该用户列为 `member`、`uniqueMember` 或 `memberUid` 的组。
- `ldap_group_name_attribute` 是包含组名的属性。默认值为 `cn`。

在过滤器中，`{{ .dn }}` 是用户的 DN，`{{ .username }}` 是用户的 `uid` 属性，如果条目没有 `uid`，则是用户的登录名。Semaphore 会对这两个值进行转义。

如果名称属性中是 DN，组名就是 DN 中的 `cn` 部分。例如，`CN=DevOps,OU=Groups,DC=corp,DC=com` 得到的组名是 `DevOps`。

#### Active Directory 中的嵌套组 {#nested-groups-in-active-directory}

要包含那些含有其他组的组，请使用 matching rule in chain：

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### 从用户条目获取组 {#groups-from-the-user-entry}

如果用户条目列出了其所属的组（例如在 `memberOf` 中），请搜索用户而不是组。请使用用户搜索的基础 DN，使搜索只找到已登录的用户。此示例适用于 Active Directory。启用 `memberOf` overlay 的 OpenLDAP 则改用 `(uid={{ .username }})` 作为过滤器。

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### 创建组映射 {#create-a-group-mapping}

按照与 OpenID Connect 相同的方式创建映射。请参阅[步骤](/admin-guide/authentication/openid#create-a-group-mapping)。选择 LDAP 提供方，并按目录返回的形式输入组名。

- 用户每次通过提供方登录时，Semaphore 都会更新来自组映射的角色。
- 每次登录都会应用本次登录所用提供方的映射，并移除来自其他提供方映射的角色。因此，先通过 Okta 登录、再通过 LDAP 登录的用户只会保留为 LDAP 映射的角色。
- 在任何组中都找不到的用户不会获得来自组映射的角色。
- 如果没有 `ldap_group_search_dn`，登录不会更改来自组映射的角色。
- 如果目录无法返回组，例如服务器没有响应或过滤器有语法错误，登录会被拒绝。服务器日志会说明原因。
- ID 相同的 OpenID Connect 提供方和 LDAP 提供方共享组映射。

## 示例：使用 OpenLDAP 服务器 {#example-using-openldap-server}

运行以下命令启动你自己的 LDAP 服务器，其中包含一个管理员账户和一个额外的用户：

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

Semaphore UI 的 LDAP 配置应如下所示：

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

若要在 Docker 中运行 Semaphore，请使用以下 LDAP 配置：


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
