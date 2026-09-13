# Runners de projet (Pro)

Les runners exécutent les tâches sur des machines autres que le serveur Semaphore : plus près de l'infrastructure cible, dans une autre zone réseau ou avec une chaîne d'outils différente. Les **runners globaux** sont enregistrés par un administrateur et servent tous les projets. Les **runners de projet** appartiennent à un seul projet et sont gérés par son équipe dans la section **Runners**.

![Runners de projet](/assets/project-runners-list.webp)

| Colonne | Contenu |
|---|---|
| Interrupteur | Active ou désactive le runner. Un runner désactivé ne reçoit aucune tâche. Seuls les runners de projet disposent de cet interrupteur ; les runners globaux sont gérés par l'administrateur. |
| **Nom** | Nom du runner. Le badge **Global** signale les runners partagés par tous les projets. |
| **Étiquette** | Étiquettes du runner. Les modèles dotés d'une **Étiquette de runner** ne s'exécutent que sur les runners qui portent cette étiquette. |
| **Statut** | **Online** lorsque le runner a interrogé le serveur récemment, **Offline** sinon. |

## Ajouter un runner {#adding-a-runner}

Vous devez avoir le rôle **Manager** ou supérieur. Cliquez sur **Nouveau runner** et remplissez le formulaire.

<div style={{maxWidth: 420}}>

![Boîte de dialogue de nouveau runner](/assets/project-runner-new.webp)

</div>

| Champ | Description |
|---|---|
| **Nom** | Nom du runner affiché dans la liste et dans les détails des tâches. |
| **Étiquettes** | Facultatif. Une ou plusieurs étiquettes. Un modèle doté d'une **Étiquette de runner** n'est exécuté que par les runners qui portent cette étiquette. |
| **Par défaut** | Les runners dotés de cet indicateur prennent également les tâches des modèles sans étiquette de runner. Un runner sans cet indicateur et sans étiquette ne reçoit jamais de tâches. |
| **Enregistrer** | Cochée : le runner est créé déjà enregistré et la boîte de dialogue affiche le jeton du runner à placer dans sa configuration. Décochée : le runner est créé non enregistré et vous obtenez un **jeton d'enregistrement** à usage unique ; le runner s'enregistre lui-même avec `semaphore runner register` ou `semaphore runner start --auto-register`. |
| **Webhook** | URL facultative que Semaphore appelle lorsqu'une tâche est affectée au runner. Utilisez-la pour démarrer des runners à la demande (à usage unique), par exemple avec une fonction cloud. |
| **Nombre maximal de tâches parallèles** | Facultatif. Nombre de tâches que le runner peut exécuter simultanément. |
| **Activé** | Indique si le runner reçoit des tâches. |

Après la création, cliquez sur le runner pour consulter à nouveau son jeton ou son jeton d'enregistrement et pour copier les extraits de configuration.

## Installer le runner {#installing-the-runner}

Le runner est le même binaire `semaphore` ou l'image Docker `semaphoreui/runner` démarrés en mode runner. L'installation, le fichier de configuration, les commandes d'enregistrement, les exécuteurs (local, Docker, Kubernetes) et la sécurité sont décrits dans le guide d'administration : [Runners](/admin-guide/runners) et [CLI : Runners](/reference/cli/runners).

## Acheminer les tâches vers les runners {#routing-tasks-to-runners}

1. Attribuez une ou plusieurs **Étiquettes** au runner, par exemple `windows-qa-server`.
2. Dans le formulaire du modèle, définissez l'**Étiquette de runner** sur la même valeur.
3. Les tâches du modèle attendent avec le statut `waiting` jusqu'à ce qu'un runner portant cette étiquette soit en ligne.

Les modèles sans étiquette de runner sont dirigés vers les runners marqués **Par défaut**, y compris les runners globaux par défaut. Le runner qui a exécuté une tâche est indiqué dans l'onglet **Détails** de la [fenêtre de la tâche](../tasks#task-window).

## Sécurité {#security}

- Les runners se connectent au serveur, jamais l'inverse : un runner peut donc se trouver derrière du NAT ou dans un réseau privé.
- Chaque requête d'un runner est authentifiée par son jeton. Révoquez un runner en le supprimant ou en le désactivant.
- Utilisez HTTPS entre les runners et le serveur ; voir [Sécurité réseau](/admin-guide/security/network).
