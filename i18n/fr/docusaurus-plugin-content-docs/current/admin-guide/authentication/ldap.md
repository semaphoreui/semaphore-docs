# LDAP et Active Directory

Le fichier de configuration contient les paramètres LDAP suivants :

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

Toutes les options du fournisseur SSO :

| Paramètre             | Variables d'environnement | Description                                                                                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Nom de l'objet utilisateur LDAP utilisé pour la liaison (bind). |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Mot de passe de l'utilisateur LDAP défini dans le Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Hôte du serveur LDAP, port inclus. Par exemple : `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Périmètre dans lequel les utilisateurs seront recherchés. Par exemple : `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Expression de recherche des utilisateurs. Par défaut : `(&(objectClass=inetOrgPerson)(uid=%s))`, où `%s` sera remplacé par l'identifiant saisi. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Expression de claim pour l'e-mail de l'utilisateur[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Expression de claim pour l'identifiant de connexion de l'utilisateur[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Expression de claim pour le nom de l'utilisateur[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP activé. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Connexion au serveur LDAP via SSL. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Périmètre dans lequel les groupes seront recherchés. Active les [mappages de groupe](#project-roles-from-groups). Dans `ldap_providers`, l'option s'appelle `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Expression de recherche des groupes. Par défaut : `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. Dans `ldap_providers`, l'option s'appelle `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Attribut qui contient le nom du groupe. Par défaut : `cn`. Dans `ldap_providers`, l'option s'appelle `group_name_attribute`. |


### \*Expression de claim {#claim-expression}

Exemple d'expression de claim :

```
email | {{ .username }}@your-domain.com
```

Semaphore tente d'abord de récupérer le champ email. S'il est vide, l'expression qui suit est évaluée.

:::warning

L'expression <code>"username_claim": "|"</code> génère un <code>username</code> aléatoire pour chaque utilisateur qui se connecte via le fournisseur.

:::

### Dépannage {#troubleshooting}

Utilisez l'outil `ldapwhoami` pour vérifier que votre **BindDN** fonctionne :
Cet outil est fourni par le paquet **openldap-clients**.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Il demandera le mot de passe de manière interactive, et doit renvoyer le code **0** et afficher le **DN** tel que spécifié.

:::warning

Veuillez lire la section [Dépannage](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) si vous rencontrez des problèmes avec LDAP.

:::


## Rôles de projet à partir des groupes <Enterprise /> {#project-roles-from-groups}

:::info
Les mappages de groupe sont disponibles dans l'édition **Semaphore Enterprise**.
:::

Un mappage de groupe donne un rôle de projet à chaque utilisateur d'un groupe de l'annuaire. Par exemple, un mappage peut donner aux membres du groupe `devops` le rôle **Manager** dans le projet `Infrastructure`.

### Lire les groupes depuis l'annuaire {#read-groups-from-the-directory}

Donnez à `ldap_group_search_dn` l'emplacement de vos groupes. Dans `ldap_providers`, utilisez `group_search_dn`. Sans ce paramètre, les connexions ne modifient pas les rôles issus des mappages de groupe.

Dans Active Directory et OpenLDAP, cette seule ligne suffit :

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Deux autres options sont facultatives :

- `ldap_group_search_filter` trouve les groupes de l'utilisateur. Par défaut, il trouve les groupes qui indiquent l'utilisateur comme `member`, `uniqueMember` ou `memberUid`.
- `ldap_group_name_attribute` est l'attribut qui contient le nom du groupe. Par défaut, c'est `cn`.

Dans le filtre, `{{ .dn }}` est le DN de l'utilisateur et `{{ .username }}` est l'attribut `uid` de l'utilisateur, ou son identifiant de connexion si l'entrée n'a pas de `uid`. Semaphore échappe les deux valeurs.

Si l'attribut de nom contient un DN, le nom du groupe est la première partie de ce DN. Par exemple, `CN=DevOps,OU=Groups,DC=corp,DC=com` donne le nom de groupe `DevOps`.

#### Groupes imbriqués dans Active Directory {#nested-groups-in-active-directory}

Pour inclure les groupes qui contiennent d'autres groupes, utilisez la règle « matching rule in chain » :

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Groupes depuis l'entrée de l'utilisateur {#groups-from-the-user-entry}

Si l'entrée de l'utilisateur liste ses groupes, par exemple dans `memberOf`, recherchez l'utilisateur au lieu des groupes. Cet exemple concerne Active Directory. Avec l'overlay `memberOf`, OpenLDAP utilise plutôt le filtre `(uid={{ .username }})`.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Créer un mappage de groupe {#create-a-group-mapping}

Créez le mappage de la même façon que pour OpenID Connect. Voir les [étapes](/admin-guide/authentication/openid#create-a-group-mapping). Choisissez votre fournisseur LDAP et saisissez le nom du groupe tel que l'annuaire le renvoie.

- Semaphore met à jour les rôles issus des mappages de groupe à chaque connexion de l'utilisateur via le fournisseur.
- Chaque connexion applique les mappages du fournisseur utilisé pour cette connexion et retire les rôles issus des mappages des autres fournisseurs. Ainsi, un utilisateur qui se connecte via Okta puis via LDAP ne garde que les rôles mappés pour LDAP.
- Un utilisateur qui n'est trouvé dans aucun groupe ne reçoit aucun rôle issu des mappages de groupe.
- Sans `ldap_group_search_dn`, une connexion ne modifie pas les rôles issus des mappages de groupe.
- Si l'annuaire ne peut pas renvoyer les groupes, par exemple parce que le serveur ne répond pas ou que le filtre contient une erreur de syntaxe, la connexion est refusée. Le journal du serveur en indique la raison.
- Un fournisseur OpenID Connect et un fournisseur LDAP qui ont le même ID partagent leurs mappages de groupe.

## Exemple : utilisation d'un serveur OpenLDAP {#example-using-openldap-server}

Exécutez la commande suivante pour démarrer votre propre serveur LDAP avec un compte administrateur et un utilisateur supplémentaire :

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

Votre configuration LDAP pour Semaphore UI doit être la suivante :

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

Pour exécuter Semaphore dans Docker, utilisez la configuration LDAP suivante :


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
