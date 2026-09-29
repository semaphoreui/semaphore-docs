---
title: Log di audit
description: Il log di audit di sicurezza che Semaphore registra per accessi, MFA, utenti, permessi, token API e impostazioni, e come attivarlo.
---

# Log di audit

Il log di audit è una traccia di audit di sicurezza: chi ha fatto cosa, da dove, su quale oggetto e con quale
risultato. Lo leggono gli analisti di sicurezza e i team di conformità, di solito in un SIEM. Ogni evento ha
uno schema stabile e documentato, così un analista può scrivere regole di rilevamento senza conoscere il
funzionamento interno di Semaphore.

Il log di audit è separato dal [log delle attività](/admin-guide/logs). Il log delle attività è un feed per gli
utenti di un progetto. Il log di audit è una traccia per chi verifica che il sistema sia usato correttamente.

## Come funziona {#overview}

Con il log di audit attivo, Semaphore registra un evento per ogni azione rilevante per la sicurezza che arriva
dall'interfaccia web o dall'API: accessi e disconnessioni, verifiche MFA, modifiche a utenti, membri dei
progetti, ruoli e permessi, token API e impostazioni di sistema. Anche le richieste rifiutate vengono
registrate: un accesso fallito, un token API sconosciuto o scaduto, un permesso negato, una richiesta
cross-site bloccata.

