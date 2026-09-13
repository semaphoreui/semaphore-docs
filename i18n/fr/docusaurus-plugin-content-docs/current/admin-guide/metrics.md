# Métriques

:::info
Le point de terminaison des métriques est disponible depuis **Semaphore version 2.20**. Si vous utilisez une version plus ancienne, effectuez une mise à niveau pour bénéficier de cette fonctionnalité.
:::

Semaphore expose un point de terminaison `GET /api/metrics` au format texte d'exposition standard de Prometheus, de sorte qu'une installation Prometheus + Grafana existante peut superviser le serveur sans aucun outil de sondage externe.

Deux catégories de métriques sont exposées :

- **Métriques de processus :** statistiques du runtime Go et du processus — nombre de goroutines, mémoire (heap/résidente), temps CPU, pauses du GC. Elles sont fournies d'office par les collecteurs Go/processus standard de Prometheus.
- **Métriques de tâches**, propres à la charge de travail de Semaphore :
  - `semaphore_tasks_running` (jauge) : nombre de tâches en cours d'exécution à l'instant présent.
  - `semaphore_tasks_total{status}` (compteur) : nombre total de tâches terminées, ventilé par résultat : `success`, `error`, `stopped`.

Les deux sont mises à jour en temps réel au fur et à mesure que les tâches changent d'état — il n'y a aucun délai de sondage, puisque les compteurs sont mis à jour directement dans l'exécuteur de tâches au moment où le statut d'une tâche change réellement.

## Activer les métriques {#enabling-metrics}

Le point de terminaison est désactivé par défaut et requiert une authentification HTTP Basic avec un identifiant statique de niveau service — non lié à un compte utilisateur, puisque Prometheus ne peut pas effectuer de connexion interactive :

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

Ou à l'aide de variables d'environnement :

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Options des métriques {#metrics-options}

| Paramètre  | Variables d'environnement         | Description |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Active ou désactive le point de terminaison `/api/metrics`. Désactivé par défaut. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Nom d'utilisateur Basic Auth requis pour collecter le point de terminaison. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Mot de passe Basic Auth requis pour collecter le point de terminaison (sensible). |

Si `enabled` reste à `false` (valeur par défaut), ou si les identifiants sont absents ou incorrects, chaque requête vers `/api/metrics` renvoie `401 Unauthorized`.

## Collecte avec Prometheus {#scraping-with-prometheus}

Configurez une tâche de collecte avec `basic_auth` en utilisant les identifiants ci-dessus :

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## Visualiser les métriques dans Grafana {#viewing-metrics-in-grafana}

La vue **Explore** de Grafana vous permet d'exécuter n'importe quelle requête PromQL directement sur les métriques et d'en voir les résultats bruts, sans devoir d'abord construire un tableau de bord :

![Grafana Explore affichant les métriques Semaphore collectées](/assets/semaphore-grafana-explore.png)

Un tableau de bord peut ensuite être construit sur ces mêmes métriques — cet exemple couvre les deux catégories avec quatre panneaux : tâches en cours, total des tâches par résultat, goroutines et mémoire résidente du processus.

![Tableau de bord Grafana avec des panneaux Semaphore](/assets/semaphore-grafana-dashboard.png)
