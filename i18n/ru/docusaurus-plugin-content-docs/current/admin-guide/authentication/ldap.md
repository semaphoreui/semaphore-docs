# LDAP и Active Directory

Файл конфигурации содержит следующие параметры LDAP:

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

Все опции SSO-провайдера:

| Параметр              | Переменные окружения  | Описание                                                                                                    |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Имя объекта пользователя LDAP для привязки (bind). |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Пароль пользователя LDAP, указанного в Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Хост сервера LDAP, включая порт. Например: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Область, в которой будет выполняться поиск пользователей. Например: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Выражение для поиска пользователей. По умолчанию: `(&(objectClass=inetOrgPerson)(uid=%s))`, где `%s` заменяется на введённый логин. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Выражение claim для email пользователя[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Выражение claim для логина пользователя[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Выражение claim для имени пользователя[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP включён. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Подключаться к серверу LDAP по SSL. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Область, в которой будет выполняться поиск групп. Включает [сопоставления групп](#project-roles-from-groups). В `ldap_providers` это `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Выражение для поиска групп. По умолчанию: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. В `ldap_providers` это `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Атрибут с именем группы. По умолчанию: `cn`. В `ldap_providers` это `group_name_attribute`. |


### \*Выражение claim {#claim-expression}

Пример выражения claim:

```
email | {{ .username }}@your-domain.com
```

Semaphore сначала пытается получить поле email. Если оно пустое, выполняется следующее за ним выражение.

:::warning

Выражение <code>"username_claim": "|"</code> генерирует случайный <code>username</code> для каждого пользователя, входящего через этого провайдера.

:::

### Устранение неполадок {#troubleshooting}

Используйте утилиту `ldapwhoami`, чтобы проверить, работает ли ваш **BindDN**:
Эта утилита входит в пакет **openldap-clients**.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Она интерактивно запросит пароль, должна вернуть код **0** и вывести указанный **DN**.

:::warning

Если у вас возникают проблемы с LDAP, ознакомьтесь с разделом [Устранение неполадок](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof).

:::


## Роли в проекте по группам <Enterprise /> {#project-roles-from-groups}

:::info
Сопоставления групп доступны в редакции **Semaphore Enterprise**.
:::

Сопоставление группы даёт роль в проекте каждому пользователю из группы в каталоге. Например, сопоставление может дать участникам группы `devops` роль **Manager** в проекте `Infrastructure`.

### Чтение групп из каталога {#read-groups-from-the-directory}

Укажите в `ldap_group_search_dn` место, где находятся ваши группы. В `ldap_providers` используйте `group_search_dn`. Без этого параметра вход не меняет роли из сопоставлений групп.

Для Active Directory и OpenLDAP достаточно одной этой строки:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Ещё два параметра необязательны:

- `ldap_group_search_filter` находит группы пользователя. По умолчанию он находит группы, в которых пользователь указан как `member`, `uniqueMember` или `memberUid`.
- `ldap_group_name_attribute` — атрибут с именем группы. По умолчанию это `cn`.

В фильтре `{{ .dn }}` — это DN пользователя, а `{{ .username }}` — атрибут `uid` пользователя, или его логин, если в записи нет `uid`. Semaphore экранирует оба значения.

Если атрибут с именем содержит DN, именем группы становится первая часть DN. Например, из `CN=DevOps,OU=Groups,DC=corp,DC=com` получается имя группы `DevOps`.

#### Вложенные группы в Active Directory {#nested-groups-in-active-directory}

Чтобы учитывать группы, в которые входят другие группы, используйте правило «matching rule in chain»:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Группы из записи пользователя {#groups-from-the-user-entry}

Если в записи пользователя перечислены его группы, например в `memberOf`, ищите пользователя, а не группы. Используйте базу из `ldap_searchdn`, чтобы поиск находил только вошедшего пользователя. Этот пример для Active Directory. Для OpenLDAP с оверлеем `memberOf` используйте вместо этого фильтр `(uid={{ .username }})`.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Создание сопоставления группы {#create-a-group-mapping}

Создайте сопоставление так же, как для OpenID Connect. См. [шаги](/admin-guide/authentication/openid#create-a-group-mapping). Выберите ваш провайдер LDAP и введите имя группы в том виде, в каком его возвращает каталог.

- Semaphore обновляет роли из сопоставлений групп при каждом входе пользователя через провайдера.
- Каждый вход применяет сопоставления того провайдера, через который выполнен вход, и убирает роли из сопоставлений других провайдеров. Поэтому пользователь, который вошёл через Okta, а затем через LDAP, сохраняет только роли, сопоставленные для LDAP.
- Пользователь, которого не нашли ни в одной группе, не получает ролей из сопоставлений групп.
- Без `ldap_group_search_dn` вход не меняет роли из сопоставлений групп.
- Если каталог не может вернуть группы, например потому что сервер не отвечает или в фильтре есть синтаксическая ошибка, вход отклоняется. Причина указана в журнале сервера.
- Провайдер OpenID Connect и провайдер LDAP с одинаковым ID используют общие сопоставления групп.

## Пример: использование сервера OpenLDAP {#example-using-openldap-server}

Выполните следующую команду, чтобы запустить собственный сервер LDAP с учётной записью администратора и дополнительным пользователем:

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

Конфигурация LDAP для Semaphore UI должна быть следующей:

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

Чтобы запустить Semaphore в Docker, используйте следующую конфигурацию LDAP:


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
