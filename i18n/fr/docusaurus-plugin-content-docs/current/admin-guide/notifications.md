---
title: Notifications
description: Comment Semaphore délivre les alertes de tâches, les canaux pris en charge et le lien entre canaux du serveur et alertes par projet.
---

# Notifications

Semaphore signale les résultats des tâches par chat et par e-mail de deux manières :

- **Les canaux du serveur** sont configurés une fois sur le serveur, dans `config.json` ou via des
  variables d’environnement, et sont disponibles pour tous les projets. Cette page les décrit.
- **Les alertes du projet** sont des destinations nommées créées par les membres du projet dans
  l’onglet [Alertes](/user-guide/projects/alerts) du projet, avec leur propre chat, webhook ou
  destinataires, et liées aux modèles et aux planifications.

## Fonctionnement de l’envoi {#how-delivery-works}

Pour un canal du serveur, trois réglages décident si un message est envoyé, et les trois doivent
l’autoriser :

1. **Le canal est configuré sur le serveur.** Chaque fournisseur a ses propres clés dans
   `config.json`. Voir la page de ce fournisseur ci-dessous.
2. **Le projet utilise les canaux du serveur.** *Envoyer les alertes de ce projet aux canaux du
   serveur* dans l’onglet [Alertes](/user-guide/projects/alerts#server-channels) du projet est
   l’interrupteur principal. S’il est désactivé, les canaux du serveur n’envoient rien pour ce
   projet. Les alertes du projet ne dépendent pas de cet interrupteur.
3. **Le modèle le demande.** Un modèle utilisant les *valeurs par défaut du projet* envoie aux
   canaux du serveur ; un modèle avec une liste d’alertes personnalisée non. Les modèles peuvent
   aussi supprimer les notifications de succès ou d’échec, voir
   [Modèles de tâches](/user-guide/task-templates).

Les canaux de chat signalent les succès, les échecs et les tâches en attente de confirmation ;
l’e-mail ne signale que les échecs. Les alertes du projet peuvent redéfinir les événements par
destination.

Utilisez **Tout tester** dans l’onglet Alertes pour envoyer un message de test par chaque canal du
serveur et chaque alerte du projet activée sans lancer de tâche.

## Canaux {#channels}

| Canal | Page |
|---|---|
| E-mail (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Plusieurs canaux peuvent être activés en même temps ; chacun reçoit chaque alerte qui passe les
trois vérifications ci-dessus. Les mêmes fournisseurs sont disponibles pour les alertes du
projet ; les alertes e-mail et Telegram réutilisent le serveur SMTP et le jeton du bot de la
configuration du serveur, et une alerte Gotify sans URL et jeton propres réutilise la paire du
serveur.

## Redéfinitions par projet {#per-project-overrides}

Telegram prend en charge un chat par projet : définissez **Telegram Chat ID** dans l’onglet
[Alertes](/user-guide/projects/alerts#server-channels) du projet pour diriger les messages de
canal du serveur d’un projet vers un chat différent de celui du serveur. Pour toute autre
destination par projet, créez une [alerte du projet](/user-guide/projects/alerts#project-alerts).

## Par où commencer {#where-to-start}

Configurez d’abord un canal, ouvrez l’onglet Alertes du projet, activez *Envoyer les alertes de
ce projet aux canaux du serveur* et cliquez sur **Tout tester**. Une fois le message de test
reçu, ajustez les modèles concernés.
