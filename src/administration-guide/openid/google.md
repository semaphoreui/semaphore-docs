# Google config

`config.json`:
```json
{
  "oidc_providers": {
		"google": {
			"color": "blue",
			"icon": "google",
			"display_name": "Sign in with Google",
			"provider_url": "https://accounts.google.com",
			"client_id": "***.apps.googleusercontent.com",
			"client_secret": "GOCSPX-***",
			"redirect_url": "https://your-domain.com/api/auth/oidc/google/redirect",
			"username_claim": "|",
			"name_claim": "name",
			"order": 2
		}
  }
}
```