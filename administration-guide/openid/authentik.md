`config.json`:

```yaml
{
  "oidc_providers": {
		"authentik": {
			"display_name": "Sign in with Authentik",
			"provider_url": "https://authentik.example.com/application/o/test/",
			"client_id": "***",
			"client_secret": "***",
			"redirect_url": "https://semaphore.example.com/api/auth/oidc/authentik/redirect/",
			"scopes": ["openid", "profile", "email"],
			"username_claim": "preferred_username",
			"name_claim": "preferred_username"
		}
  }
}
```