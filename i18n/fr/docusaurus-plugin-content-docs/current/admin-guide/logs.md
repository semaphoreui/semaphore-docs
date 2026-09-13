# Journaux

Semaphore écrit les journaux du serveur sur **stdout** et stocke les journaux des **tâches** et de l'**activité** dans une **base de données**, ce qui centralise les informations de journalisation essentielles et évite d'avoir à sauvegarder séparément des fichiers journaux. Les seules données stockées sur le système de fichiers sont les données de cache.

---

## Journal du serveur {#server-log}

Semaphore n'écrit pas de journaux dans des fichiers. Tous les journaux de l'application sont écrits sur **stdout**.  
Si Semaphore s'exécute en tant que service systemd, vous pouvez consulter les journaux avec la commande suivante :

```bash
journalctl -u semaphore.service -f
```

Si Semaphore s'exécute dans un conteneur Docker, vous pouvez consulter les journaux avec la commande suivante :
```
docker logs -f my-semaphore-container
```

Cela fournit une vue en direct (en flux continu) des journaux.

---

## Journal d'activité {#activity-log}

Le journal d'activité enregistre les actions effectuées par les utilisateurs dans Semaphore, notamment :

- L'ajout ou la suppression de ressources (par ex. modèles, inventaires, dépôts).
- L'ajout ou la suppression de membres d'équipe.

### Version Pro 2.10 et ultérieures {#pro-version-210-and-later}

**Semaphore Pro** 2.10+ prend en charge l'écriture du journal d'activité et du journal des tâches dans un fichier. Pour l'activer, ajoutez la configuration suivante à votre `config.json` :

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


Ou vous pouvez le faire à l'aide des variables d'environnement suivantes :

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Options de journalisation de l'activité (événements) {#activity-events-logging-options}

Les options de journalisation de l'activité (événements) vous permettent de configurer la manière dont Semaphore enregistre les actions des utilisateurs et les événements système dans un fichier. Ces paramètres contrôlent le comportement de la journalisation des événements, notamment son activation, le format des entrées de journal et la configuration spécifique du logger. Une fois activée, les actions des utilisateurs comme la création de modèles ou la gestion des équipes seront écrites dans le fichier journal spécifié conformément à ces paramètres.

| Paramètre             | Variables d'environnement | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Active la journalisation des événements dans un fichier. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Format des enregistrements du journal. Laissez vide pour le format raw ou définissez `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Options du logger](#logger-options). |

#### Options de journalisation des tâches {#tasks-logging-options}

Les options de journalisation des tâches vous permettent de configurer la manière dont Semaphore enregistre les détails d'exécution des tâches dans un fichier. Ces paramètres contrôlent la journalisation des événements liés aux tâches, notamment leur démarrage, leur achèvement et leur statut d'exécution. Une fois activée, toutes les opérations sur les tâches et leurs résultats seront écrits dans le fichier journal spécifié conformément à ces paramètres, fournissant ainsi une piste d'audit détaillée de l'historique d'exécution des tâches.

| Paramètre             | Variables d'environnement | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Active la journalisation des tâches dans un fichier. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Format des enregistrements du journal. Laissez vide pour le format raw ou définissez `json`. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Options du logger](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Options du logger. |



#### Options du logger {#logger-options}

| Paramètre             | Type | Description           |
| --------------------- | ------- | --------------------- |
| `filename`     | Chaîne  | Chemin et nom du fichier dans lequel écrire les journaux. Les fichiers journaux de sauvegarde sont conservés dans le même répertoire. Si vide, `processname`-lumberjack.log est utilisé dans le répertoire temporaire. |
| `maxsize`      | Entier | Taille maximale, en mégaoctets, du fichier journal avant sa rotation. La valeur par défaut est de 100 mégaoctets. |
| `maxage`       | Entier | Nombre maximal de jours pendant lesquels conserver les anciens fichiers journaux, d'après l'horodatage encodé dans leur nom de fichier. Notez qu'un jour est défini comme 24 heures et peut ne pas correspondre exactement aux jours calendaires en raison de l'heure d'été, des secondes intercalaires, etc. Par défaut, les anciens fichiers journaux ne sont pas supprimés en fonction de leur âge. |
| `maxbackups`   | Entier | Nombre maximal d'anciens fichiers journaux à conserver. Par défaut, tous les anciens fichiers journaux sont conservés (bien que MaxAge puisse tout de même entraîner leur suppression). |
| `localtime`    | Booléen | Détermine si l'heure utilisée pour formater les horodatages des fichiers de sauvegarde est l'heure locale de l'ordinateur. Par défaut, l'heure UTC est utilisée. |
| `compress`     | Booléen | Détermine si les fichiers journaux ayant subi une rotation doivent être compressés avec gzip. Par défaut, aucune compression n'est effectuée. |



