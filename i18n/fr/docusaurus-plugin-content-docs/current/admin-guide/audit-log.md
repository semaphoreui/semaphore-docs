---
title: Journal d'audit
description: Activez le journal d'audit pour savoir qui a fait quoi dans Semaphore, et envoyez les événements d'audit de Semaphore Pro vers un SIEM via Syslog ou HEC.
---

# Journal d'audit

Le journal d'audit garde une trace des actions importantes dans Semaphore : qui s'est connecté, qui a
modifié un utilisateur ou un rôle, qui a créé un jeton d'API. Chaque événement indique qui a agi, quand,
depuis quelle adresse et si l'action a réussi. Utilisez-le pour comprendre ce qui s'est passé sur votre
installation, ou envoyez les événements vers votre SIEM pour les conserver avec le reste de vos journaux.

Le journal d'audit est disponible dans toutes les éditions. Le filtrage, l'export du journal sous forme de fichier et l'envoi vers un SIEM nécessitent Semaphore Pro.

## Ce qui est enregistré {#recorded-events}

Semaphore enregistre actuellement les connexions, l'activité des comptes, celle des projets et celle des tâches :

- les connexions, les tentatives de connexion échouées, les déconnexions et les vérifications du second
  facteur ;
- les jetons d'API refusés, les requêtes refusées et les requêtes intersites bloquées ;
- les modifications des utilisateurs, des mots de passe, de l'authentification à deux facteurs, des
  identités externes et des jetons d'API ;
- les modifications des membres de projet, des rôles et des permissions de modèles ;
- les modifications des projets, inventaires, dépôts, modèles, planifications, intégrations, configurations
  d'hôtes, environnements, identifiants et stockages de secrets, ainsi que les exports et restaurations de
  sauvegardes de projet ;
- les modifications des paramètres système et l'activation de la licence Pro ;
- démarrages de tâches avec leur déclencheur (API, planification, intégration, exécution automatique, workflow), approbations, arrêts,
  fins et historique de tâches supprimé ;
