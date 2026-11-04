# LDAP e Active Directory

Il file di configurazione contiene i seguenti parametri LDAP:

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

Tutte le opzioni del provider SSO:

| Parametro             | Variabili d'ambiente  | Descrizione                                                                                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Nome dell'oggetto utente LDAP per il bind. |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Password dell'utente LDAP definito nel Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Host del server LDAP, porta inclusa. Ad esempio: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Ambito in cui verranno cercati gli utenti. Ad esempio: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Espressione di ricerca degli utenti. Valore predefinito: `(&(objectClass=inetOrgPerson)(uid=%s))`, dove `%s` verrà sostituito con il login inserito. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Espressione claim per l'email dell'utente[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Espressione claim per il login dell'utente[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Espressione claim per il nome dell'utente[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP abilitato. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Connessione al server LDAP tramite SSL. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Ambito in cui verranno cercati i gruppi. Attiva le [mappature di gruppo](#project-roles-from-groups). In `ldap_providers` è `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Espressione di ricerca dei gruppi. Valore predefinito: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. In `ldap_providers` è `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Attributo con il nome del gruppo. Valore predefinito: `cn`. In `ldap_providers` è `group_name_attribute`. |


### \*Espressione claim {#claim-expression}

Esempio di espressione claim:

```
email | {{ .username }}@your-domain.com
```

Semaphore tenta prima di ricavare il campo email. Se è vuoto, viene valutata l'espressione successiva.

:::warning

L'espressione <code>"username_claim": "|"</code> genera uno <code>username</code> casuale per ogni utente che accede tramite il provider.

:::

### Risoluzione dei problemi {#troubleshooting}

Utilizzare lo strumento `ldapwhoami` per verificare che il **BindDN** funzioni:
Questo strumento è fornito dal pacchetto **openldap-clients**.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Chiederà interattivamente la password e dovrebbe restituire il codice **0** e stampare il **DN** specificato.

:::warning

Consultare la sezione [Risoluzione dei problemi](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) in caso di problemi con LDAP.

:::


## Ruoli di Project dai gruppi <Enterprise /> {#project-roles-from-groups}

:::info
Le mappature di gruppo sono disponibili nell'edizione **Semaphore Enterprise**.
:::

Una mappatura di gruppo dà un ruolo di Project a ogni utente di un gruppo della directory. Ad esempio, una mappatura può dare ai membri del gruppo `devops` il ruolo **Manager** nel Project `Infrastructure`.

### Leggere i gruppi dalla directory {#read-groups-from-the-directory}

Impostare `ldap_group_search_dn` sul punto in cui si trovano i gruppi. In `ldap_providers`, usare `group_search_dn`. Senza questa impostazione, gli accessi non cambiano i ruoli dalle mappature di gruppo.

In Active Directory e OpenLDAP basta questa sola riga:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Altre due opzioni sono facoltative:

- `ldap_group_search_filter` trova i gruppi dell'utente. Il valore predefinito trova i gruppi che elencano l'utente come `member`, `uniqueMember` o `memberUid`.
- `ldap_group_name_attribute` è l'attributo con il nome del gruppo. Il valore predefinito è `cn`.

Nel filtro, `{{ .dn }}` è il DN dell'utente e `{{ .username }}` è l'attributo `uid` dell'utente, oppure il login dell'utente se la voce non ha `uid`. Semaphore applica l'escape a entrambi i valori.

Se l'attributo del nome contiene un DN, il nome del gruppo è la prima parte del DN. Ad esempio, `CN=DevOps,OU=Groups,DC=corp,DC=com` dà il nome di gruppo `DevOps`.

#### Gruppi annidati in Active Directory {#nested-groups-in-active-directory}

Per includere i gruppi che contengono altri gruppi, usare la regola «matching rule in chain»:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Gruppi dalla voce dell'utente {#groups-from-the-user-entry}

Se la voce dell'utente elenca i suoi gruppi, ad esempio in `memberOf`, cercare l'utente invece dei gruppi. Usare la base di `ldap_searchdn` in modo che la ricerca trovi solo l'utente che accede. Questo esempio è per Active Directory. OpenLDAP con l'overlay `memberOf` usa invece il filtro `(uid={{ .username }})`.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Creare una mappatura di gruppo {#create-a-group-mapping}

Creare la mappatura come per OpenID Connect. Vedere i [passaggi](/admin-guide/authentication/openid#create-a-group-mapping). Scegliere il provider LDAP e inserire il nome del gruppo così come lo restituisce la directory.

- Semaphore aggiorna i ruoli dalle mappature di gruppo ogni volta che l'utente accede tramite il provider.
- Ogni accesso applica le mappature del provider usato per quell'accesso e toglie i ruoli dalle mappature degli altri provider. Quindi un utente che accede tramite Okta e poi tramite LDAP mantiene solo i ruoli mappati per LDAP.
- Un utente che non si trova in nessun gruppo non riceve ruoli dalle mappature di gruppo.
- Senza `ldap_group_search_dn`, un accesso non cambia i ruoli dalle mappature di gruppo.
- Se la directory non può restituire i gruppi, ad esempio perché il server non risponde o il filtro ha un errore di sintassi, l'accesso viene rifiutato. Il log del server ne indica il motivo.
- Un provider OpenID Connect e un provider LDAP con lo stesso ID condividono le mappature di gruppo.

## Esempio: utilizzo di un server OpenLDAP {#example-using-openldap-server}

Eseguire il seguente comando per avviare un proprio server LDAP con un account amministratore e un utente aggiuntivo:

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

La configurazione LDAP per Semaphore UI dovrebbe essere la seguente:

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

Per eseguire Semaphore in Docker, utilizzare la seguente configurazione LDAP:


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
