---
title: Journal d'audit
description: Activez le journal d'audit de sécurité, découvrez les informations qu'il enregistre et envoyez les événements d'audit de Semaphore Pro à un SIEM via Syslog avec TLS.
---

# Journal d'audit

Le journal d'audit enregistre les activités liées à la sécurité : qui a effectué une action, quelle était cette
action, quel objet elle concernait, d'où provenait la requête et si elle a réussi. Les opérateurs l'utilisent
pour examiner les modifications, tandis que les équipes de sécurité s'appuient sur son format d'événement
documenté pour définir des règles de détection et produire des preuves de conformité.

La collecte et le stockage local des événements d'audit sont disponibles dans Semaphore Community.
Semaphore Pro peut également envoyer les événements collectés à un système de gestion des informations et
des événements de sécurité (SIEM).

## Différences avec les autres journaux {#log-types}

| Journal | Utilité |
| --- | --- |
| Journal du serveur | Diagnostiquer les erreurs de démarrage, de configuration et d'exécution de Semaphore. |
| Journal d'activité | Présenter aux utilisateurs d'un projet un flux des activités de ce projet. |
| Journal et historique des tâches | Examiner l'exécution, l'état et la sortie des tâches. |
| Journal d'audit | Examiner les actions d'authentification et d'administration dans toute l'installation. |

