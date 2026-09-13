---
title: Notifications
description: Comment Semaphore distribue les alertes de tâche, les canaux qu'il prend en charge et les deux interrupteurs qui doivent être activés pour que quoi que ce soit soit envoyé.
---

# Notifications

Semaphore signale les résultats des tâches dans les messageries et par e-mail. Un
canal est configuré une fois sur le serveur, dans `config.json` ou via des variables
d'environnement, puis s'applique à tous les projets. Les tâches qui produisent une
alerte sont décidées par projet et par modèle dans l'interface web.

## Comment fonctionne la distribution {#how-delivery-works}

Trois paramètres décident de l'envoi d'un message, et tous les trois doivent
l'autoriser :

1. **Le canal est configuré sur le serveur.** Chaque fournisseur a ses propres clés
   dans `config.json`. Voir la page de ce fournisseur ci-dessous.
2. **Le projet autorise les alertes.** *Allow alerts for this project* dans les
   [paramètres du projet](/user-guide/projects/settings) est l'interrupteur
   principal. S'il est désactivé, aucun canal n'envoie quoi que ce soit à propos de
   ce projet.
3. **Le modèle le demande.** Un modèle de tâche choisit d'alerter en cas de succès,
   en cas d'erreur ou pas du tout, voir
   [Modèles de tâches](/user-guide/task-templates).

Utilisez **Test alerts** dans les paramètres du projet pour envoyer un message de
test via chaque canal configuré sans exécuter de tâche.

## Canaux {#channels}

| Canal | Page |
|---|---|
| E-mail (SMTP) | [E-mail](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Plusieurs canaux peuvent être activés en même temps ; chacun reçoit toutes les
alertes qui passent les trois vérifications ci-dessus.

## Remplacements par projet {#per-project-overrides}

Telegram prend en charge un chat par projet : définissez **Telegram Chat ID** dans
les [paramètres du projet](/user-guide/projects/settings) pour router les alertes
d'un projet vers un chat différent de celui défini pour l'ensemble du serveur. Les
autres canaux utilisent la configuration du serveur pour tous les projets.

## Par où commencer {#where-to-start}

Configurez d'abord un canal, activez *Allow alerts for this project*, puis appuyez
sur **Test alerts**. Une fois qu'un message de test est arrivé, activez les alertes
sur les modèles qui comptent.
