
# Zitadel-Konfiguration

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

Tutorial zu Zitadel: [OpenID Connect Endpoints in ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Bekannte Probleme: {#known-issues}

* Um den Fehler `claim 'email' missing or has bad format` zu vermeiden, fügen Sie in der Zitadel-Konsole die Benutzerinformationen (User Info) in das ID-Token ein.
