
# GitLab 설정

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

Semaphore UI 블로그의 튜토리얼: [Semaphore UI에서의 GitLab 인증](https://semaphoreui.com/blog/openid-authentication/).
