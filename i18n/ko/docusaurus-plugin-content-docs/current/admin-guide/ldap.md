# LDAP 및 Active Directory

구성 파일에는 다음 LDAP 매개변수가 포함됩니다.

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

모든 SSO 공급자 옵션:

| 매개변수              | 환경 변수             | 설명                                                                                                        |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | 바인딩할 LDAP 사용자 객체의 이름입니다. |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Bind DN에 정의된 LDAP 사용자의 비밀번호입니다. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | 포트를 포함한 LDAP 서버 호스트입니다. 예: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | 사용자를 검색할 범위입니다. 예: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | 사용자 검색 표현식입니다. 기본값: `(&(objectClass=inetOrgPerson)(uid=%s))`, 여기서 `%s`는 입력한 로그인 이름으로 대체됩니다. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | 사용자 이메일 클레임 표현식[\*](#claim-expression)입니다. |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | 사용자 로그인 클레임 표현식[\*](#claim-expression)입니다. |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | 사용자 이름 클레임 표현식[\*](#claim-expression)입니다. |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP 활성화 여부입니다. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | SSL로 LDAP 서버에 연결합니다. |


### \*클레임 표현식 {#claim-expression}

클레임 표현식 예제:

```
email | {{ .username }}@your-domain.com
```

Semaphore는 먼저 email 필드를 클레임하려고 시도합니다. 비어 있으면 그 뒤의 표현식이 실행됩니다.

:::warning

<code>"username_claim": "|"</code> 표현식은 공급자를 통해 로그인하는 각 사용자에 대해 임의의 <code>username</code>을 생성합니다.

:::

### 문제 해결 {#troubleshooting}

`ldapwhoami` 도구를 사용하여 **BindDN**이 동작하는지 확인하십시오.
이 도구는 **openldap-clients** 패키지에 포함되어 있습니다.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

비밀번호를 대화형으로 묻고, 코드 **0**을 반환하며 지정한 **DN**을 출력해야 합니다.

:::warning

LDAP에 문제가 있는 경우 [문제 해결](/faq/troubleshooting#6-unable-to-read-ldap-response-packet-unexpected-eof) 섹션을 읽어 보십시오.

:::


## 예제: OpenLDAP 서버 사용 {#example-using-openldap-server}

다음 명령을 실행하여 관리자 계정과 추가 사용자가 있는 자체 LDAP 서버를 시작합니다.

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

Semaphore UI의 LDAP 구성은 다음과 같아야 합니다.

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

Docker에서 Semaphore를 실행하려면 다음 LDAP 구성을 사용하십시오.


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
