
# Zitadel 설정

```json title="config.json"
{
  "oidc_providers": {
    "zitadel":
    {
      "provider_url": "https://your-domain.zitadel.cloud",
      "display_name": "ZITADEL",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com:3000/api/auth/oidc/zitadel/redirect",
      "email_claim": "email"
    },
  }
}
```

Zitadel 튜토리얼: [ZITADEL의 OpenID Connect 엔드포인트](https://zitadel.com/docs/apis/openidoauth/endpoints).

## 알려진 문제: {#known-issues}

* `claim 'email' missing or has bad format` 오류를 피하려면 Zitadel 콘솔에서 ID Token에 사용자 정보(user Info)를 포함하도록 설정하십시오.
