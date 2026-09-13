---
title: Local accounts
description: Password sign-in against the Semaphore database - how passwords are stored, TOTP two-factor authentication, session lifetime, and turning passwords off.
---

# Local accounts

A local account keeps its password in the Semaphore database. Every installation
starts with one, created by `semaphore setup` or by the `SEMAPHORE_ADMIN_*`
variables, and that account is how you reach the server before any identity provider
exists.

Keep at least one local administrator even after single sign-on works. It is the only
way back in when the identity provider is unreachable.

## How passwords are stored {#how-passwords-are-stored}

Passwords are hashed with **Argon2id** using the OWASP minimum-strength parameters,
and the parameters are recorded alongside each hash in
[PHC string format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).
Releases before 2.20 used bcrypt; those hashes still work, and each one is replaced
with an Argon2id hash on the owner's next successful sign-in. Accounts that never sign
in again keep their bcrypt hash, so reset those passwords to upgrade them.

The full parameter table is in [Security](/admin-guide/security#password-hashing).

Semaphore does not enforce a password policy — no minimum length, no complexity, no
expiry. If you need one, use a directory or an identity provider, which is where such
policies belong.

## Manage accounts {#manage-accounts}

Administrators manage users in the web interface, and the same operations exist on the
command line for scripting and for recovery when nobody can sign in:

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

See [`semaphore users`](/reference/cli/users) for every flag, and
[Teams](/user-guide/team) for what a role lets a user do once they are in.

:::warning
A password on the command line lands in your shell history and in the process list of
the machine. Use it for the first administrator and for recovery, and change the
password from the web interface afterwards.
:::

## Two-factor authentication {#two-factor-authentication}

Semaphore supports TOTP: the six-digit codes produced by Google Authenticator, Aegis,
1Password, and similar apps. It is off by default and applies to whichever accounts
enable it — it is not forced on everyone.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| Option | Effect |
|---|---|
| `mfa.totp.enabled` | Lets users add TOTP to their account. Without it, nobody can enrol. |
| `mfa.totp.allow_recovery` | Issues one recovery code at enrolment, so a lost phone is not a lost account. Entering it **removes the TOTP enrolment** and signs the user in; they then enrol again. The code is stored as a bcrypt hash. |
| `mfa.totp.app_name` | The issuer label the authenticator app displays. Set it when you run more than one Semaphore. |

Users enrol from their own account page. An administrator can inspect or remove a
second factor for somebody who has lost their device:

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

Turning `mfa.totp.enabled` off again does not delete anybody's enrolment; it stops the
second factor being requested. Turn it back on and the old enrolments apply again.

## Session lifetime {#session-lifetime}

A session expires after **seven days without activity**. That inactivity timeout is
built in and not configurable.

An absolute limit is, and it is measured from the moment of sign-in rather than from
the last request, so an actively used session also ends:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

The default, `0`, means no absolute limit. Set it where a shared workstation or a
compliance rule requires people to re-authenticate on a schedule.

## Turn password sign-in off {#turn-password-sign-in-off}

Once an identity provider is configured and you have verified that a real user can
sign in through it, `password_login_disable` rejects the password method entirely:

```json
{
  "password_login_disable": true
}
```

LDAP and OpenID Connect are unaffected. Existing local accounts keep their roles and
their history; they simply have no way to authenticate.

:::danger
This option is honoured immediately and applies to every local account, including
yours. Confirm that single sign-on works — by signing in with it, not by reading the
log — before you set it. Recovering from a mistake means editing the configuration
file on the server and restarting.
:::

## What's next {#whats-next}

- [LDAP and Active Directory](/admin-guide/authentication/ldap) — authenticate against a directory.
- [OpenID Connect](/admin-guide/authentication/openid) — single sign-on with an identity provider.
- [Security](/admin-guide/security) — hashing parameters, encryption, and hardening.
