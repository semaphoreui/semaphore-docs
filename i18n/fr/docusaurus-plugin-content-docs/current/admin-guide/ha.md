---
title: "Haute disponibilité"
---

# Haute disponibilité <Enterprise />

:::info
La haute disponibilité est disponible dans l'édition **Semaphore Enterprise**.
:::

Semaphore UI prend en charge les déploiements en haute disponibilité (HA) actif-actif, dans lesquels plusieurs instances s'exécutent simultanément derrière un répartiteur de charge. Chaque instance est pleinement capable de traiter les requêtes de l'interface, les appels API, les tâches planifiées et l'exécution des tâches. Si une instance tombe en panne, les nœuds restants continuent de fonctionner sans interruption.

## Architecture {#architecture}

Un déploiement actif-actif typique se compose des éléments suivants :

**Répartiteur de charge** — Les utilisateurs se connectent via un répartiteur de charge (par exemple NGINX, HAProxy ou un répartiteur de charge cloud). Le répartiteur de charge distribue le trafic HTTP et WebSocket entre les nœuds Semaphore disponibles.

**Nœuds Semaphore** — Chaque nœud exécute une instance identique de Semaphore UI. N'importe quel nœud peut recevoir des requêtes utilisateur, lancer des tâches d'automatisation, traiter des tâches planifiées et envoyer des mises à jour en temps réel. Tous les nœuds sont égaux : il n'y a ni nœud principal ni nœud de secours.

**Base de données partagée** — Toutes les instances se connectent à une base de données PostgreSQL ou MySQL partagée. La base de données constitue la source unique de vérité pour les projets, les modèles, les inventaires, les planifications, l'historique des tâches, les comptes utilisateurs et la configuration RBAC.

:::warning
SQLite et BoltDB ne sont pas pris en charge pour les déploiements HA. Utilisez PostgreSQL ou MySQL.
:::

**Redis** — Redis fournit la couche de coordination qui permet à plusieurs nœuds de se comporter comme un système unique. Il remplit trois fonctions :

* Les **verrous distribués** garantissent qu'une seule instance exécute une tâche donnée à la fois, ce qui évite les exécutions en double.
* L'**état partagé de la file d'attente des tâches** maintient la file d'attente afin que chaque tâche soit prise en charge par exactement un worker. Tous les nœuds voient la même file d'attente et coordonnent l'exécution.
* La **messagerie Pub/Sub** permet aux nœuds de diffuser des événements tels que les mises à jour de tâches, les notifications du cluster, l'invalidation du cache et les changements d'état de l'interface. Cela maintient tous les nœuds synchronisés en temps réel.

## Prérequis {#prerequisites}

Avant de configurer la HA, vous avez besoin de :

* Une clé d'abonnement **Semaphore Enterprise**.
* Une base de données **PostgreSQL** ou **MySQL** partagée, accessible depuis tous les nœuds.
* Un serveur **Redis**, ou un déploiement **Redis Sentinel**, accessible depuis tous les nœuds. Redis Cluster n'est pas pris en charge.
* Un **répartiteur de charge** prenant en charge le trafic HTTP et WebSocket.
* Deux serveurs ou plus pour exécuter les instances Semaphore.

