---
title: Authentification par proxy JWT
description: Connecter les utilisateurs à partir d'un JWT signé ajouté par un proxy inverse d'authentification tel que Pomerium, avec toutes les options auth.jwt et la configuration de la déconnexion.
---

# Authentification par proxy JWT

Lorsque Semaphore fonctionne derrière un proxy inverse d'authentification (par exemple Pomerium, Cloudflare Access ou OAuth2 Proxy), le proxy peut transmettre l'identité de l'utilisateur dans un en-tête contenant un JWT signé. Semaphore valide le JWT à l'aide d'un point de terminaison JWKS et retrouve ou crée l'utilisateur automatiquement.

Cela évite de dupliquer la configuration OIDC entre le proxy et Semaphore.

## Fonctionnement {#how-it-works}

1. Le proxy inverse authentifie l'utilisateur et ajoute un JWT signé dans un en-tête HTTP configuré.
2. Semaphore recherche cet en-tête dans chaque requête. S'il est présent, le jeton est validé à l'aide du point de terminaison JWKS.
3. Si le jeton est valide, l'utilisateur est retrouvé de la même façon que pour LDAP et OIDC : d'abord par l'identité externe enregistrée pour le claim `sub` du jeton, puis par e-mail dans la mesure où `external_auth_email_matching` le permet, et à défaut un nouvel utilisateur externe est créé. Voir [Comment un enregistrement utilisateur est créé](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Si l'en-tête est présent mais que le jeton est invalide, Semaphore renvoie immédiatement `401 Unauthorized` -- l'authentification par jeton bearer et par session n'est pas tentée.
5. Si l'en-tête est absent, l'authentification normale (jeton bearer, cookie de session) se déroule comme d'habitude.

Les utilisateurs créés via l'authentification JWT sont marqués comme **externes**, et leur identité est enregistrée avec l'identifiant de fournisseur `jwt` et le claim `sub` du jeton. Un jeton sans claim `sub` est rejeté. Les utilisateurs locaux (non externes) ne sont jamais mis en correspondance par e-mail.

Le proxy est considéré comme fiable pour l'adresse e-mail qu'il place dans le jeton. Avec la valeur par défaut `auto` de `external_auth_email_matching`, un utilisateur créé par une version antérieure — qui mettait en correspondance les utilisateurs JWT uniquement par e-mail — est lié à son `sub` lors de sa requête suivante. Avec `never`, ces utilisateurs ne sont pas mis en correspondance, et leurs requêtes échouent parce qu'un nouveau compte réutiliserait leur adresse e-mail. Laissez-les se connecter une fois en mode `auto` avant de passer à `never`.

## Considérations de sécurité {#security-considerations}

Semaphore connecte toute personne dont la requête contient un jeton valide dans l'en-tête
configuré. La signature empêche un client de fabriquer un jeton, mais pas de rejouer un
jeton qu'il possède déjà : le proxy doit donc être le seul point d'entrée.

- Assurez-vous que Semaphore ne peut pas être joint sans passer par le proxy. Liez-le à
  une adresse privée ou filtrez son port par pare-feu ; voir [Sécurité réseau](/admin-guide/security/network).
- Configurez le proxy pour qu'il supprime l'en-tête JWT des requêtes client entrantes et ne
  le définisse qu'après avoir authentifié l'utilisateur.
- Définissez `audience` sur la valeur que le proxy utilise pour Semaphore. Sans cela, un jeton
  émis par le proxy pour une autre application et signé avec les mêmes clés est également accepté.

## Configuration {#configuration}

`header` et `jwks_url` sont tous deux obligatoires lorsque l'authentification JWT est activée. Semaphore le vérifie au démarrage.

### Fichier de configuration {#config-file}

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "header": "X-Pomerium-Jwt-Assertion",
      "jwks_url": "https://auth.example.com/.well-known/pomerium/jwks.json",
      "audience": "https://semaphore.example.com",
      "issuer": "https://auth.example.com"
    }
  }
}
```

### Variables d'environnement {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Exemple Docker {#docker-example}

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_JWT_AUTH_ENABLED=true \
  -e SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion \
  -e SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json \
  -e SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com \
  -e SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com \
  semaphoreui/semaphore:latest
```

## Options {#options}

| Paramètre | Variable d'environnement | Description |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Active l'authentification par proxy JWT. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | En-tête HTTP contenant le JWT. **Obligatoire.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL du point de terminaison JWKS utilisé pour vérifier la signature. **Obligatoire.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Claim `aud` attendu. S'il est vide, l'audience n'est pas vérifiée. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Claim `iss` attendu. S'il est vide, l'émetteur n'est pas vérifié. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | Claim JWT contenant l'adresse e-mail de l'utilisateur. Par défaut : `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | Claim JWT contenant le nom affiché de l'utilisateur. Par défaut : `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | Claim JWT contenant le nom d'utilisateur. Par défaut : `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL vers laquelle le lien de déconnexion redirige après la suppression de la session Semaphore. Voir [Déconnexion](#logout). |

## Algorithmes pris en charge {#supported-algorithms}

Semaphore accepte les jetons signés avec **ES256**, **ES384**, **ES512**, **RS256**, **RS384** ou **RS512**. Chaque jeton doit comporter un claim `exp` ; les jetons qui n'en ont pas sont rejetés.

## Déconnexion {#logout}

Cliquer sur la déconnexion dans Semaphore supprime le cookie de session Semaphore, mais la session du proxy inverse n'est pas affectée -- la requête suivante authentifie donc immédiatement le même utilisateur.

Pour déconnecter complètement l'utilisateur, définissez `signout_url` sur le point de terminaison de déconnexion du proxy. Après la suppression de la session Semaphore, le navigateur y est redirigé.

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "signout_url": "https://auth.example.com/.pomerium/sign_out"
    }
  }
}
```

Exemples pour les proxys courants :

- **Pomerium** : `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy** : `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access** : `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Disponibilité du JWKS {#jwks-availability}

Semaphore récupère le JWKS au démarrage. Si le point de terminaison JWKS est injoignable, le serveur démarre quand même. Le jeu de clés est actualisé en arrière-plan toutes les heures, ainsi que lorsqu'un jeton est signé avec un identifiant de clé que Semaphore n'a pas encore vu, au plus une fois toutes les cinq minutes. L'authentification JWT renvoie une erreur tant que les clés ne sont pas disponibles.
