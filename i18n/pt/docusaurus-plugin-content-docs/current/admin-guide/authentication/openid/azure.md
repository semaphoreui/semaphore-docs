# Configuração do Azure

```json title="config.json"
{
  "oidc_providers": {
    "azure": {
      "icon": "microsoft",
      "color": "blue",
      "display_name": "Sign in with EntraID",
      "client_id": "REDACTED",
      "client_secret": "REDACTED",
      "redirect_url": "https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/redirect",
      "endpoint": {
        "issuer": "https://login.microsoftonline.com/TENANT_ID/v2.0",
        "auth": "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/authorize",
        "token": "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/token",
        "userinfo": "https://graph.microsoft.com/oidc/userinfo",
        "jwks": "https://login.microsoftonline.com/TENANT_ID/discovery/v2.0/keys"
      },
      "scopes": ["openid", "email", "profile", "User.Read"]
    }
  }
}
```

## Login iniciado pelo IdP {#idp-initiated-login}

O Microsoft Entra ID (Azure AD) inicia as aplicações a partir do **My Apps** usando uma URL inicial iniciada pelo SP em vez do
mecanismo [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) do OpenID Connect, e não envia o
parâmetro `iss` de forma confiável. Para o Entra, aponte o bloco para o endpoint **`/login`** do Semaphore em vez de `/initiate` — assim
você **não** precisa definir `allow_idp_initiated`.

No portal do Azure, abra o seu **App registration → Branding & properties** e defina a **Home page URL** como:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Quando um usuário clica no bloco do Semaphore no My Apps, o Entra navega para essa URL, que inicia um fluxo Authorization Code
normal iniciado pelo SP.
