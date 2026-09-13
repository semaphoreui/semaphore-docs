# Configuración de Pocket-ID

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

También hay información en el sitio de Pocket-ID, en la sección Client Examples: [Ejemplos de clientes de Pocket-ID - Semaphore UI](https://pocket-id.org/docs/client-examples/semaphore-ui/).
