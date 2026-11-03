# LDAP e Active Directory

O arquivo de configuração contém os seguintes parâmetros LDAP:

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

Todas as opções do provedor SSO:

| Parâmetro             | Variáveis de ambiente | Descrição                                                                                                   |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Nome do objeto de usuário LDAP usado para o bind. |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Senha do usuário LDAP definido no Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Host do servidor LDAP, incluindo a porta. Por exemplo: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Escopo em que os usuários serão pesquisados. Por exemplo: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Expressão de busca de usuários. Padrão: `(&(objectClass=inetOrgPerson)(uid=%s))`, onde `%s` será substituído pelo login informado. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Expressão de claim do e-mail do usuário[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Expressão de claim do login do usuário[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Expressão de claim do nome do usuário[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP habilitado. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Conectar ao servidor LDAP via SSL. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Escopo em que os grupos serão pesquisados. Ativa os [mapeamentos de grupo](#project-roles-from-groups). Em `ldap_providers`, é `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Expressão de busca de grupos. Padrão: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. Em `ldap_providers`, é `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Atributo com o nome do grupo. Padrão: `cn`. Em `ldap_providers`, é `group_name_attribute`. |


### \*Expressão de claim {#claim-expression}

Exemplo de expressão de claim:

```
email | {{ .username }}@your-domain.com
```

O Semaphore tenta obter primeiro o campo email. Se ele estiver vazio, a expressão seguinte é executada.

:::warning

A expressão <code>"username_claim": "|"</code> gera um <code>username</code> aleatório para cada usuário que faz login por meio do provedor.

:::

### Solução de problemas {#troubleshooting}

Use a ferramenta `ldapwhoami` para verificar se o seu **BindDN** funciona:
Esta ferramenta é fornecida pelo pacote **openldap-clients**.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Ela solicitará a senha de forma interativa e deverá retornar o código **0** e exibir o **DN** conforme especificado.

:::warning

Leia a seção [Solução de problemas](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) se você tiver problemas com o LDAP.

:::


## Papéis de projeto a partir de grupos <Enterprise /> {#project-roles-from-groups}

:::info
Os mapeamentos de grupo estão disponíveis na edição **Semaphore Enterprise**.
:::

Um mapeamento de grupo dá um papel de projeto a cada usuário de um grupo do diretório. Por exemplo, um mapeamento pode dar aos membros do grupo `devops` o papel **Manager** no projeto `Infrastructure`.

### Ler os grupos do diretório {#read-groups-from-the-directory}

Defina `ldap_group_search_dn` com o local onde estão os seus grupos. Em `ldap_providers`, use `group_search_dn`. Sem essa configuração, os logins não alteram os papéis de mapeamentos de grupo.

No Active Directory e no OpenLDAP, basta esta linha:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Outras duas opções são opcionais:

- `ldap_group_search_filter` encontra os grupos do usuário. O padrão encontra os grupos que listam o usuário como `member`, `uniqueMember` ou `memberUid`.
- `ldap_group_name_attribute` é o atributo com o nome do grupo. O padrão é `cn`.

No filtro, `{{ .dn }}` é o DN do usuário e `{{ .username }}` é o login do usuário, ou seja, o valor do mapeamento `uid`. O Semaphore faz o escape dos dois valores.

Se o atributo de nome contém um DN, o nome do grupo é a primeira parte desse DN. Por exemplo, `CN=DevOps,OU=Groups,DC=corp,DC=com` dá o nome de grupo `DevOps`.

#### Grupos aninhados no Active Directory {#nested-groups-in-active-directory}

Para incluir os grupos que contêm outros grupos, use a regra "matching rule in chain":

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Grupos a partir da entrada do usuário {#groups-from-the-user-entry}

Se a entrada do usuário lista os seus grupos, por exemplo em `memberOf`, pesquise o usuário em vez dos grupos. Este exemplo é para o Active Directory. O OpenLDAP com o overlay `memberOf` usa em vez disso o filtro `(uid={{ .username }})`.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Criar um mapeamento de grupo {#create-a-group-mapping}

Crie o mapeamento da mesma forma que para o OpenID Connect. Veja os [passos](/admin-guide/authentication/openid#create-a-group-mapping). Escolha o seu provedor LDAP e digite o nome do grupo como o diretório o retorna.

- O Semaphore atualiza os papéis de mapeamentos de grupo cada vez que o usuário faz login pelo provedor.
- Cada login aplica os mapeamentos do provedor usado nesse login e retira os papéis dos mapeamentos de outros provedores. Assim, um usuário que faz login pelo Okta e depois pelo LDAP mantém apenas os papéis mapeados para o LDAP.
- Um usuário que não é encontrado em nenhum grupo não recebe papéis de mapeamentos de grupo.
- Sem `ldap_group_search_dn`, um login não altera os papéis de mapeamentos de grupo.
- Se o diretório não consegue retornar os grupos, por exemplo porque o servidor não responde ou o filtro tem um erro de sintaxe, o login é recusado. O log do servidor informa o motivo.
- Um provedor OpenID Connect e um provedor LDAP com o mesmo ID compartilham os seus mapeamentos de grupo.

## Exemplo: usando um servidor OpenLDAP {#example-using-openldap-server}

Execute o seguinte comando para iniciar o seu próprio servidor LDAP com uma conta de administrador e um usuário adicional:

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

A sua configuração LDAP para o Semaphore UI deve ser a seguinte:

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

Para executar o Semaphore no Docker, use a seguinte configuração LDAP:


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
