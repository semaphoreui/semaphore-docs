---
title: Your account
description: The account menu, editing your name, e-mail, alerts and password, the security tab, and personal API tokens.
---

# Your account

Your personal settings live in the account menu at the bottom of the sidebar. Click your name to open it.

<div class="DialogScreenshot" style={{maxWidth: 300}}>
![Account menu](/assets/user-menu.webp)
</div>

| Item | Description |
|---|---|ß
| Version | The Semaphore UI version running on the server. |
| **API Tokens** | Personal tokens for the [REST API](/reference/api). |
| **Edit Account** | Your name, username, e-mail, alert preference, and password. |
| **Sign Out** | Ends the session. |

Next to the menu you find the **dark mode** switch and the **language** switcher. Both settings are stored in your browser.

## Edit account {#edit-account}

<div class="DialogScreenshot">
![Edit account dialog](/assets/account-edit.webp)
</div>

The **Settings** tab contains:

| Field | Description |
|---|---|
| **Name** | Display name shown in task history and activity. |
| **Username** | Login name. |
| **Email** | Address used for e-mail alerts and password recovery. |
| **Send alerts** | Receive e-mail alerts about tasks. Alerts are sent only when the [e-mail channel](/admin-guide/notifications/email) is configured and the project allows alerts. |

Badges next to the checkboxes show your global flags: **Pro user** on a Pro instance, **Admin** for administrators, **External** for accounts managed by LDAP or OpenID Connect. External users cannot change their username or password here.

The **Security** tab lets you change your password. If the administrator enabled time-based one-time passwords, the second factor is configured on the same tab.

<div class="DialogScreenshot">
![Security tab](/assets/account-security.webp)
</div>

## API tokens {#api-tokens}

Choose **API Tokens** in the account menu. The page lists your tokens with their creation date, expiration date, and status. The **API Reference** link opens the Swagger UI built into your instance.


![API tokens](/assets/api-tokens.webp)

Click **New Token**, give the token a name, and choose when it expires. The token value is shown once after creation, copy it right away.

<div class="DialogScreenshot">
![New token dialog](/assets/api-token-new.webp)
</div>

Use the token in the `Authorization: Bearer` header, see [API](/reference/api). To revoke a token, delete it from the list.
