---
title: Pocket-ID konfiguracija
description: Primer config.json za prijavljivanje u Semaphore pomoću Pocket-ID, uključujući scope-ove i claim-ove za korisničko ime i ime.
---

# Pocket-ID konfiguracija

```json title="config.json"
"oidc_providers": {
    "pocketid": {
        "display_name": "Sign in with PocketID",
        "provider_url": "https://<your-pocket-id-url>",
        "client_id": "<client-id-from-pocket-id>",
        "client_secret": "<client-secret-from-pocket-id>",
        "redirect_url": "https://<your-semaphore-ui-url>/api/auth/oidc/pocketid/redirect/",
        "scopes": [
            "openid",
            "profile",
            "email"
        ],
        "username_claim": "email",
        "name_claim": "given_name"
    }
}
```

Informacije se nalaze i na sajtu Pocket-ID u sekciji Client Examples: [Pocket-ID Client Examples - Semaphore UI](https://pocket-id.org/docs/client-examples/semaphore-ui/).
