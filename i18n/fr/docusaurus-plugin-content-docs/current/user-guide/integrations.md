# Intégrations

Les intégrations permettent d'établir une interaction entre Semaphore et des services externes, tels que GitHub et GitLab.

![Liste des intégrations](/assets/integrations-list.webp)

L'URL du webhook du projet est affichée au-dessus de la liste. Chaque intégration possède un nom et le modèle qu'elle démarre ; cliquez sur une intégration pour configurer ses correspondances et ses extracteurs de valeurs.

![Détails d'une intégration](/assets/integration-detail.webp)

Grâce à une intégration, vous pouvez déclencher un modèle précis en appelant un point de terminaison spécial (alias), pour lequel vous pouvez configurer l'une des méthodes d'authentification suivantes :
* Webhooks GitHub
* Jeton
* HMAC (SHA-256)
* HMAC (SHA-512)
* Aucune authentification

L'alias correspond à une URL au format suivant : `/api/integrations/<random_string>`. Il prend en charge les requêtes `GET` et `POST`.

## Authentification HMAC {#hmac-authentication}

Les méthodes d'authentification HMAC (`hmac` / SHA-256 et `hmac-sha512` / SHA-512) vérifient que le corps du webhook a été signé avec un secret partagé.

Configurez :

1. **Auth header** — l'en-tête de requête qui contient la signature (par exemple `X-Signature` ou `X-Hub-Signature-256`).
2. **Auth secret** — un identifiant de type nom d'utilisateur/mot de passe du magasin de clés ; Semaphore utilise la valeur du **mot de passe** comme secret HMAC.

L'émetteur doit placer dans cet en-tête un condensat HMAC **hexadécimal brut** du corps original de la requête (sans préfixe `sha256=` / `sha512=`). Semaphore le compare au `HMAC-SHA256` ou au `HMAC-SHA512` du corps calculé avec le secret configuré.

Exemple (SHA-512) avec OpenSSL :

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Correspondances {#matchers}

Avec les correspondances, vous pouvez définir les paramètres de la requête entrante. Lorsque ces paramètres correspondent, le modèle est invoqué.

## Extracteurs de valeurs {#value-extractors}

Avec un extracteur, vous pouvez récupérer des données dans l'en-tête ou le corps de la requête (champ JSON ou chaîne) et les transmettre à la tâche. Chaque valeur extraite possède un **Type de variable** :

* **Environnement** : la valeur est ajoutée aux variables d'environnement de la tâche et remplace une variable du même nom issue du groupe de variables.
* **Paramètre de tâche** : la valeur devient un paramètre de la tâche, par exemple une variable de questionnaire ou une invite.

## Paramètres de tâche {#task-parameters}

Les intégrations peuvent déclencher des tâches avec des paramètres. Utilisez les extracteurs de valeurs pour construire une charge utile JSON destinée aux paramètres de la tâche, et configurez le modèle pour qu'il accepte les valeurs demandées.

## Remarques sur les alias et les correspondances {#notes-on-aliases-and-matchers}

Un alias de projet (l'URL au-dessus de la liste des intégrations) est partagé par toutes les intégrations du projet : Semaphore vérifie les correspondances de chaque intégration et démarre les modèles dont les correspondances concordent. Une intégration peut aussi disposer de son propre alias ; les requêtes qui lui sont adressées démarrent cette intégration sans évaluer les correspondances. Privilégiez l'authentification par jeton ou HMAC selon vos besoins et transmettez les paramètres via des extracteurs.
