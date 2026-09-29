---
title: Journal d'audit
description: Le journal d'audit de sécurité que Semaphore tient pour les connexions, la MFA, les utilisateurs, les permissions, les jetons d'API et les paramètres, et comment l'activer.
---

# Journal d'audit

Le journal d'audit est une piste d'audit de sécurité : qui a fait quoi, depuis où, sur quel objet et avec quel
résultat. Les analystes sécurité et les équipes de conformité le lisent, le plus souvent dans un SIEM. Chaque
événement a un schéma stable et documenté, afin qu'un analyste puisse écrire des règles de détection sans
connaître le fonctionnement interne de Semaphore.

Le journal d'audit est distinct du [journal d'activité](/admin-guide/logs). Le journal d'activité est un flux
pour les utilisateurs d'un projet. Le journal d'audit est une piste pour les personnes qui vérifient que le
système est utilisé correctement.

## Fonctionnement {#overview}

Lorsque le journal d'audit est activé, Semaphore enregistre un événement pour chaque action liée à la sécurité
qui passe par l'interface web ou l'API : connexions et déconnexions, vérifications MFA, modifications des
utilisateurs, des membres de projets, des rôles et des permissions, jetons d'API et paramètres système. Les
requêtes refusées sont aussi enregistrées : une connexion échouée, un jeton d'API inconnu ou expiré, une
permission refusée, une requête intersite bloquée.