Le journal d'audit est indépendant du [journal d'activité](/admin-guide/logs#activity-log). L'activation ou
l'exportation de l'un n'active ni n'exporte l'autre.

## Événements enregistrés {#recorded-events}

La version actuelle enregistre les événements d'authentification et de gestion des identités pris en charge,
notamment :

- les connexions réussies et échouées, les déconnexions et les vérifications TOTP ;
- les jetons d'API rejetés, les permissions refusées et les requêtes intersites bloquées ;
- les modifications apportées aux utilisateurs, aux mots de passe, à l'inscription TOTP, aux identités
  externes et aux jetons d'API ;
- les modifications apportées aux membres des projets, aux rôles et aux permissions des modèles ;
- les modifications apportées aux paramètres système et l'activation de la licence Pro ;
- le démarrage de la collecte des événements d'audit avec le serveur.

Une connexion réussie est enregistrée une fois que l'utilisateur a terminé toutes les étapes
d'authentification requises, y compris la vérification TOTP. Pour connaître tous les événements disponibles
et ceux prévus dans les versions ultérieures, consultez les
[événements d'audit](/reference/audit-events).

## Données sensibles exclues des événements {#sensitive-data}

Les événements d'audit identifient une action sans copier les identifiants ou les données secrètes qu'elle
contient. Ils excluent les mots de passe, les codes d'accès, les secrets et codes QR TOTP, les codes de
récupération, les cookies de session, les jetons bruts, les codes et claims OAuth, les clés privées, les
phrases secrètes, les valeurs secrètes, les valeurs d'environnement et de sondage, le corps des webhooks, la
sortie des tâches et les URL des dépôts.

Les jetons d'API sont identifiés par une empreinte et non par leur valeur. Une connexion échouée comprend
l'identifiant de connexion fourni, tronqué à 64 octets. Si les utilisateurs se connectent avec une adresse
e-mail, cet identifiant peut contenir une adresse e-mail.

## Activer le journal d'audit {#enable}

Choisissez un nom stable pour l'installation, puis définissez `audit.enabled` et `audit.instance_id` dans
`config.json` :

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

L'ID de l'instance doit contenir entre 1 et 255 caractères ASCII imprimables, sans espace. Il figure dans
chaque événement et permet à un SIEM de distinguer plusieurs installations de Semaphore.

Vous pouvez également utiliser des variables d'environnement :

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Redémarrez Semaphore pour appliquer la modification. La collecte commence après le redémarrage ; les
activités antérieures ne sont pas ajoutées au journal d'audit. Le premier événement est `audit.lifecycle`
avec l'action `start`.

Pour connaître toutes les options et variables d'environnement, consultez les
[options de configuration](/reference/configuration#audit-log).

## Enregistrer l'adresse du client derrière un proxy {#trusted-proxies}

Par défaut, un événement d'audit HTTP enregistre l'adresse qui s'est connectée directement à Semaphore. Si
cette adresse est celle d'un proxy inverse, ajoutez uniquement les réseaux des proxys à
`audit.trusted_proxy_cidrs` :

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Ou définissez :

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore ne fait confiance à `X-Forwarded-For` et à `X-Real-IP` que si la requête provient de ces réseaux.
N'ajoutez pas de réseaux clients : un client situé dans un réseau de confiance pourrait choisir l'adresse
source enregistrée dans ses événements. Lorsque plusieurs proxys ajoutent des adresses à `X-Forwarded-For`,
Semaphore enregistre l'adresse la plus à droite qui ne correspond pas à un proxy de confiance.

## Stockage et limitations {#storage}

Semaphore stocke les événements d'audit dans sa base de données. Cette version ne propose ni interface de
consultation des audits, ni API d'audit, ni conservation ou purge automatique. Surveillez la croissance de la
base de données et incluez les données d'audit dans votre stratégie de sauvegarde de la base de données.

L'enregistrement d'un événement d'audit ne bloque pas l'action enregistrée. Si le stockage d'un événement
échoue, Semaphore consigne une erreur dans le journal du serveur et poursuit l'opération d'origine. Les
enregistrements locaux sont protégés par les mêmes contrôles d'accès à la base de données que le reste de
Semaphore ; ils ne sont ni immuables ni protégés contre les altérations.

Chaque démarrage du serveur enregistre `audit.lifecycle/start`. Il n'existe aucun événement d'arrêt. Un arrêt,
un plantage ou la désactivation du journal d'audit apparaît comme une période sans événement avant un
événement de démarrage ultérieur.

## Exporter vers un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro peut envoyer les événements correctement collectés à un récepteur Syslog avec TLS existant,
tel que rsyslog ou Vector. Le récepteur peut stocker les événements ou les transférer à votre SIEM.

Avant de commencer, préparez :

- le nom d'hôte et le port du récepteur ;
- un ID de destination stable, tel que `security-syslog` ;
- le certificat de la CA qui a signé le certificat du récepteur, si cette CA n'est pas déjà approuvée par
  l'hôte Semaphore.

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

Vous pouvez également utiliser des variables d'environnement :

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` et `address` sont obligatoires. Conservez le même ID lorsque vous modifiez l'adresse ou le certificat du
récepteur afin que Semaphore reprenne à partir de la position enregistrée. Un nouvel ID commence par les
événements enregistrés après l'initialisation de cette destination ; les événements déjà stockés à ce moment
ne lui sont pas envoyés.

`ca_file` ajoute des certificats au magasin de confiance du système. `server_name` remplace le nom d'hôte
vérifié dans le certificat du récepteur. Semaphore exige TLS 1.2 ou une version ultérieure et vérifie toujours
le certificat du serveur. Il n'est pas possible de désactiver cette vérification ni d'utiliser un certificat
client pour cette connexion.

Redémarrez Semaphore. Des paramètres de destination non valides ou un fichier de CA illisible empêchent le
démarrage de Semaphore.

### Vérifier la livraison {#verify-siem-delivery}

Après le redémarrage, recherchez le nouvel événement sur le récepteur et vérifiez que :

- `event_code` est `audit.lifecycle` ;
- `action` est `start` ;
- `outcome` est `success` ;
- `instance_id` correspond au nom configuré pour l'installation ;
- `metadata.destinations` contient l'ID de la destination.

### Fonctionnement de la livraison {#delivery}

- Si le récepteur est indisponible, Semaphore conserve localement les événements collectés et tente de les
  renvoyer lorsque le récepteur est de nouveau disponible. Les requêtes des utilisateurs se poursuivent
  normalement.
- La livraison Syslog s'effectue au mieux. Un événement écrit sur une connexion qui échoue sans en informer
  Semaphore peut être perdu.
- Les erreurs réseau, les redémarrages et les basculements HA peuvent produire des livraisons en double.
  Supprimez les doublons à l'aide de `event_id` et ordonnez les événements selon `seq`.
- Dans une [installation HA](/admin-guide/ha), un seul nœud envoie normalement les événements à une
  destination à la fois. L'exportation est suspendue si Redis est indisponible, tandis que la collecte se
  poursuit dans la base de données partagée.

Semaphore envoie des messages RFC 5424 avec TLS et un tramage par comptage d'octets. Le corps du message
contient l'événement JSON. `HOSTNAME` correspond à l'ID du nœud HA ou à l'ID de l'instance sur un nœud unique ;
`MSGID` correspond à `event_code`.

### Exemple de récepteur rsyslog {#rsyslog}

Ce fragment de configuration rsyslog accepte la connexion TLS et écrit un objet JSON d'événement par ligne :

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

### Exemple de récepteur Vector {#vector}

Cette configuration Vector accepte la connexion TLS, analyse l'événement JSON et l'écrit dans un fichier :

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

### Résoudre les problèmes d'exportation {#troubleshoot-export}

- Si Semaphore ne démarre pas, vérifiez que `audit.syslog.id` et `audit.syslog.address` sont tous deux définis
  et que le fichier de CA contient des certificats PEM lisibles.
- Si la connexion TLS échoue, vérifiez que le certificat du récepteur est valide pour `server_name` et que sa
  chaîne remonte à une CA système ou configurée.
- Si un événement n'est pas encore arrivé, consultez le journal du serveur Semaphore et le journal d'ingestion
  du récepteur. Après un échec, les nouvelles tentatives d'exportation sont différées.
- Si des événements apparaissent deux fois, dédupliquez-les à l'aide de `event_id` ; des doublons sont attendus
  après certaines nouvelles tentatives et certains basculements.

## Actions non couvertes par l'audit {#not-recorded}

La commande `semaphore` modifie directement la base de données. Les actions exécutées côté serveur dans
l'interface en ligne de commande, telles que `user add` et `user token`, ne sont donc pas enregistrées.
L'accès au serveur et à la base de données doit être contrôlé séparément.

Cette version ne comporte pas non plus d'événement d'audit pour la suppression d'une licence, les paramètres
d'exécution des applications, l'effacement de l'état des tâches HA, les alias d'inventaires Terraform, les
exécutions de workflows ou les invitations aux projets. Le
[catalogue des événements](/reference/audit-events) indique les événements prévus dans les versions
ultérieures.

## Pour aller plus loin {#whats-next}

- [Événements d'audit](/reference/audit-events) — champs des événements, événements disponibles et prévus, et couverture de conformité.
- [Options de configuration](/reference/configuration#audit-log) — toutes les options `audit.*` et les variables d'environnement.
- [Journaux](/admin-guide/logs) — journaux du serveur, d'activité et des tâches.
