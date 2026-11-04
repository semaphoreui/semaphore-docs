# LDAP i Active Directory

Konfiguraciona datoteka sadrži sledeće LDAP parametre:

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

Sve opcije SSO provajdera:

| Parametar             | Promenljive okruženja | Opis                                                                                                        |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Naziv LDAP korisničkog objekta za povezivanje (bind). |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Lozinka LDAP korisnika definisanog u Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | Host LDAP servera uključujući port. Na primer: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Opseg u kome se pretražuju korisnici. Na primer: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Izraz za pretragu korisnika. Podrazumevano: `(&(objectClass=inetOrgPerson)(uid=%s))`, gde se `%s` zamenjuje unetim loginom. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | Claim izraz za e-adresu korisnika[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | Claim izraz za login korisnika[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | Claim izraz za ime korisnika[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP uključen. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Povezivanje sa LDAP serverom preko SSL-a. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Opseg u kome se pretražuju grupe. Uključuje [mapiranja grupa](#project-roles-from-groups). U `ldap_providers` to je `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Izraz za pretragu grupa. Podrazumevano: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. U `ldap_providers` to je `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Atribut sa nazivom grupe. Podrazumevano: `cn`. U `ldap_providers` to je `group_name_attribute`. |


### \*Claim izraz {#claim-expression}

Primer claim izraza:

```
email | {{ .username }}@your-domain.com
```

Semaphore prvo pokušava da preuzme polje email. Ako je prazno, izvršava se izraz koji sledi.

:::warning

Izraz <code>"username_claim": "|"</code> generiše nasumičan <code>username</code> za svakog korisnika koji se prijavi preko provajdera.

:::

### Rešavanje problema {#troubleshooting}

Koristite alat `ldapwhoami` da proverite da li vaš **BindDN** radi:
Ovaj alat je deo paketa **openldap-clients**.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

Alat će interaktivno zatražiti lozinku i trebalo bi da vrati kod **0** i ispiše zadati **DN**.

:::warning

Ako imate problema sa LDAP-om, pročitajte odeljak [Rešavanje problema](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof).

:::


## Uloge u projektu na osnovu grupa <Enterprise /> {#project-roles-from-groups}

:::info
Mapiranja grupa dostupna su u izdanju **Semaphore Enterprise**.
:::

Mapiranje grupe daje ulogu u projektu svakom korisniku iz jedne grupe u direktorijumu. Na primer, mapiranje može da da članovima grupe `devops` ulogu **Manager** u projektu `Infrastructure`.

### Čitanje grupa iz direktorijuma {#read-groups-from-the-directory}

Postavite `ldap_group_search_dn` na mesto gde se nalaze vaše grupe. U `ldap_providers` koristite `group_search_dn`. Bez ovog podešavanja prijave ne menjaju uloge iz mapiranja grupa.

Za Active Directory i OpenLDAP dovoljan je samo ovaj red:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Još dve opcije nisu obavezne:

- `ldap_group_search_filter` pronalazi grupe korisnika. Podrazumevano pronalazi grupe koje navode korisnika kao `member`, `uniqueMember` ili `memberUid`.
- `ldap_group_name_attribute` je atribut sa nazivom grupe. Podrazumevano je `cn`.

U filteru je `{{ .dn }}` DN korisnika, a `{{ .username }}` atribut `uid` korisnika, odnosno login korisnika ako unos nema `uid`. Semaphore escape-uje obe vrednosti.

Ako atribut sa nazivom sadrži DN, naziv grupe je prvi deo tog DN-a. Na primer, iz `CN=DevOps,OU=Groups,DC=corp,DC=com` dobija se naziv grupe `DevOps`.

#### Ugnežđene grupe u Active Directory-ju {#nested-groups-in-active-directory}

Da biste uključili grupe koje sadrže druge grupe, koristite pravilo „matching rule in chain“:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Grupe iz zapisa korisnika {#groups-from-the-user-entry}

Ako zapis korisnika navodi svoje grupe, na primer u `memberOf`, pretražujte korisnika umesto grupa. Koristite bazu pretrage korisnika da bi pretraga našla samo prijavljenog korisnika. Ovaj primer je za Active Directory. OpenLDAP sa overlay-em `memberOf` umesto toga koristi filter `(uid={{ .username }})`.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Kreiranje mapiranja grupe {#create-a-group-mapping}

Kreirajte mapiranje na isti način kao za OpenID Connect. Pogledajte [korake](/admin-guide/authentication/openid#create-a-group-mapping). Izaberite svoj LDAP provajder i unesite naziv grupe onako kako ga vraća direktorijum.

- Semaphore ažurira uloge iz mapiranja grupa pri svakoj prijavi korisnika preko provajdera.
- Svaka prijava primenjuje mapiranja provajdera preko kog je ta prijava izvršena i oduzima uloge iz mapiranja drugih provajdera. Zato korisnik koji se prijavi preko provajdera Okta, a zatim preko LDAP-a, zadržava samo uloge mapirane za LDAP.
- Korisnik koji nije pronađen ni u jednoj grupi ne dobija uloge iz mapiranja grupa.
- Bez `ldap_group_search_dn` prijava ne menja uloge iz mapiranja grupa.
- Ako direktorijum ne može da vrati grupe, na primer zato što server ne odgovara ili filter ima sintaksnu grešku, prijava se odbija. Razlog je naveden u logu servera.
- OpenID Connect provajder i LDAP provajder sa istim ID-jem dele mapiranja grupa.

## Primer: korišćenje OpenLDAP servera {#example-using-openldap-server}

Pokrenite sledeću komandu da biste podigli sopstveni LDAP server sa administratorskim nalogom i jednim dodatnim korisnikom:

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

Vaša LDAP konfiguracija za Semaphore UI treba da izgleda ovako:

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

Da biste pokrenuli Semaphore u Docker-u, koristite sledeću LDAP konfiguraciju:


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
