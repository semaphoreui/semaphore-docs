---
title: Log di audit
description: Attiva il log di audit di sicurezza, scopri cosa registra e invia gli eventi di audit da Semaphore Pro a un SIEM tramite Syslog con TLS.
---

# Log di audit

Il log di audit registra le attività rilevanti per la sicurezza: chi ha agito, cosa ha fatto, quale oggetto ha
interessato, da dove proveniva la richiesta e se è stata completata con successo. Gli operatori lo usano per
indagare sulle modifiche, mentre i team di sicurezza utilizzano il formato documentato degli eventi per le
regole di rilevamento e le prove di conformità.

L'acquisizione degli eventi di audit e la loro archiviazione locale sono disponibili in Semaphore Community.
Semaphore Pro può anche inviare gli eventi acquisiti a un sistema SIEM (Security Information and Event Management).

## Differenze rispetto agli altri log {#log-types}

| Log | Utilizzo |
| --- | --- |
| Log del server | Diagnosticare errori di avvio, configurazione e runtime di Semaphore. |
| Registro attività | Mostrare agli utenti del progetto un flusso delle attività del progetto. |
| Log e cronologia delle attività | Esaminare l'esecuzione, lo stato e l'output delle attività. |
| Log di audit | Indagare sulle azioni di autenticazione e amministrazione nell'intera installazione. |

