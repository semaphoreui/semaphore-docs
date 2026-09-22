---
title: Avvisi
description: La scheda Avvisi di un progetto, dove si attivano i canali del server e si creano, testano e collegano a modelli e pianificazioni gli avvisi con nome del progetto.
---

# Avvisi

La scheda **Avvisi** di un progetto decide dove vengono segnalati i risultati delle attività. Ha due parti:

- **Canali del server**: i provider di notifica che un amministratore ha configurato sul server in `config.json`, vedi [Notifiche](/admin-guide/notifications). Sono condivisi da tutti i progetti e ogni progetto decide se usarli.
- **Avvisi del progetto**: destinazioni con nome che appartengono al progetto: una chat Telegram, un webhook Slack, un elenco di indirizzi e-mail e così via. Modelli e pianificazioni scelgono quali avvisi inviare.

Le due parti possono essere usate insieme.

![Scheda Avvisi di un progetto](/assets/alerts-page.webp)

## Canali del server {#server-channels}

La scheda in cima alla pagina elenca i canali configurati sul server. Attiva **Invia gli avvisi di questo progetto ai canali del server** per ricevere tramite essi ogni risultato delle attività di questo progetto. È lo stesso interruttore che nelle versioni precedenti si chiamava **Allow alerts for this project** nelle impostazioni del progetto.

Telegram compare non appena il server ha un token del bot, in grigio finché non è noto un chat. Fai clic sul chip per inserire il **Telegram Chat ID** di questo progetto; sostituisce la chat del server ed è obbligatorio quando il server non ne ha una.

