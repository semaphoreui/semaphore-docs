# Utenti

Il comando `semaphore users` aggiunge, modifica, rimuove e ispeziona gli utenti e
gestisce i loro token API e la verifica TOTP (2FA).

```bash
semaphore users --help
```

> `user` è un alias di `users`.

| Comando | Scopo |
|---------|---------|
| [`users add`](#add-a-user) | Crea un utente. |
| [`users change-by-login`](#change-a-user) | Aggiorna un utente individuato tramite login. |
| [`users change-by-email`](#change-a-user) | Aggiorna un utente individuato tramite email. |
| [`users get`](#show-a-user) | Stampa i dettagli di un utente. |
| [`users list`](#list-users) | Stampa i login di tutti gli utenti. |
| [`users delete`](#delete-a-user) | Rimuove un utente. |
| [`users token create`](#create-a-token) | Crea un token API per un utente. |
| [`users token list`](#list-tokens) | Elenca i token API di un utente. |
| [`users totp enable`](#totp-management) | Abilita il TOTP per un utente. |
| [`users totp show`](#totp-management) | Mostra i dettagli TOTP di un utente. |
| [`users totp disable`](#totp-management) | Disabilita il TOTP per un utente. |

## Aggiungere un utente {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Flag | Descrizione |
|------|-------------|
| `--login` | Login dell'utente. **Obbligatorio.** |
| `--name` | Nome visualizzato dell'utente. **Obbligatorio.** |
| `--email` | Email dell'utente. **Obbligatorio.** |
| `--password` | Password dell'utente. Obbligatoria per gli utenti normali; non consentita per gli utenti esterni. |
| `--admin` | Contrassegna il nuovo utente come amministratore. |
| `--external` | Contrassegna il nuovo utente come esterno (LDAP o OIDC). Agli utenti esterni non deve essere assegnata una `--password`. |

In caso di successo il comando stampa `User <login> <email> added!`.

## Modificare un utente {#change-a-user}

L'utente da modificare può essere individuato tramite login o tramite email.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Flag | Descrizione |
|------|-------------|
| `--login` | Per `change-by-login`, il login dell'utente da individuare (**obbligatorio**). Per `change-by-email`, il nuovo login dell'utente. |
| `--email` | Per `change-by-email`, l'email dell'utente da individuare (**obbligatoria**). Per `change-by-login`, la nuova email dell'utente. |
| `--name` | Nuovo nome dell'utente. |
| `--password` | Nuova password dell'utente. |
| `--admin` | Concede i diritti di amministratore. |

Vengono applicati solo i flag forniti; i campi omessi restano invariati.
`--admin` può solo concedere i diritti di amministratore. Non può revocarli; per questo
usare l'interfaccia web.

## Mostrare un utente {#show-a-user}

Stampa i dettagli di un singolo utente, individuato tramite login o email.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

È richiesto almeno uno tra `--login` e `--email`. L'output include l'ID
dell'utente, la data di creazione, il login, il nome, l'email e lo stato di amministratore. Se nessun utente
corrisponde, il comando stampa un messaggio ed esce con uno stato diverso da zero.

## Elencare gli utenti {#list-users}

Stampa i login di tutti gli utenti, uno per riga.

```bash
semaphore user list
```

## Eliminare un utente {#delete-a-user}

Rimuove un utente, individuato tramite login o email.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

È richiesto almeno uno tra `--login` e `--email`.

## Gestione dei token API {#api-token-management}

Gestire i token API di un utente tramite la CLI:

```bash
semaphore user token --help
```

### Creare un token {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Flag | Descrizione |
|------|-------------|
| `--login` | Login del proprietario del token. **Obbligatorio.** |
| `--name` | Nome del token. |
| `--ttl` | Durata del token come duration Go (ad esempio `1h`, `30m`, `24h`). Se omesso, il token non scade mai. |

Il comando stampa il nuovo token su una riga a sé, senza altro output, quindi può essere
catturato in sicurezza in uno script:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

Un valore `--ttl` non valido o un login sconosciuto vengono segnalati e il comando esce
con uno stato diverso da zero.

### Elencare i token {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` è obbligatorio. Ogni riga riporta il nome del token, il suo stato (`active` o
`expired`) e la data di scadenza in formato RFC 3339 (`never` se non ha
scadenza), separati da tabulazioni. I valori dei token non vengono mai stampati.

## Gestione del TOTP {#totp-management}

Gestire la verifica tramite password monouso basata sul tempo (2FA) dalla CLI:

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Tutti i sottocomandi TOTP richiedono `--login`.

- `enable` stampa un codice di recupero monouso, l'URL `otpauth://` e un
  codice QR scansionabile. Conservare il codice di recupero in un luogo sicuro. Fallisce se il TOTP
  è già abilitato per l'utente.
- `show` stampa di nuovo l'URL `otpauth://` e il codice QR, oppure `TOTP disabled` se
  l'utente non ha alcun TOTP configurato.
- `disable` rimuove la verifica TOTP dell'utente. Fallisce se il TOTP non è
  abilitato.

L'issuer mostrato nelle app di autenticazione è preso dall'opzione di configurazione `mfa.totp.app_name`
(`SEMAPHORE_TOTP_ISSUER`). Il valore predefinito è `Semaphore`.
