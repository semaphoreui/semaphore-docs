# Telegram

### Voraussetzungen {#pre-requisites}

Um Semaphore UI so zu konfigurieren, dass Warnmeldungen über Telegram gesendet werden, sind vorab einige Schritte auf Telegram-Seite erforderlich.  Sie müssen einen eigenen Bot erstellen, der den Webhook empfängt, und Sie müssen die ID des Chats kennen, an den die Nachricht gesendet werden soll.

#### Bot einrichten {#bot-setup}

Am einfachsten richten Sie Ihren eigenen Bot über @BotFather ein.

1. Senden Sie in Ihrem Telegram-Client `/start` an @BotFather.
1. Folgen Sie den Anweisungen, um einen neuen Bot zu erstellen, und notieren Sie sich das im letzten Schritt angezeigte Autorisierungs-Token.  Hinweis: Dieses Token ist geheim und sollte entsprechend behandelt werden.
1. Senden Sie `/start` an Ihren neuen Bot, um ihn zu starten, damit er Nachrichten empfangen kann.

#### Chat-ID {#chat-id}

1. Senden Sie in Ihrem Telegram-Client eine beliebige Nachricht an @RawDataBot.
1.  Kopieren Sie den Wert des Schlüssels `id` in der `chat`-Map.

#### Testen {#testing}

Mit cURL können Sie die obigen Einstellungen wie folgt überprüfen:

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### Konfiguration {#configuration}

Mit der Chat-ID und dem Token aus den vorherigen Schritten können Sie Semaphore UI nun wie folgt für das Senden von Telegram-Warnmeldungen konfigurieren:

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

Beispiel für `config.json`:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### Chat-IDs pro Projekt {#per-project-chat-ids}

Jedes Projekt kann eine eigene Chat-ID verwenden.  So können Sie Benachrichtigungen nach Projekt trennen, statt sie alle an denselben Chat zu senden. Dies überschreibt die oben beschriebene globale Chat-ID.
