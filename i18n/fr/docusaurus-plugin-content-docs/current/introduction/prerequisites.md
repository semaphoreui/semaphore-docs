---
title: Prérequis
description: Ce dont vous avez besoin avant d'installer Semaphore - un hôte, une base de données, des accès réseau, des identifiants, et l'outillage d'automatisation que vos tâches appellent.
---

# Prérequis

Semaphore a peu d'exigences propres. L'essentiel de ce que vous devez préparer
concerne l'automatisation qu'il exécutera et l'environnement qui l'entoure. Parcourez
cette page avant l'[Installation](/admin-guide/installation) et l'installation elle-même
ne prendra que quelques minutes.

## Un hôte {#a-host}

Semaphore est distribué sous forme de binaire unique et d'image de conteneur, et fonctionne sous Linux,
macOS et Windows. Linux est la cible des paquets, des images Docker et du chart Helm,
et c'est ce qu'utilisent la plupart des déploiements.

Le service est léger : c'est un processus Go qui sert une interface web. Ce qui consomme
réellement de la mémoire et du CPU, ce sont Ansible, Terraform et vos scripts, exécutés en parallèle
sur la même machine. Dimensionnez l'hôte pour le travail à effectuer, pas pour Semaphore, et limitez
la concurrence avec le paramètre de projet **Nombre maximal de tâches parallèles** — ou déplacez
l'exécution vers des [runners](/admin-guide/runners) et dimensionnez ceux-ci à la place.

Prévoyez du stockage persistant à deux endroits : la base de données, et le répertoire indiqué par
`tmp_path` où les dépôts sont clonés. Sous Docker, cela signifie un volume ; un conteneur
qui n'en a pas perd ses données à la recréation.

## Une base de données {#a-database}

Choisissez-en une avant d'installer, car changer par la suite implique de migrer les données.

| Moteur | À utiliser quand |
|---|---|
| **SQLite** | Un serveur, une équipe. Intégré, rien à configurer, valeur par défaut. |
| **PostgreSQL** ou **MySQL/MariaDB** | Le service compte pour plus de quelques personnes, vous voulez des sauvegardes et de la supervision depuis votre plateforme de bases de données existante, ou vous prévoyez d'exploiter plus d'un nœud. |

La [haute disponibilité](/admin-guide/ha) exige PostgreSQL ou MySQL ainsi que Redis, et
ne peut pas utiliser SQLite. Si la HA figure dans votre feuille de route, commencez avec PostgreSQL.

Créez la base de données et un utilisateur disposant des droits dessus avant l'installation ; Semaphore crée
ses propres tables au premier démarrage et à chaque mise à niveau.

## Accès réseau {#network-access}

| Semaphore doit atteindre | Pour |
|---|---|
| Vos dépôts Git distants | Cloner les dépôts vers lesquels pointent les modèles. |
| Les hôtes et API cloud que vous automatisez | Effectuer réellement le travail. |
| Votre fournisseur d'identité, le cas échéant | La connexion [LDAP](/admin-guide/authentication/ldap) ou [OpenID Connect](/admin-guide/authentication/openid). |
| Vos canaux de notification | E-mail, Telegram, Slack, et les autres. |

Les utilisateurs accèdent à l'interface web sur le port `3000`, sauf si vous le changez. Placez
[TLS](/admin-guide/reverse-proxy) devant celle-ci avant que quiconque ne se connecte : les sessions
et les jetons d'API y transitent.

Si un runner exécute les tâches, c'est *lui* qui a besoin de l'accès aux dépôts Git distants et aux
hôtes cibles, ainsi que d'un accès sortant vers le serveur Semaphore. Le serveur ne se
connecte jamais à un runner.

## Outillage d'automatisation {#automation-tooling}

Tout ce qu'exécute une tâche doit être installé là où elle s'exécute — sur le serveur, sur le
runner, ou dans l'image de conteneur utilisée par l'exécuteur.

- Les images Docker sont livrées avec Ansible, Terraform, OpenTofu et les dépendances
  habituelles. Les paquets Python supplémentaires se déclarent dans un `requirements.txt` monté ; voir
  [Installer des dépendances Python supplémentaires](/admin-guide/installation/docker#installing-additional-python-dependencies).
- Une installation par paquet ou par binaire ne vous donne que Semaphore. Installez Git, Python, Ansible,
  ainsi que les collections ou providers nécessaires vous-même ; voir
  [Installation manuelle](/admin-guide/installation_manually).

Vérifiez que votre playbook ou votre configuration s'exécute depuis un shell sur cette machine, sous
l'utilisateur avec lequel Semaphore s'exécute, avant d'en créer un modèle. Presque tous les
signalements « ça marche en local » se ramènent à une collection, un provider ou un paquet Python manquant.

## Identifiants à préparer {#credentials-to-have-ready}

Rassemblez-les avant le premier modèle, sinon chacun deviendra une interruption séparée :

- Une **clé de déploiement ou un jeton** pour chaque dépôt que Semaphore clonera.
- Les **clés SSH ou identifiants** utilisés pour atteindre les hôtes que vous administrez.
- Tous les **identifiants cloud** requis par votre Terraform ou vos modules.
- Un **mot de passe Ansible Vault**, si vos playbooks sont chiffrés.

Tous ont leur place dans le [magasin de clés](/user-guide/key-store), pas dans le dépôt.

## Décisions à prendre d'abord {#decisions-to-make-first}

Trois choix sont peu coûteux maintenant et onéreux plus tard :

1. **Le moteur de base de données**, comme ci-dessus.
2. **L'URL que les utilisateurs emploieront.** Définissez-la dans `web_host`. Les reverse proxies, les URI
   de redirection OIDC, les cibles de webhooks et les liens de notification en découlent tous.
3. **`access_key_encryption`.** Générez-la au moment de l'installation, sauvegardez-la séparément,
   et ne la changez jamais à la légère : chaque secret stocké est chiffré avec elle.

```bash
head -c32 /dev/urandom | base64
```

## Et ensuite {#whats-next}

- [Installation](/admin-guide/installation) — choisissez une méthode et installez.
- [Configuration](/admin-guide/configuration) — comment les options sont fournies et ce qu'elles signifient.
- [Premiers pas](/getting-started) — d'un serveur installé à une première tâche.
