`config.json`:

```yaml
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "http://localhost:8080/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "http://localhost:3000/api/auth/oidc/keycloak/redirect"
    }
  }
}
```