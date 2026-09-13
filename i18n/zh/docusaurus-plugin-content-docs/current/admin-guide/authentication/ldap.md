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
