# Configuration Azure

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

## Connexion initiée par l'IdP {#idp-initiated-login}

Microsoft Entra ID (Azure AD) lance les applications depuis **My Apps** à l'aide d'une URL de démarrage initiée par le SP plutôt que via le
mécanisme OpenID Connect [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login), et il n'envoie pas de manière fiable
le paramètre `iss`. Pour Entra, faites pointer la tuile vers le point de terminaison **`/login`** de Semaphore plutôt que vers `/initiate` — vous
n'avez donc **pas** besoin de définir `allow_idp_initiated`.

Dans le portail Azure, ouvrez votre **Inscription d'application → Personnalisation et propriétés** et définissez l'**URL de la page d'accueil** à :

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Lorsqu'un utilisateur clique sur la tuile Semaphore dans My Apps, Entra navigue vers cette URL, ce qui démarre un flux Authorization Code
initié par le SP classique.
