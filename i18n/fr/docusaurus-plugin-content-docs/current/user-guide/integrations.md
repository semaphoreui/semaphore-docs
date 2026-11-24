# Intégrations

Une intégration démarre un modèle de tâche lorsqu'un service externe appelle une URL de Semaphore. L'appelant peut être GitHub, GitLab, Bitbucket, un système de supervision ou tout programme capable d'envoyer une requête HTTP. La requête ne fait pas que déclencher l'exécution : certaines de ses parties — un nom de branche, un commit, une étiquette de version — peuvent être transmises à la tâche sous forme de variables.

![Liste des intégrations](/assets/integrations-list.webp)

Chaque intégration comporte quatre éléments :

| Élément | Répond à la question |
|---|---|
| **Alias** | Quelle URL l'expéditeur appelle-t-il ? |
| **Méthode d'authentification** | Cette requête a-t-elle le droit de démarrer quoi que ce soit ? |
| **Matchers** | Est-ce *cette* requête que l'intégration attend ? |
| **Extracteurs de valeurs** | Quels champs de la requête atteignent la tâche, et sous quelle forme ? |

Pour en créer une, ouvrez **Integrations** dans le menu du projet et cliquez sur **New Integration** : donnez-lui un nom, choisissez le modèle de tâche qu'elle exécute et la méthode d'authentification. Cliquez ensuite sur l'intégration dans la liste pour configurer son alias, ses matchers et ses extracteurs de valeurs.

