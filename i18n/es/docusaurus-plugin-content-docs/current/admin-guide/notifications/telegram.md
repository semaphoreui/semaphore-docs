# Telegram

### Requisitos previos {#pre-requisites}

Para configurar Semaphore UI de modo que envíe alertas a través de Telegram, es necesario realizar previamente algunos pasos en el lado de Telegram.  Deberá crear su propio bot que recibirá el webhook y deberá conocer el ID del chat al que desea enviar el mensaje.

#### Configuración del bot {#bot-setup}

La forma más sencilla de crear su propio bot es usar @BotFather.

1. En su cliente de Telegram, envíe `/start` a @BotFather.
1. Siga las indicaciones para crear un nuevo bot y anote el token de autorización que se proporciona en el último paso.  Nota: este token es secreto y debe tratarse como tal.
1. Envíe `/start` a su nuevo bot para iniciarlo, de modo que pueda recibir mensajes.

#### ID del chat {#chat-id}

1. En su cliente de Telegram, envíe cualquier mensaje a @RawDataBot.
1.  Copie el valor de la clave `id` dentro del mapa `chat`.

#### Pruebas {#testing}

Puede usar cURL para validar la configuración anterior de la siguiente manera:

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### Configuración {#configuration}

Con el ID del chat y el token de los pasos anteriores, ya puede configurar Semaphore UI para enviar alertas de Telegram de la siguiente manera:

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

Ejemplo de `config.json`:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### IDs de chat por proyecto {#per-project-chat-ids}

Cada proyecto puede usar un ID de chat único.  Esto permite separar las notificaciones por proyecto en lugar de enviarlas todas al mismo chat. Esta opción sobrescribe el ID de chat global indicado arriba.
