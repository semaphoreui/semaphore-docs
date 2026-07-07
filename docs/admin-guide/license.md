# License activation

Semaphore Pro and Enterprise features are enabled with a license key. You can activate the license from the web UI, or provide the key in the server configuration for automated deployments.

## Before you start

- You do not need to reinstall Semaphore UI or switch to a different build to activate Pro or Enterprise. Your current Semaphore UI version can be activated with a license key. Update to the latest version if you want access to the newest Pro or Enterprise features.
- Sign in with an administrator account.
- Have your license key ready. You can find it in the purchase email or in the [Semaphore UI Portal](https://portal.semaphoreui.com/auth/login).

## Activate from the web UI

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

## Activate from configuration

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

## Manage or replace a license key

To renew, replace, or review your license, open the Admin menu and select **Subscription & Billing**.

![Admin menu with the Subscription and Billing item](/assets/subscription-billing-menu-item.png)

For a license key managed from the web UI, open the action menu in the **Subscription & Billing** dialog to reload, upload, or reset the key.

![Subscription and Billing dialog with key actions](/assets/subscription-key-actions-menu.png)

If the key is configured on the server:

1. Replace the value of `subscription.key`, or update the contents of the file referenced by `subscription.key_file`.
2. Restart Semaphore UI so the server reloads the license key.
3. Verify that the expected Pro or Enterprise options are available in Semaphore UI.
