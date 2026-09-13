---
title: Zitadel config
description: Example config.json for ZITADEL single sign-on and the known issue with the missing email claim.
---

# Zitadel config

```json title="config.json"
{
  "oidc_providers": {
    "zitadel":
    {
      "provider_url": "https://your-domain.zitadel.cloud",
      "display_name": "ZITADEL",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com:3000/api/auth/oidc/zitadel/redirect",
      "email_claim": "email"
    },
  }
}
```

Tutorial on Zitadel: [OpenID Connect Endpoints in ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Known issues: {#known-issues}

* to avoid error `claim 'email' missing or has bad format` add user Info inside ID Token in the Zitadel console.
