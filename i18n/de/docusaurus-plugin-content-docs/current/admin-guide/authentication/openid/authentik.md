# Authentik-Konfiguration

```yaml title="config.json"
{
  "oidc_providers": {
    "authentik": {
      "display_name": "Sign in with Authentik",
      "provider_url": "https://authentik.example.com/application/o/<slug>/",
      "client_id": "<client-id>",
      "client_secret": "<client-secret>",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/authentik/redirect/",
      "scopes": ["openid", "profile", "email"],
      "username_claim": "preferred_username",
      "name_claim": "preferred_username"
    }
  }
}
```

Diskussion auf GitHub: [#1663](https://github.com/semaphoreui/semaphore/discussions/1663).

Siehe auch die Beschreibung in der [authentik-Dokumentation](https://integrations.goauthentik.io/infrastructure/semaphore/).
