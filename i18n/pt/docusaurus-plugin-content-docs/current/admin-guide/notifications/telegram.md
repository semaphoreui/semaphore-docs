# Telegram

### Pré-requisitos {#pre-requisites}

Para configurar o Semaphore UI para enviar alertas via Telegram, alguns passos são necessários antes do lado do Telegram.  Você precisará criar seu próprio bot, que receberá o webhook, e precisará saber o ID do chat para o qual deseja enviar a mensagem.

#### Configuração do bot {#bot-setup}

A maneira mais fácil de configurar seu próprio bot é usar o @BotFather.

1. No seu cliente do Telegram, envie `/start` para o @BotFather.
1. Siga as instruções para criar um novo bot e anote o Token de Autorização fornecido no último passo.  Observação: esse token é secreto e deve ser tratado como tal.
1. Envie `/start` para o seu novo bot para iniciá-lo, de modo que ele possa receber mensagens.

#### ID do chat {#chat-id}

1. No seu cliente do Telegram, envie qualquer mensagem para o @RawDataBot.
1.  Copie o valor da chave `id` no mapa `chat`.

#### Testando {#testing}

Você pode usar o cURL para validar as configurações acima da seguinte forma:

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### Configuração {#configuration}

Usando o ID do chat e o Token dos passos anteriores, agora você pode configurar o Semaphore UI para enviar alertas do Telegram da seguinte forma:

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

Exemplo de `config.json`:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### IDs de chat por projeto {#per-project-chat-ids}

Cada projeto pode usar um ID de chat exclusivo.  Isso permite separar as notificações por projeto em vez de enviá-las todas para o mesmo chat. Isso sobrescreve o ID de chat global definido acima.
