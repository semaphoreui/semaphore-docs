# Microsoft Teams

Les notifications Microsoft Teams transmettent les résultats des tâches de Semaphore directement dans un canal Teams. Chaque message est une carte contenant le nom du modèle, le statut de la tâche, l'utilisateur qui a lancé la tâche et un bouton qui ouvre la tâche dans Semaphore.

Pour configurer les notifications Teams, vous avez besoin d'une URL de webhook qui relie Semaphore au canal. Dans Teams, cette URL se crée avec l'application **Workflows**, qui repose sur Microsoft Power Automate et n'a aucun rapport avec les workflows de Semaphore.

:::warning
En mai 2026, Microsoft a retiré les connecteurs Office 365 de Teams, y compris l'ancien connecteur **Incoming Webhook**. Une URL de webhook sur `webhook.office.com` ne délivre plus de messages. Créez une nouvelle URL avec l'application Workflows comme décrit ci-dessous.
:::

## Créer un webhook Teams {#creating-teams-webhook}

### Étape 1. Ouvrir Workflows pour le canal {#step-1-open-workflows-for-the-channel}

1. Dans Microsoft Teams, allez dans l'équipe et le canal qui doivent recevoir les notifications.
2. Cliquez sur **More options (…)** à côté du nom du canal.
3. Sélectionnez **Workflows**.

---

### Étape 2. Créer un workflow à partir du modèle {#step-2-create-a-workflow-from-the-template}

1. Recherchez le modèle **Send webhook alerts to a channel** et sélectionnez-le.
2. Vérifiez les paramètres du workflow : l'équipe (**Team**) et le canal (**Channel**) dans lesquels les messages sont publiés.
3. Cliquez sur **Save**.

Semaphore envoie la requête sans en-têtes d'authentification : utilisez donc ce modèle et non ses variantes *from specific people* ou *from people in an org*.

---

### Étape 3. Copier l'URL du webhook {#step-3-copy-the-webhook-url}

1. Une fois le workflow créé, Teams affiche son lien de webhook. Copiez-le.
2. L'URL est longue et ressemble à ceci :

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

Le paramètre `sig` est la seule protection du webhook : toute personne qui possède l'URL peut publier dans le canal. Traitez l'URL entière comme un secret.

---

### Étape 4. Tester votre webhook {#step-4-test-your-webhook}

Utilisez `curl` pour tester :

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

Le corps de la requête a la même structure que les messages envoyés par Semaphore : un message avec une pièce jointe Adaptive Card. Si tout est correctement configuré, la réponse est `202 Accepted` et la carte apparaît dans le canal Teams sélectionné en quelques secondes.


## Configuration de Semaphore {#semaphore-configuration}

Une fois que vous disposez de votre URL de webhook Teams, vous pouvez activer les notifications Teams à l'aide du fichier de configuration ou de variables d'environnement. Redémarrez Semaphore pour appliquer la modification.

### Méthode 1 : fichier de configuration {#method-1-configuration-file}

Ajoutez les paramètres suivants à votre fichier de configuration Semaphore :

- `microsoft_teams_alert` : définissez-le à `true` pour activer les notifications Teams
- `microsoft_teams_url` : votre URL de webhook obtenue à l'étape précédente

Exemple de `config.json` :

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Méthode 2 : variables d'environnement {#method-2-environment-variables}

Vous pouvez également utiliser des variables d'environnement. Cette méthode est particulièrement utile pour les déploiements conteneurisés ou lorsque vous ne souhaitez pas que l'URL du webhook figure dans le fichier de configuration.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
L'URL contient les caractères `&` et `%`. Entourez-la de guillemets simples lorsque vous définissez la variable dans un shell. Dans une unité systemd, placez-la dans un `EnvironmentFile` plutôt que sur une ligne `Environment=`, où `%` introduit un spécificateur.
:::

## Activer les notifications pour un projet {#enabling-notifications-for-a-project}

Les paramètres ci-dessus activent le canal pour l'ensemble du serveur, et tous les messages sont envoyés dans le seul canal auquel appartient le webhook. Un projet ne les reçoit que s'il utilise les canaux du serveur, et un modèle de tâche peut supprimer les messages de succès ou d'échec. Consultez [Fonctionnement de l’envoi](/admin-guide/notifications#how-delivery-works), qui explique également comment envoyer un message de test sans lancer de tâche.

Teams est notifié lorsqu'une tâche réussit, échoue ou attend une confirmation.

Pour envoyer les notifications d'un projet vers un autre canal Teams, créez une [alerte du projet](/user-guide/alerts#project-alerts) de type Microsoft Teams avec sa propre URL de webhook.

## Contenu du message {#message-content}

| Élément de la carte | Valeur |
|---|---|
| En-tête | `Ansible Task Template Execution by:` suivi du nom de l'utilisateur qui a lancé la tâche, ou `—` si la tâche n'a pas été lancée par un utilisateur. |
| **Task** | Nom du modèle de tâche. |
| **Status** | Statut de la tâche avec une icône, par exemple `✅ SUCCESS`, `❌ ERROR` ou `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Numéro de la tâche. |
| Bouton **Task URL** | Ouvre la tâche dans Semaphore. Le lien est construit à partir de `web_host` : définissez donc cette option sur l'adresse à laquelle les utilisateurs ouvrent Semaphore. |

## Dépannage {#troubleshooting}

La requête est envoyée par le serveur Semaphore, et non par un runner, et le résultat est écrit dans le journal de la tâche. Semaphore envoie chaque message une seule fois et ne réessaie pas.

| Journal de la tâche | Points à vérifier |
|---|---|
| Aucune ligne concernant Microsoft Teams | L'envoi du message n'a pas été tenté. Vérifiez que `microsoft_teams_alert` vaut `true`, que le projet utilise les canaux du serveur et que le modèle ne supprime pas la notification. |
| `Can't send microsoft teams alert! Error: …` | Le serveur n'a pas pu joindre l'hôte du webhook. Autorisez le trafic HTTPS sortant du serveur vers l'hôte figurant dans l'URL. Derrière un proxy, définissez `HTTPS_PROXY` pour le serveur Semaphore, voir [Exécution derrière un proxy d'entreprise](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | Le webhook a rejeté la requête. Vérifiez que l'URL a été copiée en entier, y compris le paramètre `sig`, et que le workflow est activé et n'a pas été supprimé. Microsoft limite un webhook à quatre requêtes par seconde. |
| `Sent successfully microsoft teams alert`, mais aucune carte dans le canal | Le workflow a accepté la requête puis a échoué. Ouvrez le workflow dans l'application **Workflows** et consultez son historique d'exécution. Un workflow appartient à l'utilisateur qui l'a créé et cesse de fonctionner lorsque cet utilisateur quitte l'organisation ou perd l'accès au canal : ajoutez donc des copropriétaires au workflow. |
