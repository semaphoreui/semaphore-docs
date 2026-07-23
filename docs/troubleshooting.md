# Troubleshooting

Solutions for common errors, organized by the error message you see. If your problem is not listed here, ask in the [Discord community](https://discord.gg/5R6k7hNGcH) or search [GitHub issues](https://github.com/semaphoreui/semaphore/issues).

## Runner returns error 404 or 401

The runner cannot authenticate against the Semaphore server. Check that:

- `use_remote_runner` is enabled on the server.
- The runner token matches a runner registered on the server.
- The `web_host` in the runner configuration points to the server root URL, without a trailing path.

See the discussion [Getting 401 error code from Runner](https://github.com/semaphoreui/semaphore/discussions/1873) and the [Runners guide](/admin-guide/runners).

## `fatal: [localhost]: FAILED!` during Gathering Facts

The error occurs on Semaphore UI installed via [Snap](https://snapcraft.io/semaphore) or [Docker](https://hub.docker.com/r/semaphoreui/semaphore):

```
TASK [Gathering Facts] *********************************************************
fatal: [localhost]: FAILED! => changed=false
```

**Cause:** Ansible tries to gather facts locally, but it runs in a limited, isolated container which doesn't allow this. For background, read [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

**Resolution** — either of the following:

1. Disable facts gathering:

   ```yaml
   - hosts: localhost
     gather_facts: False
     roles:
       - ...
   ```

2. Explicitly set the connection type to **ssh**:

   ```
   [localhost]
   127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
   ```

## `panic: pq: SSL is not enabled on the server`

**Cause:** Semaphore connects to PostgreSQL with SSL, but the PostgreSQL server has SSL disabled.

**Resolution:** add the `sslmode=disable` option to the configuration file:

```json
"postgres": {
    "host": "localhost",
    "user": "postgres",
    "pass": "pwd",
    "name": "semaphore",
    "options": {
        "sslmode": "disable"
    }
},
```

## `fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit`

**Cause:** you are trying to access a repository over HTTPS that requires authentication, and no credentials are attached to the repository.

**Resolution:**

1. Go to the **Key Store** screen.
2. Create a new key of the `Login with password` type.
3. Specify your login for GitHub/Bitbucket/etc.
4. Specify the password. For GitHub/Bitbucket you can't use your account password — use a Personal Access Token (PAT) instead. Read more in the [GitHub documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
5. Go to the **Repositories** screen, find your repository, and select the key you created.

## `unable to read LDAP response packet: unexpected EOF`

**Cause:** most likely, you are connecting to the LDAP server without TLS although the server expects a secure connection.

**Resolution:** enable TLS in your `config.json` file:

```json
"ldap_needtls": true
```

## `LDAP Result Code 49 "Invalid Credentials"`

**Cause:** wrong password or wrong `binddn`.

**Resolution:** use the `ldapwhoami` tool to check that your binddn works:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

It asks for the password interactively and should return code **0** and echo the **DN**.

Related reading:

- [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
- [semaphoreui/semaphore#906](https://github.com/semaphoreui/semaphore/issues/906)

## `LDAP Result Code 32 "No Such Object"`

**Cause:** the DN configured in `ldap_searchdn` (or the bind DN) does not exist on the LDAP server, or the search base is wrong.

**Resolution:** verify the DNs in your LDAP configuration with `ldapsearch`:

```bash
ldapsearch \
  -H ldap://ldap.com:389 \
  -D "your ldap_binddn value" \
  -W \
  -b "your ldap_searchdn value" \
  "(objectClass=*)" dn
```

Fix the value that produces the error. See the [LDAP guide](/admin-guide/ldap) for a full configuration example.
