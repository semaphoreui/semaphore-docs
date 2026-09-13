# LDAP und Active Directory

Die Konfigurationsdatei enthält die folgenden LDAP-Parameter:

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

Alle Optionen des SSO-Providers:

| Parameter             | Umgebungsvariablen | Beschreibung                                                                                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Name des LDAP-Benutzerobjekts für das Bind. |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Passwort des im Bind-DN definierten LDAP-Benutzers. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Host des LDAP-Servers inklusive Port. Zum Beispiel: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Bereich, in dem Benutzer gesucht werden. Zum Beispiel: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Suchausdruck für Benutzer. Standard: `(&(objectClass=inetOrgPerson)(uid=%s))`, wobei `%s` durch den eingegebenen Login ersetzt wird. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Claim-Ausdruck für die E-Mail-Adresse des Benutzers[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Claim-Ausdruck für den Login des Benutzers[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Claim-Ausdruck für den Namen des Benutzers[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP aktiviert. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Verbindung zum LDAP-Server über SSL. |


### \*Claim-Ausdruck {#claim-expression}

Beispiel für einen Claim-Ausdruck:

```
email | {{ .username }}@your-domain.com
```

Semaphore versucht zuerst, das Feld `email` zu übernehmen. Ist es leer, wird der darauf folgende Ausdruck ausgewertet.

:::warning

Der Ausdruck <code>"username_claim": "|"</code> erzeugt für jeden Benutzer, der sich über den Provider anmeldet, einen zufälligen <code>username</code>.

:::

### Fehlerbehebung {#troubleshooting}

Verwenden Sie das Tool `ldapwhoami`, um zu prüfen, ob Ihr **BindDN** funktioniert:
Dieses Tool wird vom Paket **openldap-clients** bereitgestellt.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Es fragt interaktiv nach dem Passwort, sollte den Rückgabecode **0** liefern und den angegebenen **DN** ausgeben.

:::warning

Bitte lesen Sie den Abschnitt [Fehlerbehebung](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof), wenn Sie Probleme mit LDAP haben.

:::


## Beispiel: Verwendung eines OpenLDAP-Servers {#example-using-openldap-server}

Führen Sie den folgenden Befehl aus, um Ihren eigenen LDAP-Server mit einem Admin-Konto und einem zusätzlichen Benutzer zu starten:

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

Ihre LDAP-Konfiguration für Semaphore UI sollte wie folgt aussehen:

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

Um Semaphore in Docker auszuführen, verwenden Sie die folgende LDAP-Konfiguration:


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
