---
title: LDAP and Active Directory
description: Every ldap_* option and its environment variable, claim expressions, an OpenLDAP example, and troubleshooting tips.
---

# LDAP and Active Directory

Configuration file contains the following LDAP parameters:

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

All SSO provider options:

| Parameter             | Environment Variables | Description                                                                                                 |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ldap_binddn`         | `SEMAPHORE_LDAP_BIND_DN` | Name of LDAP user object to bind. |
| `ldap_bindpassword`   | `SEMAPHORE_LDAP_BIND_PASSWORD` | Password of LDAP user defined in Bind DN. |
| `ldap_server`         | `SEMAPHORE_LDAP_SERVER` | LDAP server host including port. For example: `localhost:389`. |
| `ldap_searchdn`       | `SEMAPHORE_LDAP_SEARCH_DN` | Scope where users will be searched. For example: `ou=users,dc=example,dc=org`. |
| `ldap_searchfilter`   | `SEMAPHORE_LDAP_SEARCH_FILTER` | Users search expression. Default: `(&(objectClass=inetOrgPerson)(uid=%s))`, where `%s` will replaced to entered login. |
| `ldap_mappings.dn`    | `SEMAPHORE_LDAP_MAPPING_DN` | |
| `ldap_mappings.mail`  | `SEMAPHORE_LDAP_MAPPING_MAIL` | User email claim expression[\*](#claim-expression). |
| `ldap_mappings.uid`   | `SEMAPHORE_LDAP_MAPPING_UID` | User login claim expression[\*](#claim-expression). |
| `ldap_mappings.cn`    | `SEMAPHORE_LDAP_MAPPING_CN` | User name claim expression[\*](#claim-expression). |
| `ldap_enable`         | `SEMAPHORE_LDAP_ENABLE` | LDAP enabled. |
| `ldap_needtls`        | `SEMAPHORE_LDAP_NEEDTLS` | Connect to LDAP server by SSL. |
| `ldap_group_search_dn` | `SEMAPHORE_LDAP_GROUP_SEARCH_DN` | Scope where groups will be searched. Turns on [group mappings](#project-roles-from-groups). In `ldap_providers` it is `group_search_dn`. |
| `ldap_group_search_filter` | `SEMAPHORE_LDAP_GROUP_SEARCH_FILTER` | Groups search expression. Default: `(\|(member={{ .dn }})(uniqueMember={{ .dn }})(memberUid={{ .username }}))`. In `ldap_providers` it is `group_search_filter`. |
| `ldap_group_name_attribute` | `SEMAPHORE_LDAP_GROUP_NAME_ATTRIBUTE` | Attribute with the group name. Default: `cn`. In `ldap_providers` it is `group_name_attribute`. |


### \*Claim expression {#claim-expression}

Example of claim expression:

```
email | {{ .username }}@your-domain.com
```

Semaphore is attempting to claim the email field first. If it is empty, the expression following it is executed.

:::warning

The expression <code>"username_claim": "|"</code> generates a random <code>username</code> for each user who logs in through the provider.

:::

### Troubleshooting {#troubleshooting}

Use `ldapwhoami` tool to check if your **BindDN** works:
This tool is provided by the **openldap-clients** package.

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=your_ldap_binddn_value_in_config"\
  -x\
  -W
```

It will ask interactively for the password, and should return code **0** and echo out the **DN** as specified.

:::warning

Please read [Troubleshooting](/faq/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) section if you have issues with LDAP.

:::


## Project roles from groups <Enterprise /> {#project-roles-from-groups}

:::info
Group mappings are available in the **Semaphore Enterprise** edition.
:::

A group mapping gives a project role to every user in a group of the directory. For example, a mapping can give the members of the `devops` group the **Manager** role in the `Infrastructure` project.

### Read groups from the directory {#read-groups-from-the-directory}

Set `ldap_group_search_dn` to the place where your groups are. In `ldap_providers`, use `group_search_dn`. Without it, sign-ins do not change roles from group mappings.

In Active Directory and OpenLDAP, this one line is enough:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com"
}
```

Two more options are optional:

- `ldap_group_search_filter` finds the groups of the user. The default finds groups that list the user as `member`, `uniqueMember` or `memberUid`.
- `ldap_group_name_attribute` is the attribute with the group name. The default is `cn`.

In the filter, `{{ .dn }}` is the DN of the user and `{{ .username }}` is the `uid` attribute of the user, or the user login when the entry has no `uid`. Semaphore escapes both values.

If the name attribute holds a DN, the group name is the `cn` part of it. For example, `CN=DevOps,OU=Groups,DC=corp,DC=com` gives the group name `DevOps`.

#### Nested groups in Active Directory {#nested-groups-in-active-directory}

To include groups that contain other groups, use the matching rule in chain:

```json
{
  "ldap_group_search_dn": "ou=groups,dc=corp,dc=com",
  "ldap_group_search_filter": "(member:1.2.840.113556.1.4.1941:={{ .dn }})"
}
```

#### Groups from the user entry {#groups-from-the-user-entry}

If the user entry lists its groups, for example in `memberOf`, search for the user instead of the groups. Use the base of the user search so that the search finds only the signed-in user. This example is for Active Directory. OpenLDAP with the `memberOf` overlay uses `(uid={{ .username }})` as the filter instead.

```json
{
  "ldap_group_search_dn": "ou=people,dc=corp,dc=com",
  "ldap_group_search_filter": "(sAMAccountName={{ .username }})",
  "ldap_group_name_attribute": "memberOf"
}
```

### Create a group mapping {#create-a-group-mapping}

Create the mapping in the same way as for OpenID Connect. See the [steps](/admin-guide/authentication/openid#create-a-group-mapping). Choose your LDAP provider and enter the group name as the directory returns it.

- Semaphore updates roles from group mappings each time a user signs in through the provider.
- Each sign-in applies the mappings of the provider used for that sign-in and takes away the roles from the mappings of other providers, so a user who signs in through Okta and then through LDAP keeps only the roles mapped for LDAP.
- A user who is found in no group gets no roles from group mappings.
- Without `ldap_group_search_dn`, a sign-in does not change roles from group mappings.
- If the directory cannot return the groups, for example because the server does not answer or the filter has a syntax error, the sign-in is refused. The server log says why.
- An OpenID Connect provider and an LDAP provider with the same ID share their group mappings.

## Example: Using OpenLDAP Server {#example-using-openldap-server}

Run the following command to start your own LDAP server with an admin account and an additional user:

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
