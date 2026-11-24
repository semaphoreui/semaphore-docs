---
title: License activation
description: How to activate a Pro or Enterprise license key from the web UI or the server configuration, and how to replace it.
sidebar_custom_props:
  edition: pro
---

# License activation <Pro />

Semaphore Pro and Enterprise features are enabled with a license key. You can activate the license from the web UI, or provide the key in the server configuration for automated deployments.

## Before you start {#before-you-start}

- You do not need to reinstall Semaphore UI or switch to a different build to activate Pro or Enterprise. Your current Semaphore UI version can be activated with a license key. Update to the latest version if you want access to the newest Pro or Enterprise features.
- Sign in with an administrator account.
- Have your license key ready. You can find it in the purchase email or in the [Semaphore UI Portal](https://portal.semaphoreui.com/auth/login).

## Activate from the web UI {#activate-from-the-web-ui}

1. Sign in to Semaphore UI as an administrator.

![Semaphore UI login screen](/assets/subscription-login-screen.png)

2. Open the Admin menu from the user area in the lower-left corner.

![Admin menu trigger in the lower-left corner](/assets/subscription-admin-menu-trigger.png)

3. Select **Upgrade to PRO or EE**.

![Admin menu with the Upgrade to PRO or EE item](/assets/subscription-upgrade-menu-item.png)

4. Paste your license key into the activation dialog and click **ACTIVATE NEW KEY**.

![Semaphore Pro activation dialog](/assets/subscription-activation-dialog.png)

After a successful activation, Semaphore UI shows your current license details in the **Subscription & Billing** dialog.

![Subscription and Billing dialog after successful activation](/assets/subscription-activation-success.png)

## Activate from configuration {#activate-from-configuration}

For Docker, Kubernetes, systemd, or other automated deployments, provide the license key in the server configuration instead of entering it in the UI. The configuration option names use `subscription.*`.

In `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Or as an environment variable:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

You can also store the key in a file:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

or:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

When the license key is managed by configuration, Semaphore UI disables editing and activation controls in the **Subscription & Billing** dialog. This applies to both `subscription.key` and `subscription.key_file`, because the server reads the key file into the runtime license key at startup.

## How license validation works {#how-license-validation-works}

Semaphore UI validates a license against the Semaphore UI Portal. The address is
`subscription.server_url`, `https://portal.semaphoreui.com/billing` by default.

### What Semaphore UI connects to {#what-semaphore-ui-connects-to}

| When | Request |
| --- | --- |
| Activating a key | `POST {server_url}/subscriptions/{key}/activate` |
| Validating and refreshing the license | `POST {server_url}/subscriptions/{key}/validate` |

Both are plain JSON requests, and a request is given up after 20 seconds. The activation request
sends the license key; the validation request sends the license token the server holds at that
moment. Nothing else leaves the installation: no user accounts, project names, inventories, host
names, or task output are part of these requests.

The answer to both is a **license token** — a JWT signed by the portal with an RSA key. Semaphore UI
verifies the signature against the matching public key built into the server binary, so a token
cannot be forged or edited. Its claims carry what the license allows: the plan, the subscription
state, the company name, the expiry date, and the number of Pro users, nodes, and UIs. The server
keeps the key and the token in the database, in the `subscription_key` and `subscription_token`
options.

### When the check runs {#when-the-check-runs}

| Trigger | What happens |
| --- | --- |
| Server startup | The license token is refreshed once. |
| Every day at 01:00, server time | The license token is refreshed. |
| Activating a key in the UI, or a key in `subscription.key` | The key is activated, which returns the first token. |
| **Reload** in the **Subscription & Billing** dialog | The license token is refreshed on demand. |

Between those calls Semaphore UI does not contact the portal. Every license check — whether Pro
features are enabled, and whether one more Pro user, runner, or Terraform/OpenTofu HTTP backend
state fits into the license — reads the stored token locally.

### When the portal cannot be reached {#when-the-portal-cannot-be-reached}

A failed refresh is written to the server log under the `subscription` context and leaves the stored
token untouched, so a network outage or an unavailable portal does not switch Pro features off. The
installation keeps running until the expiry date in the token itself passes: an expired token still
loads, but its state becomes `expired` and Pro features stop.

### Online and offline keys {#online-and-offline-keys}

- An **online key** is a UUID, in the form `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. Activating it
  calls the portal, and the daily refresh keeps it current. A value that is not a UUID is refused
  before any request is made.
- An **offline key** is a license token itself — a long signed string issued for an installation
  without internet access. Semaphore UI verifies it locally and never calls the portal for it, so
  the daily refresh makes no request at all. To renew an offline license, replace the key with a
  newly issued one.

### High availability {#high-availability}

Each server node refreshes the license on its own startup and on its own daily schedule, and writes
the result into the shared database, so every node of the cluster reads the same license token. No
extra configuration is needed.

## Reach the license server through a proxy {#reach-the-license-server-through-a-proxy}

:::info Since v2.20
The proxy is available since **Semaphore 2.20**.
:::

Activating a key, refreshing the license token, and the daily token refresh all call the Semaphore
UI Portal at `subscription.server_url`. In a network where the server has no direct internet
access, route those calls through an HTTP proxy:

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

Or as environment variables:

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

Notes:

- The schemes `http`, `https`, `socks5`, and `socks5h` are supported. An invalid proxy address
  stops the server at startup.
- `username` and `password` are optional, and override credentials given inside `url`. Keeping
  them separate keeps the password out of the proxy address Semaphore UI logs.
- The proxy applies only to requests to the license server. Tasks, Git clones, and other outgoing
  connections are not affected.
- Without `subscription.proxy`, the license server is reached through the proxy variables of the
  server process (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`), as before.
- An air-gapped installation needs an offline license key instead of a proxy — the server never
  calls the portal for it.

## Manage or replace a license key {#manage-or-replace-a-license-key}

To renew, replace, or review your license, open the Admin menu and select **Subscription & Billing**.

![Admin menu with the Subscription and Billing item](/assets/subscription-billing-menu-item.png)

For a license key managed from the web UI, open the action menu in the **Subscription & Billing** dialog to reload, upload, or reset the key.

![Subscription and Billing dialog with key actions](/assets/subscription-key-actions-menu.png)

If the key is configured on the server:

1. Replace the value of `subscription.key`, or update the contents of the file referenced by `subscription.key_file`.
2. Restart Semaphore UI so the server reloads the license key.
3. Verify that the expected Pro or Enterprise options are available in Semaphore UI.
