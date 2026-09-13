# Telegram

### Prérequis {#pre-requisites}

Pour configurer Semaphore UI afin qu'il envoie des alertes via Telegram, quelques étapes préalables sont nécessaires côté Telegram. Vous devrez créer votre propre bot, qui recevra le webhook, et connaître l'ID du chat auquel vous souhaitez envoyer le message.

#### Configuration du bot {#bot-setup}

Le moyen le plus simple de configurer votre propre bot est d'utiliser @BotFather.

1. Dans votre client Telegram, envoyez `/start` à @BotFather.
1. Suivez les instructions pour créer un nouveau bot et notez le token d'autorisation fourni à la dernière étape. Remarque : ce token est secret et doit être traité comme tel.
1. Envoyez `/start` à votre nouveau bot pour le démarrer afin qu'il puisse recevoir des messages.

#### ID du chat {#chat-id}

1. Dans votre client Telegram, envoyez n'importe quel message à @RawDataBot.
1.  Copiez la valeur de la clé `id` dans l'objet `chat`.

#### Test {#testing}

Vous pouvez utiliser cURL pour valider les paramètres ci-dessus comme suit :

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### Configuration {#configuration}

En utilisant l'ID du chat et le token obtenus aux étapes précédentes, vous pouvez maintenant configurer Semaphore UI pour envoyer des alertes Telegram comme suit :

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

Exemple de `config.json` :

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### ID de chat par projet {#per-project-chat-ids}

Chaque projet peut utiliser un ID de chat distinct. Cela vous permet de séparer les notifications par projet plutôt que de toutes les envoyer vers le même chat. Ce paramètre remplace l'ID de chat global défini ci-dessus.
