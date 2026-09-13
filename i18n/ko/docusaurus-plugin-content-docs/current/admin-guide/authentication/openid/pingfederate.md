# PingFederate 설정

```json title="config.json"
{
  "oidc_providers": {
    "pingfederate": {
      "icon": "key",
      "display_name": "Sign in with PingFederate",
      "client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET",
      "redirect_url": "https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/pingfederate/redirect",
      "endpoint": {
        "issuer": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as",
        "auth": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/authorize",
        "token": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/token",
        "userinfo": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/userinfo",
        "jwks": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/jwks"
      },
      "scopes": ["openid", "email", "profile"]
    }
  }
}
```

자리 표시자를 PingFederate 설정의 값으로 바꾸십시오:

* `YOUR_CLIENT_ID` — OIDC 애플리케이션 클라이언트 ID.
* `YOUR_CLIENT_SECRET` — OIDC 애플리케이션 클라이언트 Secret.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — 외부에서 접근하는 Semaphore UI 호스트와 포트.
* `YOUR_ENVIRONMENT_ID` — issuer URL에 포함된 환경 식별자.
