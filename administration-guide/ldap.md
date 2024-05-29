# LDAP configuration

Configuration file contains the following LDAP parameters:

```json
{
  ...
  "ldap_binddn": "cn=admin,dc=example,dc=org",
  "ldap_bindpassword": "admin_password",
  "ldap_server": "localhost:1389",
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
  ...
}
```

`ldap_mappings` used to convert LDAP fields to the following Semaphore fields:
* `ldap_mappings.uid` &mdash; user login.
* `ldap_mappings.mail` &mdash; user email.
* `ldap_mappings.cn` &mdash; user name.


Use `ldapwhoami` tool to check if your **BindDN** works:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

It will ask interactively for the password, and should return code **0** and echo out the **DN** as specified.

{% hint style="info" %}
Please read [Troubleshooting](https://docs.ansible-semaphore.com/administration-guide/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) section if you have issues with LDAP.
{% endhint %}


## Example: Using OpenLDAP Server

Run the following command to start your own LDAP server with an admin account and an additional user::

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

Your LDAP configuration for Semaphore UI should be as follows:

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

To run Semaphore in Docker, use the following LDAP configuration:

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