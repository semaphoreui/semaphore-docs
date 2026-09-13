# API

## Référence de l'API {#api-reference}

Semaphore UI fournit deux formats de documentation de l'API, afin que vous puissiez choisir celui qui convient le mieux à votre flux de travail :

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; idéal si vous préférez une expérience interactive dans le navigateur.
* [Collection Postman officielle](https://www.postman.com/semaphoreui) &mdash; explorez et testez tous les points de terminaison dans Postman.
* **Documentation Swagger intégrée de l'API** &mdash; documentation interactive de l'API propulsée par Swagger UI. Vous pouvez y accéder depuis votre instance.

![](/assets/swagger-link.webp)

Toutes ces options incluent la documentation complète des points de terminaison disponibles, des paramètres et des exemples de réponses.

## Premiers pas avec l'API {#getting-started-with-the-api}

Pour commencer à utiliser l'API Semaphore, vous devez générer un jeton d'API.
Ce jeton doit être inclus dans l'en-tête de la requête sous la forme :

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Créer un jeton d'API {#creating-an-api-token}

Il existe deux façons de créer un jeton d'API :
- Via l'interface web
- Avec une requête HTTP

#### Via l'interface web (depuis la version 2.14) {#through-the-web-interface-since-214}

Ouvrez le menu du compte en bas de la barre latérale et choisissez **Jetons d'API**. La page liste vos jetons ; le lien **Référence de l'API** qu'elle contient ouvre l'interface Swagger UI intégrée à votre instance.

![Jetons d'API](/assets/api-tokens.webp)

Cliquez sur **Nouveau jeton**, saisissez un nom, choisissez la date d'expiration du jeton, puis copiez la valeur affichée après la création. Voir [Votre compte](/user-guide/account#api-tokens).

<div style={{maxWidth: 420}}>

![Boîte de dialogue de nouveau jeton](/assets/api-token-new.webp)

</div>

#### Avec une requête HTTP {#using-http-request}

Vous pouvez également vous authentifier et générer un jeton de session à l'aide d'une requête HTTP directe.

Connectez-vous à Semaphore (le mot de passe doit être échappé, par exemple `slashy\\pass` au lieu de `slashy\pass`) :

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

Générez un nouveau jeton et récupérez-le :

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

La commande doit retourner quelque chose de similaire à :

```json
{
    "id": "YOUR_ACCESS_TOKEN",
    "created": "2025-05-21T02:35:12Z",
    "expired": false,
    "user_id": 3
}
```
---

## Utiliser le jeton pour effectuer des requêtes à l'API {#using-token-to-make-api-requests}

Une fois votre jeton d'API obtenu, incluez-le dans l'en-tête **Authorization** pour authentifier vos requêtes.

### Lancer une tâche {#launch-a-task}

Utilisez ce jeton pour lancer une tâche ou pour toute autre opération :

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## Faire expirer un jeton d'API {#expiring-an-api-token}

Si vous n'avez plus besoin du jeton, vous devez le faire expirer afin de préserver la sécurité de votre compte.

Pour révoquer (faire expirer) manuellement un jeton d'API, envoyez une requête DELETE au point de terminaison du jeton :

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
