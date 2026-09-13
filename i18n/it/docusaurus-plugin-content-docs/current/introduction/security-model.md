---
title: Modello di sicurezza
description: Che cosa protegge Semaphore, i confini di fiducia di un deployment, chi può far eseguire del codice e quali decisioni restano a te.
---

# Modello di sicurezza

Semaphore custodisce le credenziali della tua infrastruttura ed esegue codice su di essa.
Da qui derivano due proprietà, che condizionano ogni altra decisione di questa pagina:
**i segreti non devono mai tornare a un browser** e **chiunque possa avviare un task può
eseguire codice sulle macchine che quel task raggiunge**.

Questa pagina spiega il modello. Per le impostazioni che lo implementano, vedi
[Sicurezza](/admin-guide/security).

## Confini di fiducia {#trust-boundaries}

| Confine | Attraversato da | Protetto da |
|---|---|---|
| Browser ↔ server | Sessioni, token API | TLS, cookie sicuri, [reverse proxy](/admin-guide/reverse-proxy) |
| Server ↔ database | Tutto lo stato persistente | Restrizione di rete; segreti cifrati prima della scrittura |
| Server ↔ runner | Payload dei job, segreti compresi | HTTPS e un bearer token per ciascun runner |
| Task ↔ host gestiti | La tua automazione | Le chiavi che hai fornito al template |

Un task si trova al di là di ognuno di questi confini. Riceve nel proprio ambiente i
segreti che gli servono e, da quel momento, è il codice del tuo repository a decidere
che cosa ne accade.

## Identità {#identity}

Gli utenti si autenticano in uno di tre modi, e tutti e tre sfociano nella stessa sessione:

- **Account locali.** Le password sono sottoposte ad hashing con Argon2id (bcrypt prima
  della 2.20, aggiornato al primo accesso). L'autenticazione a due fattori TOTP può essere resa obbligatoria.
- **[LDAP o Active Directory](/admin-guide/authentication/ldap).** La directory verifica la password;
  Semaphore conserva solo l'account.
- **[OpenID Connect](/admin-guide/authentication/openid).** Il provider autentica e Semaphore
  mappa i claim sugli utenti.

L'accesso non interattivo usa **token API** creati da un utente, che portano con sé i
permessi di quell'utente. I runner non usano affatto l'identità degli utenti: si
autenticano con un token proprio, emesso in fase di registrazione.

Anche i task possono portare un'identità. Con i [JWT dei task](/user-guide/task-templates/jwt)
un'esecuzione riceve un token firmato a vita breve che indica progetto, template e utente,
e che un archivio di segreti esterno può verificare invece di costringerti a conservare una
credenziale a lunga durata.

## Autorizzazione {#authorization}

Esistono due livelli, indipendenti tra loro.

**Livello server.** Un amministratore gestisce utenti, runner globali e impostazioni del
server. Essere amministratore del server non comporta di per sé l'appartenenza a un progetto.

**Livello progetto.** Ogni membro ha un ruolo in ciascun progetto:

| Ruolo | Può |
|---|---|
| **Owner** | Tutto ciò che riguarda il progetto, compresi i membri e l'eliminazione. |
| **Manager** | Eseguire task e gestire risorse e template. |
| **Task Runner** | Eseguire task. Nient'altro. |
| **Guest** | Leggere. |

Enterprise aggiunge i [ruoli personalizzati](/user-guide/team) <FeatureState feature="extended-rbac" />
quando quei quattro risultano troppo generici.

Il confine che conta per la sicurezza passa tra **Task Runner** e **Manager**.
Un Manager può cambiare ciò che un template esegue e quindi può eseguire codice arbitrario
con le credenziali di quel progetto. Un Task Runner può solo avviare ciò che già esiste —
a meno che il template non esponga prompt o variabili di survey che arrivano alla riga di
comando, nel qual caso l'autore del template ha allargato quel confine deliberatamente.

## Segreti {#secrets}

I valori segreti — chiavi SSH private, password, token, variabili segrete — sono cifrati
con la chiave in `access_key_encryption` prima di essere memorizzati, così un semplice dump
del database non li rivela. L'API non restituisce mai un valore segreto; la UI mostra che un
segreto è impostato, non qual è.

I segreti raggiungono un task tramite il suo ambiente nel momento in cui viene avviato. Per
questo conviene trattare l'output dei task come sensibile: un playbook che stampa una
variabile la stampa in un log che altri membri del progetto possono leggere.

Se preferisci non custodire affatto i segreti, gli
[archivi di segreti esterni](/user-guide/key-store) mantengono i valori in HashiCorp Vault,
OpenBao, AWS Secrets Manager o Devolutions Server e li recuperano a ogni esecuzione.

## Eseguire codice non affidabile {#executing-untrusted-code}

Con la configurazione predefinita, un task è un processo sul server Semaphore, con il file
system e l'accesso di rete del server. È una scelta adeguata quando chiunque possa modificare
un template gode già di piena fiducia sul server.

Quando non è così, sposta l'esecuzione lontano dal server:

- Un [runner](/admin-guide/runners) colloca i task su una macchina diversa, così compromettere
  un task non compromette il servizio web né il database.
- L'executor **Docker** o **Kubernetes** assegna a ogni job un container o un Pod nuovo,
  così un'esecuzione non può leggere i file di un'altra né quelli dell'host.
- Progetti separati con chiavi separate fanno sì che un task possa raggiungere solo ciò che
  consentono le credenziali del proprio progetto.

:::warning
Un repository che un membro del progetto può modificare è codice che verrà eseguito con le
credenziali di quel progetto. Proteggi il branch da cui un template attinge, oppure punta i
template su un branch su cui possono scrivere solo i revisori.
:::

## Che cosa resta a te {#what-is-left-to-you}

Semaphore è self-hosted, quindi alcune parti del modello devi fornirle tu:

- Il TLS davanti al servizio, integrato o tramite un [reverse proxy](/admin-guide/reverse-proxy).
- La restrizione di rete del database e della superficie amministrativa del server.
- I backup del database e di `access_key_encryption` — il secondo è inutile senza il primo,
  e il primo è illeggibile senza il secondo.
- Mantenere aggiornata la versione. Segnala le vulnerabilità a `security@semaphoreui.com`.

## Prossimi passi {#whats-next}

- [Sicurezza](/admin-guide/security) — le impostazioni concrete, i parametri di hashing e i passi di hardening.
- [Architettura](/introduction/architecture) — i componenti che questi confini separano.
- [Team](/user-guide/team) — assegnare i ruoli in un progetto.
