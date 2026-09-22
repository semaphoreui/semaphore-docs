---
title: Alertes
description: L’onglet Alertes d’un projet, où l’on active les canaux du serveur et où l’on crée, teste et lie aux modèles et aux planifications les alertes nommées du projet.
---

# Alertes

L’onglet **Alertes** d’un projet décide où les résultats des tâches sont signalés. Il comporte deux parties :

- **Canaux du serveur** : les fournisseurs de notification qu’un administrateur a configurés sur le serveur dans `config.json`, voir [Notifications](/admin-guide/notifications). Ils sont partagés par tous les projets et chaque projet décide s’il les utilise.
- **Alertes du projet** : des destinations nommées appartenant au projet : un chat Telegram, un webhook Slack, une liste d’adresses e-mail, etc. Les modèles et les planifications choisissent quelles alertes ils envoient.

Les deux parties peuvent être utilisées en même temps.

![Onglet Alertes d’un projet](/assets/alerts-page.webp)

## Canaux du serveur {#server-channels}

La carte en haut de la page liste les canaux configurés sur le serveur. Activez **Envoyer les alertes de ce projet aux canaux du serveur** pour recevoir par eux chaque résultat de tâche de ce projet. C’est le même interrupteur que les anciennes versions appelaient **Allow alerts for this project** dans les paramètres du projet.

Telegram apparaît dès que le serveur possède un jeton de bot, grisé tant qu’aucun chat n’est connu. Cliquez sur la puce pour saisir le **Telegram Chat ID** de ce projet ; il remplace le chat du serveur et est obligatoire lorsque le serveur n’en a pas.