- modifications des runners, enregistrements (y compris les jetons d'enregistrement refusés), désenregistrements et rapports de runners
  avec un statut invalide ;
- exports du journal d'audit sous forme de fichier ;
- chaque démarrage du serveur.

Pour la liste complète, consultez
[Événements d'audit](/reference/audit-events).

Les mots de passe, les jetons, les valeurs secrètes et la sortie des tâches n'apparaissent jamais dans les
événements d'audit. Les jetons d'API sont identifiés par une empreinte plutôt que par leur valeur. Une
connexion échouée conserve l'identifiant saisi, qui peut donc contenir une adresse e-mail.

Dans l'événement de fin d'une tâche, `metadata.result` indique le
statut que Semaphore a donné à la tâche, et `metadata.end_reason` indique pourquoi Semaphore l'a terminée : `timeout` lorsqu'elle a duré
trop longtemps, `runner_lost` lorsque son runner a cessé de répondre. Les arguments de la tâche, les variables, les étiquettes de runner et les jetons
ne sont pas enregistrés.

Pendant une mise à niveau progressive d'un cluster HA, une tâche démarrée sur un nœud mis à niveau et terminée sur un nœud qui
n'est pas encore mis à niveau n'a pas d'événement de fin.

Les URL de dépôts, les URL de configurations d'hôtes et les alias d'intégrations ne sont pas enregistrés non plus.

Il arrive que Semaphore enregistre ou supprime un objet, mais qu'une partie ultérieure de la même requête
échoue. L'interface ou l'API affiche alors une erreur, alors que l'objet a bien été créé ou supprimé. Un tel
événement est enregistré comme un succès avec `metadata.partial=true`, et `reason` indique ce qui n'a pas abouti :

- `secret_failed` : un environnement a été enregistré ou supprimé, mais certains de ses secrets n'ont pas été
  enregistrés ou pas retirés ;
- `inventory_failed` : un modèle a été créé, mais pas son inventaire de workspace Terraform ;
- `restore_failed` : un projet a été restauré depuis une sauvegarde, mais pas tous ses objets ;
- `setup_failed` : un projet a été créé, mais pas entièrement configuré ; par exemple, son créateur n'a pas été
  ajouté comme propriétaire.

## Activer le journal d'audit {#enable}

Le journal d'audit est désactivé par défaut. Pour l'activer, définissez `audit.enabled` et donnez un nom à
votre installation dans `audit.instance_id` :

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Ou avec des variables d'environnement :

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

L'ID d'instance compte de 1 à 255 caractères sans espaces. Il est ajouté à chaque événement, ce qui permet
de distinguer vos installations lorsqu'elles envoient leurs événements au même endroit.

Redémarrez Semaphore. L'enregistrement commence après le redémarrage ; les actions antérieures ne sont pas
ajoutées. Pour toutes les options, consultez [Options de configuration](/reference/configuration#audit-log).

## Enregistrer l'adresse du client derrière un proxy {#trusted-proxies}

Si Semaphore fonctionne derrière un proxy inverse, les événements affichent l'adresse du proxy au lieu de
celle de l'utilisateur. Pour enregistrer la véritable adresse du client, indiquez les réseaux de vos proxys
dans `audit.trusted_proxy_cidrs` :

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Ou avec des variables d'environnement :

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore lit alors l'adresse du client dans `X-Forwarded-For` ou `X-Real-IP`, mais uniquement pour les
requêtes provenant de ces réseaux. Si les requêtes traversent plusieurs proxys, indiquez-les tous.
N'ajoutez pas les réseaux depuis lesquels vos utilisateurs se connectent : n'importe qui dans ces réseaux
pourrait mettre n'importe quelle adresse dans ces en-têtes.

## Consulter le journal d'audit {#view}

Les administrateurs ouvrent **Audit log** depuis le menu utilisateur. Les événements les plus récents viennent en premier, 50 par page.

![Le journal d'audit, événements les plus récents en premier](/assets/audit-log-list.png)

Cliquez sur un événement pour voir tous ses champs. Le bouton de copie copie l'événement dans le format que
Semaphore envoie à un SIEM.

![Un événement avec tous ses champs](/assets/audit-log-card.png)

### Filtrer et exporter <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtrez par période, utilisateur, type d'événement, résultat, projet ou adresse IP. Dans un événement,
l'utilisateur, l'adresse, l'objet et le projet sont des liens qui filtrent le journal selon eux.

![Le journal filtré par l'adresse d'un événement](/assets/audit-log-filters.png)

Quand une combinaison de filtres trouve peu d'événements, Semaphore cherche deux secondes à la fois et indique
jusqu'où il est remonté. Cliquez sur **Search older** pour continuer.

**Export** enregistre tous les événements qui correspondent aux filtres dans un fichier CSV ou JSON Lines. Chaque
export est enregistré comme un événement `audit.log/export`.

![Export en CSV ou JSON Lines](/assets/audit-log-export.png)

Sans Semaphore Pro, les filtres et l'export sont visibles mais désactivés.

![Le journal d'audit dans l'édition Community](/assets/audit-log-community.png)

## Stockage {#storage}

Les événements sont stockés dans la base de données de Semaphore, vos sauvegardes habituelles les incluent
donc.
Par défaut, Semaphore conserve tous les événements. Pour
supprimer les anciens événements, définissez une durée de conservation en jours :

```json
{
  "audit": {
    "retention_days": 365
  }
}
```

Ou avec une variable d'environnement : `SEMAPHORE_AUDIT_RETENTION_DAYS=365`.

Semaphore supprime les anciens événements une fois par heure et enregistre un événement `audit.retention/delete` avec
le nombre d'événements supprimés. Si vous exportez les événements vers un SIEM, choisissez une durée plus longue que
la plus longue panne du SIEM que vous voulez absorber : les événements plus anciens que cette durée sont supprimés
même s'ils n'ont pas été envoyés.

La rétention s'exécute aussi au démarrage de Semaphore. Dans une installation HA, utilisez le même `retention_days` sur chaque nœud.

Le journal d'audit ne gêne jamais vos utilisateurs. Si un événement ne peut pas être enregistré, Semaphore
écrit une erreur dans le journal du serveur et l'action se poursuit normalement.

## Exporter vers un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro peut envoyer les événements d'audit à un récepteur Syslog via TLS, comme rsyslog ou Vector, et à
tout récepteur du protocole Splunk HTTP Event Collector (HEC), comme Splunk, Vector, Fluent Bit,
l'OpenTelemetry Collector ou Cribl. Vous pouvez configurer une destination Syslog et une destination HEC, ou
les deux à la fois.

Il vous faut :

- le nom d'hôte et le port du récepteur ;
- un nom pour cette destination, par exemple `security-syslog` ;
- le certificat de l'autorité de certification du récepteur, si l'hôte Semaphore ne lui fait pas encore
  confiance.

Ajoutez `audit.syslog` à `config.json` :

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

Ou avec des variables d'environnement :

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` et `address` sont obligatoires. Semaphore retient les événements déjà envoyés à chaque destination :
gardez donc le même `id` lorsque vous changez l'adresse ou le certificat. Un nouvel `id` commence avec les
nouveaux événements.

Semaphore vérifie toujours le certificat du récepteur et utilise TLS 1.2 ou une version plus récente.
`ca_file` ajoute votre autorité de certification aux certificats de confiance, et `server_name` définit le
nom à vérifier dans le certificat lorsqu'il diffère de l'adresse.

Redémarrez Semaphore. Si les paramètres sont invalides ou si le fichier de l'autorité de certification ne
peut pas être lu, Semaphore ne démarre pas.

### Vérifier que les événements arrivent {#verify-siem-delivery}

Semaphore enregistre un événement à chaque démarrage. Après le redémarrage, cherchez-le sur le récepteur :
`event_code` vaut `audit.lifecycle`, `action` vaut `start` et `metadata.destinations` contient l'ID de votre
destination.

### Envoyer les événements via HEC {#hec}

Il vous faut l'URL du point de terminaison HEC, un jeton HEC, un nom pour cette destination, par exemple
`security-hec`, et le certificat de l'autorité de certification du récepteur si l'hôte Semaphore ne lui fait
pas déjà confiance.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

Ou avec des variables d'environnement :

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN='<HEC token>'
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`, `url` et `token` sont obligatoires, et l'URL doit commencer par `https://`. Utilisez un `id` différent de
celui de Syslog. `source` et `sourcetype` valent par défaut `semaphore` et `semaphore:audit`. Les certificats
sont vérifiés comme pour Syslog, et les variables standard `HTTPS_PROXY` et `NO_PROXY` s'appliquent.

Semaphore envoie jusqu'à 100 événements par requête. Le champ `event` de chaque événement HEC contient le JSON
de l'événement d'audit, `time` est l'heure de l'événement et `host` est l'ID du nœud HA, ou l'ID d'instance
sur un seul nœud.

Redémarrez Semaphore, puis vérifiez que les événements arrivent comme décrit [plus haut](#verify-siem-delivery).

### Comment les événements sont livrés {#delivery}

- Si le récepteur est indisponible, les événements attendent dans la base de données et sont envoyés à son
  retour. Les utilisateurs ne remarquent rien.
- Après des erreurs réseau, des redémarrages ou une bascule HA, certains événements peuvent arriver en
  double. Utilisez `event_id` pour écarter les doublons et `seq` pour remettre les événements dans l'ordre.
- Avec Syslog, si une connexion se coupe sans erreur, l'événement envoyé à ce moment-là peut être perdu.
- Dans une [installation HA](/admin-guide/ha), un seul nœud à la fois envoie les événements à chaque destination. Si Redis est
  indisponible, l'envoi est suspendu et les événements continuent d'être enregistrés.
- Avec HEC, un événement n'est considéré comme envoyé qu'après une réponse du récepteur avec un statut 2xx.
  Toute autre réponse, y compris 4xx, entraîne une nouvelle tentative. Si le récepteur tombe en panne après
  avoir répondu, les événements qu'il n'avait pas encore stockés peuvent être perdus.

Avec Syslog, chaque événement est envoyé sous forme de message Syslog RFC 5424 dont le corps est le JSON de l'événement.
`HOSTNAME` est l'ID du nœud HA, ou l'ID d'instance sur un seul nœud, et `MSGID` est le code de l'événement.

Les exemples ci-dessous sont minimaux et montrent seulement comment recevoir les événements. Ils acceptent la
connexion de tout client qui peut atteindre le port. En production, protégez le récepteur afin que seuls vos
serveurs Semaphore puissent lui envoyer des événements.

### Exemple rsyslog {#rsyslog}

Cette configuration rsyslog accepte la connexion TLS et écrit un événement par ligne :

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Exemple Vector {#vector}

Cette configuration Vector accepte la connexion TLS, lit le JSON de l'événement et l'écrit dans un fichier :

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Exemple Vector avec HEC {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Exemple Splunk {#splunk}

Créez un jeton HEC dans Splunk (**Settings → Data inputs → HTTP Event Collector**), autorisez-lui l'index
`security` et définissez `url` sur `https://<splunk>:8088/services/collector/event`. Pour retrouver les
événements, recherchez `index=security sourcetype="semaphore:audit"`.

Laissez **Enable indexer acknowledgement** désactivé pour ce jeton : Semaphore ne l'utilise pas.

### Surveiller l'export {#monitor-export}

Lorsque les [métriques](/admin-guide/metrics) sont activées, Semaphore Pro fournit pour chaque destination :

| Métrique | Signification |
| --- | --- |
| `semaphore_audit_export_oldest_pending_seconds` | Âge du plus ancien événement pas encore envoyé, 0 lorsque tout est envoyé |
| `semaphore_audit_export_pending_events` | Nombre d'événements en attente d'envoi |
| `semaphore_audit_export_errors_total` | Tentatives d'envoi échouées |

`semaphore_audit_export_errors_total` est comptée par le nœud qui a envoyé, additionnez-la donc entre les nœuds, par exemple `sum by (destination) (increase(semaphore_audit_export_errors_total[15m]))`.

Chaque métrique a un label `destination` avec l'`id` de la destination. Pour être alerté lorsque le SIEM ne reçoit
plus d'événements, surveillez l'âge du plus ancien événement en attente :

```yaml
- alert: SemaphoreAuditExportStalled
  expr: max by (destination) (semaphore_audit_export_oldest_pending_seconds) > 900
  for: 5m
```

### Résoudre les problèmes d'export {#troubleshoot-export}

- **Semaphore ne démarre pas.** Vérifiez que `audit.syslog.id` et `audit.syslog.address` sont définis, ou
  `audit.splunk_hec.id`, `url` et `token` pour HEC, et que le fichier de l'autorité de certification contient
  des certificats PEM.
- **La connexion TLS échoue.** Vérifiez que le certificat du récepteur correspond à `server_name` et qu'il
  est signé par une autorité de certification en laquelle Semaphore a confiance.
- **Les événements n'arrivent pas.** Consultez le journal du serveur Semaphore et celui du récepteur. Après
  un échec, Semaphore attend un peu avant de réessayer.
- **Certains événements arrivent en double.** Cela peut arriver après des nouvelles tentatives et des
  bascules. Écartez les doublons grâce à `event_id`.
- **HEC répond 400, 401 ou 403.** Vérifiez le jeton, les index dans lesquels il peut écrire, et que l'accusé de réception de l'indexeur est désactivé pour lui. Le jeton n'apparaît jamais dans le journal de Semaphore.

## Ce qui n'est pas enregistré {#not-recorded}

L'outil en ligne de commande `semaphore` agit directement sur la base de données : les commandes comme
`user add` et `user token` ne sont donc pas enregistrées.

Certaines actions de l'interface ne sont pas enregistrées : la suppression d'une licence, les
paramètres des apps, la réinitialisation de l'état des tâches HA, les alias d'inventaires Terraform, la
suppression d'un état Terraform, les exécutions de workflows et les invitations aux projets. Les descriptions de
modèles, les vues, le vidage du cache du projet et les synchronisations planifiées des stockages de secrets ne
sont pas enregistrés non plus.

## Et ensuite {#whats-next}

- [Événements d'audit](/reference/audit-events) — le format des événements et tous les événements enregistrés.
- [Options de configuration](/reference/configuration#audit-log) — toutes les options `audit.*` et variables d'environnement.
- [Journaux](/admin-guide/logs) — journaux du serveur, d'activité et des tâches.
