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
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Bereich, in dem Gruppen gesucht werden. Schaltet [Gruppenzuordnungen](#project-roles-from-groups) ein. In `ldap_providers` heißt die Option `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Suchausdruck für Gruppen. Standard: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. In `ldap_providers` heißt die Option `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Attribut mit dem Gruppennamen. Standard: `cn`. In `ldap_providers` heißt die Option `group_name_attribute`. |


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


## Projektrollen aus Gruppen <Enterprise /> {#project-roles-from-groups}

:::info
Gruppenzuordnungen sind in der Edition **Semaphore Enterprise** verfügbar.
:::

Eine Gruppenzuordnung gibt jedem Benutzer einer Gruppe im Verzeichnis eine Projektrolle. Zum Beispiel kann eine Zuordnung den Mitgliedern der Gruppe `devops` die Rolle **Manager** im Projekt `Infrastructure` geben.

### Gruppen aus dem Verzeichnis lesen {#read-groups-from-the-directory}

Setzen Sie `ldap_group_search_dn` auf den Ort, an dem Ihre Gruppen liegen. In `ldap_providers` verwenden Sie `group_search_dn`. Ohne diese Einstellung ändern Anmeldungen die Rollen aus Gruppenzuordnungen nicht.

In Active Directory und OpenLDAP reicht diese eine Zeile:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Zwei weitere Optionen sind optional:

- `ldap_group_search_filter` findet die Gruppen des Benutzers. Der Standard findet Gruppen, die den Benutzer als `member`, `uniqueMember` oder `memberUid` aufführen.
- `ldap_group_name_attribute` ist das Attribut mit dem Gruppennamen. Der Standard ist `cn`.

Im Filter ist `{{ .dn }}` der DN des Benutzers und `{{ .username }}` der Login des Benutzers, also der Wert der Zuordnung `uid`. Semaphore maskiert beide Werte.

Wenn das Namensattribut einen DN enthält, ist der Gruppenname dessen erster Teil. Zum Beispiel ergibt `CN=DevOps,OU=Groups,DC=corp,DC=com` den Gruppennamen `DevOps`.

#### Verschachtelte Gruppen in Active Directory {#nested-groups-in-active-directory}

Um auch Gruppen einzubeziehen, die andere Gruppen enthalten, verwenden Sie die Regel „matching rule in chain“:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Gruppen aus dem Benutzereintrag {#groups-from-the-user-entry}

Wenn der Benutzereintrag seine Gruppen auflistet, zum Beispiel in `memberOf`, suchen Sie nach dem Benutzer statt nach den Gruppen. Dieses Beispiel gilt für Active Directory. OpenLDAP mit dem Overlay `memberOf` verwendet stattdessen `(uid={{ .username }})` als Filter.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Eine Gruppenzuordnung erstellen {#create-a-group-mapping}

Erstellen Sie die Zuordnung genauso wie für OpenID Connect. Siehe die [Schritte](/admin-guide/authentication/openid#create-a-group-mapping). Wählen Sie Ihren LDAP-Anbieter und geben Sie den Gruppennamen so ein, wie das Verzeichnis ihn zurückgibt.

- Semaphore aktualisiert die Rollen aus Gruppenzuordnungen bei jeder Anmeldung des Benutzers über den Anbieter.
- Jede Anmeldung wendet die Zuordnungen des dabei verwendeten Anbieters an und entzieht die Rollen aus den Zuordnungen anderer Anbieter. Ein Benutzer, der sich über Okta und dann über LDAP anmeldet, behält also nur die Rollen, die für LDAP zugeordnet sind.
- Ein Benutzer, der in keiner Gruppe gefunden wird, erhält keine Rollen aus Gruppenzuordnungen.
- Ohne `ldap_group_search_dn` ändert eine Anmeldung die Rollen aus Gruppenzuordnungen nicht.
- Wenn das Verzeichnis die Gruppen nicht liefern kann, zum Beispiel weil der Server nicht antwortet oder der Filter einen Syntaxfehler hat, wird die Anmeldung abgelehnt. Das Serverprotokoll nennt den Grund.
- Ein OpenID-Connect-Anbieter und ein LDAP-Anbieter mit derselben ID teilen sich ihre Gruppenzuordnungen.

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