Tous les nœuds Semaphore doivent utiliser la même base de données, le même backend Redis et la même configuration (à l'exception de `ha.node_id`, qui doit être unique pour chaque nœud).

## Configuration {#configuration}

Activez la HA en ajoutant le bloc `ha` à votre fichier `config.json` sur chaque nœud :

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

Chaque nœud doit avoir un `ha.node_id` unique. Tout le reste de la configuration doit être identique sur tous les nœuds.

### Variables d'environnement {#environment-variables}

Vous pouvez également configurer la HA à l'aide de variables d'environnement :

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Pour survivre à la perte du serveur Redis lui-même, faites pointer le cluster vers un déploiement [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) plutôt que vers une adresse unique. Définissez `ha.engine` sur `redis_sentinel` et décrivez la configuration Sentinel dans `ha.redis_sentinel` :

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

Chaque nœud demande aux sentinelles quel est le maître actuel et suit un basculement sans redémarrage : une tâche en cours d'exécution au moment du changement de maître continue de s'exécuter, et les nouvelles tâches, les planifications et les mises à jour en temps réel se poursuivent sur la réplique promue.

La même configuration avec des variables d'environnement (la liste des sentinelles est un tableau JSON) :

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Remarques :

* `ha.engine` détermine quel bloc est lu. `redis` (la valeur par défaut) lit `ha.redis` ; `redis_sentinel` lit `ha.redis_sentinel`. L'autre bloc, s'il est présent, est ignoré et un avertissement est consigné au démarrage.
* Avec `redis_sentinel`, `master_name` et au moins une adresse dans `addrs` sont obligatoires ; le nœud refuse de démarrer sans eux.
* `user` et `pass` servent à s'authentifier auprès des nœuds de données Redis. Si les sentinelles elles-mêmes exigent une authentification (`requirepass` dans `sentinel.conf`), définissez également `sentinel_user` et `sentinel_pass`.
* `tls` et `tls_skip_verify` s'appliquent à la fois aux connexions Sentinel et aux connexions vers les nœuds de données Redis.

### Référence de configuration {#configuration-reference}

| Option du fichier de configuration | Variable d'environnement | Description |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Active le mode haute disponibilité. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Identifiant unique de ce nœud. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Adresse du serveur Redis (par exemple `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Numéro de la base de données Redis. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Mot de passe du serveur Redis. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Nom d'utilisateur du serveur Redis. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Active TLS pour la connexion Redis. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Ignore la vérification du certificat TLS pour Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Backend Redis : `redis` (serveur unique, par défaut) ou `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Nom du maître surveillé, tel que configuré dans Sentinel. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Adresses des sentinelles, `host:port`. Tableau JSON dans la variable d'environnement. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Nom d'utilisateur des nœuds Sentinel eux-mêmes. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Mot de passe des nœuds Sentinel eux-mêmes. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Numéro de la base de données Redis sur les nœuds de données. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Nom d'utilisateur des nœuds de données Redis. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Mot de passe des nœuds de données Redis. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Active TLS pour les connexions Sentinel et Redis. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Ignore la vérification du certificat TLS pour les connexions Sentinel et Redis. |

Consultez [Configuration](/admin-guide/configuration) pour la liste complète des options disponibles.

## Répartiteur de charge {#load-balancer}

Placez un répartiteur de charge devant les nœuds Semaphore pour distribuer le trafic. Le répartiteur de charge doit prendre en charge les **connexions WebSocket** pour les mises à jour en temps réel de l'interface.

### Exemple NGINX {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

Consultez [Proxy inverse](/admin-guide/reverse-proxy/nginx) pour plus de détails sur la configuration de NGINX.

## Fonctionnement de l'exécution des tâches {#how-job-execution-works}

Dans un déploiement multi-nœuds, l'exécution des tâches suit un flux coordonné :

1. **L'utilisateur déclenche une tâche.** Un utilisateur lance une tâche via l'interface ou l'API. La requête peut arriver sur n'importe quel nœud Semaphore.
2. **Les métadonnées de la tâche sont enregistrées.** Le nœud qui reçoit la requête écrit les métadonnées de la tâche dans la base de données et signale le travail via Redis.
3. **Un nœud prend la tâche en charge.** L'un des nœuds disponibles récupère la tâche depuis Redis, acquiert un verrou distribué et la marque comme en cours d'exécution dans la base de données.
4. **La tâche s'exécute.** Le nœud exécute la tâche localement ou la délègue à un [runner distant](/admin-guide/runners). La progression et les journaux sont écrits dans la base de données.
5. **Les résultats sont diffusés.** Les mises à jour de la tâche se propagent via Redis Pub/Sub afin que tous les nœuds et les clients connectés à l'interface restent synchronisés.

## Fonctionnement interne de la HA {#under-the-hood}

Les nœuds Semaphore ne communiquent jamais directement entre eux. Tout ce sur quoi ils doivent s'accorder passe par Redis : qui est en vie, quelle tâche appartient à quel nœud, qui déclenche une planification et quels messages de l'interface relayer. Chaque élément de cet état est un petit ensemble de clés Redis avec une expiration, de sorte qu'un nœud qui plante ne peut rien laisser derrière lui très longtemps. Les données durables (tâches, modèles, journaux, runners) résident toujours dans la base de données ; Redis ne contient que l'état de coordination.

Toutes les clés utilisent les préfixes fixes `ha:` et `tasks:`. Ils ne sont pas configurables : deux clusters Semaphore partageant un même serveur Redis doivent donc utiliser des numéros de base de données différents (`ha.redis.db`).

### Registre des nœuds {#node-registry}

Chaque nœud s'enregistre au démarrage, puis rafraîchit son enregistrement toutes les 10 secondes. L'enregistrement expire après 30 secondes, de sorte qu'un nœud qui cesse de le rafraîchir est considéré comme mort au bout d'une demi-minute au plus. Lors d'un arrêt propre, le nœud supprime immédiatement son enregistrement.

| Clé | Type | Rôle |
| --- | --- | --- |
| `ha:node:<node_id>` | chaîne, JSON | Heartbeat d'un nœud : `node_id`, `started_at`, `version`, `last_beat`. Expire 30 s après le dernier rafraîchissement. |
| `ha:nodes` | ensemble | Identifiants de tous les nœuds enregistrés. Les membres dont la clé de heartbeat a expiré sont purgés par les autres nœuds. |

Le registre des nœuds est ce qu'affiche le tableau de bord Cluster, et ce que consulte le nettoyeur de tâches orphelines (ci-dessous) pour déterminer si le propriétaire d'une tâche est toujours en vie.

### File d'attente et tâches en cours {#task-queue}

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

### Verrous {#locks}

Les verrous sont de simples clés créées avec `SET NX` : le nœud qui parvient à créer la clé détient le verrou. Chaque verrou a une expiration, et les verrous détenus longtemps sont rafraîchis par leur propriétaire, de sorte qu'un nœud qui plante libère automatiquement ses verrous.

| Clé | Expiration | Rôle |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Un verrou par planification et par minute. Le nœud qui le crée déclenche la planification ; les autres l'ignorent. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, rafraîchi toutes les 10 s | Un seul nœud fait avancer une exécution de workflow donnée à la fois. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Verrou court pendant la création d'une nouvelle exécution de workflow, afin que deux nœuds ne démarrent pas deux fois le même workflow. |
| `ha:audit:export:<destination_id>` | 30 s, rafraîchi toutes les 10 s | Un seul nœud exporte les événements d'audit vers une destination donnée. Si Redis est indisponible, aucun nœud n'exporte, de sorte que les événements ne sont jamais envoyés deux fois. |

Les verrous de planification et de workflow sont permissifs en cas de panne (fail open) : si Redis est injoignable, le nœud poursuit son travail au lieu de le sauter, et les mises à jour conditionnelles dans la base de données garantissent un résultat correct. Le bail d'export d'audit est au contraire restrictif en cas de panne (fail closed), car un export en double ne peut pas être annulé.

### Canaux Pub/Sub {#pubsub-channels}

| Canal | Rôle |
| --- | --- |
| `ha:ws:broadcast` | Messages WebSocket pour l'interface. Un nœud remet un message à ses propres navigateurs connectés et le publie ici ; les autres nœuds le relaient aux leurs. |
| `tasks:events` | Changements dans la file d'attente et l'ensemble des tâches en cours, mises à jour des champs d'exécution et demandes d'arrêt forcé. Les nœuds utilisent ces événements pour maintenir à jour leur vue en mémoire de la file d'attente et pour arrêter une tâche qu'un autre nœud a demandé d'arrêter. |

Les messages portent l'identifiant du nœud émetteur, de sorte qu'un nœud ignore ses propres messages.

### Clés du cache des runners {#runner-cache-keys}

Les clés `ha:runner:*` appartiennent au [cache des runners](#runner-cache), décrit dans la section suivante.

## Cache des runners {#runner-cache}

Chaque requête qu'un [runner](/admin-guide/runners) envoie au serveur porte son jeton, et le serveur doit convertir ce jeton en enregistrement de runner avant de pouvoir faire quoi que ce soit d'autre. Les runners interrogent le serveur toutes les quelques secondes et signalent leur progression chaque seconde pendant l'exécution d'un job ; sans cache, chacune de ces requêtes coûterait une requête à la base de données. Le cache des runners répond à la plupart d'entre elles depuis la mémoire.

Un nœud seul conserve le cache dans sa propre mémoire. En mode HA, cela ne suffit pas : si vous modifiez un runner sur le nœud A, le nœud B ne doit pas continuer à servir l'ancien enregistrement. En mode HA, le cache réside donc dans Redis et est partagé par tous les nœuds ; une modification effectuée via n'importe quel nœud est visible par tous immédiatement.

:::note
Ce cache n'a rien à voir avec l'action **Vider le cache** de la page Runners. Cette action demande au runner lui-même de supprimer les répertoires de travail sur sa machine.
:::

### Ce qui est mis en cache et pour combien de temps {#runner-cache-ttl}

La valeur mise en cache est l'enregistrement du runner sans ses tags et sans le jeton. Le jeton n'atteint jamais Redis : la clé est dérivée d'un hachage SHA-256 du jeton, et le champ du jeton est vidé avant le stockage de l'enregistrement.

Une entrée vit au plus 30 secondes. En pratique, elle est supprimée bien plus tôt, car toute modification effectuée via Semaphore invalide le cache immédiatement :

* La création, la mise à jour, la suppression ou le réenregistrement d'un runner, ou la suppression d'un projet, supprime **tous** les runners mis en cache sur tous les nœuds.
* Un heartbeat de runner supprime **uniquement l'entrée de ce runner**, de sorte que l'heure « vu pour la dernière fois » stockée reste à jour sans toucher aux autres. Un heartbeat est écrit au plus une fois par intervalle égal au tiers de `runners.offline_timeout_sec`, plafonné à 45 secondes ; avec le délai par défaut de 120 secondes, c'est toutes les 40 secondes.

L'expiration de 30 secondes n'a d'importance que pour les modifications effectuées en dehors de Semaphore, par exemple en modifiant directement la table `runner` ou en restaurant une sauvegarde.

### Comment les écritures obsolètes sont évitées {#runner-cache-generation}

Une recherche qui ne trouve rien dans le cache lit le runner depuis la base de données, puis le stocke. Entre ces deux étapes, un autre nœud peut modifier le runner. Pour garantir que la recherche ne met jamais en cache ce qu'elle a lu avant la modification, le cache maintient un compteur qui augmente à chaque invalidation. La recherche mémorise la valeur du compteur vue avant d'aller en base de données, et le stockage est rejeté si le compteur a progressé entre-temps. Chaque étape s'exécute sous la forme d'un seul script Lua dans Redis, de sorte que le compteur et l'entrée sont lus et écrits ensemble.

### Clés Redis {#runner-cache-redis-keys}

| Clé | Type | Rôle |
| --- | --- | --- |
| `ha:runner:gen` | chaîne, entier | Le compteur. Augmente de un à chaque invalidation, qu'elle concerne tout le cache ou un seul runner. |
| `ha:runner:inv` | chaîne, entier | Valeur du compteur lors de la dernière invalidation complète. Elle fait partie de chaque clé d'entrée, de sorte qu'une invalidation complète rend toutes les entrées existantes inaccessibles d'un coup ; elles expirent ensuite d'elles-mêmes. |
| `ha:runner:token:<inv>:<sha256(token)>` | chaîne, binaire | L'enregistrement du runner mis en cache. Expire après 30 s. |
| `ha:runner:forgot:<sha256(token)>` | chaîne, entier | Valeur du compteur lors du dernier heartbeat de ce runner. Une recherche commencée avant le heartbeat ne peut pas stocker l'enregistrement antérieur au heartbeat. Expire après 30 s. |

Le tableau de bord Cluster indique le nombre de clés `ha:runner:token:*` comme taille du cache des runners.

### Comportement en cas de problème avec Redis {#runner-cache-failures}

Le cache ne fait jamais échouer une requête de runner. Chaque opération sur le cache est limitée à 500 millisecondes ; si Redis est lent ou injoignable, la recherche est traitée comme un échec de cache et va en base de données, et rien n'est stocké. Le seul cas à connaître est celui d'une invalidation qui échoue parce que Redis est hors service au moment où un runner est modifié : les autres nœuds peuvent alors servir l'ancien enregistrement jusqu'à son expiration, au plus 30 secondes plus tard. L'échec est consigné au niveau erreur.

## Mise à l'échelle avec des runners {#scaling-with-runners}

La HA permet également une mise à l'échelle horizontale de l'exécution des tâches. Au lieu d'exécuter les tâches uniquement sur les nœuds Semaphore eux-mêmes, l'exécution peut être déléguée à plusieurs [runners](/admin-guide/runners). Cela vous permet de :

* Répartir la charge de travail sur votre infrastructure.
* Faire évoluer la capacité d'automatisation indépendamment de la couche web/API.
* Isoler les environnements d'exécution pour limiter le rayon d'impact.
* Exécuter des tâches en parallèle sur de nombreux nœuds.

Consultez [Runners](/admin-guide/runners) pour les instructions de configuration.

## Avantages {#benefits}

* **Fiabilité accrue** — Si une instance tombe en panne, les autres continuent de servir le trafic et d'exécuter les tâches.
* **Maintenance sans interruption** — Les nœuds peuvent être mis à jour ou redémarrés individuellement sans arrêter le système.
* **Évolutivité horizontale** — Ajoutez des nœuds Semaphore derrière le répartiteur de charge pour augmenter la capacité.
* **Aucune dépendance à un nœud principal** — Tous les nœuds sont égaux, ce qui élimine les mécanismes complexes de basculement.
* **État du cluster cohérent** — La base de données partagée et la coordination via Redis maintiennent toutes les instances synchronisées.

## FAQ {#faq}

### Qu'est-ce que la haute disponibilité actif-actif ? {#what-is-active-active-high-availability}

La HA actif-actif signifie que plusieurs instances de l'application s'exécutent simultanément et que toutes servent des requêtes. Il n'y a pas de nœud principal : n'importe quelle instance peut traiter le trafic et exécuter des tâches.

### Pourquoi Semaphore utilise-t-il Redis en mode HA ? {#why-does-semaphore-use-redis-in-ha-mode}

Redis sert de couche de coordination entre les instances. Il fournit des verrous distribués, un état partagé de la file d'attente des tâches et une messagerie Pub/Sub afin de garantir que les nœuds n'exécutent pas la même tâche simultanément.

### Quelle base de données utiliser pour les déploiements HA ? {#what-database-should-i-use-for-ha-deployments}

Semaphore prend en charge PostgreSQL et MySQL comme base de données partagée. SQLite et BoltDB ne peuvent pas être utilisés en mode HA, car ils ne prennent pas en charge l'accès concurrent depuis plusieurs processus.

### Que se passe-t-il si Redis tombe en panne ? {#what-happens-if-redis-fails}

Avec un serveur Redis unique (`ha.engine: redis`), les nœuds ne peuvent plus se coordonner jusqu'au retour de Redis. Avec [Redis Sentinel](#redis-sentinel), les sentinelles promeuvent une réplique et chaque nœud Semaphore y bascule automatiquement, généralement en quelques secondes, sans redémarrage.

### Que se passe-t-il si un nœud Semaphore tombe en panne ? {#what-happens-if-one-semaphore-node-fails}

Le répartiteur de charge redirige le trafic vers les nœuds restants. Les tâches en cours continuent sur les autres instances, et les nouvelles tâches sont prises en charge par n'importe quel nœud disponible.

### Puis-je effectuer une mise à l'échelle horizontale ? {#can-i-scale-horizontally}

Oui. Vous pouvez ajouter des nœuds Semaphore derrière le répartiteur de charge pour augmenter la capacité web/API, et ajouter des [runners](/admin-guide/runners) pour augmenter la capacité d'exécution des tâches.
