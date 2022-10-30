# Troubleshooting

## Gathering Facts issue for localhost

The issue can occur on Ansible Semaphore which installed via [Snap](https://snapcraft.io/semaphore) or [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Why it happens

More information about localhost in Ansible read in article [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible tries to gathering facts locally, but Ansible localed in limited isolated container which doesn't allow this.

### How to fix

There are two ways:

1. Disable facts gathering:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Explicit set conneciton type to **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```



## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit

This means that you are trying to access a repository over HTTPS that requires authentication.

### How to fix

* Go to **Key Store** screen.
* Create new key with type `Login with password`.
* Specify your login for GitHub/BitBucket/etc.
* Specify the password. You can't use your account password for GitHub/BitBucket, you should use Personal Access Token (PAT) instead of it. Read more [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* After creating the key, go to **Repositories** screen, find your repository and specify the key.


## unable to read LDAP response packet: unexpected EOF

Most likely, you are trying to connect to the LDAP server using an insecure method, although it expects a secure connection (via TLS).

### How to fix

Enable TSL in your `config.json`:

```json
...
"ldap_needtls": true
...
```