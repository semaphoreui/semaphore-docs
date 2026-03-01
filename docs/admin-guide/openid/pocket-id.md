# Pocket-ID config

`config.json`:
```json
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

Info is also on Pocket-ID Site under Client Examples: [Pocket-ID Client Examples - Semaphore UI](https://pocket-id.org/docs/client-examples/semaphore-ui/).
