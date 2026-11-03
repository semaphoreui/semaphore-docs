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
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | 그룹을 검색할 범위입니다. [그룹 매핑](#project-roles-from-groups)을 켭니다. `ldap_providers`에서는 `group_search_dn`입니다. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | 그룹 검색 표현식입니다. 기본값: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. `ldap_providers`에서는 `group_search_filter`입니다. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | 그룹 이름이 담긴 속성입니다. 기본값: `cn`. `ldap_providers`에서는 `group_name_attribute`입니다. |


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

LDAP에 문제가 있는 경우 [문제 해결](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) 섹션을 읽어 보십시오.

:::


## 그룹에 따른 프로젝트 역할 <Enterprise /> {#project-roles-from-groups}

:::info
그룹 매핑은 **Semaphore Enterprise** 에디션에서 사용할 수 있습니다.
:::

그룹 매핑은 디렉터리의 그룹에 속한 모든 사용자에게 프로젝트 역할을 부여합니다. 예를 들어 그룹 매핑으로 `devops` 그룹 구성원에게 `Infrastructure` 프로젝트의 **Manager** 역할을 부여할 수 있습니다.

### 디렉터리에서 그룹 읽기 {#read-groups-from-the-directory}

`ldap_group_search_dn`에 그룹이 있는 위치를 설정합니다. `ldap_providers`에서는 `group_search_dn`을 사용합니다. 이 값을 설정하지 않으면 로그인은 그룹 매핑으로 받은 역할을 바꾸지 않습니다.

Active Directory와 OpenLDAP에서는 이 한 줄이면 충분합니다:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

선택 사항인 옵션이 두 개 더 있습니다:

- `ldap_group_search_filter`는 사용자의 그룹을 찾습니다. 기본값은 사용자를 `member`, `uniqueMember` 또는 `memberUid`로 포함하는 그룹을 찾습니다.
- `ldap_group_name_attribute`는 그룹 이름이 담긴 속성입니다. 기본값은 `cn`입니다.

필터에서 `{{ .dn }}`은 사용자의 DN이고 `{{ .username }}`은 사용자 로그인 이름, 즉 `uid` 매핑의 값입니다. Semaphore는 두 값을 모두 이스케이프합니다.

이름 속성에 DN이 들어 있으면 그 첫 번째 부분이 그룹 이름이 됩니다. 예를 들어 `CN=DevOps,OU=Groups,DC=corp,DC=com`에서는 그룹 이름 `DevOps`를 얻습니다.

#### Active Directory의 중첩 그룹 {#nested-groups-in-active-directory}

다른 그룹을 포함하는 그룹까지 포함하려면 matching rule in chain을 사용합니다:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### 사용자 항목의 그룹 {#groups-from-the-user-entry}

사용자 항목에 그룹이 나열되어 있으면(예: `memberOf`) 그룹 대신 사용자를 검색합니다. 이 예제는 Active Directory용입니다. `memberOf` 오버레이를 사용하는 OpenLDAP에서는 대신 `(uid={{ .username }})`을 필터로 사용합니다.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### 그룹 매핑 만들기 {#create-a-group-mapping}

OpenID Connect와 같은 방법으로 매핑을 만드십시오. [단계](/admin-guide/authentication/openid#create-a-group-mapping)를 참고하십시오. LDAP 제공자를 선택하고 디렉터리가 반환하는 그대로 그룹 이름을 입력합니다.

- Semaphore는 사용자가 제공자를 통해 로그인할 때마다 그룹 매핑으로 받은 역할을 업데이트합니다.
- 각 로그인은 그 로그인에 사용한 제공자의 매핑을 적용하고 다른 제공자의 매핑으로 받은 역할을 제거합니다. 따라서 Okta로 로그인한 다음 LDAP로 로그인한 사용자에게는 LDAP용으로 매핑된 역할만 남습니다.
- 어떤 그룹에서도 찾을 수 없는 사용자는 그룹 매핑으로 역할을 받지 않습니다.
- `ldap_group_search_dn`이 없으면 로그인은 그룹 매핑으로 받은 역할을 바꾸지 않습니다.
- 서버가 응답하지 않거나 필터에 구문 오류가 있는 등의 이유로 디렉터리가 그룹을 반환하지 못하면 로그인이 거부됩니다. 서버 로그에 그 이유가 남습니다.
- ID가 같은 OpenID Connect 제공자와 LDAP 제공자는 그룹 매핑을 공유합니다.

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
