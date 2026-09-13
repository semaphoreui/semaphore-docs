# Telegram

### Preduslovi {#pre-requisites}

Da biste podesili Semaphore UI da šalje upozorenja preko Telegrama, prethodno je potrebno obaviti nekoliko koraka na Telegram strani.  Potrebno je da kreirate sopstvenog bota koji će primati webhook i da znate ID ćaskanja u koje želite da šaljete poruke.

#### Podešavanje bota {#bot-setup}

Najlakši način da podesite sopstvenog bota jeste da koristite @BotFather.

1. U svom Telegram klijentu pošaljite @BotFather poruku `/start`.
1. Pratite uputstva da biste kreirali novog bota i zabeležite Authorization Token dobijen u poslednjem koraku.  Napomena: ovaj token je tajan i tako ga treba i tretirati.
1. Pošaljite svom novom botu poruku `/start` da biste ga pokrenuli kako bi mogao da prima poruke.

#### ID ćaskanja {#chat-id}

1. U svom Telegram klijentu pošaljite @RawDataBot bilo koju poruku.
1.  Kopirajte vrednost ključa `id` iz mape `chat`.

#### Testiranje {#testing}

Gornja podešavanja možete proveriti pomoću cURL-a na sledeći način:

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### Podešavanje {#configuration}

Koristeći ID ćaskanja i token iz prethodnih koraka, sada možete podesiti Semaphore UI da šalje Telegram upozorenja na sledeći način:

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

Primer `config.json`:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### ID-jevi ćaskanja po projektu {#per-project-chat-ids}

Svaki projekat (Project) može koristiti jedinstven ID ćaskanja.  To vam omogućava da razdvojite obaveštenja po projektima umesto da sva idu u isto ćaskanje. Ovo ima prednost nad globalnim ID-jem ćaskanja opisanim iznad.
