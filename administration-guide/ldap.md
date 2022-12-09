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


Use `ldapwhoami` tool to check if your binddn works:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

It will ask interactively for the password, and should return code **0** and echo out the **DN** as specified.

{% hint style="info" %}
Please read [Troubleshooting](https://docs.ansible-semaphore.com/administration-guide/troubleshooting#unable-to-read-ldap-response-packet-unexpected-eof) section if you have issues with LDAP.
{% endhint %}
