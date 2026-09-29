---
title: Envoyer le journal d'audit à un SIEM
description: Configurer Semaphore Pro pour envoyer les événements d'audit à un SIEM via Syslog avec TLS, et préparer rsyslog ou Vector à les recevoir.
---

# Envoyer le journal d'audit à un SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro envoie chaque événement du [journal d'audit](/admin-guide/audit-log) à un SIEM sous forme de
message Syslog RFC 5424 sur TLS.

## Avant de commencer {#before-you-begin}

- Une licence Semaphore Pro.
- Le [journal d'audit activé](/admin-guide/audit-log#enable).
- Un récepteur Syslog qui accepte TLS, par exemple rsyslog ou Vector, voir
  [Exemples de récepteurs](#receivers).
- Le certificat de la CA qui a signé le certificat du récepteur, au format PEM, s'il n'est pas dans le magasin
  de confiance du système.

## Étapes {#steps}

Pour envoyer le journal d'audit à un SIEM, procédez comme suit :

1. Ajoutez la section `audit.syslog` à `config.json` :

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
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
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` et `address` sont obligatoires. `ca_file` ajoute une CA au magasin de confiance du système.
   `server_name` remplace le nom vérifié dans le certificat du récepteur. `timeout` limite la connexion et
   l'écriture, 10 secondes par défaut.
2. Redémarrez Semaphore. Un fichier de CA illisible ou l'absence de `id` ou de `address` arrête le démarrage
   avec une erreur.
3. Connectez-vous avec un mauvais mot de passe. Le SIEM reçoit un événement `auth.login` avec le résultat
   `failure`.

## Comment les événements sont livrés {#delivery}

- Semaphore conserve sa position dans le journal sous l'`id`. Après un redémarrage, il reprend à cet endroit,
  et les événements enregistrés pendant que le récepteur était injoignable sont envoyés quand il revient. Un
  nouvel `id` commence à l'événement courant et n'envoie pas les plus anciens.
- La livraison se fait au mieux : un événement écrit sur une connexion coupée sans avertissement peut être
  perdu.
- Un événement peut arriver deux fois, par exemple après une erreur réseau ou un basculement. Supprimez les
  doublons par `event_id` et ordonnez les événements par `seq`.
- Avec la [haute disponibilité](/admin-guide/ha), un seul nœud envoie à la fois. Un autre nœud prend le relais
  quand il s'arrête.

## Exemples de récepteurs {#receivers}

Semaphore envoie des messages RFC 5424 avec un tramage par comptage d'octets (RFC 5425). Le corps du message est
le JSON de l'événement. Le `HOSTNAME` Syslog est l'ID du nœud ou, sans HA, l'ID de l'instance, et `MSGID` est
l'`event_code`.

### rsyslog {#rsyslog}

Recevoir les événements via TLS et écrire un événement JSON par ligne :

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

### Vector {#vector}

Recevoir les événements via TLS et analyser le JSON de l'événement :

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

## Et ensuite {#whats-next}

- [Journal d'audit](/admin-guide/audit-log) — le schéma de l'événement et ce qui est enregistré.
- [Événements d'audit](/reference/audit-events) — chaque événement avec ses résultats, ses motifs et ses métadonnées.
- [Configuration](/reference/configuration) — chaque option `audit.*`.
