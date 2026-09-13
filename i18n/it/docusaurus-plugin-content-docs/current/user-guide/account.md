# Il proprio account

Le impostazioni personali si trovano nel menu dell'account in fondo alla barra laterale. Fare clic sul proprio nome per aprirlo.

![Menu dell'account](/assets/user-menu.webp)

| Voce | Descrizione |
|---|---|
| Version | La versione di Semaphore UI in esecuzione sul server. |
| **API Tokens** | Token personali per l'[API REST](/reference/api). |
| **Edit Account** | Il proprio nome, nome utente, e-mail, preferenza sugli avvisi e password. |
| **Sign Out** | Termina la sessione. |

Accanto al menu si trovano l'interruttore della **modalità scura** e il selettore della **lingua**. Entrambe le impostazioni sono memorizzate nel browser.

## Modifica dell'account {#edit-account}

![Finestra di dialogo di modifica dell'account](/assets/account-edit.webp)

La scheda **Settings** contiene:

| Campo | Descrizione |
|---|---|
| **Name** | Nome visualizzato mostrato nella cronologia dei Task e nelle attività. |
| **Username** | Nome utilizzato per l'accesso. |
| **Email** | Indirizzo utilizzato per gli avvisi via e-mail e il recupero della password. |
| **Send alerts** | Ricevere avvisi via e-mail sui Task. Gli avvisi vengono inviati solo se il [canale e-mail](/admin-guide/notifications/email) è configurato e il Project consente gli avvisi. |

I badge accanto alle caselle di controllo mostrano i propri flag globali: **Pro user** su un'istanza Pro, **Admin** per gli amministratori, **External** per gli account gestiti da LDAP o OpenID Connect. Gli utenti esterni non possono modificare qui il proprio nome utente o la propria password.

La scheda **Security** consente di modificare la password. Se l'amministratore ha abilitato le password monouso basate sul tempo, il secondo fattore si configura nella stessa scheda.

![Scheda Security](/assets/account-security.webp)

## Token API {#api-tokens}

Scegliere **API Tokens** nel menu dell'account. La pagina elenca i propri token con la data di creazione, la data di scadenza e lo stato. Il collegamento **API Reference** apre la Swagger UI integrata nella propria istanza.

![Token API](/assets/api-tokens.webp)

Fare clic su **New Token**, assegnare un nome al token e scegliere quando scade. Il valore del token viene mostrato una sola volta dopo la creazione: copiarlo immediatamente.

![Finestra di dialogo per un nuovo token](/assets/api-token-new.webp)

Utilizzare il token nell'intestazione `Authorization: Bearer`, vedere [API](/reference/api). Per revocare un token, eliminarlo dall'elenco.
