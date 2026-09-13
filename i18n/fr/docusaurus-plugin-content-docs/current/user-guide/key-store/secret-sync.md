# Synchronisation des secrets depuis des stockages distants

Semaphore peut se connecter à un gestionnaire de secrets externe — tel que **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault** ou **Devolutions Server (DVLS)** — et en importer automatiquement les secrets dans le magasin de clés. Au lieu de copier les identifiants à la main dans Semaphore et de les maintenir à jour, vous indiquez à Semaphore votre stockage distant et il entretient un miroir local pour vous.

Les **chemins de synchronisation** sont les règles qui indiquent à Semaphore *quels* secrets importer depuis un stockage distant et *comment* les nommer une fois importés. Un gestionnaire de secrets peut contenir des milliers de secrets répartis dans de nombreux dossiers ; les chemins de synchronisation vous permettent de sélectionner uniquement les sous-arborescences qui vous intéressent et de contrôler le nommage des clés créées.

## Concepts clés {#key-concepts}

- **Stockage distant** — une connexion configurée vers un gestionnaire de secrets externe, comprenant son adresse et l'identifiant que Semaphore utilise pour y lire.
- **Synchronisation** — le processus de lecture des secrets depuis le stockage distant et de leur réconciliation avec les clés stockées dans Semaphore.
- **Chemin de synchronisation** — une règle d'import unique, composée d'un *chemin*, d'un *préfixe* et d'un *séparateur*.

## Fonctionnement d'un chemin de synchronisation {#how-a-sync-path-works}

Chaque chemin de synchronisation comporte trois champs :

- **Chemin** — l'emplacement du stockage distant à partir duquel importer. Il s'agit du dossier de base, du préfixe ou de la sous-arborescence que Semaphore liste et lit. Tout ce qui s'y trouve devient candidat à l'import.
- **Préfixe** — une chaîne ajoutée au début du nom de chaque clé générée. Utilisez-le pour isoler les secrets importés dans un espace de noms afin qu'ils n'entrent pas en collision avec les clés provenant d'autres chemins ou d'autres stockages (par exemple `prod-`).
- **Séparateur** — le caractère utilisé pour assembler les composantes de l'emplacement distant d'un secret en un seul nom de clé. Comme un secret distant peut se trouver plusieurs dossiers en profondeur, le séparateur détermine la façon dont cette hiérarchie est aplatie en un nom lisible.

Lors d'une synchronisation, Semaphore parcourt le **chemin** et, pour chaque secret trouvé, construit un nom de clé en combinant l'emplacement du secret avec le **séparateur** et en y ajoutant le **préfixe** au début. Le type de clé créée (clé SSH, login/mot de passe ou simple chaîne secrète) est déduit automatiquement de la forme du secret distant.

Vous pouvez définir **plusieurs chemins de synchronisation** sur un même stockage. Chaque chemin est importé indépendamment, ce qui vous permet de récupérer des secrets depuis plusieurs zones sans rapport du même gestionnaire de secrets et d'attribuer à chacune son propre préfixe et son propre style de nommage.

:::tip
Des valeurs par défaut adaptées sont appliquées pour chaque fournisseur — par exemple, HashiCorp Vault, OpenBao et AWS Secrets Manager utilisent `/` comme séparateur par défaut, Azure Key Vault `-` et Devolutions Server `\` — de sorte que, dans la plupart des cas, il vous suffit de renseigner le chemin.
:::

## Lancer une synchronisation {#running-a-sync}

Une synchronisation peut se produire de deux façons :

1. **Manuellement.** Ouvrez le stockage et utilisez l'action **Synchroniser maintenant**. Semaphore réconcilie immédiatement ce stockage avec ses chemins de synchronisation configurés. C'est utile pour un premier import ou pour récupérer une modification sans attendre.
2. **Automatiquement, selon une planification.** Activez **Synchroniser les clés** pour le stockage et définissez un **intervalle de synchronisation** en minutes. Semaphore relance alors la synchronisation à cette cadence en arrière-plan. Un intervalle de `0` désactive la synchronisation automatique et ne laisse que l'option manuelle.

Chaque stockage enregistre la date de sa dernière synchronisation et indique si la dernière tentative a échoué, de sorte que vous pouvez toujours connaître l'état du miroir.

:::note
Dans un déploiement à haute disponibilité, les synchronisations automatiques sont coordonnées entre les nœuds, de sorte qu'une synchronisation donnée ne s'exécute que sur un seul nœud à la fois : vous n'obtiendrez pas d'imports en double.
:::

## Effets de la synchronisation sur vos clés {#what-syncing-does-to-your-keys}

Une synchronisation est un **miroir complet**, et non une copie ponctuelle. À chaque exécution, Semaphore réconcilie le stockage distant avec les clés qu'il a précédemment importées :

- Les **nouveaux** secrets trouvés sous un chemin de synchronisation sont créés en tant que clés.
- Les clés importées **existantes** sont **mises à jour** pour correspondre à la valeur distante actuelle.
- Les clés précédemment importées qui **n'existent plus** dans le stockage distant sont **supprimées**.

Seules les clés importées par Semaphore sont concernées : les clés que vous avez créées manuellement ne sont jamais modifiées ni supprimées par une synchronisation.

:::warning
Comme les clés importées sont des copies gérées des secrets distants, la suppression d'un stockage (ou la désactivation de sa synchronisation) supprime également les clés qui en proviennent.
:::

## Deux portées : clés partagées et variables d'environnement {#two-scopes-shared-keys-and-environment-variables}

Les chemins de synchronisation peuvent être configurés à deux endroits :

- **Au niveau du stockage** — les secrets importés deviennent des **clés partagées**, disponibles dans tout le projet partout où des clés sont utilisées.
- **Au niveau de l'environnement** — un [groupe de variables](/user-guide/environment) peut pointer vers un stockage et ses chemins de synchronisation pour importer des secrets en tant que **variables d'environnement** limitées à ce groupe.

Le mécanisme est identique ; seule la destination des secrets importés diffère.

## Remarques et limitations {#notes-and-limitations}

- La synchronisation n'est prise en charge que pour les types de stockage **externes** (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). Le stockage intégré **Base de données** contient les secrets nativement et n'a rien à synchroniser.
- L'identifiant du stockage distant lui-même (le token ou la clé que Semaphore utilise pour s'authentifier) est stocké de manière sécurisée et séparément des secrets qu'il importe.
- Si la synchronisation est désactivée et qu'aucun chemin ne subsiste, la configuration de synchronisation de ce stockage est effacée.
