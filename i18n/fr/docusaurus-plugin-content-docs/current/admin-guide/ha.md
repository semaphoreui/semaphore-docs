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
* Une instance **Redis** (ou un cluster Redis) accessible depuis tous les nœuds.
* Un **répartiteur de charge** prenant en charge le trafic HTTP et WebSocket.
* Deux serveurs ou plus pour exécuter les instances Semaphore.

Tous les nœuds Semaphore doivent utiliser la même base de données, la même instance Redis et la même configuration (à l'exception de `ha.node_id`, qui doit être unique pour chaque nœud).

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

### Que se passe-t-il si un nœud Semaphore tombe en panne ? {#what-happens-if-one-semaphore-node-fails}

Le répartiteur de charge redirige le trafic vers les nœuds restants. Les tâches en cours continuent sur les autres instances, et les nouvelles tâches sont prises en charge par n'importe quel nœud disponible.

### Puis-je effectuer une mise à l'échelle horizontale ? {#can-i-scale-horizontally}

Oui. Vous pouvez ajouter des nœuds Semaphore derrière le répartiteur de charge pour augmenter la capacité web/API, et ajouter des [runners](/admin-guide/runners) pour augmenter la capacité d'exécution des tâches.
