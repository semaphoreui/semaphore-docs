`config.json`:

```yaml
{
  "oidc_providers": {
		"authentik": {
			"display_name": "Sign in with Authentik",
			"provider_url": "http://localhost:9000/application/o/test/",
			"client_id": "***",
			"client_secret": "***",
			"redirect_url": "http://localhost:3000/api/auth/oidc/authentik/redirect/",
			"scopes": ["openid", "profile", "email"],
			"username_claim": "preferred_username",
			"name_claim": "preferred_username"
		}
  }
}
```