![Détails d'une intégration](/assets/integration-detail.webp)

## Déroulement d'un appel {#how-a-call-is-handled}

1. L'expéditeur appelle `/api/integrations/<alias>` en `GET` ou en `POST`.
2. Semaphore résout l'alias vers les intégrations qu'il peut démarrer. Le point d'entrée est public — seuls l'alias et la méthode d'authentification le protègent.
3. Chacune de ces intégrations vérifie la requête avec sa propre **méthode d'authentification**. Une requête qui échoue ne démarre rien.
4. Si l'appel est arrivé par un **alias de projet**, les **matchers** de l'intégration sont évalués. Ils doivent tous correspondre, sinon l'intégration est ignorée.
5. Les **extracteurs de valeurs** s'exécutent et transforment des parties de la requête en variables et en paramètres de tâche.
6. La tâche est créée et mise en file, exactement comme si quelqu'un avait lancé le modèle à la main.

Un appel traité reçoit `204 No Content` avec un corps vide, qu'il ait démarré quelque chose ou non. Ce qui a démarré est indiqué dans les en-têtes de réponse :

| En-tête de réponse | Valeur |
|---|---|
| `X-Semaphore-Task-ID` | La tâche créée |
| `X-Semaphore-Template-ID` | Le modèle qu'elle exécute |
| `X-Semaphore-Project-ID` | Le projet auquel appartient la tâche |
| `X-Semaphore-Integration-ID` | L'intégration qui l'a démarrée |
| `X-Semaphore-Inventory-ID` | L'inventaire de la tâche, lorsqu'elle en a un |

Chaque appel à un alias connu est également inscrit dans l'[historique des appels](#call-history) — c'est là qu'il faut regarder quand un webhook ne fait pas ce qu'on attend.

## Alias {#aliases}

Un alias est la partie aléatoire et indevinable de l'URL du webhook : `/api/integrations/<random_string>`. Il accepte `GET` et `POST`. Il en existe deux sortes, et une intégration n'en utilise qu'une à la fois.

Un **alias de projet** se crée avec **Add Alias** au-dessus de la liste des intégrations ; il est partagé par toutes les intégrations du projet dont l'interrupteur **Use project alias** est activé. Une requête entrante est proposée à toutes, et chacune décide par ses matchers si elle doit s'exécuter. C'est l'alias à donner une fois pour toutes à GitHub ou GitLab, puis à router par événement.

Un **alias d'intégration** se crée avec **Add Alias** sur la page de l'intégration elle-même et n'appartient qu'à elle. Un appel le démarre immédiatement — **les matchers ne sont pas évalués du tout**. Utilisez-le quand l'expéditeur est dédié à une seule tâche, ou quand le corps est dans un format que les matchers ne savent pas inspecter.

:::warning
L'interrupteur **Use project alias** de la page de l'intégration décide de la sorte d'alias qui fonctionne. Tant qu'il est activé, l'intégration répond à l'alias de projet et ses propres alias sont ignorés ; tant qu'il est désactivé, l'alias de projet n'atteint jamais l'intégration et ses matchers ne servent jamais.
:::

Un projet peut avoir plusieurs alias des deux sortes. Supprimer un alias avec l'icône de corbeille à côté de lui l'arrête immédiatement, tandis que les appels déjà reçus restent dans l'historique.

## Authentification {#authentication}

Le point d'entrée du webhook n'est pas derrière une connexion : c'est donc la méthode d'authentification qui empêche des inconnus de démarrer vos tâches. Choisissez-la dans le formulaire de l'intégration ; **Auth secret** est une clé du [magasin de clés](/user-guide/key-store).

| Méthode d'authentification | Ce que Semaphore vérifie | Auth secret |
|---|---|---|
| **None** | Rien — quiconque apprend l'URL peut démarrer le modèle | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` vaut `sha256=` suivi du HMAC-SHA256 du corps | Chaîne, ou le mot de passe d'une clé identifiant/mot de passe |
| **Bitbucket Webhooks** | `X-Hub-Signature` de la même façon | Chaîne, ou le mot de passe d'une clé identifiant/mot de passe |
| **Token** | L'en-tête nommé dans **Auth header** est égal au secret | Chaîne, ou le mot de passe d'une clé identifiant/mot de passe |
| **HMAC** | L'en-tête nommé dans **Auth header** contient le HMAC-SHA256 du corps | Chaîne, ou le mot de passe d'une clé identifiant/mot de passe |
| **HMAC (SHA-512)** | La même chose avec HMAC-SHA512 | Chaîne, ou le mot de passe d'une clé identifiant/mot de passe |
| **BasicAuth** | L'en-tête `Authorization` porte l'identifiant *et* le mot de passe | Uniquement une clé identifiant/mot de passe |

Une clé de type **Chaîne** utilise sa valeur comme secret partagé ; une clé identifiant/mot de passe utilise son mot de passe, et seul BasicAuth compare aussi l'identifiant. Une clé d'un type que la méthode ne sait pas utiliser fait rejeter la requête au lieu de passer la différence sous silence.

### Authentification HMAC {#hmac-authentication}

Les méthodes d'authentification HMAC (`hmac` / SHA-256 et `hmac-sha512` / SHA-512) vérifient que le corps du webhook a été signé avec un secret partagé.

Configurez :

1. **Auth header** — l'en-tête de requête qui porte la signature (par exemple `X-Signature` ou `X-Hub-Signature-256`).
2. **Auth secret** — une clé **Chaîne** du magasin de clés (sa valeur est le secret) ou un identifiant/mot de passe (son **mot de passe** est le secret).

L'expéditeur doit placer dans cet en-tête un condensé HMAC du corps brut de la requête en **hexadécimal pur** (sans préfixe `sha256=` / `sha512=` ; les méthodes GitHub et Bitbucket attendent au contraire ce préfixe, les méthodes HMAC non). Semaphore le compare au `HMAC-SHA256` ou au `HMAC-SHA512` du corps calculé avec le secret configuré.

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

## Matchers {#matchers}

Un matcher est une condition portant sur la requête entrante : *cet en-tête est égal à ceci*, *ce champ JSON contient cela*. Les matchers sont ce qui permet à un seul alias de projet de servir plusieurs intégrations : GitHub envoie tous ses événements à la même URL, et les matchers décident quelle intégration réagit à quel événement.

Un matcher décide seulement si l'intégration s'exécute. Il ne modifie jamais la tâche ; c'est le rôle des extracteurs.

Les matchers ne sont évalués **que pour les appels arrivant par un alias de projet** (interrupteur **Use project alias** activé). Un appel à l'alias propre d'une intégration la démarre sans les regarder.

### Champs d'un matcher {#matcher-fields}

| Champ | Signification |
|---|---|
| **Name** | Un libellé pour la liste. Texte libre, non utilisé dans la comparaison |
| **Match on** | **Body** ou **Header** — d'où vient la valeur |
| **Body Data Format** | **JSON** ou **String**, affiché pour **Body** seulement |
| **Key** | Le nom de l'en-tête, ou le chemin vers un champ du corps JSON |
| **Comparison Method** | `==`, `!=` ou **Contains** |
| **Value** | Le texte auquel la valeur de la requête est comparée |

**Match on: Header** — **Key** est un nom d'en-tête, comparé sans tenir compte de la casse : `X-GitHub-Event` et `x-github-event` désignent le même en-tête. Un en-tête absent de la requête se comporte comme une valeur manquante (voir plus bas). Quand un en-tête apparaît plusieurs fois, seule la première valeur est comparée.

**Match on: Body, JSON** — **Key** est un chemin dans le corps analysé, décrit à la section suivante. Un corps qui n'est pas du JSON valide donne une valeur manquante pour n'importe quelle clé.

**Match on: Body, String** — la valeur est le corps brut tout entier et **Key** est ignoré. Le formulaire réclame quand même une clé, car le champ est obligatoire ; mettez un tiret. C'est la seule façon de comparer un corps qui n'est pas du JSON — associez-la à **Contains**.

**Key** et **Value** sont tous deux obligatoires : un matcher ne peut donc pas tester une valeur vide. Pour réagir à l'absence d'un champ, comparez-le avec `!=` à une valeur qu'il ne prend jamais.

### Clés JSON {#json-keys}

Une clé est un chemin dans le document JSON. Les niveaux sont séparés par des points et un élément de tableau est désigné par son index entre crochets, en comptant à partir de zéro. La casse des noms compte.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| Clé | Ce qu'elle désigne |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | Le tableau entier |
| `repository.url` | Rien — le champ n'existe pas |

La même syntaxe est utilisée par le champ **Key** d'un extracteur de valeurs.

### Comment un matcher compare les valeurs {#how-a-matcher-compares-values}

La valeur issue de la requête est convertie en texte et comparée à **Value** comme du texte ; le champ **Value** n'a donc jamais besoin de guillemets, de crochets ni d'échappement.

- **Les chaînes** sont comparées littéralement, et la comparaison tient compte de la casse : `Push` ne correspond pas à `push`.
- **Les nombres** sont comparés sans partie décimale lorsqu'ils n'en ont pas : `42` dans le corps correspond à la valeur `42`, pas à `42.0`. Un nombre fractionnaire est comparé tel qu'il est écrit, donc `1.5` correspond à `1.5`.
- **Les booléens** correspondent à `true` et `false`.
- **Une valeur manquante** — en-tête absent, chemin JSON inexistant, `null`, ou corps qui n'est pas du JSON valide — est comparée comme le texte littéral `<nil>`. Il en découle une conséquence à retenir : `==` ne peut jamais correspondre à un champ manquant, et `!=` y correspond toujours.
- **Les objets et les tableaux** n'ont pas de forme textuelle lisible ; ne les comparez pas. Visez plutôt un champ scalaire à l'intérieur.
- **Contains** est un simple test de sous-chaîne sensible à la casse, sans jokers ni expressions régulières.

### Plusieurs matchers {#several-matchers}

Une intégration peut avoir autant de matchers que nécessaire, et ils sont combinés par **ET** : l'intégration ne s'exécute que lorsque chacun d'eux correspond. Il n'existe pas de *ou* au sein d'une même intégration — créez une seconde intégration sur le même modèle pour la condition alternative.

:::warning
Une intégration qui utilise l'alias de projet et n'a **aucun matcher** ne démarre jamais, car il n'y a rien qui puisse correspondre. Donnez-lui au moins un matcher, ou désactivez **Use project alias** et appelez l'alias propre de l'intégration.
:::

### Exemples de matchers {#matcher-examples}

| Objectif | Match on | Format | Key | Méthode | Value |
|---|---|---|---|---|---|
| Seulement les push GitHub | Header | — | `X-GitHub-Event` | `==` | `push` |
| Seulement les push sur `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Toute branche sauf `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Seulement les étiquettes | Body | JSON | `ref` | Contains | `refs/tags/` |
| Seulement les merge requests GitLab fusionnées | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Ignorer les commits d'un bot | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Seulement les releases GitHub publiées | Body | JSON | `action` | `==` | `published` |
| Une alerte en texte brut mentionnant un disque | Body | String | `-` | Contains | `disk` |

Les deux premières lignes réunies forment la configuration habituelle d'une intégration de déploiement : le type d'événement depuis l'en-tête et la branche depuis le corps, les deux devant correspondre.

## Extracteurs de valeurs {#value-extractors}

Un extracteur de valeurs copie un morceau de la requête entrante dans la tâche qui va démarrer. C'est ainsi qu'un webhook transmet une branche, une empreinte de commit, un auteur ou un numéro de version à l'automatisation qu'il déclenche.

Les extracteurs s'exécutent toujours, quelle que soit la sorte d'alias par laquelle l'appel est arrivé, et après que l'authentification et les matchers ont été franchis.

### Champs d'un extracteur {#extractor-fields}

| Champ | Signification |
|---|---|
| **Name** | Un libellé pour la liste. Texte libre |
| **Source of the Value** | **Body** ou **Header** |
| **Data Type of Body** | **JSON** ou **String**, affiché pour **Body** seulement |
| **Key** | Le nom de l'en-tête, ou une [clé JSON](#json-keys) — la même syntaxe que pour les matchers |
| **Variable Usage** | **Variables** ou **Task Params** — où la valeur est livrée |
| **Variable** | Le nom que la valeur prend dans la tâche |

Avec **Body** et **String**, le corps brut tout entier devient la valeur et **Key** est ignoré, exactement comme dans un matcher.

### Ce que reçoit la variable {#what-the-variable-receives}

Contrairement à un matcher, un extracteur ne convertit rien en texte : une valeur JSON conserve son type, un nombre reste donc un nombre et un objet reste un objet.

| Ce que contient la requête | Ce que reçoit la variable |
|---|---|
| Un en-tête | Son texte ; une chaîne vide si l'en-tête est absent |
| Une chaîne, un nombre ou un booléen JSON | La même valeur, avec son type |
| Un objet ou un tableau JSON | L'objet ou le tableau entier, structure préservée |
| Un `null` JSON, un chemin inexistant, ou un corps qui n'est pas du JSON valide | Rien — la variable **n'est pas définie du tout**, et ce que définit le modèle reste en place |
| Le corps en **String** | Le corps brut tout entier, en texte |

La différence entre « vide » et « non défini » compte : un en-tête absent donne une chaîne vide à la tâche, alors qu'un champ JSON absent laisse intacte la valeur propre du modèle.

### Variable Usage : Variables {#variable-usage-variables}

La valeur rejoint les variables de la tâche — le même ensemble que remplit le champ **Variables** de la boîte de dialogue de lancement. Semaphore les passe à l'outil comme variables supplémentaires (`--extra-vars` pour Ansible, `-var` pour Terraform), et elles remplacent une clé de même nom du [groupe de variables](/user-guide/environment) du modèle.

Nommez la variable exactement comme une [variable de questionnaire](/user-guide/task-templates/survey-vars) du modèle, et le webhook remplira cette variable à la place d'une personne.

### Variable Usage : Task Params {#variable-usage-task-params}

Les paramètres de tâche sont les [invites](/user-guide/task-templates/prompts) intégrées du modèle, et non des variables pour le playbook. La valeur extraite est transmise sans transformation : son type JSON doit donc être celui attendu — `true`, et non `"true"`.

| Variable | S'applique à | Attend |
|---|---|---|
| `git_branch` | Toutes les applications | La branche à extraire. Un `refs/heads/` initial est retiré, le `ref` de GitHub peut donc être utilisé tel quel |
| `limit`, `tags`, `skip_tags` | Ansible | Une liste de chaînes |
| `debug`, `dry_run`, `diff` | Ansible | `true` ou `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` ou `false` |

Le modèle doit autoriser le remplacement pour que la valeur prenne effet : **Allow override branch in task** pour `git_branch`, et l'invite correspondante pour `limit`, `tags` et `skip_tags`. Sans cette permission, la valeur est abandonnée et la tâche s'exécute avec le réglage du modèle.

### Exemple d'extracteurs : push GitHub {#extractor-example-github-push}

Un webhook de push GitHub envoie un corps qui commence ainsi :

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Quatre extracteurs en font une tâche entièrement décrite :

| Name | Source | Format | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

La tâche extrait alors `main` (le préfixe `refs/heads/` est retiré pour vous) et s'exécute avec les variables `COMMIT`, `AUTHOR` et `EVENT` à disposition du playbook. Pour voir ce qu'un appel réel a vraiment livré, ouvrez-le dans l'onglet History et comparez son corps à vos clés.

## Paramètres de tâche prédéfinis {#task-parameters}

Dès qu'un modèle est choisi dans le formulaire de l'intégration, ses propres options de lancement apparaissent : un message, ses variables de questionnaire, l'inventaire, la branche Git lorsque le modèle autorise son remplacement, et les invites de l'application. Tout ce que vous réglez là devient la valeur par défaut de chaque tâche démarrée par cette intégration ; les valeurs qui ne changent jamais — un inventaire, un message fixe — ont donc leur place ici plutôt que dans un extracteur.

Les extracteurs s'appliquent par-dessus ces valeurs : une variable ou un paramètre de tâche produit par un extracteur remplace la valeur prédéfinie de même nom, et la valeur prédéfinie subsiste quand l'extracteur ne trouve rien.

## Intégrations de workflow <FeatureState feature="workflows" /> {#workflow-integrations}

Une intégration peut démarrer un [workflow](/user-guide/workflows) au lieu d'un seul modèle. Basculez **Runs** sur **Workflow** dans le formulaire de l'intégration et choisissez le workflow.

Les extracteurs fonctionnent de la même manière, à une différence près : **Variable Usage** est ignoré, et chaque valeur extraite est livrée comme réponse au questionnaire du workflow sous le nom indiqué dans **Variable**. Le workflow valide ensuite ces réponses et les transmet à ses nœuds par leurs liaisons ; une valeur à laquelle aucun nœud n'est lié n'atteint donc jamais une tâche. Un appel réussi renvoie `X-Semaphore-Workflow-ID` et `X-Semaphore-Workflow-Run-ID` en plus des en-têtes de tâche.

## Historique des appels {#call-history}

L'onglet **History** de la page des intégrations liste tous les appels que le projet a reçus par l'un de ses alias, du plus récent au plus ancien. Il survit à l'alias, à l'intégration et à la tâche démarrée, car il est conservé par projet et non par intégration.

| Colonne | Affiche |
|---|---|
| **Time** | Quand l'appel est arrivé |
| **Integration** | L'intégration qui l'a traité, avec l'alias en dessous — cliquez sur l'alias pour filtrer la liste |
| **Source IP** | L'adresse d'où venait l'appel |
| **Method** | `GET` ou `POST` |
| **Status** | Ce que l'intégration a fait de l'appel, et pourquoi |
| **Task** | La tâche ou l'exécution de workflow démarrée |
| **Duration** | Le temps que l'intégration a mis à traiter l'appel |

Quatre statuts sont possibles :

| Statut | Signification |
|---|---|
| `ok` | Une tâche ou une exécution de workflow a démarré |
| `unauthorized` | La requête a échoué à la méthode d'authentification de l'intégration |
| `skipped` | Les matchers n'ont pas correspondu, ou l'alias n'a démarré aucune intégration |
| `error` | Le démarrage a été tenté et a échoué — le modèle avait disparu, le questionnaire a refusé les valeurs |

Un clic sur une ligne ouvre l'appel, avec le corps de la requête tel qu'il a été reçu (ses 64 premiers Kio ; s'il était plus long, la taille stockée et la taille d'origine sont toutes deux affichées). Les **en-têtes de requête ne sont jamais conservés** : ils portent la signature ou le jeton avec lequel l'expéditeur s'est authentifié. Le corps d'un appel qui a échoué à l'authentification n'est pas conservé non plus, puisque quiconque connaît l'URL peut en produire un.

Filtrez la liste par intégration et par alias avec les contrôles au-dessus du tableau, et parcourez-la avec les flèches en dessous. L'historique n'expire pas — il grandit jusqu'à la suppression du projet.

## Dépannage {#troubleshooting}

| Symptôme | Ce qu'il faut vérifier |
|---|---|
| Aucune ligne n'apparaît dans History | L'alias de l'URL est faux ou supprimé. Un appel à l'alias propre d'une intégration alors que **Use project alias** est activé n'est lui non plus enregistré nulle part |
| `unauthorized` | Le nom de l'en-tête d'authentification, la clé dans le magasin de clés, et si l'expéditeur envoie la signature avec le préfixe `sha256=` attendu par la méthode. GitHub et Bitbucket utilisent leurs propres en-têtes, indépendamment de **Auth header** |
| `skipped`, motif *No integration matched the alias* | L'alias existe, mais aucune intégration du projet n'a **Use project alias** activé |
| `skipped`, motif *No matcher matched the request* | Ouvrez l'appel et comparez son corps à vos matchers. Rappelez-vous qu'un champ manquant ne correspond jamais avec `==`, que la casse des clés compte et que **Contains** n'accepte pas de jokers. Une intégration sans aucun matcher est ignorée pour la même raison |
| La tâche s'exécute mais une variable est vide ou absente | La clé JSON ne correspond pas à la charge utile (ouvrez l'appel pour voir le corps), la valeur était `null`, ou le nom dans **Variable** diffère de la variable de questionnaire à remplir |
| La branche n'est pas remplacée | Le modèle a besoin de **Allow override branch in task**, et l'extracteur doit écrire dans le paramètre de tâche `git_branch` |
| Plusieurs tâches démarrent pour un seul appel | Plusieurs intégrations utilisent l'alias de projet et leurs matchers correspondent tous. Resserrez les matchers, ou donnez aux intégrations leurs propres alias |
