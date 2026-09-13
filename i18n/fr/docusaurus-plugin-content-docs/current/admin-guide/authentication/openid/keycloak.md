
# Configuration Keycloak

```yaml title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```

## Connexion initiée par l'IdP {#idp-initiated-login}

Pour permettre aux utilisateurs de lancer Semaphore depuis le lanceur d'applications de la **console de compte** (Account Console) de Keycloak, activez
la [connexion initiée par l'IdP](/admin-guide/authentication/openid#idp-initiated-login) pour le fournisseur :

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

Ensuite, dans la console d'administration de Keycloak, ouvrez votre client et définissez la **Home URL** (Keycloak ≥ 19 ; les versions plus anciennes l'appellent
*Base URL*) à :

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Lorsqu'un utilisateur clique sur l'application dans le lanceur, Keycloak redirige vers cette URL avec le paramètre `iss`. Semaphore
valide `iss` par rapport à votre `provider_url` (l'issuer du realm) et démarre un flux Authorization Code classique.


## Issues GitHub associées {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Comment désactiver la validation du certificat pour le serveur Keycloak  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Option pour désactiver la vérification TLS  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Se déconnecter de la session Keycloak lors de la déconnexion de Semaphore  

[Voir toutes les issues liées à Keycloak →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Discussions GitHub associées {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Le nom d'utilisateur diffère de `preferred_username` dans OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Prise en charge de SAML ?

[Voir toutes les discussions liées à Keycloak →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
