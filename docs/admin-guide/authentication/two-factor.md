---
title: Two-factor authentication
description: How TOTP two-factor authentication works in Semaphore, how to turn it on for the server, set it up for an account, sign in with a code, and recover.
---

# Two-factor authentication

Two-factor authentication (2FA) asks for a second proof after the first sign-in step: a
six-digit code from an authenticator app on the user's phone. A stolen password alone is
then not enough to get in.

Semaphore implements the second factor with TOTP — time-based one-time passwords, the
standard behind Google Authenticator, Microsoft Authenticator, Aegis, 1Password, Bitwarden,
and similar apps. It is available in every edition.

## How it works {#how-it-works}

Two switches decide whether a sign-in asks for a code:

- **The server** must allow TOTP — the `mfa.totp.enabled` option. It is off by default.
- **The account** must have TOTP set up. Each user turns it on for their own account; it
  is not forced on everyone.

When both are on, a sign-in goes through two steps:

1. The user signs in as usual — with a password, through LDAP, or through an OpenID
   Connect provider. The second factor applies to all three.
2. Semaphore opens a session but marks it unverified, and asks for the code. Until the code
   is accepted, every API call on that session is refused with `401` and
   `{"error":"TOTP_REQUIRED"}`.
3. The user enters the code shown by the app. Semaphore checks it against the secret stored
   for the account; a correct code verifies the session and the user is in.

The code changes every 30 seconds, and the app computes it from a secret it received once,
when the account was set up. Semaphore and the phone never talk to each other, so the phone
needs no network connection — only a roughly correct clock.

## Turn it on for the server {#turn-it-on-for-the-server}

Add the `mfa.totp` section to the configuration file and restart Semaphore:

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

The same settings can be given as environment variables:

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Option | Environment variable | Effect |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Lets users set up TOTP and makes sign-in ask for the code. Without it, the setting is not shown to anybody. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Gives each user a one-time [recovery code](#recovery-code) when they set up TOTP, and lets them sign in with it when the phone is lost. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | The issuer name an authenticator app shows next to the account. Defaults to `Semaphore`. See the warning below. |

:::warning ⚠️ `app_name` is not used by the web interface (2026-11-27)
An account set up from the web interface is always labelled `Semaphore:<email>` in the
authenticator app, whatever `mfa.totp.app_name` says. Only
[`semaphore users totp enable`](#manage-the-second-factor-from-the-command-line) uses the
configured name. If you run more than one Semaphore, users tell the entries apart by the
e-mail address, or rename the entry in their app.
:::

Every option is also listed in the
[configuration reference](/reference/configuration).

## Set up TOTP for your account {#set-up-totp-for-your-account}

Install an authenticator app on your phone first. Then:

1. Open a project, click your name at the bottom of the side bar, and choose
   **Edit Account**.
2. Open the **Security** tab.
3. Under **Two-factor authentication**, turn on **Time-based one-time password**.
   Semaphore creates the secret at once and shows it as a QR code.
4. In the authenticator app, add an account and scan the QR code. The app starts showing a
   six-digit code for `Semaphore`.
5. If a **Recovery code** is shown under the QR code, copy it with the button next to it
   and keep it somewhere safe — a password manager, or on paper. It is shown only now.
6. Close the dialog.

<div style={{maxWidth: 450}}>

![The Security tab of the Edit User dialog with two-factor authentication turned on: a QR code to scan and a recovery code below it](/assets/two-factor-enrol.webp)

</div>

The switch takes effect immediately; there is no **Save** to press and no test code to
enter. Make sure the app shows a code for Semaphore before you sign out — the next sign-in
asks for it.

You can open the **Security** tab again later to scan the QR code on a second device. The
recovery code is not shown again.

## Sign in with a code {#sign-in-with-a-code}

After the password, LDAP or single sign-on step, Semaphore shows **Two-step verification**:

![The Two-step verification screen asking for the six-digit code from the authenticator app](/assets/two-factor-verify.webp)

Type the six digits the app currently shows. The form submits itself after the sixth
digit. A wrong or outdated code shows an error and leaves you on the same screen; wait for
the next code and try again.

**Return to login** abandons this sign-in and starts over.

## Use the recovery code {#recovery-code}

When the phone is lost or reset, the recovery code gets the user back in on their own:

1. Sign in with your password as usual.
2. On **Two-step verification**, click **Use recovery code**.
3. Enter the recovery code and click **Send**.

Semaphore signs you in and **removes TOTP from your account**. The recovery code is used
up with it. Set TOTP up again straight away, as described
[above](#set-up-totp-for-your-account), to get a new secret and a new recovery code.

**Use recovery code** appears only when the server has `mfa.totp.allow_recovery`
turned on. Recovery codes are 16 characters long and are stored only as a bcrypt hash, so
nobody — administrators included — can read a user's code back later.

## Remove the second factor {#remove-the-second-factor}

**Your own account.** Turn off **Time-based one-time password** on the **Security** tab of
**Edit Account**. TOTP is removed at once and the next sign-in asks only for the first
step. Delete the Semaphore entry from your authenticator app too; it no longer matches
anything.

**Somebody else's account.** A user who has lost the phone and has no recovery code
cannot remove TOTP themselves. An administrator, or a user whose global role allows
managing users, opens **Users**, edits that user, and turns the switch off on the
**Security** tab. The user signs in with the password alone and sets TOTP up again.

### Manage the second factor from the command line {#manage-the-second-factor-from-the-command-line}

On the server, the same can be done without the web interface — useful when the only
administrator has lost their phone:

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` sets TOTP up for a user and prints the
`otpauth://` URL, a QR code and a recovery code in the terminal; `show` prints the URL and
QR code of an existing setup. Both print the secret itself, so run them only where nobody
else can see the terminal, and hand the QR code to its owner directly. Full syntax is in
[`semaphore users`](/reference/cli/users#totp-management).

## Turn it off for the server {#turn-it-off-for-the-server}

Set `mfa.totp.enabled` to `false`, or remove the section, and restart. Sign-in then stops
asking for codes and the **Two-factor authentication** setting disappears from
**Security**.

Nobody's setup is deleted. Turn the option back on and every account that had TOTP asks
for its code again, with the same secret — no need to scan anything twice.

## Things to know {#things-to-know}

- **API tokens skip the second factor.** A request with an `Authorization: Bearer` token
  is never asked for a code. A token can only be created from a fully signed-in session,
  but tokens that existed before TOTP was set up keep working. Review them on the
  **API Tokens** page after turning TOTP on.
- **Semaphore does not limit attempts at the code.** Six digits is a small space, so put a
  rate limit on `POST /api/auth/verify` and `POST /api/auth/recovery` in your
  [reverse proxy](/admin-guide/reverse-proxy).
- **The secret is stored in the database as is.** Anyone who can read the `user__totp`
  table, or a backup of the database, can generate valid codes for every account. Protect
  backups as you protect the configuration file.
- **TOTP cannot be required.** Semaphore has no option that forces users to set it up.
  If your policy requires a second factor for everyone, enforce it in your identity
  provider and sign users in through [OpenID Connect](/admin-guide/authentication/openid).

Setting up, removing, and using the second factor is recorded in the
[audit log](/admin-guide/audit-log) as `iam.mfa` and `auth.mfa` events; see
[Audit events](/reference/audit-events) for the list.

## What's next {#whats-next}

- [Local accounts](/admin-guide/authentication/local) — passwords, session lifetime, and
  turning password sign-in off.
- [Security](/admin-guide/security) — hashing parameters, encryption, and hardening.
- [`semaphore users`](/reference/cli/users#totp-management) — the TOTP commands.
