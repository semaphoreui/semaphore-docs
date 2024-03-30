# Troubleshooting

## Gathering Facts issue for localhost

The issue can occur on Ansible Semaphore installed via [Snap](https://snapcraft.io/semaphore) or [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Why this happens

For more information about localhost use in Ansible, read this article [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible tries to gather facts locally, but Ansible is located in a limited isolated container which doesn't allow this.

### How to fix this

There are two ways:

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
---
## panic: pq: SSL is not enabled on the server

This means that your Postgres doesn't work by SSL.

### How to fix this

Add option `sslmode=disable` to the configuration file:

```json
	"postgres": {
		"host": "localhost",
		"user": "pastgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```
---
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit

This means that you are trying to access a repository over HTTPS that requires authentication.

### How to fix this

* Go to **Key Store** screen.
* Create a new key `Login with password` type.
* Specify your login for GitHub/BitBucket/etc.
* Specify the password. You can't use your account password for GitHub/BitBucket, you should use a Personal Access Token (PAT) instead of it. Read more [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* After creating the key, go to the **Repositories** screen, find your repository and specify the key.

---

## unable to read LDAP response packet: unexpected EOF

Most likely, you are trying to connect to the LDAP server using an insecure method, although it expects a secure connection (via TLS).

### How to fix this

Enable TLS in your `config.json` file:

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials"

You have the wrong password or `binddn`.

### How to fix this

Use `ldapwhoami` tool and check if your binddn works:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

It will ask interactively for the password and should return code **0** and echo out the **DN** as specified.

You also can read the following articles: 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## LDAP Result Code 32 "No Such Object"

Coming soon.
