---
title: Notifiche
description: Come Semaphore consegna gli avvisi delle attività, i canali supportati e il rapporto tra canali del server e avvisi per progetto.
---

# Notifiche

Semaphore segnala i risultati delle attività via chat ed e-mail in due modi:

- **I canali del server** sono configurati una volta sul server, in `config.json` o tramite
  variabili d’ambiente, e sono disponibili per ogni progetto. Questa pagina li descrive.
- **Gli avvisi del progetto** sono destinazioni con nome create dai membri del progetto nella
  scheda [Avvisi](/user-guide/alerts) del progetto, con chat, webhook o destinatari
  propri, e collegate a modelli e pianificazioni.

## Come funziona la consegna {#how-delivery-works}

Per un canale del server tre impostazioni decidono se un messaggio viene inviato, e tutte e tre
devono consentirlo:

1. **Il canale è configurato sul server.** Ogni provider ha le proprie chiavi in `config.json`.
   Vedi la pagina di quel provider qui sotto.
2. **Il progetto usa i canali del server.** *Invia gli avvisi di questo progetto ai canali del
   server* nella scheda [Avvisi](/user-guide/alerts#server-channels) del progetto è
   l’interruttore principale. Se è spento, i canali del server non inviano nulla su quel
   progetto. Gli avvisi del progetto non dipendono da questo interruttore.
3. **Il modello lo richiede.** Un modello che usa i *predefiniti del progetto* invia ai canali
   del server; un modello con un elenco personalizzato di avvisi no. I modelli possono anche
   sopprimere le notifiche di successo o errore, vedi
   [Modelli di attività](/user-guide/task-templates).

I canali chat segnalano successi, errori e attività in attesa di conferma; l’e-mail segnala solo
gli errori. Gli avvisi del progetto possono sovrascrivere gli eventi per destinazione.

Usa **Prova tutto** nella scheda Avvisi per inviare un messaggio di prova tramite ogni canale del
server e ogni avviso del progetto abilitato senza eseguire un’attività.

## Canali {#channels}

| Canale | Pagina |
|---|---|
| E-mail (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Più canali possono essere abilitati contemporaneamente; ognuno riceve ogni avviso che supera i
tre controlli sopra. Gli stessi provider sono disponibili per gli avvisi del progetto; gli avvisi
e-mail e Telegram riutilizzano il server SMTP e il token del bot dalla configurazione del
server, e un avviso Gotify senza URL e token propri riutilizza la coppia del server.

## Sovrascritture per progetto {#per-project-overrides}

Telegram supporta una chat per progetto: imposta **Telegram Chat ID** nella scheda
[Avvisi](/user-guide/alerts#server-channels) del progetto per indirizzare i messaggi
dei canali del server di un progetto a una chat diversa da quella del server. Per qualsiasi
altra destinazione per progetto crea un [avviso del progetto](/user-guide/alerts#project-alerts).

## Da dove iniziare {#where-to-start}

Configura prima un canale, apri la scheda Avvisi del progetto, attiva *Invia gli avvisi di questo
progetto ai canali del server* e premi **Prova tutto**. Quando arriva un messaggio di prova,
sistema i modelli che contano.
