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

For more information about localhost use in Ansible, read in article [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible tries to gather facts locally, but Ansible is located in limited isolated container which doesn't allow this.

### How to fix this

There are two ways:

1. Disable facts gathering:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Explicitly set connection type to **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```



## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit

This means that you are trying to access a repository over HTTPS that requires authentication.

### How to fix this

* Go to **Key Store** screen.
* Create a new key `Login with password` type.
* Specify your login for GitHub/BitBucket/etc.
* Specify the password. You can't use your account password for GitHub/BitBucket, you should use a Personal Access Token (PAT) instead of it. Read more [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* After creating the key, go to the **Repositories** screen, find your repository and specify the key.


## unable to read LDAP response packet: unexpected EOF

Most likely, you are trying to connect to the LDAP server using an insecure method, although it expects a secure connection (via TLS).

### How to fix this

Enable TLS in your `config.json` file:

```json
...
"ldap_needtls": true
...
```

## LDAP Result Code 49 "Invalid Credentials"

You have the wrong password or `binddn`.

### How to fix this

Use `ldapwhoami` tool and check if your binddn works:

```
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

It will ask interactively for the password and should return code **0** and echo out the **DN** as specified.

If the check fails - you can enable debug output using the `-V -d1` flags.

You also can read the following articles: 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/ansible-semaphore/semaphore/issues/906](https://github.com/ansible-semaphore/semaphore/issues/906)


## LDAP Result Code 2 "Protocol error"

The 'protocol error' can have multiple reasons.

### Reason: WhoAmI action not supported

#### Why this happens

After authenticating the LDAP user, a [WhoAmI](https://www.rfc-editor.org/rfc/rfc4532.html) action is performed to make sure we are in the session of the authenticated user.

Some LDAP Provider do not support this extended LDAP Operation!

Affected Providers include:

* Google LDAP
* lldap
* Samba
* GLAuth
* outpost

#### Testing support

You can check your LDAP Provider for this issue using `ldapwhoami`:

```
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W\
  -V\
  -d1
```

You should see that the connection and bind was successful, but the whoami-action failed:

```
connect success
...
ldap_bind: Success (0)
        additional info: Valid access code
...
request done: ld 0x55667aa11a40 msgid 2
res_errno: 2, res_error: <>, res_matched: <>
...
ldap_parse_result: Protocol error (2)
```

#### How to fix this

Disable the WhoAmI-Check in your `config.json` file:

```json
...
"ldap_whoami": false
...
```

## LDAP Result Code 32 "No Such Object"

Coming soon.
