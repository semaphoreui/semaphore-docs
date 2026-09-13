---
title: Guide d'administration
description: Pour les administrateurs qui installent, configurent, sécurisent et exploitent un serveur Semaphore pour leurs équipes.
---

# Guide d'administration

Cette section s'adresse aux administrateurs qui installent et exploitent Semaphore
pour d'autres personnes. Tout ce qui est décrit ici nécessite un accès au serveur
lui-même : le fichier de configuration, les variables d'environnement, la ligne de
commande ou la machine sur laquelle Semaphore s'exécute. Le travail réalisé dans un
projet via l'interface web est traité dans le
[Guide utilisateur](/user-guide).

Semaphore est un unique binaire Go doté d'une interface web et d'une API REST. Il
stocke ses données dans SQLite, MySQL ou PostgreSQL, conserve les identifiants
chiffrés et exécute les tâches soit sur le serveur lui-même, soit sur des runners
séparés. Une installation fonctionnelle se résume donc à quatre décisions : comment
l'installer, où se trouve la base de données, comment les utilisateurs se connectent
et où les tâches s'exécutent.

## Mise en place {#set-up}

Tout ce que vous configurez avant ou autour du démarrage du serveur.

| Page | Contenu |
|---|---|
| [Installation](/admin-guide/installation) | Gestionnaire de paquets, Docker, binaire, Kubernetes et installation manuelle. |
| [Configuration](/admin-guide/configuration) | Le fichier `config.json`, les variables d'environnement et toutes les options prises en charge. |
| [Mise à niveau](/admin-guide/upgrading) | Passer à une version plus récente et ce qu'il faut vérifier au préalable. |
| [Reverse proxy](/admin-guide/reverse-proxy) | Servir Semaphore derrière nginx, Apache ou Caddy, avec TLS. |
| [Sécurité](/admin-guide/security) | Hachage des mots de passe, chiffrement des secrets, durcissement réseau et JWT de tâche. |
| [LDAP et AD](/admin-guide/ldap) | Se connecter auprès d'un service d'annuaire. |
| [OpenID Connect](/admin-guide/openid) | Authentification unique avec GitHub, Google, Keycloak, Okta et neuf autres fournisseurs. |
| [Runners](/admin-guide/runners) | Exécuter les tâches sur d'autres machines que le serveur. |
| [Haute disponibilité](/admin-guide/ha) | Faire fonctionner plusieurs nœuds Semaphore sur une même base de données. |

## Exploitation {#operate}

Tout ce que vous faites sur un serveur déjà en fonctionnement.

| Page | Contenu |
|---|---|
| [CLI](/reference/cli) | Gérer les utilisateurs, les projets, les vaults, les runners et les migrations de base de données depuis le shell. |
| [API](/reference/api) | S'authentifier avec un token et piloter Semaphore par programmation. |
| [Intégration CI/CD](/admin-guide/cicd) | Démarrer des tâches Semaphore depuis un pipeline externe. |
| [Journaux](/admin-guide/logs) | Journaux du serveur, journaux de tâches et leur transfert vers un autre système. |
| [Métriques](/admin-guide/metrics) | Le point de terminaison Prometheus et les métriques qu'il expose. |
| [Notifications](/admin-guide/notifications) | Canaux de distribution des alertes : e-mail, Telegram, Slack et autres. |
| [Licence](/admin-guide/license) | Activer un abonnement Pro ou Enterprise. |

## Par où commencer {#where-to-start}

Si vous installez Semaphore pour la première fois, lisez
[Installation](/admin-guide/installation) et choisissez une méthode, puis
[Configuration](/admin-guide/configuration) pour comprendre comment les options sont
fournies. Placez le serveur derrière un [reverse proxy](/admin-guide/reverse-proxy)
avec TLS avant que quiconque d'autre ne l'utilise.

Pour voir ce qu'apporte un abonnement payant, consultez [Éditions](/editions).
