---
title: Troubleshooting
description: A numbered list of frequent errors and their fixes, from runner 404s and Postgres SSL to LDAP credential problems.
---

# Troubleshooting

## 1. Runner prints error 404 {#1-runner-prints-error-404}

### How to fix {#how-to-fix}

[Getting 401 error code from Runner](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## 2. Gathering Facts issue for localhost {#2-gathering-facts-issue-for-localhost}

The issue can occur on Semaphore UI installed via [Snap](https://snapcraft.io/semaphore) or [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Why this happens {#why-this-happens}

For more information about localhost use in Ansible, read this article [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible tries to gather facts locally, but Ansible is located in a limited isolated container which doesn't allow this.

### How to fix this {#how-to-fix-this}

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
## 3. panic: pq: SSL is not enabled on the server {#3-panic-pq-ssl-is-not-enabled-on-the-server}

This means that your Postgres doesn't work by SSL.

### How to fix this {#how-to-fix-this-1}

Add option `sslmode=disable` to the configuration file:

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


---


## 4. fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#4-fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

This means that you are trying to access a repository over HTTPS that requires authentication.

### How to fix this {#how-to-fix-this-2}

* Go to **Key Store** screen.
* Create a new key `Login with password` type.
* Specify your login for GitHub/BitBucket/etc.
* Specify the password. You can't use your account password for GitHub/BitBucket, you should use a Personal Access Token (PAT) instead of it. Read more [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* After creating the key, go to the **Repositories** screen, find your repository and specify the key.


---

## 5. Git clone or pull fails intermittently {#5-git-clone-or-pull-fails-intermittently}

Task logs may show messages like `Git pull failed (...), retrying in 2s` followed by either success or a final failure after several attempts.

### Why this happens {#why-this-happens-1}

The git server was temporarily unreachable or returned a transient error. Semaphore retries clone and pull operations automatically before failing the task.

### How to fix this {#how-to-fix-this-3}

1. **Transient outages**: Usually resolve on their own. Semaphore retries up to `git_attempts` times (default 4) with exponential backoff.
2. **Frequent failures**: Increase `git_attempts` in your configuration or set `SEMAPHORE_GIT_ATTEMPTS`.
3. **Immediate, consistent failures**: Check repository URL, branch, access keys, and network connectivity.

See [Git operations](/admin-guide/configuration/config-file#git-operations) for configuration details.

---

## 6. unable to read LDAP response packet: unexpected EOF {#6-unable-to-read-ldap-response-packet-unexpected-eof}

Most likely, you are trying to connect to the LDAP server using an insecure method, although it expects a secure connection (via TLS).

### How to fix this {#how-to-fix-this-4}

Enable TLS in your `config.json` file:

```json
...
"ldap_needtls": true
...
```

---

## 7. LDAP Result Code 49 "Invalid Credentials" {#7-ldap-result-code-49-invalid-credentials}

You have the wrong password or `binddn`.

### How to fix this {#how-to-fix-this-5}

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

## 8. LDAP Result Code 32 "No Such Object" {#8-ldap-result-code-32-no-such-object}

Coming soon.
