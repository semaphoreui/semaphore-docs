# OpenID Connect

Semaphore prend en charge l'authentification via OpenID Connect (OIDC).

Liens :

* [Configuration GitHub](/admin-guide/authentication/openid/github)
* [Configuration Google](/admin-guide/authentication/openid/google)
* [Configuration GitLab](/admin-guide/authentication/openid/gitlab)
* [Configuration Authelia](/admin-guide/authentication/openid/authelia)
* [Configuration Authentik](/admin-guide/authentication/openid/authentik)
* [Configuration Keycloak](/admin-guide/authentication/openid/keycloak)
* [Configuration Okta](/admin-guide/authentication/openid/okta)
* [Configuration PingFederate](/admin-guide/authentication/openid/pingfederate)
* [Configuration Azure](/admin-guide/authentication/openid/azure)
* [Configuration Zitadel](/admin-guide/authentication/openid/zitadel)
* [Configuration Pocket-ID](/admin-guide/authentication/openid/pocket-id)

Exemple de configuration d'un fournisseur SSO :

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### Configuration via une variable d'environnement {#configure-via-environment-variable}

Lors d'une exécution dans des conteneurs, il peut être pratique de configurer les fournisseurs à l'aide d'une seule variable d'environnement :

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Cette valeur doit être une chaîne JSON valide correspondant à la structure `oidc_providers` ci-dessus.

Toutes les options d'un fournisseur SSO :

| Paramètre             | Description                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Nom du fournisseur affiché sur l'écran de connexion.                                                        |
| `icon`                | [Icône MDI](https://pictogrammers.com/library/mdi/) affichée devant le nom du fournisseur sur l'écran de connexion. |
| `color`               | Nom du fournisseur affiché sur l'écran de connexion.                                                        |
| `client_id`           | ID client du fournisseur.                                                                                   |
| `client_id_file`      | Chemin du fichier dans lequel est stocké l'ID client du fournisseur. A une priorité inférieure à `client_id`. |
| `client_secret`       | Secret client du fournisseur.                                                                               |
| `client_secret_file`  | Chemin du fichier dans lequel est stocké le secret client du fournisseur. A une priorité inférieure à `client_secret`. |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Expression de claim du nom d'utilisateur[\*](#claim-expression).                |
| `email_claim`         | Expression de claim de l'e-mail[\*](#claim-expression).                         |
| `name_claim`          | Expression de claim du nom de profil[\*](#claim-expression).                    |
| `order`               | Position du bouton du fournisseur sur l'écran de connexion.                                                 |
| `allow_idp_initiated` | Active la [connexion initiée par l'IdP](#idp-initiated-login) pour ce fournisseur. Par défaut `false`.     |
| `return_via_state`    | Transmet le chemin de retour post-connexion via le paramètre OAuth `state` plutôt que via l'URL de redirection. Par défaut `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Expression de claim {#claim-expression}

Exemple d'expression de claim :

```
email | {{ .username }}@your-domain.com
```

Semaphore tente d'abord de récupérer le champ email. S'il est vide, l'expression qui suit est évaluée.

<div class="warning">
  L'expression <code>"username_claim": "|"</code> génère un <code>username</code> aléatoire pour chaque utilisateur qui se connecte via le fournisseur.
</div>

## Connexion initiée par l'IdP {#idp-initiated-login}

Par défaut, Semaphore ne prend en charge que la connexion **initiée par le SP** : l'utilisateur ouvre Semaphore, clique sur le bouton du fournisseur et
est redirigé vers le fournisseur d'identité (IdP).

Avec la connexion **initiée par l'IdP**, le parcours peut au contraire commencer chez le fournisseur d'identité — par exemple en cliquant sur la
tuile Semaphore dans le tableau de bord Okta, dans *My Apps* d'Azure ou dans un lanceur d'applications Keycloak / Authentik.

Semaphore implémente cela à l'aide du mécanisme standard **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). L'IdP
redirige le navigateur vers une **Initiate Login URI** dédiée, puis Semaphore démarre un flux Authorization Code classique.
L'authentification proprement dite reste un échange de code complet et sécurisé — Semaphore n'accepte jamais de token non sollicité.

### Activation {#enabling-it}

Définissez `allow_idp_initiated` à `true` pour le fournisseur :

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### Configurer le fournisseur d'identité {#configuring-the-identity-provider}

Dans votre IdP, définissez l'**Initiate Login URI** de l'application à :

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

où `<provider-id>` est la clé sous `oidc_providers` (par exemple `mysso`).

L'IdP doit envoyer le paramètre `iss` (issuer) à ce point de terminaison ; Semaphore rejette les requêtes dont le `iss` ne correspond pas
au fournisseur configuré. Le paramètre facultatif `login_hint` est transmis à l'IdP, et un paramètre facultatif `target_link_uri`
définit la page à ouvrir après la connexion (il doit pointer vers Semaphore, sinon il est ignoré).

Remarques propres à certains fournisseurs :

- **Okta** — définissez *Login initiated by* à *Either Okta or App* (ou *App Only*) et renseignez l'*Initiate login URI*. Okta
  envoie à la fois `iss` et `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** — définissez l'URL de lancement / d'accueil de l'application à l'Initiate Login URI.
- **Azure AD / Entra** — *My Apps* utilise une URL de démarrage initiée par le SP et n'envoie pas toujours `iss` ; faites plutôt pointer l'URL de démarrage vers
  `https://your-domain.com/api/auth/oidc/<provider-id>/login`.

### Sécurité {#security}

- La connexion initiée par l'IdP est **désactivée par défaut** et doit être activée pour chaque fournisseur.
- Le paramètre `iss` est validé par rapport à l'issuer configuré afin d'éviter toute confusion entre fournisseurs.
- `target_link_uri` n'est accepté que s'il pointe vers Semaphore (pas de redirection ouverte).
- Le flux passe par l'échange Authorization Code complet avec un `state` CSRF et un `nonce`, de sorte qu'un token capturé ou rejoué
  ne peut pas être utilisé pour se connecter.

## Écran de connexion {#sign-in-screen}

Pour chacun des fournisseurs configurés, un bouton de connexion supplémentaire est ajouté à la page de connexion :

![Capture d'écran de la page de connexion de Semaphore, avec deux boutons de connexion. L'un indique « Sign In », l'autre « Sign in with MySSO »](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