I canali del server segnalano ogni stato rilevante: successo, errore e *in attesa di conferma*. L’e-mail segnala solo gli errori. Un modello può comunque sopprimere le notifiche di successo o di errore, vedi [Avvisi del modello](#template-alerts).

![Scheda dei canali del server con l’ID chat Telegram aperto](/assets/alerts-server-channels.webp)

## Avvisi del progetto {#project-alerts}

![Menu Nuovo avviso](/assets/alerts-new-menu.webp)

Premi **Nuovo avviso** per creare una destinazione. Ogni avviso ha:

| Campo | Descrizione |
|---|---|
| **Nome** | Mostrato nei moduli di modelli e pianificazioni. Univoco nel progetto. |
| **Tipo** | Il canale: Telegram, Slack, Email, Microsoft Teams, Rocket.Chat, DingTalk o Gotify. Il modulo mostra i campi di destinazione richiesti dal canale. |
| **Destinazione** | ID chat e argomento del forum opzionale per Telegram; URL del webhook per Slack, Teams, Rocket.Chat e DingTalk; URL del server per Gotify; destinatari per l’e-mail (lascia vuoto per avvisare i membri del progetto che hanno attivato gli avvisi nel profilo). |
| **Segreto** | Telegram, Gotify ed e-mail richiedono un segreto: il token del bot, il token dell’applicazione, le credenziali SMTP. *Usa le impostazioni del server* lo prende dalla configurazione del server; *Usa il mio* lo prende da una chiave di accesso del Key Store (tipo *Token segreto* per i token, *Login con password* per SMTP). Un avviso e-mail con credenziali proprie può anche impostare host SMTP, porta, mittente e cifratura propri. |
| **Invia su** | Gli eventi ascoltati dall’avviso: successo, errore, in attesa di conferma. I nuovi avvisi partono dai valori predefiniti del canale. |
| **Predefinito del progetto** | Contrassegna l’avviso come uno dei predefiniti del progetto. Ogni modello che usa i predefiniti del progetto lo invia. |
| **Abilitato** | Un avviso disabilitato non viene mai inviato e non è un predefinito del progetto. |
| **Modello del messaggio** | Template Go opzionale per il corpo del messaggio. Lascia il testo integrato per seguire i futuri aggiornamenti del server. |

I segreti non vengono mai salvati sull’avviso: risiedono cifrati nel Key Store e la chiave non può essere eliminata finché un avviso la usa. Se il server non ha token del bot, server SMTP o coppia Gotify configurati, il modulo offre solo *Usa il mio*. Gli URL dei webhook devono usare `http` o `https` e non possono puntare al server stesso.

Usa **Invia messaggio di prova** nell’elenco per verificare un avviso e **Prova tutto** nella barra degli strumenti per inviare una prova a ogni destinazione abilitata del progetto, canali del server compresi.

Un avviso collegato a un modello o a una pianificazione non può essere eliminato. La finestra elenca gli oggetti che lo usano.

![Avviso Telegram con token del bot proprio](/assets/alert-form-telegram.webp)

![Avviso e-mail con server SMTP proprio](/assets/alert-form-email.webp)

### Modelli di messaggio {#message-templates}

Il corpo è un `text/template` Go (`html/template` per l’e-mail). I campi disponibili sono:

| Campo | Valore |
|---|---|
| `.Name` | Nome del modello |
| `.Author` | Nome dell’utente che ha avviato l’attività, oppure `—` |
| `.Project.Name`, `.Project.ID` | Il progetto |
| `.Playbook` | Playbook o script del modello |
| `.ScheduleName` | Nome della pianificazione che ha avviato l’attività, se presente |
| `.Task.ID`, `.Task.URL` | Numero dell’attività e link al suo log |
| `.Task.Result` | Stato con icona, ad esempio `✅ SUCCESS` |
| `.Task.Desc` | Messaggio inserito all’avvio dell’attività |
| `.Task.Version` | Versione di build, o versione di build in ingresso per le attività di deploy |
| `.Task.Duration` | Durata dell’esecuzione, vuota finché l’attività non parte |
| `.Task.Trigger` | `manual`, `schedule`, `integration` o `api` |
| `.Color` | Colore dell’allegato per Slack e Rocket.Chat |

Per i canali chat il testo renderizzato deve essere il documento JSON atteso dal messenger; il template integrato è un buon punto di partenza. I corpi Telegram sono testo semplice con formattazione HTML; chat e argomento vengono aggiunti da Semaphore.

## Avvisi del modello {#template-alerts}

Nella sezione **Avanzate** di un modello di attività, **Avvisi** sceglie tra:

- **Usa i predefiniti del progetto**: i canali del server, quando sono attivi per il progetto, più gli avvisi contrassegnati come predefiniti del progetto. I modelli esistenti mantengono questo comportamento dopo un aggiornamento.
- **Usa un insieme personalizzato di avvisi**: solo gli avvisi selezionati. Una selezione vuota significa che il modello non invia nulla.

**Sopprimi le notifiche di successo** e **Sopprimi le notifiche di errore** valgono per entrambe le scelte. Le notifiche di un’attività in attesa di conferma non vengono mai soppresse.

![Modello di attività con un insieme personalizzato di avvisi](/assets/template-form-alerts.webp)

## Avvisi della pianificazione {#schedule-alerts}

Una pianificazione può **usare gli avvisi del modello** o **usare un insieme diverso di avvisi**. La seconda scelta sostituisce del tutto la selezione del modello per le attività avviate da quella pianificazione: un job notturno può segnalare a un canale di reperibilità mentre le esecuzioni manuali restano silenziose.

![Pianificazione con un proprio insieme di avvisi](/assets/schedule-form-alerts.webp)

## Come viene instradata un’attività {#how-a-task-is-routed}

Le destinazioni di un’attività vengono fissate alla sua creazione. Modificare un avviso, un modello o una pianificazione mentre un’attività è in esecuzione non cambia dove quell’attività viene segnalata. Ogni consegna viene registrata per attività, destinazione ed evento, così in un’installazione ad alta disponibilità un solo nodo del server invia ogni messaggio.

## Backup {#backups}

Gli avvisi del progetto fanno parte del [backup del progetto](./projects/settings#danger-zone). Modelli e pianificazioni vi fanno riferimento per nome, quindi un progetto ripristinato mantiene i collegamenti. Gli avvisi fanno riferimento alla propria chiave di accesso per nome; come per ogni chiave, il valore segreto non viene esportato.
