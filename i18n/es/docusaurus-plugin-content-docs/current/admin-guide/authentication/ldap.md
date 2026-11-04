# LDAP y Active Directory

El archivo de configuración contiene los siguientes parámetros de LDAP:

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

Todas las opciones del proveedor de SSO:

| Parámetro             | Variables de entorno | Descripción                                                                                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Nombre del objeto de usuario LDAP para el enlace (bind). |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Contraseña del usuario LDAP definido en el Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Host del servidor LDAP, incluido el puerto. Por ejemplo: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Ámbito en el que se buscarán los usuarios. Por ejemplo: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Expresión de búsqueda de usuarios. Valor predeterminado: `(&(objectClass=inetOrgPerson)(uid=%s))`, donde `%s` se sustituirá por el nombre de usuario introducido. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Expresión de claim del correo electrónico del usuario[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Expresión de claim del nombre de usuario (login)[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Expresión de claim del nombre del usuario[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP habilitado. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Conectar al servidor LDAP mediante SSL. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Ámbito en el que se buscarán los grupos. Activa las [asignaciones de grupo](#project-roles-from-groups). En `ldap_providers` es `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Expresión de búsqueda de grupos. Valor predeterminado: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. En `ldap_providers` es `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Atributo con el nombre del grupo. Valor predeterminado: `cn`. En `ldap_providers` es `group_name_attribute`. |


### \*Expresión de claim {#claim-expression}

Ejemplo de expresión de claim:

```
email | {{ .username }}@your-domain.com
```

Semaphore intenta obtener primero el campo email. Si está vacío, se evalúa la expresión que le sigue.

:::warning

La expresión <code>"username_claim": "|"</code> genera un <code>username</code> aleatorio para cada usuario que inicia sesión a través del proveedor.

:::

### Solución de problemas {#troubleshooting}

Utilice la herramienta `ldapwhoami` para comprobar si su **BindDN** funciona:
Esta herramienta la proporciona el paquete **openldap-clients**.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Solicitará la contraseña de forma interactiva y debería devolver el código **0** y mostrar el **DN** especificado.

:::warning

Consulte la sección [Solución de problemas](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) si tiene problemas con LDAP.

:::


## Roles de proyecto a partir de grupos <Enterprise /> {#project-roles-from-groups}

:::info
Las asignaciones de grupo están disponibles en la edición **Semaphore Enterprise**.
:::

Una asignación de grupo da un rol de proyecto a cada usuario de un grupo del directorio. Por ejemplo, una asignación puede dar a los miembros del grupo `devops` el rol **Gestor** en el proyecto `Infrastructure`.

### Leer los grupos del directorio {#read-groups-from-the-directory}

Establezca `ldap_group_search_dn` con el lugar donde están sus grupos. En `ldap_providers`, use `group_search_dn`. Sin este ajuste, los inicios de sesión no cambian los roles de asignaciones de grupo.

En Active Directory y OpenLDAP, basta con esta línea:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Hay dos opciones más, que son opcionales:

- `ldap_group_search_filter` busca los grupos del usuario. El valor predeterminado busca los grupos que incluyen al usuario como `member`, `uniqueMember` o `memberUid`.
- `ldap_group_name_attribute` es el atributo con el nombre del grupo. El valor predeterminado es `cn`.

En el filtro, `{{ .dn }}` es el DN del usuario y `{{ .username }}` es el atributo `uid` del usuario, o el nombre de usuario (login) si la entrada no tiene `uid`. Semaphore escapa ambos valores.

Si el atributo de nombre contiene un DN, el nombre del grupo es la primera parte del DN. Por ejemplo, `CN=DevOps,OU=Groups,DC=corp,DC=com` da el nombre de grupo `DevOps`.

#### Grupos anidados en Active Directory {#nested-groups-in-active-directory}

Para incluir los grupos que contienen otros grupos, use la regla «matching rule in chain»:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Grupos desde la entrada del usuario {#groups-from-the-user-entry}

Si la entrada del usuario enumera sus grupos, por ejemplo en `memberOf`, busque el usuario en lugar de los grupos. Use la base de `ldap_searchdn` para que la búsqueda encuentre solo al usuario que inicia sesión. Este ejemplo es para Active Directory. OpenLDAP con el overlay `memberOf` usa en su lugar el filtro `(uid={{ .username }})`.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Crear una asignación de grupo {#create-a-group-mapping}

Cree la asignación igual que para OpenID Connect. Consulte los [pasos](/admin-guide/authentication/openid#create-a-group-mapping). Elija su proveedor LDAP y escriba el nombre del grupo tal como lo devuelve el directorio.

- Semaphore actualiza los roles de asignaciones de grupo cada vez que el usuario inicia sesión a través del proveedor.
- Cada inicio de sesión aplica las asignaciones del proveedor usado en ese inicio de sesión y quita los roles de las asignaciones de otros proveedores. Así, un usuario que inicia sesión a través de Okta y después a través de LDAP conserva solo los roles asignados para LDAP.
- Un usuario que no se encuentra en ningún grupo no recibe roles de asignaciones de grupo.
- Sin `ldap_group_search_dn`, un inicio de sesión no cambia los roles de asignaciones de grupo.
- Si el directorio no puede devolver los grupos, por ejemplo porque el servidor no responde o el filtro tiene un error de sintaxis, el inicio de sesión se rechaza. El registro del servidor indica el motivo.
- Un proveedor OpenID Connect y un proveedor LDAP con el mismo ID comparten sus asignaciones de grupo.

## Ejemplo: uso de un servidor OpenLDAP {#example-using-openldap-server}

Ejecute el siguiente comando para iniciar su propio servidor LDAP con una cuenta de administrador y un usuario adicional:

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

Su configuración de LDAP para Semaphore UI debería ser la siguiente:

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

Para ejecutar Semaphore en Docker, utilice la siguiente configuración de LDAP:


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
