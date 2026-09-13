---
title: Troubleshooting
description: "Fixes for the failures people hit most often: runner 404, Ansible gathering facts, Postgres SSL, git clones, missing script output, and LDAP errors."
---

# Troubleshooting

## Runner prints error 404 {#runner-prints-error-404}

### How to fix {#how-to-fix}

[Getting 401 error code from Runner](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## Gathering Facts issue for localhost {#gathering-facts-issue-for-localhost}

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
## panic: pq: SSL is not enabled on the server {#panic-pq-ssl-is-not-enabled-on-the-server}

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
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

This means that you are trying to access a repository over HTTPS that requires authentication.

### How to fix this {#how-to-fix-this-2}

* Go to **Key Store** screen.
* Create a new key `Login with password` type.
* Specify your login for GitHub/BitBucket/etc.
* Specify the password. You can't use your account password for GitHub/BitBucket, you should use a Personal Access Token (PAT) instead of it. Read more [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* After creating the key, go to the **Repositories** screen, find your repository and specify the key.

---

## Git clone or pull fails intermittently {#git-clone-or-pull-fails-intermittently}

Task logs may show messages like `Git pull failed (...), retrying in 2s` followed by either success or a final failure after several attempts.

### Why this happens {#why-this-happens-1}

The git server (GitHub, GitLab, Bitbucket, or a self-hosted instance) was temporarily unreachable, returned a transient HTTP error, or the network between Semaphore and the server had a brief outage. Semaphore retries clone and pull operations automatically before failing the task.

### How to fix this {#how-to-fix-this-3}

1. **Transient outages**: Usually resolve on their own. Semaphore retries up to `git_attempts` times (default 4) with exponential backoff between attempts.
2. **Frequent failures**: Increase the attempt budget in your configuration:

```json
{
  "git_attempts": 8
}
```

Or with an environment variable:

```bash
export SEMAPHORE_GIT_ATTEMPTS=8
```

3. **Immediate, consistent failures**: Retries will not help. Check repository URL, branch name, access keys, and network connectivity from the Semaphore server or runner host.

See [Git operations](/admin-guide/configuration/config-file#git-operations) for details on `git_client` and `git_attempts`.

---

## Bash script output is missing or incomplete {#bash-script-output-is-missing-or-incomplete}

A Bash task finishes successfully but the log shows little or no output from `echo`, `printf`, or other commands — especially when the script exits quickly.

### Why this happens {#why-this-happens-2}

Semaphore captures stdout and stderr from shell commands while they run. Very short scripts can finish before all buffered output is read, so the last lines may be dropped from the task log.

### How to fix this {#how-to-fix-this-4}

1. **Upgrade**: Recent Semaphore versions drain process output before marking a task complete. Update server and runners if you are on an older release.
2. **Flush output in the script** when you need guaranteed delivery:

```bash
#!/bin/bash
echo "Starting deploy"
echo "Done" >&2
```

For critical diagnostics, write to a file inside the repository workspace and `cat` it at the end of the script.
3. **Avoid silent early exit**: Use `set -euo pipefail` and explicit error messages so failures are visible even when output is brief.

---

## unable to read LDAP response packet: unexpected EOF {#unable-to-read-ldap-response-packet-unexpected-eof}

Most likely, you are trying to connect to the LDAP server using an insecure method, although it expects a secure connection (via TLS).

### How to fix this {#how-to-fix-this-5}

Enable TLS in your `config.json` file:

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials" {#ldap-result-code-49-invalid-credentials}

You have the wrong password or `binddn`.

### How to fix this {#how-to-fix-this-6}

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

## LDAP Result Code 32 "No Such Object" {#ldap-result-code-32-no-such-object}

The directory has no entry at the distinguished name Semaphore asked about. It is
almost always a wrong `ldap_searchdn`, less often a wrong `ldap_binddn`.

### How to fix this {#how-to-fix-this-7}

Check that the search base exists, using the same credentials Semaphore uses:

```bash
ldapsearch\
  -H ldap://ldap.example.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -b "/your/ldap_searchdn/value/in/config/file"\
  -x\
  -W\
  -s base
```

- Result code **32** from this command means the base itself does not exist.
  Correct `ldap_searchdn` in `config.json`; a typo in a component such as
  `OU=Users` against an actual `OU=People` is the usual cause.
- Result code **0** means the base is fine and the problem is in
  `ldap_searchfilter`: it matches no entry below that base.

See [LDAP and AD](/admin-guide/authentication/ldap) for the meaning of each option.
