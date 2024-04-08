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
			"redirect_url": "https://cloud.semui.co/api/auth/oidc/google/redirect",
			"username_claim": "|",
			"name_claim": "name",
			"order": 2
		}
  }
}
```