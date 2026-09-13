---
title: Configuração do Pocket-ID
description: Exemplo de config.json para entrar no Semaphore com o Pocket-ID, incluindo os escopos e as claims de nome de usuário e de nome.
---

# Configuração do Pocket-ID

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

As informações também estão disponíveis no site do Pocket-ID, na seção Client Examples: [Pocket-ID Client Examples - Semaphore UI](https://pocket-id.org/docs/client-examples/semaphore-ui/).
