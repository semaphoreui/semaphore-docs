---
title: Autenticazione a due fattori
description: Come funziona l'autenticazione a due fattori TOTP in Semaphore, come attivarla per il server, configurarla per un account, accedere con un codice e ripristinare l'accesso.
---

# Autenticazione a due fattori

L'autenticazione a due fattori (2FA) chiede una seconda prova dopo il primo passaggio di
accesso: un codice a sei cifre generato da un'app di autenticazione sul telefono dell'utente.
Una password rubata, da sola, non basta più per entrare.

Semaphore implementa il secondo fattore con TOTP — le password monouso basate sul tempo, lo
standard su cui si basano Google Authenticator, Microsoft Authenticator, Aegis, 1Password,
Bitwarden e app simili. È disponibile in tutte le edizioni.

## Come funziona {#how-it-works}

Due interruttori decidono se un accesso richiede un codice:

- **Il server** deve consentire TOTP — l'opzione `mfa.totp.enabled`. È disattivata per
  impostazione predefinita.
- **L'account** deve avere TOTP configurato. Ogni utente lo attiva per il proprio account; non
  viene imposto a tutti.

Quando entrambi sono attivi, un accesso avviene in due passaggi:

1. L'utente accede come al solito — con una password, tramite LDAP o tramite un provider OpenID
   Connect. Il secondo fattore si applica a tutti e tre.
2. Semaphore apre una sessione ma la contrassegna come non verificata e chiede il codice. Finché
   il codice non viene accettato, ogni chiamata API su quella sessione viene rifiutata con `401` e
   `{"error":"TOTP_REQUIRED"}`.
3. L'utente inserisce il codice mostrato dall'app. Semaphore lo confronta con il segreto
   memorizzato per l'account; un codice corretto verifica la sessione e l'utente è dentro.

Il codice cambia ogni 30 secondi e l'app lo calcola a partire da un segreto ricevuto una sola
volta, quando l'account è stato configurato. Semaphore e il telefono non comunicano mai tra loro,
quindi al telefono non serve una connessione di rete — solo un orologio più o meno esatto.

## Attivarla per il server {#turn-it-on-for-the-server}

Aggiungete la sezione `mfa.totp` al file di configurazione e riavviate Semaphore:

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

Le stesse impostazioni possono essere fornite come variabili d'ambiente:

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Opzione | Variabile d'ambiente | Effetto |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Consente agli utenti di configurare TOTP e fa sì che l'accesso richieda il codice. Senza di essa l'impostazione non viene mostrata a nessuno. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Fornisce a ogni utente un [codice di ripristino](#recovery-code) monouso quando configura TOTP e gli consente di accedere con esso quando perde il telefono. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | Il nome dell'emittente che un'app di autenticazione mostra accanto all'account. Il valore predefinito è `Semaphore`. Vedere l'avviso qui sotto. |