Chaque ligne du fichier suit ce format :

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Historique des tâches {#task-history}

Semaphore stocke les informations sur l'exécution des tâches dans la base de données. L'historique des tâches offre une vue détaillée de toutes les tâches exécutées, y compris leur statut et leurs journaux. Vous pouvez suivre les tâches en temps réel ou consulter les journaux historiques via l'interface web.

### Configurer la rétention des tâches {#configuring-task-retention}

Par défaut, Semaphore stocke toutes les tâches dans la base de données. Si vous exécutez un grand nombre de tâches, elles peuvent occuper un espace disque important.

Vous pouvez configurer le nombre de tâches conservées par modèle en utilisant l'une des approches suivantes :

1. **Variable d'environnement**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **Option de `config.json`**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

Lorsque le nombre de tâches dépasse cette limite, les journaux de tâches les plus anciens sont automatiquement supprimés.

---

## Prise en charge du protocole syslog {#syslog-protocol-support}

Semaphore peut transférer les entrées du journal d'activité et du journal des tâches vers un collecteur syslog externe pour un stockage à long terme ou une supervision centralisée. Le transfert syslog est désactivé par défaut.

Configurez la prise en charge de syslog dans `config.json` :

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

Les mêmes options sont disponibles via des variables d'environnement si vous préférez ne pas modifier le fichier JSON :

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Options syslog {#syslog-options}

| Paramètre             | Variables d'environnement | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Active ou désactive le transfert syslog. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protocole utilisé pour joindre le collecteur, par exemple `udp` ou `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Adresse du collecteur au format `host:port`. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Identifiant facultatif ajouté en préfixe de chaque message. |


Redémarrez le service Semaphore après avoir modifié ces valeurs afin que la nouvelle destination syslog soit appliquée.

---

## Intégration SIEM {#siem-integration}

Semaphore 2.20+ enregistre une piste d'audit de sécurité adaptée au transfert vers un SIEM (Splunk, Elastic Security, QRadar, Wazuh, etc.).

Chaque événement d'audit inclut l'**action** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), l'**adresse IP du client** et le **user agent**, en plus de l'utilisateur à l'origine de l'action et de l'objet concerné. Outre les modifications de ressources, Semaphore journalise :

- Les connexions réussies (mot de passe, LDAP et OpenID), les déconnexions, les tentatives de connexion échouées et les vérifications MFA échouées.
- La création, la modification et la suppression de comptes utilisateur ainsi que les changements de mot de passe.
- La création et la suppression de tokens d'API (seul le court préfixe du token est journalisé, jamais le secret).

Il existe trois façons de transmettre les événements d'audit à votre SIEM :

1. **Pull :** lire `/api/events` (voir la [documentation de l'API](/reference/api)).
2. **Collecteur de fichiers :** activer le fichier du journal d'activité (Pro, voir ci-dessus) et expédier `events.log` (format JSON recommandé) avec Filebeat, Fluentd ou un Splunk Universal Forwarder.
3. **Webhook d'audit (Pro) :** pousser les événements en temps réel via HTTPS — vers un point de terminaison JSON générique ou un Splunk HTTP Event Collector.

### Webhook d'audit {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

Ou à l'aide de variables d'environnement :

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Options du webhook d'audit {#audit-webhook-options}

| Paramètre             | Variables d'environnement | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Active ou désactive le transfert des événements d'audit. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | URL complète du point de terminaison récepteur. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Format de la charge utile : vide pour du JSON brut ou `splunk_hec` pour une enveloppe Splunk HEC. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | En-têtes HTTP supplémentaires, par ex. le token HEC : `{"Authorization": "Splunk <token>"}`. |

La livraison est asynchrone : les événements sont mis en file d'attente en mémoire et réessayés jusqu'à trois fois avec un délai croissant, de sorte qu'un récepteur indisponible ne ralentit ni ne fait jamais échouer les requêtes des utilisateurs. Si le récepteur reste indisponible, les événements en file d'attente sont abandonnés avec un avertissement dans le journal du serveur.

## Résumé {#summary}

- **Journal du serveur :** écrit sur stdout ; consultable via `journalctl` en cas d'exécution sous systemd.  
- **Journal d'activité et des tâches :** suit toutes les actions des utilisateurs. En option, **Pro 2.10+** peut les écrire dans un fichier.  
- **Historique des tâches :** stocke les journaux d'exécution des tâches en temps réel et historiques. La rétention est configurable par modèle.

En suivant ces recommandations, vous disposez d'une visibilité adéquate sur le fonctionnement de Semaphore UI tout en maîtrisant l'utilisation du stockage et la rétention des journaux.
