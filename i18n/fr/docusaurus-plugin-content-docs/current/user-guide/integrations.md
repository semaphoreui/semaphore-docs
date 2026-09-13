# Intégrations

Les intégrations permettent d'établir une interaction entre Semaphore et des services externes, tels que GitHub et GitLab.

![Liste des intégrations](/assets/integrations-list.webp)

L'URL du webhook du projet est affichée au-dessus de la liste. Chaque intégration possède un nom et le modèle qu'elle démarre ; cliquez sur une intégration pour configurer ses correspondances et ses extracteurs de valeurs.

![Détails d'une intégration](/assets/integration-detail.webp)

Grâce à une intégration, vous pouvez déclencher un modèle précis en appelant un point de terminaison spécial (alias), pour lequel vous pouvez configurer l'une des méthodes d'authentification suivantes :
* Webhooks GitHub
* Jeton
* HMAC
* Aucune authentification

L'alias correspond à une URL au format suivant : `/api/integrations/<random_string>`. Il prend en charge les requêtes `GET` et `POST`.

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