Gli eventi sono salvati nel database di Semaphore. Semaphore Pro può inviarli a un SIEM, vedi
[Esportazione verso un SIEM](#siem-export).

## Schema dell'evento {#event-schema}

Ogni evento è un oggetto JSON con gli stessi campi. Per l'elenco degli eventi, dei loro esiti, motivi e
metadati, vedi [Eventi di audit](/reference/audit-events).

| Campo | Descrizione |
| --- | --- |
| `event_id` | ID univoco dell'evento. Usalo per eliminare i duplicati nel SIEM. |
| `seq` | Numero di sequenza senza buchi che cresce a ogni evento. Usalo per ordinare gli eventi. |
| `timestamp` | Ora dell'evento in UTC. |
| `schema_version` | Versione di questo schema. Cambia solo quando un campo viene rinominato, rimosso o cambia tipo. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` o `audit`. |
| `event_code` | Di cosa tratta l'evento, ad esempio `iam.api_token`. |
| `type` | Tipo di modifica: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` o `info`. |
| `action` | Cosa è stato fatto, ad esempio `create`. |
| `outcome` | `success` o `failure`. |
| `reason` | Perché l'azione è fallita, da un elenco fisso per evento. Vuoto in caso di successo. |
| `actor` | Chi ha agito: il suo `type` (`user`, `anonymous`, `system`, `runner`, `integration`), `id` e `name`. Per un utente anche `auth` (`session` o `api_token`) e, per un token API, `token_fingerprint`. |
| `source` | Per le richieste all'interfaccia web e all'API: l'`ip` e lo `user_agent` del client. |
| `target` | L'oggetto su cui si è agito: il suo `type`, `id` e `name`. |
| `scope` | Il `project_id` per gli eventi all'interno di un progetto. |
| `request_id` | ID della richiesta HTTP. Semaphore lo restituisce anche nell'header di risposta `X-Request-ID`. |
| `instance_id` | Nome di questa installazione di Semaphore, da `audit.instance_id`. |
| `node_id` | Nodo che ha registrato l'evento, quando l'[alta disponibilità](/admin-guide/ha) è attiva. |
| `metadata` | Dettagli aggiuntivi che dipendono dall'evento. |

`timestamp` è l'ora del database, in microsecondi, o in millisecondi su SQLite. Ordina gli eventi per `seq`:
due eventi possono avere la stessa ora, ma mai lo stesso `seq`.

Su MySQL, la colonna `created` della tabella `audit_event` usa il fuso orario dell'opzione di connessione
`loc`, UTC per impostazione predefinita. Il `timestamp` di ogni evento è sempre in UTC.

Ogni avvio del server registra `audit.lifecycle` con l'azione `start`. Non c'è un evento di arresto: un
arresto, un crash o la disattivazione del log di audit appaiono come un buco temporale prima dello `start`
successivo.

## Cosa non viene mai registrato {#never-recorded}

Il log di audit non contiene mai password, codici monouso, segreti e codici QR TOTP, codici di recupero,
cookie di sessione, token, codici e claim OAuth, chiavi private, passphrase, valori dei segreti, valori di
ambiente e dei sondaggi, corpi dei webhook, output delle attività, indirizzi email o URL. Un token API è
identificato solo dalla sua impronta: i primi 16 caratteri esadecimali del suo hash SHA-256.

L'ID utente e il nome utente identificano chi ha agito. Un accesso fallito registra il login digitato,
troncato a 64 byte, perché l'indagine sugli accessi falliti ne ha bisogno.

## Attiva il log di audit {#enable}

Imposta `audit.enabled` e dai un nome all'installazione in `audit.instance_id`. Il nome ha da 1 a 255
caratteri ASCII stampabili senza spazi e compare in ogni evento.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Oppure con le variabili d'ambiente:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Riavvia Semaphore per applicare la modifica. Per tutte le opzioni, vedi
[Configurazione](/reference/configuration).

## Indirizzo del client dietro un reverse proxy {#trusted-proxies}

Dietro un reverse proxy, l'interlocutore diretto di Semaphore è il proxy, e l'indirizzo del client arriva
dall'header `X-Forwarded-For` o `X-Real-IP`. Semaphore legge questi header solo quando l'interlocutore diretto
rientra in `audit.trusted_proxy_cidrs`. Altrimenti registra l'indirizzo dell'interlocutore, così un client non
può falsificare il proprio indirizzo.

Elenca in `audit.trusted_proxy_cidrs` solo i tuoi reverse proxy, mai reti di client. Un client all'interno di
un intervallo attendibile può inserire qualsiasi indirizzo in `X-Forwarded-For`.

L'indirizzo registrato è quello più a destra in `X-Forwarded-For` che non è un proxy attendibile.
`X-Real-IP` si usa solo quando manca `X-Forwarded-For`, e solo se ha un unico valore.

## Archiviazione {#storage}

Gli eventi sono salvati nel database di Semaphore e non vengono mai eliminati: questa versione non prevede la
conservazione limitata. Pianifica le dimensioni del database in base al numero di accessi e modifiche della tua
installazione.

## Mappatura della conformità {#compliance}

Semaphore registra gli eventi che ti servono per questi controlli. Da solo non rende conforme la tua
installazione.

| Requisito | Coperto da | Stato |
| --- | --- | --- |
| PCI DSS 10.2.1.1 accesso a dati sensibili (analogo: segreti) | `iam.mfa/view_qr` | Disponibile |
| PCI DSS 10.2.1.1 accesso a dati sensibili (analogo: segreti) | `resource.project_backup/export` | Pianificato |
| PCI DSS 10.2.1.2 azioni degli amministratori / ISO 27002 8.15 uso dei privilegi | `iam.*`, `system.*` | Disponibile |
| PCI DSS 10.2.1.2 azioni degli amministratori / ISO 27002 8.15 uso dei privilegi | `resource.*`, `secret.*` | Pianificato |
| PCI DSS 10.2.1.2 azioni degli amministratori / ISO 27002 8.15 uso dei privilegi | `runner.*`, `task.control`, `task.history` | Pianificato |
| PCI DSS 10.2.1.3 accesso ai log di audit | Non applicabile: Semaphore non dà accesso alla traccia di audit. | — |
| PCI DSS 10.2.1.4 tentativi di accesso logico non validi / ISO tentativi di accesso rifiutati | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Disponibile |
| PCI DSS 10.2.1.4 tentativi di accesso logico non validi / ISO tentativi di accesso rifiutati | `runner.lifecycle/register` failure | Pianificato |
| PCI DSS 10.2.1.5 modifiche alle credenziali di identificazione e autenticazione | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Disponibile |
| PCI DSS 10.2.1.5 modifiche alle credenziali di identificazione e autenticazione | `runner.credential` | Pianificato |
| PCI DSS 10.2.1.6 avvio, arresto e pausa dei log di audit / ISO attivazione dei sistemi di sicurezza | `audit.lifecycle/start`; un arresto appare come il buco che lo precede | Disponibile |
| PCI DSS 10.2.1.7 creazione ed eliminazione di oggetti di sistema | `resource.*` create/delete | Pianificato |
| PCI DSS 10.2.1.7 creazione ed eliminazione di oggetti di sistema | `runner.lifecycle` create/delete | Pianificato |
| PCI DSS 10.2.2 campi obbligatori | `actor`, `event_code` e `action`, `timestamp`, `outcome`, `source` o `node_id`, `target` o `scope` | Disponibile |
| PCI DSS 10.3.3 backup tempestivo su un server di log centrale | Esportazione verso un SIEM tramite Syslog+TLS | Disponibile |
| PCI DSS 10.3.3 backup tempestivo su un server di log centrale | Esportazione verso un SIEM tramite Splunk HEC | Pianificato |

Gli eventi pianificati non vengono registrati in questa versione.

## Cosa non viene registrato in questa versione {#not-recorded}

- Le azioni eseguite con il comando `semaphore` sul server, come `user add` o `user token`. Modificano
  direttamente il database, e chi può eseguirle può modificare anche la tabella di audit.
- La rimozione della licenza, le impostazioni di runtime delle app, la cancellazione dello stato delle attività
  HA, gli alias degli inventari Terraform, le esecuzioni dei workflow e gli inviti ai progetti. Non hanno
  ancora un evento di audit.

## Esportazione verso un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro invia il log di audit a un SIEM tramite Syslog con TLS. Conserva la propria posizione nel log per
il SIEM, così gli eventi registrati mentre il SIEM non è raggiungibile vengono inviati quando torna
disponibile. Per i passaggi, vedi [Inviare il log di audit a un SIEM](/admin-guide/audit-log-siem).

## Passi successivi {#whats-next}

- [Inviare il log di audit a un SIEM](/admin-guide/audit-log-siem) — esporta gli eventi tramite Syslog+TLS.
- [Eventi di audit](/reference/audit-events) — ogni evento con i suoi esiti, motivi e metadati.
- [Configurazione](/reference/configuration) — ogni opzione `audit.*`.
