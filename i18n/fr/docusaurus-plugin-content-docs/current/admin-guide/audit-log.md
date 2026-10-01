---
title: Journal d'audit
description: Activez le journal d'audit pour savoir qui a fait quoi dans Semaphore, et envoyez les événements d'audit de Semaphore Pro vers un SIEM.
---

# Journal d'audit

Le journal d'audit garde une trace des actions importantes dans Semaphore : qui s'est connecté, qui a
modifié un utilisateur ou un rôle, qui a créé un jeton d'API. Chaque événement indique qui a agi, quand,
depuis quelle adresse et si l'action a réussi. Utilisez-le pour comprendre ce qui s'est passé sur votre
installation, ou envoyez les événements vers votre SIEM pour les conserver avec le reste de vos journaux.

Le journal d'audit est disponible dans toutes les éditions. L'envoi vers un SIEM nécessite Semaphore Pro.

## Ce qui est enregistré {#recorded-events}

Semaphore enregistre actuellement les connexions, l'activité des comptes et celle des projets :

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
- chaque démarrage du serveur.

D'autres événements seront ajoutés dans les prochaines versions. Pour la liste complète, consultez
[Événements d'audit](/reference/audit-events).

Les mots de passe, les jetons, les valeurs secrètes et la sortie des tâches n'apparaissent jamais dans les
événements d'audit. Les jetons d'API sont identifiés par une empreinte plutôt que par leur valeur. Une
connexion échouée conserve l'identifiant saisi, qui peut donc contenir une adresse e-mail.

Les URL de dépôts, les URL de configurations d'hôtes et les alias d'intégrations ne sont pas enregistrés non plus.

Il arrive que Semaphore enregistre ou supprime un objet, mais qu'une partie ultérieure de la même requête
échoue. L'interface ou l'API affiche alors une erreur, alors que l'objet a bien été créé ou supprimé. Un tel
événement est enregistré comme un succès avec `metadata.partial=true`, et `reason` indique ce qui n'a pas abouti :

- `secret_failed` : un environnement a été enregistré ou supprimé, mais certains de ses secrets n'ont pas été
  enregistrés ou pas retirés ;
- `key_failed` : un stockage de secrets a été supprimé, mais certains des identifiants que Semaphore conservait
  pour lui n'ont pas été retirés ;
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

## Stockage {#storage}

Les événements sont stockés dans la base de données de Semaphore, vos sauvegardes habituelles les incluent
donc. Semaphore n'affiche pas les événements d'audit dans l'interface et ne supprime pas les anciens
événements : surveillez la taille de la base de données.

Le journal d'audit ne gêne jamais vos utilisateurs. Si un événement ne peut pas être enregistré, Semaphore
écrit une erreur dans le journal du serveur et l'action se poursuit normalement.

## Exporter vers un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro peut envoyer les événements d'audit à un récepteur Syslog via TLS, comme rsyslog ou Vector. Le
récepteur peut les stocker ou les transmettre à votre SIEM.

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

### Comment les événements sont livrés {#delivery}

- Si le récepteur est indisponible, les événements attendent dans la base de données et sont envoyés à son
  retour. Les utilisateurs ne remarquent rien.
- Après des erreurs réseau, des redémarrages ou une bascule HA, certains événements peuvent arriver en
  double. Utilisez `event_id` pour écarter les doublons et `seq` pour remettre les événements dans l'ordre.
- Si une connexion se coupe sans erreur, l'événement envoyé à ce moment-là peut être perdu.
- Dans une [installation HA](/admin-guide/ha), un seul nœud envoie les événements à la fois. Si Redis est
  indisponible, l'envoi est suspendu et les événements continuent d'être enregistrés.

Chaque événement est envoyé sous forme de message Syslog RFC 5424 dont le corps est le JSON de l'événement.
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

### Résoudre les problèmes d'export {#troubleshoot-export}

- **Semaphore ne démarre pas.** Vérifiez que `audit.syslog.id` et `audit.syslog.address` sont définis et
  que le fichier de l'autorité de certification contient des certificats PEM.
- **La connexion TLS échoue.** Vérifiez que le certificat du récepteur correspond à `server_name` et qu'il
  est signé par une autorité de certification en laquelle Semaphore a confiance.
- **Les événements n'arrivent pas.** Consultez le journal du serveur Semaphore et celui du récepteur. Après
  un échec, Semaphore attend un peu avant de réessayer.
- **Certains événements arrivent en double.** Cela peut arriver après des nouvelles tentatives et des
  bascules. Écartez les doublons grâce à `event_id`.

## Ce qui n'est pas enregistré {#not-recorded}

L'outil en ligne de commande `semaphore` agit directement sur la base de données : les commandes comme
`user add` et `user token` ne sont donc pas enregistrées.

Certaines actions de l'interface ne sont pas encore enregistrées : la suppression d'une licence, les
paramètres des apps, la réinitialisation de l'état des tâches HA, les alias d'inventaires Terraform, la
suppression d'un état Terraform, les exécutions de workflows et les invitations aux projets. Les descriptions de
modèles, les vues, le vidage du cache du projet et les synchronisations planifiées des stockages de secrets ne
sont pas enregistrés non plus. Pour les événements prévus dans les prochaines versions, consultez
[Événements d'audit](/reference/audit-events).

## Et ensuite {#whats-next}

- [Événements d'audit](/reference/audit-events) — le format des événements et tous les événements enregistrés.
- [Options de configuration](/reference/configuration#audit-log) — toutes les options `audit.*` et variables d'environnement.
- [Journaux](/admin-guide/logs) — journaux du serveur, d'activité et des tâches.
