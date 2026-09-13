---
title: Notifiche
description: Come Semaphore recapita gli avvisi sui Task, i canali che supporta e i due interruttori che devono essere attivi perché venga inviato qualcosa.
---

# Notifiche

Semaphore comunica i risultati dei Task via chat ed email. Un canale si configura una
sola volta sul server, in `config.json` oppure tramite variabili d'ambiente, e vale
poi per tutti i Project. Quali Task producano un avviso viene deciso per singolo
Project e per singolo Task Template nell'interfaccia web.

## Come funziona il recapito {#how-delivery-works}

Tre impostazioni determinano se un messaggio viene inviato, e tutte e tre devono
consentirlo:

1. **Il canale è configurato sul server.** Ogni provider ha le proprie chiavi in
   `config.json`. Vedere più sotto la pagina del provider corrispondente.
2. **Il Project consente gli avvisi.** *Allow alerts for this project* nelle
   [impostazioni del Project](/user-guide/projects/settings) è l'interruttore
   principale. Se è disattivato, nessun canale invia alcunché riguardo a quel
   Project.
3. **Il Task Template lo richiede.** Un Task Template sceglie se inviare un avviso in
   caso di successo, in caso di errore oppure mai, vedere
   [Task Template](/user-guide/task-templates).

Utilizzare **Test alerts** nelle impostazioni del Project per inviare un messaggio di
prova attraverso ogni canale configurato senza eseguire un Task.

## Canali {#channels}

| Canale | Pagina |
|---|---|
| Email (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

È possibile abilitare più canali contemporaneamente; ciascuno riceve tutti gli avvisi
che superano i tre controlli descritti sopra.

## Override per Project {#per-project-overrides}

Telegram supporta una chat per singolo Project: impostare **Telegram Chat ID** nelle
[impostazioni del Project](/user-guide/projects/settings) per instradare gli avvisi
di un Project verso una chat diversa da quella valida per l'intero server. Gli altri
canali usano la configurazione del server per tutti i Project.

## Da dove iniziare {#where-to-start}

Configurare prima un solo canale, attivare *Allow alerts for this project* e premere
**Test alerts**. Una volta arrivato il messaggio di prova, abilitare gli avvisi sui
Task Template che interessano.
