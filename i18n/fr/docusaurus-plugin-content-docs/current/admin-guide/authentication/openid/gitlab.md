
# Configuration GitLab

```json title="config.json"
{
	"oidc_providers": {
        "gitlab": {
            "display_name": "Sign in with GitLab",
            "color": "orange",
            "icon": "gitlab",
            "provider_url": "https://gitlab.com",
            "client_id": "***",
            "client_secret": "gloas-***",
            "redirect_url": "https://your-domain.com/api/auth/oidc/gitlab/redirect",
            "username_claim": "|",
            "order": 3
        }
	}
}
```

Tutoriel sur le blog de Semaphore UI : [Authentification GitLab dans Semaphore UI](https://semaphoreui.com/blog/openid-authentication/).