:::warning ⚠️ `app_name` non è usato dall'interfaccia web (2026-11-27)
Un account configurato dall'interfaccia web è sempre etichettato `Semaphore:<email>` nell'app di
autenticazione, qualunque sia il valore di `mfa.totp.app_name`. Solo
[`semaphore users totp enable`](#manage-the-second-factor-from-the-command-line) usa il nome
configurato. Se gestite più di un Semaphore, gli utenti distinguono le voci dall'indirizzo
e-mail, oppure rinominano la voce nella propria app.
:::

Ogni opzione è elencata anche nel
[riferimento della configurazione](/reference/configuration).

## Configurare TOTP per il proprio account {#set-up-totp-for-your-account}

Installate prima un'app di autenticazione sul telefono. Poi:

1. Aprite un Project, fate clic sul vostro nome in fondo alla barra laterale e scegliete
   **Edit Account**.
2. Aprite la scheda **Security**.
3. In **Two-factor authentication**, attivate **Time-based one-time password**.
   Semaphore crea subito il segreto e lo mostra come codice QR.
4. Nell'app di autenticazione aggiungete un account e scansionate il codice QR. L'app inizia a
   mostrare un codice a sei cifre per `Semaphore`.
5. Se sotto il codice QR compare un **Recovery code**, copiatelo con il pulsante accanto e
   conservatelo in un posto sicuro — un password manager, oppure su carta. Viene mostrato solo
   adesso.
6. Chiudete la finestra di dialogo.

<div style={{maxWidth: 450}}>

![La scheda Security della finestra Edit User con l'autenticazione a due fattori attivata: un codice QR da scansionare e sotto un codice di ripristino](/assets/two-factor-enrol.webp)

</div>

L'interruttore ha effetto immediato; non c'è un pulsante **Save** da premere né un codice di
prova da inserire. Assicuratevi che l'app mostri un codice per Semaphore prima di disconnettervi:
l'accesso successivo lo richiederà.

In seguito potete riaprire la scheda **Security** per scansionare il codice QR su un secondo
dispositivo. Il codice di ripristino non viene mostrato di nuovo.

## Accedere con un codice {#sign-in-with-a-code}

Dopo il passaggio con password, LDAP o single sign-on, Semaphore mostra **Two-step verification**:

![La schermata Two-step verification che chiede il codice a sei cifre dell'app di autenticazione](/assets/two-factor-verify.webp)

Digitate le sei cifre che l'app mostra in quel momento. Il modulo viene inviato da solo dopo la
sesta cifra. Un codice errato o scaduto mostra un errore e vi lascia sulla stessa schermata;
attendete il codice successivo e riprovate.

**Return to login** abbandona questo accesso e ricomincia da capo.

## Usare il codice di ripristino {#recovery-code}

Quando il telefono viene perso o reimpostato, il codice di ripristino permette all'utente di
rientrare da solo:

1. Accedete con la vostra password come al solito.
2. In **Two-step verification**, fate clic su **Use recovery code**.
3. Inserite il codice di ripristino e fate clic su **Send**.

Semaphore vi fa accedere e **rimuove TOTP dal vostro account**. Con esso viene consumato anche
il codice di ripristino. Configurate di nuovo TOTP subito, come descritto
[sopra](#set-up-totp-for-your-account), per ottenere un nuovo segreto e un nuovo codice di
ripristino.

**Use recovery code** compare solo quando sul server è attivata `mfa.totp.allow_recovery`.
I codici di ripristino sono lunghi 16 caratteri e vengono memorizzati solo come hash bcrypt,
quindi nessuno — amministratori compresi — può rileggere in seguito il codice di un utente.

## Rimuovere il secondo fattore {#remove-the-second-factor}

**Il proprio account.** Disattivate **Time-based one-time password** nella scheda **Security** di
**Edit Account**. TOTP viene rimosso subito e l'accesso successivo chiede solo il primo
passaggio. Eliminate anche la voce di Semaphore dall'app di autenticazione; non corrisponde più
a nulla.

**L'account di un'altra persona.** Un utente che ha perso il telefono e non ha un codice di
ripristino non può rimuovere TOTP da solo. Un amministratore, o un utente il cui ruolo globale
consente di gestire gli utenti, apre **Users**, modifica quell'utente e disattiva l'interruttore
nella scheda **Security**. L'utente accede con la sola password e configura di nuovo TOTP.

### Gestire il secondo fattore da riga di comando {#manage-the-second-factor-from-the-command-line}

Sul server si può fare lo stesso senza l'interfaccia web — utile quando l'unico amministratore
ha perso il telefono:

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` configura TOTP per un utente e stampa nel terminale
l'URL `otpauth://`, un codice QR e un codice di ripristino; `show` stampa l'URL e il codice QR di
una configurazione esistente. Entrambi stampano il segreto stesso, quindi eseguiteli solo dove
nessun altro può vedere il terminale e consegnate il codice QR direttamente al suo proprietario.
La sintassi completa si trova in [`semaphore users`](/reference/cli/users#totp-management).

## Disattivarla per il server {#turn-it-off-for-the-server}

Impostate `mfa.totp.enabled` a `false`, oppure rimuovete la sezione, e riavviate. L'accesso
smette quindi di chiedere codici e l'impostazione **Two-factor authentication** scompare da
**Security**.

Nessuna configurazione viene eliminata. Riattivate l'opzione e ogni account che aveva TOTP
chiede di nuovo il proprio codice, con lo stesso segreto — non serve scansionare nulla una
seconda volta.

## Cose da sapere {#things-to-know}

- **I token API saltano il secondo fattore.** A una richiesta con un token
  `Authorization: Bearer` non viene mai chiesto un codice. Un token può essere creato solo da una
  sessione con accesso completo, ma i token che esistevano prima della configurazione di TOTP
  continuano a funzionare. Controllateli nella pagina **API Tokens** dopo aver attivato TOTP.
- **Semaphore non limita i tentativi di inserimento del codice.** Sei cifre sono uno spazio
  ridotto, quindi impostate un limite di frequenza su `POST /api/auth/verify` e
  `POST /api/auth/recovery` nel vostro [reverse proxy](/admin-guide/reverse-proxy).
- **Il segreto è memorizzato nel database così com'è.** Chiunque possa leggere la tabella
  `user__totp`, o un backup del database, può generare codici validi per ogni account.
  Proteggete i backup come proteggete il file di configurazione.
- **TOTP non può essere reso obbligatorio.** Semaphore non ha alcuna opzione che obblighi gli
  utenti a configurarlo. Se la vostra policy richiede un secondo fattore per tutti, applicatela
  nel vostro provider di identità e fate accedere gli utenti tramite
  [OpenID Connect](/admin-guide/authentication/openid).

La configurazione, la rimozione e l'uso del secondo fattore vengono registrati nel
[log di audit](/admin-guide/audit-log) come eventi `iam.mfa` e `auth.mfa`; vedere
[Eventi di audit](/reference/audit-events) per l'elenco.

## Prossimi passi {#whats-next}

- [Account locali](/admin-guide/authentication/local) — password, durata della sessione e
  disattivazione dell'accesso con password.
- [Sicurezza](/admin-guide/security) — parametri di hashing, cifratura e hardening.
- [`semaphore users`](/reference/cli/users#totp-management) — i comandi TOTP.