Il log di audit è indipendente dal [registro attività](/admin-guide/logs#activity-log). L'attivazione o
l'esportazione dell'uno non attiva né esporta l'altro.

## Cosa viene registrato {#recorded-events}

La versione attuale registra gli eventi supportati di autenticazione e gestione delle identità, tra cui:

- accessi riusciti e non riusciti, disconnessioni e verifiche TOTP;
- token API rifiutati, autorizzazioni negate e richieste cross-site bloccate;
- modifiche a utenti, password, registrazione TOTP, identità esterne e token API;
- modifiche ad appartenenza ai progetti, ruoli e autorizzazioni dei template;
- modifiche alle impostazioni di sistema e attivazione della licenza Pro;
- avvio dell'acquisizione degli eventi di audit insieme al server.

Un accesso riuscito viene registrato dopo che l'utente ha completato tutti i passaggi di autenticazione
richiesti, incluso TOTP. Per tutti gli eventi disponibili e quelli previsti per le versioni future, consulta
[Eventi di audit](/reference/audit-events).

## Dati sensibili esclusi dagli eventi {#sensitive-data}

Gli eventi di audit identificano un'azione senza copiarne le credenziali o il payload segreto. Escludono
password, codici di accesso, segreti e codici QR TOTP, codici di recupero, cookie di sessione, token non
elaborati, codici e claim OAuth, chiavi private, passphrase, valori segreti, valori di ambiente e dei sondaggi,
corpi dei webhook, output delle attività e URL dei repository.

I token API vengono identificati tramite un'impronta digitale, non tramite il loro valore. Un accesso non
riuscito include l'identificativo di login immesso, troncato a 64 byte. Se gli utenti accedono con un indirizzo
email, tale identificativo può contenere un indirizzo email.

## Attivare il log di audit {#enable}

Scegli un nome stabile per l'installazione, quindi imposta `audit.enabled` e `audit.instance_id` in
`config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

L'ID dell'istanza deve contenere da 1 a 255 caratteri ASCII stampabili senza spazi. Compare in ogni evento e
consente a un SIEM di distinguere più installazioni di Semaphore.

In alternativa, utilizza le variabili d'ambiente:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Riavvia Semaphore per applicare la modifica. L'acquisizione inizia dopo il riavvio; le attività precedenti non
vengono aggiunte al log di audit. Il primo evento è `audit.lifecycle` con l'azione `start`.

Per tutte le opzioni e le variabili d'ambiente, consulta
[Opzioni di configurazione](/reference/configuration#audit-log).

## Registrare l'indirizzo del client dietro un proxy {#trusted-proxies}

Per impostazione predefinita, un evento di audit HTTP registra l'indirizzo che si è connesso direttamente a
Semaphore. Se tale indirizzo è un reverse proxy, aggiungi a `audit.trusted_proxy_cidrs` soltanto le reti dei
proxy:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Oppure imposta:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore considera attendibili `X-Forwarded-For` e `X-Real-IP` solo se provengono da queste reti. Non
aggiungere reti di client: un client in una rete attendibile potrebbe scegliere l'indirizzo sorgente registrato
nei propri eventi. Quando più proxy aggiungono valori a `X-Forwarded-For`, Semaphore registra l'indirizzo più a
destra che non appartiene a un proxy attendibile.

## Archiviazione e limitazioni {#storage}

Semaphore archivia gli eventi di audit nel proprio database. Questa versione non dispone di un visualizzatore
degli audit, di un'API di audit, né di conservazione o eliminazione automatica. Monitora la crescita del database
e includi i dati di audit nei criteri di backup del database.

La registrazione di audit non blocca l'azione registrata. Se l'archiviazione di un evento non riesce, Semaphore
scrive un errore nel log del server e continua l'operazione originale. I record locali sono protetti dagli stessi
controlli di accesso al database usati per il resto di Semaphore; non sono immutabili né protetti da manomissioni.

Ogni avvio del server registra `audit.lifecycle/start`. Non è previsto un evento di arresto. Un arresto, un
crash o la disattivazione del log di audit appaiono come un periodo privo di eventi prima di un evento di avvio
successivo.

## Esportare verso un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro può inviare gli eventi acquisiti correttamente a un ricevitore Syslog TLS esistente, come rsyslog
o Vector. Il ricevitore può archiviare gli eventi o inoltrarli al tuo SIEM.

Prima di iniziare, prepara:

- il nome host e la porta del ricevitore;
- un ID stabile per la destinazione, ad esempio `security-syslog`;
- il certificato della CA che ha firmato il certificato del ricevitore, se la CA non è già considerata
  attendibile dall'host Semaphore.

Aggiungi `audit.syslog` a `config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

Oppure utilizza le variabili d'ambiente:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` e `address` sono obbligatori. Mantieni lo stesso ID quando modifichi l'indirizzo o il certificato del
ricevitore, in modo che Semaphore riprenda dalla posizione salvata. Un nuovo ID inizia dagli eventi registrati
dopo l'inizializzazione della destinazione; gli eventi già archiviati in quel momento non vengono inviati alla
nuova destinazione.

`ca_file` aggiunge certificati all'archivio attendibile del sistema. `server_name` sostituisce il nome host
verificato nel certificato del ricevitore. Semaphore richiede TLS 1.2 o versioni successive e verifica sempre il
certificato del server. Non supporta la disattivazione della verifica né l'uso di un certificato client per questa
connessione.

Riavvia Semaphore. Impostazioni della destinazione non valide o un file CA illeggibile impediscono l'avvio di
Semaphore.

### Verificare la consegna {#verify-siem-delivery}

Dopo il riavvio, individua il nuovo evento sul ricevitore e verifica che:

- `event_code` sia `audit.lifecycle`;
- `action` sia `start`;
- `outcome` sia `success`;
- `instance_id` corrisponda al nome configurato per l'installazione;
- `metadata.destinations` contenga l'ID della destinazione.

### Comportamento della consegna {#delivery}

- Se il ricevitore non è disponibile, Semaphore conserva localmente gli eventi acquisiti e ne ritenta l'invio
  quando il ricevitore torna disponibile. Le richieste degli utenti continuano normalmente.
- La consegna tramite Syslog avviene secondo il principio best effort. Un evento scritto su una connessione che
  si interrompe senza avvisare Semaphore può andare perso.
- Errori di rete, riavvii e failover HA possono produrre consegne duplicate. Rimuovi i duplicati tramite
  `event_id` e ordina gli eventi in base a `seq`.
- In un'[installazione HA](/admin-guide/ha), normalmente un solo nodo alla volta invia eventi a una destinazione.
  L'esportazione si interrompe se Redis non è disponibile, mentre l'acquisizione continua nel database condiviso.

Semaphore invia messaggi RFC 5424 con TLS e framing con conteggio degli ottetti. Il corpo del messaggio contiene
il JSON dell'evento di audit. `HOSTNAME` è l'ID del nodo HA oppure l'ID dell'istanza su un singolo nodo; `MSGID` è
`event_code`.

### Esempio di ricevitore rsyslog {#rsyslog}

Questo frammento di configurazione rsyslog accetta la connessione TLS e scrive un oggetto JSON di evento per riga:

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Esempio di ricevitore Vector {#vector}

Questa configurazione Vector accetta la connessione TLS, analizza il JSON dell'evento e lo scrive in un file:

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Risolvere i problemi di esportazione {#troubleshoot-export}

- Se Semaphore non si avvia, verifica che siano impostati sia `audit.syslog.id` sia `audit.syslog.address` e
  che il file CA contenga certificati PEM leggibili.
- Se TLS non funziona, verifica che il certificato del ricevitore sia valido per `server_name` e che la relativa
  catena porti a una CA di sistema o configurata.
- Se un evento non è ancora arrivato, controlla il log del server Semaphore e il log di acquisizione del
  ricevitore. Dopo un errore, i tentativi di esportazione vengono effettuati con un ritardo.
- Se gli eventi compaiono due volte, deduplicali tramite `event_id`; dopo alcuni tentativi e failover è prevista
  la presenza di duplicati.

## Azioni prive di copertura di audit {#not-recorded}

Il comando `semaphore` modifica direttamente il database, pertanto le azioni CLI lato server come `user add` e
`user token` non vengono registrate. L'accesso al server e al database deve essere controllato separatamente.

Questa versione non prevede inoltre eventi di audit per la rimozione della licenza, le impostazioni di runtime
delle app, la cancellazione dello stato delle attività HA, gli alias degli inventari Terraform, le esecuzioni dei
workflow o gli inviti ai progetti. Il [catalogo degli eventi](/reference/audit-events) indica gli eventi previsti
per le versioni future.

## Passaggi successivi {#whats-next}

- [Eventi di audit](/reference/audit-events) — campi degli eventi, eventi disponibili e previsti e copertura della conformità.
- [Opzioni di configurazione](/reference/configuration#audit-log) — tutte le opzioni `audit.*` e le variabili d'ambiente.
- [Log](/admin-guide/logs) — log del server, registro attività e log delle attività.
