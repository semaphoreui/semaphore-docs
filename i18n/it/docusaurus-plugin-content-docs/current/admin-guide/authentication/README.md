---
title: Autenticazione
description: I tre modi con cui gli utenti accedono a Semaphore - account locali, LDAP e OpenID Connect -, come si combinano e come vengono collegate le identità.
---

# Autenticazione

Semaphore dispone di tre modi per stabilire l'identità di una persona. Sono indipendenti tra
loro e possono essere attivi tutti contemporaneamente, quindi la schermata di accesso può
proporre un modulo con password, un accesso tramite directory e un pulsante per ciascun provider
di identità.

| Metodo | Chi verifica la password | Da usare quando |
|---|---|---|
| [Account locali](/admin-guide/authentication/local) | Semaphore, sul proprio database | Non si dispone di una directory oppure serve un amministratore di emergenza. |
| [LDAP e Active Directory](/admin-guide/authentication/ldap) | Il proprio server di directory | Le persone esistono già in LDAP o AD e si vuole un'unica coppia di credenziali. |
| [OpenID Connect](/admin-guide/authentication/openid) | Il proprio provider di identità | È disponibile il single sign-on: Keycloak, Okta, Entra ID, Google, GitHub e altri. |

L'autenticazione risponde soltanto alla domanda su *chi* sia l'utente. Ciò che gli è consentito
fare viene deciso separatamente, dal suo ruolo a livello di server e dal suo ruolo in ciascun
Project: vedere [Team](/user-guide/team).

## Come nasce il record di un utente {#how-a-user-record-comes-to-exist}

Ogni persona che accede ha una riga nel database di Semaphore, qualunque metodo abbia usato. Un
account locale viene creato da un amministratore oppure con `semaphore user add`. Un account
LDAP o OIDC viene creato al primo accesso riuscito e Semaphore memorizza accanto ad esso
un'**identità esterna**: l'ID del provider più l'ID utente restituito da quel provider.

È su quell'identità esterna che vengono confrontati gli accessi successivi, il che significa che
rinominare una persona nella directory non crea un secondo account. Ciò che invece richiede
attenzione è il *primo* accesso di un utente già esistente, quando non esiste ancora alcuna
identità esterna. L'opzione `external_auth_email_matching` decide che cosa accade in quel caso:

| Valore | Comportamento |
|---|---|
| `auto` (predefinito) | Collega tramite e-mail, ma solo per gli utenti esterni che non hanno ancora un'identità. In questo modo gli account creati prima della 2.20 vengono adottati una sola volta, e nient'altro. |
| `always` | Collega tramite e-mail qualsiasi utente esterno. Da usare quando una stessa persona accede attraverso più provider. |
| `never` | Non collegare mai tramite e-mail; le identità vengono confrontate esclusivamente in base all'ID del provider. |

Gli account locali con password non vengono mai confrontati tramite e-mail, in nessuna modalità.
Altrimenti un provider OIDC che consente all'utente di scegliere il proprio indirizzo e-mail
potrebbe essere sfruttato per impossessarsi dell'account di un amministratore.

:::warning
L'ID del provider — la chiave in `oidc_providers` o `ldap_providers` — fa parte di ogni identità
memorizzata. Rinominarlo rende orfane le identità che vi fanno riferimento e quegli utenti
ottengono nuovi account vuoti al successivo accesso. Sceglietelo una volta sola.
:::

## Combinare i metodi {#combining-methods}

Una configurazione realistica abilita il single sign-on per le persone e mantiene un
amministratore locale per il giorno in cui il provider di identità non è raggiungibile:

1. Configurare il provider e verificare che un utente reale riesca ad accedere tramite esso.
2. Assegnare a quell'utente i ruoli di cui ha bisogno.
3. Mantenere un account di amministratore locale con una password robusta e
   [TOTP](/admin-guide/authentication/local#two-factor-authentication) abilitato.
4. Impostare `password_login_disable` per impedire a tutti gli altri di usare le password.

Eseguite questi passaggi nell'ordine indicato. Impostare `password_login_disable` prima del
passaggio 1 funziona esattamente come dichiarato e vi esclude dal vostro stesso server.

## In questa sezione {#in-this-section}

| Pagina | Contenuto |
|---|---|
| [Account locali](/admin-guide/authentication/local) | Password, TOTP, codici monouso via e-mail, durata della sessione e disattivazione dell'accesso con password. |
| [LDAP e Active Directory](/admin-guide/authentication/ldap) | Bind a una directory, filtri di ricerca, mappature degli attributi e TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | Configurazione del provider, espressioni per i claim, accesso avviato dall'IdP e dodici esempi completi di provider. |

## Da dove iniziare {#where-to-start}

Una nuova installazione dispone già dell'amministratore locale creato durante il setup, quindi
iniziate dagli [Account locali](/admin-guide/authentication/local) per metterlo in sicurezza e
aggiungete poi [OpenID Connect](/admin-guide/authentication/openid) oppure
[LDAP](/admin-guide/authentication/ldap) per tutti gli altri.