Les événements sont stockés dans la base de données de Semaphore. Semaphore Pro peut les envoyer à un SIEM,
voir [Export vers un SIEM](#siem-export).

## Schéma de l'événement {#event-schema}

Chaque événement est un objet JSON avec les mêmes champs. Pour la liste des événements, de leurs résultats, de
leurs motifs et de leurs métadonnées, voir [Événements d'audit](/reference/audit-events).

| Champ | Description |
| --- | --- |
| `event_id` | ID unique de l'événement. Servez-vous-en pour supprimer les doublons dans le SIEM. |
| `seq` | Numéro de séquence sans trou qui augmente à chaque événement. Servez-vous-en pour ordonner les événements. |
| `timestamp` | Heure de l'événement en UTC. |
| `schema_version` | Version de ce schéma. Elle ne change que si un champ est renommé, supprimé ou change de type. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` ou `audit`. |
| `event_code` | Ce que concerne l'événement, par exemple `iam.api_token`. |
| `type` | Nature du changement : `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` ou `info`. |
| `action` | Ce qui a été fait, par exemple `create`. |
| `outcome` | `success` ou `failure`. |
| `reason` | Pourquoi l'action a échoué, d'après une liste fixe par événement. Vide en cas de succès. |
| `actor` | Qui a agi : son `type` (`user`, `anonymous`, `system`, `runner`, `integration`), son `id` et son `name`. Pour un utilisateur, aussi `auth` (`session` ou `api_token`) et, pour un jeton d'API, `token_fingerprint`. |
| `source` | Pour les requêtes à l'interface web et à l'API : l'`ip` et le `user_agent` du client. |
| `target` | L'objet concerné : son `type`, son `id` et son `name`. |
| `scope` | Le `project_id` pour les événements d'un projet. |
| `request_id` | ID de la requête HTTP. Semaphore le renvoie aussi dans l'en-tête de réponse `X-Request-ID`. |
| `instance_id` | Nom de cette installation de Semaphore, tiré de `audit.instance_id`. |
| `node_id` | Nœud qui a enregistré l'événement, lorsque la [haute disponibilité](/admin-guide/ha) est activée. |
| `metadata` | Détails supplémentaires qui dépendent de l'événement. |

`timestamp` est l'heure de la base de données, en microsecondes, ou en millisecondes sur SQLite. Ordonnez les
événements par `seq` : deux événements peuvent avoir la même heure, mais jamais le même `seq`.

Sous MySQL, la colonne `created` de la table `audit_event` utilise le fuseau horaire de l'option de connexion
`loc`, UTC par défaut. Le `timestamp` de chaque événement est toujours en UTC.

Chaque démarrage du serveur enregistre `audit.lifecycle` avec l'action `start`. Il n'y a pas d'événement
d'arrêt : un arrêt, un plantage ou la désactivation du journal d'audit apparaissent comme un trou dans le temps
avant le `start` suivant.

## Ce qui n'est jamais enregistré {#never-recorded}

Le journal d'audit ne contient jamais de mots de passe, de codes à usage unique, de secrets et de codes QR TOTP,
de codes de récupération, de cookies de session, de jetons, de codes et de claims OAuth, de clés privées, de
phrases secrètes, de valeurs de secrets, de valeurs d'environnement et de sondages, de corps de webhooks, de
sorties de tâches, d'adresses e-mail ni d'URL. Un jeton d'API n'est identifié que par son empreinte : les 16
premiers caractères hexadécimaux de son hachage SHA-256.

L'ID et le nom d'utilisateur identifient l'acteur. Une connexion échouée enregistre l'identifiant saisi,
tronqué à 64 octets, car l'enquête sur les connexions échouées en a besoin.

## Activer le journal d'audit {#enable}

Définissez `audit.enabled` et donnez un nom à l'installation dans `audit.instance_id`. Le nom compte de 1 à 255
caractères ASCII imprimables sans espace et figure dans chaque événement.

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
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Redémarrez Semaphore pour appliquer le changement. Pour toutes les options, voir
[Configuration](/reference/configuration).

## Adresse du client derrière un proxy inverse {#trusted-proxies}

Derrière un proxy inverse, l'interlocuteur direct de Semaphore est le proxy, et l'adresse du client vient de
l'en-tête `X-Forwarded-For` ou `X-Real-IP`. Semaphore ne lit ces en-têtes que si l'interlocuteur direct fait
partie de `audit.trusted_proxy_cidrs`. Sinon, il enregistre l'adresse de l'interlocuteur, si bien qu'un client
ne peut pas falsifier son adresse.

Ne listez dans `audit.trusted_proxy_cidrs` que vos proxys inverses, jamais des réseaux de clients. Un client
situé dans une plage de confiance peut mettre n'importe quelle adresse dans `X-Forwarded-For`.

L'adresse enregistrée est l'adresse la plus à droite de `X-Forwarded-For` qui n'est pas un proxy de confiance.
`X-Real-IP` n'est utilisé qu'en l'absence de `X-Forwarded-For`, et seulement s'il n'a qu'une seule valeur.

## Stockage {#storage}

Les événements sont stockés dans la base de données de Semaphore et ne sont jamais supprimés : cette version n'a
pas de durée de conservation. Prévoyez la taille de la base de données selon le nombre de connexions et de
modifications de votre installation.

## Correspondance avec la conformité {#compliance}

Semaphore enregistre les événements dont vous avez besoin pour ces contrôles. Il ne rend pas votre installation
conforme à lui seul.

| Exigence | Couverte par | Statut |
| --- | --- | --- |
| PCI DSS 10.2.1.1 accès aux données sensibles (analogue : secrets) | `iam.mfa/view_qr` | Disponible |
| PCI DSS 10.2.1.1 accès aux données sensibles (analogue : secrets) | `resource.project_backup/export` | Prévu |
| PCI DSS 10.2.1.2 actions des administrateurs / ISO 27002 8.15 utilisation des privilèges | `iam.*`, `system.*` | Disponible |
| PCI DSS 10.2.1.2 actions des administrateurs / ISO 27002 8.15 utilisation des privilèges | `resource.*`, `secret.*` | Prévu |
| PCI DSS 10.2.1.2 actions des administrateurs / ISO 27002 8.15 utilisation des privilèges | `runner.*`, `task.control`, `task.history` | Prévu |
| PCI DSS 10.2.1.3 accès aux journaux d'audit | Sans objet : Semaphore ne donne pas accès à la piste d'audit. | — |
| PCI DSS 10.2.1.4 tentatives d'accès logique invalides / ISO tentatives d'accès refusées | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Disponible |
| PCI DSS 10.2.1.4 tentatives d'accès logique invalides / ISO tentatives d'accès refusées | `runner.lifecycle/register` failure | Prévu |
| PCI DSS 10.2.1.5 modifications des identifiants d'identification et d'authentification | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Disponible |
| PCI DSS 10.2.1.5 modifications des identifiants d'identification et d'authentification | `runner.credential` | Prévu |
| PCI DSS 10.2.1.6 démarrage, arrêt et pause des journaux d'audit / ISO activation des systèmes de sécurité | `audit.lifecycle/start` ; un arrêt apparaît comme le trou qui le précède | Disponible |
| PCI DSS 10.2.1.7 création et suppression d'objets au niveau du système | `resource.*` create/delete | Prévu |
| PCI DSS 10.2.1.7 création et suppression d'objets au niveau du système | `runner.lifecycle` create/delete | Prévu |
| PCI DSS 10.2.2 champs obligatoires | `actor`, `event_code` et `action`, `timestamp`, `outcome`, `source` ou `node_id`, `target` ou `scope` | Disponible |
| PCI DSS 10.3.3 sauvegarde rapide sur un serveur de journaux central | Export vers un SIEM via Syslog+TLS | Disponible |
| PCI DSS 10.3.3 sauvegarde rapide sur un serveur de journaux central | Export vers un SIEM via Splunk HEC | Prévu |

Les événements prévus ne sont pas enregistrés dans cette version.

## Ce qui n'est pas enregistré dans cette version {#not-recorded}

- Les actions faites avec la commande `semaphore` sur le serveur, comme `user add` ou `user token`. Elles
  modifient directement la base de données, et qui peut les lancer peut aussi modifier la table d'audit.
- La suppression de la licence, les paramètres d'exécution des applications, l'effacement de l'état des tâches
  HA, les alias d'inventaires Terraform, les exécutions de workflows et les invitations aux projets. Ils n'ont
  pas encore d'événement d'audit.

## Export vers un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro envoie le journal d'audit à un SIEM via Syslog avec TLS. Il conserve sa position dans le journal
pour le SIEM, si bien que les événements enregistrés pendant que le SIEM est injoignable sont envoyés quand il
revient. Pour les étapes, voir [Envoyer le journal d'audit à un SIEM](/admin-guide/audit-log-siem).

## Et ensuite {#whats-next}

- [Envoyer le journal d'audit à un SIEM](/admin-guide/audit-log-siem) — exporter les événements via Syslog+TLS.
- [Événements d'audit](/reference/audit-events) — chaque événement avec ses résultats, ses motifs et ses métadonnées.
- [Configuration](/reference/configuration) — chaque option `audit.*`.
