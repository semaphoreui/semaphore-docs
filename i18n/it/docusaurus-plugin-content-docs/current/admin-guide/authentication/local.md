---
title: Account locali
description: Accesso con password sul database di Semaphore - come vengono memorizzate le password, l'autenticazione a due fattori TOTP, la durata della sessione e la disattivazione delle password.
---

# Account locali

Un account locale conserva la propria password nel database di Semaphore. Ogni installazione ne
possiede uno fin dall'inizio, creato da `semaphore setup` o dalle variabili
`SEMAPHORE_ADMIN_*`, ed è con quell'account che si raggiunge il server prima che esista un
provider di identità.

Mantenete almeno un amministratore locale anche dopo che il single sign-on funziona. È l'unico
modo per rientrare quando il provider di identità non è raggiungibile.

## Come vengono memorizzate le password {#how-passwords-are-stored}

Le password vengono sottoposte ad hashing con **Argon2id** usando i parametri di robustezza
minima OWASP, e i parametri vengono registrati accanto a ciascun hash in
[formato stringa PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).
Le release precedenti alla 2.20 usavano bcrypt; quegli hash continuano a funzionare e ciascuno
viene sostituito da un hash Argon2id al successivo accesso riuscito del proprietario. Gli account
che non accedono mai più mantengono il loro hash bcrypt, quindi reimpostate quelle password per
aggiornarle.

La tabella completa dei parametri si trova in [Sicurezza](/admin-guide/security#password-hashing).

Semaphore non impone alcuna policy sulle password: nessuna lunghezza minima, nessuna complessità,
nessuna scadenza. Se ne serve una, usate una directory o un provider di identità, che è il posto
a cui tali policy appartengono.

## Gestire gli account {#manage-accounts}

Gli amministratori gestiscono gli utenti dall'interfaccia web e le stesse operazioni sono
disponibili da riga di comando, per gli script e per il ripristino quando nessuno riesce ad
accedere:

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

Vedere [`semaphore users`](/reference/cli/users) per tutti i flag e [Team](/user-guide/team) per
sapere che cosa consente di fare un ruolo una volta che l'utente è dentro.

:::warning
Una password digitata da riga di comando finisce nella cronologia della shell e nell'elenco dei
processi della macchina. Usatela per il primo amministratore e per il ripristino, poi cambiate la
password dall'interfaccia web.
:::

## Autenticazione a due fattori {#two-factor-authentication}

Semaphore supporta TOTP: i codici a sei cifre generati da Google Authenticator, Aegis, 1Password
e app simili. È disattivato per impostazione predefinita e si applica agli account che lo
abilitano — non viene imposto a tutti.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| Opzione | Effetto |
|---|---|
| `mfa.totp.enabled` | Consente agli utenti di aggiungere TOTP al proprio account. Senza di essa nessuno può registrarsi. |
| `mfa.totp.allow_recovery` | Rilascia un codice di ripristino al momento della registrazione, così un telefono perso non significa un account perso. Inserendolo **viene rimossa la registrazione TOTP** e l'utente viene autenticato; successivamente si registra di nuovo. Il codice è memorizzato come hash bcrypt. |
| `mfa.totp.app_name` | L'etichetta dell'emittente mostrata dall'app di autenticazione. Impostatela quando gestite più di un Semaphore. |

Gli utenti si registrano dalla pagina del proprio account. Un amministratore può consultare o
rimuovere il secondo fattore di chi ha perso il proprio dispositivo:

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

Disattivare nuovamente `mfa.totp.enabled` non elimina la registrazione di nessuno; impedisce
soltanto che venga richiesto il secondo fattore. Riattivatela e le vecchie registrazioni tornano
valide.

## Durata della sessione {#session-lifetime}

Una sessione scade dopo **sette giorni di inattività**. Quel timeout di inattività è integrato e
non è configurabile.

Un limite assoluto invece lo è, ed è misurato dal momento dell'accesso anziché dall'ultima
richiesta, quindi termina anche una sessione usata attivamente:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

Il valore predefinito, `0`, significa nessun limite assoluto. Impostatelo dove una postazione di
lavoro condivisa o una regola di conformità richiede che le persone si autentichino di nuovo a
intervalli regolari.

## Disattivare l'accesso con password {#turn-password-sign-in-off}

Una volta configurato un provider di identità e verificato che un utente reale riesce ad accedere
tramite esso, `password_login_disable` rifiuta completamente il metodo con password:

```json
{
  "password_login_disable": true
}
```

LDAP e OpenID Connect non ne sono influenzati. Gli account locali esistenti mantengono i loro
ruoli e la loro cronologia; semplicemente non hanno più alcun modo di autenticarsi.

:::danger
Questa opzione ha effetto immediato e si applica a ogni account locale, compreso il vostro.
Verificate che il single sign-on funzioni — accedendo con esso, non leggendo il log — prima di
impostarla. Rimediare a un errore significa modificare il file di configurazione sul server e
riavviare.
:::

## Prossimi passi {#whats-next}

- [LDAP e Active Directory](/admin-guide/authentication/ldap) — autenticarsi su una directory.
- [OpenID Connect](/admin-guide/authentication/openid) — single sign-on con un provider di identità.
- [Sicurezza](/admin-guide/security) — parametri di hashing, cifratura e hardening.
