---
title: Intégrations
description: Démarrer des modèles et des workflows à partir de webhooks entrants avec des points de terminaison, des groupes d'intégrations, des méthodes d'authentification, des correspondances et des extracteurs de valeurs.
---

# Intégrations

Les intégrations permettent à des services externes tels que GitHub, GitLab ou un serveur CI de démarrer des tâches dans Semaphore en appelant une URL de webhook. Trois objets décrivent une intégration : un **point de terminaison** indique où la requête arrive et comment elle est authentifiée, un **groupe d'intégrations** indique quelles intégrations s'exécutent depuis ce point de terminaison, et une **intégration** indique ce qu'il faut démarrer et avec quels paramètres.

![Liste des intégrations](/assets/integrations-list.webp)

## Fonctionnement {#how-it-works}

| Objet | Ce qu'il contient | Où |
|---|---|---|
| **Point de terminaison** | Un nom et une description, un ou plusieurs **alias** (URL publiques de la forme `/api/integrations/<random_string>`) et l'**authentification** avec laquelle chaque requête vers ces URL est vérifiée. | Projet → **Points de terminaison** |
| **Groupe d'intégrations** | Un ensemble d'intégrations qui s'exécutent depuis un point de terminaison. Un groupe hérite normalement de l'authentification du point de terminaison ; il peut la **remplacer** par sa propre méthode et son propre secret. | Projet → **Intégrations**, une section par groupe |
| **Intégration** | Le modèle ou le workflow (Pro) à démarrer, ses paramètres de tâche, les [correspondances](#matchers) qui filtrent les requêtes et les [extracteurs de valeurs](#value-extractors) qui alimentent la tâche. | Dans son groupe |

Lorsqu'une requête arrive sur un alias, Semaphore retrouve le point de terminaison, vérifie la requête avec l'authentification de chaque groupe (celle du point de terminaison ou celle propre au groupe) et démarre chaque intégration d'un groupe autorisé dont toutes les correspondances acceptent la requête. Une intégration sans correspondance s'exécute à chaque requête autorisée. La réponse est toujours `204 No Content` ; les en-têtes `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` et `X-Semaphore-Task-ID` indiquent ce qui a été démarré. `GET` et `POST` sont acceptés.

![Détails d'une intégration](/assets/integration-detail.webp)

La chaîne de l'alias est le seul secret d'un point de terminaison non authentifié : traitez l'URL comme un mot de passe et supprimez un alias pour le révoquer. Un point de terminaison peut avoir plusieurs alias ; vous pouvez donc remettre une URL distincte à chaque émetteur et les révoquer une par une.

## Authentification {#authentication}

Un point de terminaison, ou un groupe qui le remplace, vérifie les requêtes avec l'une des méthodes suivantes :

* **Webhooks GitHub** — l'en-tête `X-Hub-Signature-256`, HMAC-SHA256 du corps avec le secret
* **Webhooks Bitbucket** — l'en-tête `x-hub-signature`, HMAC-SHA256 du corps
* **Jeton** — un en-tête de votre choix doit être égal au secret
* **HMAC (SHA-256)** et **HMAC (SHA-512)** — un en-tête de votre choix contient la signature du corps
* **BasicAuth** — nom d'utilisateur et mot de passe d'un identifiant nom d'utilisateur/mot de passe
* **Aucune authentification** — toute requête avec une URL d'alias valide passe

Le secret provient du [magasin de clés](./key-store) du projet : une clé de type **Chaîne** (sa valeur est le secret) ou un identifiant **nom d'utilisateur/mot de passe** (son mot de passe est le secret). BasicAuth fait exception : elle vérifie aussi le nom d'utilisateur et exige donc un identifiant nom d'utilisateur/mot de passe. Le formulaire ne propose que les clés dont le type correspond à la méthode, et l'API refuse les autres.

## Authentification HMAC {#hmac-authentication}

Les méthodes d'authentification HMAC (`hmac` / SHA-256 et `hmac-sha512` / SHA-512) vérifient que le corps du webhook a été signé avec un secret partagé.

Configurez sur le point de terminaison (ou sur le groupe qui le remplace) :

1. **Auth header** — l'en-tête de requête qui contient la signature (par exemple `X-Signature`).
2. **Auth secret** — une clé de type **Chaîne** du magasin de clés ou un identifiant nom d'utilisateur/mot de passe.

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

Les correspondances décrivent les requêtes auxquelles une intégration réagit : un en-tête ou un champ du corps (chemin JSON ou corps entier sous forme de chaîne) comparé à une valeur. Toutes les correspondances d'une intégration doivent être satisfaites ; une intégration sans correspondance s'exécute à chaque requête que son groupe laisse passer. Utilisez les correspondances pour exécuter différentes intégrations d'un même point de terminaison selon l'événement — par exemple un modèle pour `push` et un autre pour `release`.

## Extracteurs de valeurs {#value-extractors}

Avec un extracteur, vous pouvez récupérer des données dans l'en-tête ou le corps de la requête (champ JSON ou chaîne) et les transmettre à la tâche. Chaque valeur extraite possède un **Type de variable** :

* **Environnement** : la valeur est ajoutée aux variables d'environnement de la tâche et remplace une variable du même nom issue du groupe de variables.
* **Paramètre de tâche** : la valeur devient un paramètre de la tâche, par exemple une variable de questionnaire ou une invite.

## Paramètres de tâche {#task-parameters}

Les intégrations peuvent déclencher des tâches avec des paramètres. Utilisez les extracteurs de valeurs pour construire une charge utile JSON destinée aux paramètres de la tâche, et configurez le modèle pour qu'il accepte les valeurs demandées.

## Mise à niveau depuis des versions antérieures {#upgrading-from-older-versions}

Avant la version 2.20.19, une intégration portait sa propre authentification, et les alias existaient soit pour l'ensemble du projet, soit pour une seule intégration. La mise à niveau convertit cette configuration sans changer ce que fait une URL existante :

| Avant | Après la mise à niveau |
|---|---|
| Alias du projet (l'URL au-dessus de la liste des intégrations) | Un point de terminaison nommé **Default**, sans authentification, qui les contient tous |
| Une intégration accessible via l'alias du projet (« Utiliser l'alias du projet » activé) | Un groupe dédié sur le point de terminaison **Default**. Si l'intégration avait une authentification, le groupe **remplace** celle du point de terminaison par la sienne |
| Une intégration avec ses propres alias | Un point de terminaison portant le nom de l'intégration, avec ses alias et son authentification, et un groupe dédié sur ce point de terminaison |
| Correspondances et extracteurs de valeurs | Inchangés |

Chaque intégration se retrouve seule dans un groupe qui porte son nom ; fusionnez ensuite les groupes ou renommez les points de terminaison à votre convenance. Deux détails diffèrent de l'ancien comportement : une intégration derrière l'alias du projet qui n'avait aucune correspondance ne s'exécutait jamais auparavant et s'exécute désormais à chaque requête autorisée, et les alias propres d'une intégration qui utilisait aussi l'alias du projet (et qui ne correspondaient jamais à rien) sont abandonnés. Les sauvegardes de projet réalisées avec une version antérieure sont converties de la même manière lors de leur restauration.
