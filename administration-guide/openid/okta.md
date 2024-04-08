`config.json`:

```yaml
{
  "oidc_providers": {
    "okta": {
      "display_name":"Sign in with Okta",
      "provider_url":"https://trial-7761382.okta.com/oauth2/default",
      "client_id":"***",
      "client_secret":"***",
      "redirect_url":"http://localhost:3000/api/auth/oidc/okta/redirect/"
    }
  }
}
```