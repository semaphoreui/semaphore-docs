---
title: Cache d'authentification des runners
description: Pourquoi Semaphore met en cache les enregistrements des runners par jeton, comment les nœuds HA partagent le cache via Redis, quand les entrées sont invalidées et ce qui se passe si Redis tombe.
---

# Cache d'authentification des runners

Chaque requête qu'un [runner](/admin-guide/runners) envoie au serveur porte son jeton, et le serveur doit convertir ce jeton en enregistrement de runner avant de pouvoir faire quoi que ce soit d'autre. Les runners interrogent le serveur toutes les quelques secondes et signalent leur progression chaque seconde pendant l'exécution d'un job ; sans cache, chacune de ces requêtes coûterait une requête à la base de données. Le cache des runners répond à la plupart d'entre elles depuis la mémoire.

Un nœud seul conserve le cache dans sa propre mémoire. En mode HA, cela ne suffit pas : si vous modifiez un runner sur le nœud A, le nœud B ne doit pas continuer à servir l'ancien enregistrement. En mode HA, le cache réside donc dans Redis et est partagé par tous les nœuds ; une modification effectuée via n'importe quel nœud est visible par tous immédiatement.

:::note
Ce cache n'a rien à voir avec l'action **Vider le cache** de la page Runners. Cette action demande au runner lui-même de supprimer les répertoires de travail sur sa machine.
:::

## Ce qui est mis en cache et pour combien de temps {#runner-cache-ttl}

La valeur mise en cache est l'enregistrement du runner sans ses tags et sans le jeton. Le jeton n'atteint jamais Redis : la clé est dérivée d'un hachage SHA-256 du jeton, et le champ du jeton est vidé avant le stockage de l'enregistrement.

Une entrée vit au plus 30 secondes. En pratique, elle est supprimée bien plus tôt, car toute modification effectuée via Semaphore invalide le cache immédiatement :

* La création, la mise à jour, la suppression ou le réenregistrement d'un runner, ou la suppression d'un projet, supprime **tous** les runners mis en cache sur tous les nœuds.
* Un heartbeat de runner supprime **uniquement l'entrée de ce runner**, de sorte que l'heure « vu pour la dernière fois » stockée reste à jour sans toucher aux autres. Un heartbeat est écrit au plus une fois par intervalle égal au tiers de `runners.offline_timeout_sec`, plafonné à 45 secondes ; avec le délai par défaut de 120 secondes, c'est toutes les 40 secondes.

L'expiration de 30 secondes n'a d'importance que pour les modifications effectuées en dehors de Semaphore, par exemple en modifiant directement la table `runner` ou en restaurant une sauvegarde.

## Comment les écritures obsolètes sont évitées {#runner-cache-generation}

Une recherche qui ne trouve rien dans le cache lit le runner depuis la base de données, puis le stocke. Entre ces deux étapes, un autre nœud peut modifier le runner. Pour garantir que la recherche ne met jamais en cache ce qu'elle a lu avant la modification, le cache maintient un compteur qui augmente à chaque invalidation. La recherche mémorise la valeur du compteur vue avant d'aller en base de données, et le stockage est rejeté si le compteur a progressé entre-temps. Chaque étape s'exécute sous la forme d'un seul script Lua dans Redis, de sorte que le compteur et l'entrée sont lus et écrits ensemble.

## Clés Redis {#runner-cache-redis-keys}

| Clé | Type | Rôle |
| --- | --- | --- |
| `ha:runner:gen` | chaîne, entier | Le compteur. Augmente de un à chaque invalidation, qu'elle concerne tout le cache ou un seul runner. |
| `ha:runner:inv` | chaîne, entier | Valeur du compteur lors de la dernière invalidation complète. Elle fait partie de chaque clé d'entrée, de sorte qu'une invalidation complète rend toutes les entrées existantes inaccessibles d'un coup ; elles expirent ensuite d'elles-mêmes. |
| `ha:runner:token:<inv>:<sha256(token)>` | chaîne, binaire | L'enregistrement du runner mis en cache. Expire après 30 s. |
| `ha:runner:forgot:<sha256(token)>` | chaîne, entier | Valeur du compteur lors du dernier heartbeat de ce runner. Une recherche commencée avant le heartbeat ne peut pas stocker l'enregistrement antérieur au heartbeat. Expire après 30 s. |

Le tableau de bord Cluster indique le nombre de clés `ha:runner:token:*` comme taille du cache des runners.

## Comportement en cas de problème avec Redis {#runner-cache-failures}

Le cache ne fait jamais échouer une requête de runner. Chaque opération sur le cache est limitée à 500 millisecondes ; si Redis est lent ou injoignable, la recherche est traitée comme un échec de cache et va en base de données, et rien n'est stocké. Le seul cas à connaître est celui d'une invalidation qui échoue parce que Redis est hors service au moment où un runner est modifié : les autres nœuds peuvent alors servir l'ancien enregistrement jusqu'à son expiration, au plus 30 secondes plus tard. L'échec est consigné au niveau erreur.

## Pages associées {#related-pages}

- [Haute disponibilité](/admin-guide/ha) — architecture, configuration et mise en place du répartiteur de charge.
- [Coordination du cluster](/admin-guide/ha/coordination) — les clés, verrous et canaux Redis partagés par les nœuds.
- [Runners](/admin-guide/runners) — enregistrement et configuration des runners.
