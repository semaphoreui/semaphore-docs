
# Configuration Okta

```yaml title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## Connexion initiée par l'IdP {#idp-initiated-login}

Pour permettre aux utilisateurs de démarrer la connexion depuis la tuile du tableau de bord Okta, activez
la [connexion initiée par l'IdP](/admin-guide/authentication/openid#idp-initiated-login) pour le fournisseur :

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

Ensuite, dans la console d'administration Okta, ouvrez les paramètres **General** de votre application et configurez la section *Login* :

1. Définissez **Login initiated by** à *Either Okta or App* (ou *App Only*).
2. Définissez **Initiate login URI** à :

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Facultatif) Sous **Application visibility**, activez *Display application icon to users* afin que la tuile apparaisse sur le
   tableau de bord Okta.

Okta envoie les paramètres `iss` et `target_link_uri` ; Semaphore valide `iss` par rapport à votre `provider_url` et démarre
un flux Authorization Code classique.


## Issues GitHub associées {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Aide pour la configuration/le débogage OIDC avec Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — La v2.9.56 casse l'authentification oidc avec keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — Test de oidc_providers

[Voir toutes les issues liées à Okta →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Discussions GitHub associées {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — Lors de la configuration de GitHub OpenID, l'analyse n'est possible que pour l'e-mail
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Prise en charge de SAML ?

[Voir toutes les discussions liées à Okta →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
