# Active Directory config

```json title="config.json"
{
    "ldap_binddn": "CN=Denis Gukov,DC=semaphore,DC=test",
    "ldap_bindpassword": "REDACTED",
    "ldap_server": "semaphore.test:389",
    "ldap_searchdn": "DC=semaphore,DC=test",
    "ldap_searchfilter": "(&(objectClass=user)(sAMAccountName=%s))",
    "ldap_mappings": {
        "dn": "",
        "mail": "userPrincipalName",
        "uid": "sAMAccountName",
        "cn": "cn"
    },
    "ldap_enable": true,
    "ldap_needtls": false
}
```
