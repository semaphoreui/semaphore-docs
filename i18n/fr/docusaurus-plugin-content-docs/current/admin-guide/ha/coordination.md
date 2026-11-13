---
title: Coordination du cluster
description: Comment les nœuds HA de Semaphore se coordonnent via Redis, avec chaque clé, verrou et canal Pub/Sub partagés et la durée de vie de chacun.
---

# Coordination du cluster <Enterprise />

Les nœuds Semaphore ne communiquent jamais directement entre eux. Tout ce sur quoi ils doivent s'accorder passe par Redis : qui est en vie, quelle tâche appartient à quel nœud, qui déclenche une planification et quels messages de l'interface relayer. Chaque élément de cet état est un petit ensemble de clés Redis avec une expiration, de sorte qu'un nœud qui plante ne peut rien laisser derrière lui très longtemps. Les données durables (tâches, modèles, journaux, runners) résident toujours dans la base de données ; Redis ne contient que l'état de coordination.

Toutes les clés utilisent les préfixes fixes `ha:` et `tasks:`. Ils ne sont pas configurables : deux clusters Semaphore partageant un même serveur Redis doivent donc utiliser des numéros de base de données différents (`ha.redis.db`).

## Registre des nœuds {#node-registry}

Chaque nœud s'enregistre au démarrage, puis rafraîchit son enregistrement toutes les 10 secondes. L'enregistrement expire après 30 secondes, de sorte qu'un nœud qui cesse de le rafraîchir est considéré comme mort au bout d'une demi-minute au plus. Lors d'un arrêt propre, le nœud supprime immédiatement son enregistrement.

| Clé | Type | Rôle |
| --- | --- | --- |
| `ha:node:<node_id>` | chaîne, JSON | Heartbeat d'un nœud : `node_id`, `started_at`, `version`, `last_beat`. Expire 30 s après le dernier rafraîchissement. |
| `ha:nodes` | ensemble | Identifiants de tous les nœuds enregistrés. Les membres dont la clé de heartbeat a expiré sont purgés par les autres nœuds. |

Le registre des nœuds est ce qu'affiche le tableau de bord Cluster, et ce que consulte le nettoyeur de tâches orphelines (ci-dessous) pour déterminer si le propriétaire d'une tâche est toujours en vie.

## File d'attente et tâches en cours {#task-queue}

La file d'attente des tâches est partagée : une tâche lancée sur un nœud peut donc être distribuée, surveillée et finalisée par n'importe quel autre. Redis ne stocke que les identifiants des tâches et quelques champs transitoires ; la tâche elle-même est chargée depuis la base de données par le nœud qui en a besoin.

| Clé | Type | Rôle |
| --- | --- | --- |
| `tasks:queue` | liste | Identifiants des tâches en attente de distribution, dans l'ordre. |
| `tasks:claim:<task_id>` | chaîne | Identifiant du nœud propriétaire de la tâche. Écrit de manière atomique en même temps que le retrait de la file d'attente, de sorte qu'une tâche est revendiquée par exactement un nœud. Expire après 5 minutes ; le propriétaire le rafraîchit toutes les minutes. |
| `tasks:running` | ensemble | Identifiants des tâches en cours d'exécution. |
| `tasks:active:<project_id>` | ensemble | Identifiants des tâches actives (en attente ou en cours) dans un projet. Utilisé pour les limites de concurrence par projet. |
| `tasks:task_project` | hash | `task_id` → `project_id`, afin que n'importe quel nœud puisse charger la tâche depuis la base de données. |
| `tasks:aliases` | hash | `alias` → `task_id` pour les tâches désignées par un alias. |
| `tasks:runtime:<task_id>` | hash | Champs qui changent pendant l'exécution de la tâche, comme l'identifiant du runner et l'utilisateur qui l'a lancée. |
| `tasks:finalize:<task_id>` | chaîne | Verrou pris par le nœud qui écrit le résultat final d'une tâche exécutée sur un runner distant. Expire après 5 minutes. |

Les entrées de `tasks:task_project`, `tasks:aliases` et `tasks:runtime:*` sont supprimées à la fin de la tâche et expirent en outre après 7 jours, par sécurité.

Un nœud prend une tâche dans la file d'attente en une seule opération atomique : il vérifie que la tâche est toujours en file d'attente, écrit la revendication, retire la tâche de la file et l'ajoute à l'ensemble des tâches en cours. Si deux nœuds essaient en même temps, un seul réussit.

**Nettoyeur de tâches orphelines.** Une fois par minute, chaque nœud passe en revue les tâches en cours dont le propriétaire est mort, c'est-à-dire dont la revendication a expiré ou dont le heartbeat du propriétaire a disparu. Une tâche que la base de données indique déjà comme terminée est simplement supprimée de Redis. Une tâche qui n'a jamais été confiée à un runner est remise dans la file d'attente afin qu'un nœud vivant la distribue. Une tâche déjà en cours d'exécution sur un runner est laissée telle quelle : le runner continue de travailler, et la tâche est nettoyée une fois que la base de données l'indique comme terminée.

## Verrous {#locks}

Les verrous sont de simples clés créées avec `SET NX` : le nœud qui parvient à créer la clé détient le verrou. Chaque verrou a une expiration, et les verrous détenus longtemps sont rafraîchis par leur propriétaire, de sorte qu'un nœud qui plante libère automatiquement ses verrous.

| Clé | Expiration | Rôle |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Un verrou par planification et par minute. Le nœud qui le crée déclenche la planification ; les autres l'ignorent. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, rafraîchi toutes les 10 s | Un seul nœud fait avancer une exécution de workflow donnée à la fois. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Verrou court pendant la création d'une nouvelle exécution de workflow, afin que deux nœuds ne démarrent pas deux fois le même workflow. |
| `ha:audit:export:<destination_id>` | 30 s, rafraîchi toutes les 10 s | Un seul nœud exporte les événements d'audit vers une destination donnée. Si Redis est indisponible, aucun nœud n'exporte, de sorte que les événements ne sont jamais envoyés deux fois. |

Les verrous de planification et de workflow sont permissifs en cas de panne (fail open) : si Redis est injoignable, le nœud poursuit son travail au lieu de le sauter, et les mises à jour conditionnelles dans la base de données garantissent un résultat correct. Le bail d'export d'audit est au contraire restrictif en cas de panne (fail closed), car un export en double ne peut pas être annulé.

## Canaux Pub/Sub {#pubsub-channels}

| Canal | Rôle |
| --- | --- |
| `ha:ws:broadcast` | Messages WebSocket pour l'interface. Un nœud remet un message à ses propres navigateurs connectés et le publie ici ; les autres nœuds le relaient aux leurs. |
| `tasks:events` | Changements dans la file d'attente et l'ensemble des tâches en cours, mises à jour des champs d'exécution et demandes d'arrêt forcé. Les nœuds utilisent ces événements pour maintenir à jour leur vue en mémoire de la file d'attente et pour arrêter une tâche qu'un autre nœud a demandé d'arrêter. |

Les messages portent l'identifiant du nœud émetteur, de sorte qu'un nœud ignore ses propres messages.

## Clés du cache des runners {#runner-cache-keys}

Les clés `ha:runner:*` appartiennent au cache partagé des enregistrements de runners. Pour plus d'informations, consultez [Cache d'authentification des runners](/admin-guide/ha/runner-cache).

## Pages associées {#related-pages}

- [Haute disponibilité](/admin-guide/ha) — architecture, configuration et mise en place du répartiteur de charge.
- [Cache d'authentification des runners](/admin-guide/ha/runner-cache) — le cache partagé des enregistrements de runners.