Les canaux du serveur signalent tous les statuts notables : succès, échec et *en attente de confirmation*. L’e-mail ne signale que les échecs. Un modèle peut toujours supprimer les notifications de succès ou d’échec, voir [Alertes du modèle](#template-alerts).

![Carte des canaux du serveur avec l’ID de chat Telegram ouvert](/assets/alerts-server-channels.webp)

## Alertes du projet {#project-alerts}

![Menu Nouvelle alerte](/assets/alerts-new-menu.webp)

Cliquez sur **Nouvelle alerte** pour créer une destination. Chaque alerte possède :

| Champ | Description |
|---|---|
| **Nom** | Affiché dans les formulaires de modèle et de planification. Unique dans le projet. |
| **Type** | Le canal : Telegram, Slack, Email, Microsoft Teams, Rocket.Chat, DingTalk ou Gotify. Le formulaire affiche les champs de destination requis par le canal. |
| **Destination** | ID de chat et sujet de forum facultatif pour Telegram ; URL de webhook pour Slack, Teams, Rocket.Chat et DingTalk ; URL du serveur pour Gotify ; destinataires pour l’e-mail (laissez vide pour notifier les membres du projet ayant activé les alertes dans leur profil). |
| **Secret** | Telegram, Gotify et l’e-mail ont besoin d’un secret : le jeton du bot, le jeton d’application, les identifiants SMTP. *Utiliser les réglages du serveur* le prend dans la configuration du serveur ; *Utiliser le mien* le prend dans une clé d’accès du Magasin de clés (type *Jeton secret* pour les jetons, *Connexion par mot de passe* pour SMTP). Une alerte e-mail avec ses propres identifiants peut aussi définir son hôte SMTP, son port, son expéditeur et son chiffrement. |
| **Envoyer sur** | Les événements écoutés par l’alerte : succès, échec, en attente de confirmation. Les nouvelles alertes commencent avec les valeurs par défaut du canal. |
| **Défaut du projet** | Marque l’alerte comme l’une des valeurs par défaut du projet. Tout modèle utilisant les valeurs par défaut du projet l’envoie. |
| **Activée** | Une alerte désactivée n’est jamais envoyée et n’est pas une valeur par défaut du projet. |
| **Modèle de message** | Modèle Go facultatif pour le corps du message. Conservez le texte intégré pour suivre les futures mises à jour du serveur. |

Les secrets ne sont jamais stockés sur l’alerte : ils vivent chiffrés dans le Magasin de clés et la clé ne peut pas être supprimée tant qu’une alerte l’utilise. Lorsque le serveur n’a ni jeton de bot, ni serveur SMTP, ni paire Gotify configurés, le formulaire ne propose que *Utiliser le mien*. Les URL de webhook doivent utiliser `http` ou `https` et ne peuvent pas pointer vers le serveur lui-même.

Utilisez **Envoyer un message de test** dans la liste pour vérifier une alerte et **Tout tester** dans la barre d’outils pour envoyer un test à chaque destination activée du projet, canaux du serveur compris.

Une alerte liée à un modèle ou à une planification ne peut pas être supprimée. La boîte de dialogue liste les objets qui l’utilisent.

![Alerte Telegram avec un jeton de bot propre](/assets/alert-form-telegram.webp)

![Alerte e-mail avec un serveur SMTP propre](/assets/alert-form-email.webp)

### Modèles de message {#message-templates}

Le corps est un `text/template` Go (`html/template` pour l’e-mail). Les champs disponibles sont :

| Champ | Valeur |
|---|---|
| `.Name` | Nom du modèle |
| `.Author` | Nom de l’utilisateur ayant lancé la tâche, ou `—` |
| `.Project.Name`, `.Project.ID` | Le projet |
| `.Playbook` | Playbook ou script du modèle |
| `.ScheduleName` | Nom de la planification ayant lancé la tâche, le cas échéant |
| `.Task.ID`, `.Task.URL` | Numéro de la tâche et lien vers son journal |
| `.Task.Result` | Statut avec icône, par exemple `✅ SUCCESS` |
| `.Task.Desc` | Message saisi au lancement de la tâche |
| `.Task.Version` | Version de build, ou version de build entrante pour les tâches de déploiement |
| `.Task.Duration` | Durée d’exécution, vide tant que la tâche n’a pas démarré |
| `.Task.Trigger` | `manual`, `schedule`, `integration` ou `api` |
| `.Color` | Couleur de la pièce jointe pour Slack et Rocket.Chat |

Pour les canaux de chat, le texte rendu doit être le document JSON attendu par la messagerie ; le modèle intégré est un bon point de départ. Les corps Telegram sont du texte brut avec mise en forme HTML ; Semaphore ajoute le chat et le sujet.

## Alertes du modèle {#template-alerts}

Dans la section **Avancé** d’un modèle de tâche, **Alertes** propose :

- **Utiliser les valeurs par défaut du projet** : les canaux du serveur, lorsqu’ils sont activés pour le projet, plus les alertes marquées comme défaut du projet. Les modèles existants conservent ce comportement après une mise à niveau.
- **Utiliser un ensemble personnalisé d’alertes** : uniquement les alertes sélectionnées. Une sélection vide signifie que le modèle n’envoie rien.

**Supprimer les notifications de succès** et **Supprimer les notifications d’erreur** s’appliquent aux deux choix. Les notifications d’une tâche en attente de confirmation ne sont jamais supprimées.

![Modèle de tâche avec un ensemble personnalisé d’alertes](/assets/template-form-alerts.webp)

## Alertes de planification {#schedule-alerts}

Une planification peut **utiliser les alertes du modèle** ou **utiliser un autre ensemble d’alertes**. Le second choix remplace entièrement la sélection du modèle pour les tâches lancées par cette planification : un job nocturne peut signaler à un canal d’astreinte tandis que les exécutions manuelles restent silencieuses.

![Planification avec son propre ensemble d’alertes](/assets/schedule-form-alerts.webp)

## Comment une tâche est acheminée {#how-a-task-is-routed}

Les destinations d’une tâche sont fixées à sa création. Modifier une alerte, un modèle ou une planification pendant qu’une tâche s’exécute ne change pas où cette tâche est signalée. Chaque envoi est enregistré par tâche, destination et événement, si bien qu’en haute disponibilité un seul nœud du serveur envoie chaque message.

## Sauvegardes {#backups}

Les alertes du projet font partie de la [sauvegarde du projet](./projects/settings#danger-zone). Les modèles et les planifications s’y réfèrent par nom, un projet restauré conserve donc ses liaisons. Les alertes désignent leur clé d’accès par son nom ; comme pour toute clé, la valeur secrète n’est pas exportée.
