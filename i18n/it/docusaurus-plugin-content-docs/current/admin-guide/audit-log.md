---
title: Log di audit
description: Attiva il log di audit per vedere chi ha fatto cosa in Semaphore e invia gli eventi di audit da Semaphore Pro a un SIEM.
---

# Log di audit

Il log di audit tiene traccia delle azioni importanti in Semaphore: chi ha effettuato l'accesso, chi ha
modificato un utente o un ruolo, chi ha creato un token API. Ogni evento mostra chi ha agito, quando, da
quale indirizzo e se l'azione è riuscita. Usalo per capire cosa è successo nella tua installazione, oppure
invia gli eventi al tuo SIEM per tenerli insieme al resto dei log.

Il log di audit è disponibile in tutte le edizioni. L'invio a un SIEM richiede Semaphore Pro.

## Cosa viene registrato {#recorded-events}

Attualmente Semaphore registra gli accessi e l'attività di account e progetti:

- accessi, tentativi di accesso non riusciti, disconnessioni e verifiche del secondo fattore;
- token API rifiutati, richieste negate e richieste cross-site bloccate;
- modifiche a utenti, password, autenticazione a due fattori, identità esterne e token API;
- modifiche ai membri del progetto, ai ruoli e ai permessi dei template;
- modifiche a progetti, inventari, repository, template, pianificazioni, integrazioni, configurazioni host,
  ambienti, credenziali e archivi dei segreti, ed esportazioni e ripristini dei backup di progetto;
- modifiche alle impostazioni di sistema e l'attivazione della licenza Pro;
- ogni avvio del server.

Altri eventi verranno aggiunti nelle prossime versioni. Per l'elenco completo, consulta
[Eventi di audit](/reference/audit-events).

Password, token, valori segreti e output dei task non compaiono mai negli eventi di audit. I token API sono
indicati da un'impronta invece che dal loro valore. Un accesso non riuscito conserva il nome di accesso
inserito, che quindi può contenere un indirizzo email.

Anche gli URL dei repository, gli URL delle configurazioni host e gli alias delle integrazioni non vengono registrati.
Se un ambiente viene salvato ma uno dei suoi segreti non riesce, l'API restituisce un errore, anche se l'ambiente
esiste. L'evento è allora un successo con `metadata.partial=true` e `reason=secret_failed`.

## Attivare il log di audit {#enable}

Il log di audit è disattivato per impostazione predefinita. Per attivarlo, imposta `audit.enabled` e dai un
nome alla tua installazione in `audit.instance_id`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Oppure con le variabili d'ambiente:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

L'ID dell'istanza è composto da 1 a 255 caratteri senza spazi. Viene aggiunto a ogni evento, così puoi
distinguere le tue installazioni quando inviano eventi allo stesso punto.

Riavvia Semaphore. La registrazione inizia dopo il riavvio; le azioni precedenti non vengono aggiunte. Per
tutte le opzioni, consulta [Opzioni di configurazione](/reference/configuration#audit-log).

## Registrare l'indirizzo del client dietro un proxy {#trusted-proxies}

Se Semaphore è dietro un reverse proxy, gli eventi mostrano l'indirizzo del proxy invece di quello
dell'utente. Per registrare l'indirizzo reale del client, elenca le reti dei tuoi proxy in
`audit.trusted_proxy_cidrs`:

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
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore prende allora l'indirizzo del client da `X-Forwarded-For` o `X-Real-IP`, ma solo per le richieste
che arrivano da queste reti. Se le richieste attraversano più proxy, elencali tutti. Non inserire le reti da
cui si collegano i tuoi utenti: chiunque in quelle reti potrebbe impostare questi header su qualsiasi
indirizzo.

## Archiviazione {#storage}

Gli eventi sono salvati nel database di Semaphore, quindi i normali backup del database li includono.
Semaphore non mostra gli eventi di audit nell'interfaccia e non elimina gli eventi vecchi, quindi tieni
d'occhio la dimensione del database.

Il log di audit non intralcia mai i tuoi utenti. Se un evento non può essere salvato, Semaphore scrive un
errore nel log del server e l'azione prosegue normalmente.

## Esportare verso un SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro può inviare gli eventi di audit a un ricevitore Syslog tramite TLS, come rsyslog o Vector. Il
ricevitore può salvarli o inoltrarli al tuo SIEM.

Ti servono:

- il nome host e la porta del ricevitore;
- un nome per questa destinazione, ad esempio `security-syslog`;
- il certificato della CA del ricevitore, se l'host di Semaphore non la considera già attendibile.

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

Oppure con le variabili d'ambiente:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` e `address` sono obbligatori. Semaphore ricorda quali eventi ha già inviato a ogni destinazione,
quindi mantieni lo stesso `id` quando cambi l'indirizzo o il certificato. Un nuovo `id` parte dagli eventi
nuovi.

Semaphore verifica sempre il certificato del ricevitore e usa TLS 1.2 o successivo. `ca_file` aggiunge la
tua CA ai certificati attendibili e `server_name` imposta il nome da verificare nel certificato quando è
diverso dall'indirizzo.

Riavvia Semaphore. Se le impostazioni non sono valide o il file della CA non è leggibile, Semaphore non si
avvia.

### Verificare che gli eventi arrivino {#verify-siem-delivery}

Semaphore registra un evento a ogni avvio. Dopo il riavvio, cercalo sul ricevitore: `event_code` è
`audit.lifecycle`, `action` è `start` e `metadata.destinations` include l'ID della tua destinazione.

### Come vengono consegnati gli eventi {#delivery}

- Se il ricevitore non è disponibile, gli eventi attendono nel database e vengono inviati quando torna. Gli
  utenti non si accorgono di nulla.
- Dopo errori di rete, riavvii o un failover HA, alcuni eventi possono arrivare due volte. Usa `event_id`
  per scartare i duplicati e `seq` per ordinare gli eventi.
- Se una connessione si interrompe senza errori, l'evento inviato in quel momento può andare perso.
- In un'[installazione HA](/admin-guide/ha), un solo nodo alla volta invia gli eventi. Se Redis non è
  disponibile, l'invio si ferma e gli eventi continuano a essere registrati.

Ogni evento viene inviato come messaggio Syslog RFC 5424 con il JSON dell'evento come corpo. `HOSTNAME` è
l'ID del nodo HA, oppure l'ID dell'istanza su un singolo nodo, e `MSGID` è il codice dell'evento.

### Esempio rsyslog {#rsyslog}

Questa configurazione di rsyslog accetta la connessione TLS e scrive un evento per riga:

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

### Esempio Vector {#vector}

Questa configurazione di Vector accetta la connessione TLS, legge il JSON dell'evento e lo scrive in un
file:

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

- **Semaphore non si avvia.** Verifica che siano impostati sia `audit.syslog.id` sia `audit.syslog.address`
  e che il file della CA contenga certificati PEM.
- **La connessione TLS non riesce.** Verifica che il certificato del ricevitore corrisponda a `server_name`
  e sia firmato da una CA considerata attendibile da Semaphore.
- **Gli eventi non arrivano.** Controlla il log del server di Semaphore e il log del ricevitore. Dopo un
  errore, Semaphore attende un po' prima di riprovare.
- **Alcuni eventi arrivano due volte.** Può succedere dopo tentativi ripetuti e failover. Scarta i duplicati
  tramite `event_id`.

## Cosa non viene registrato {#not-recorded}

Lo strumento da riga di comando `semaphore` lavora direttamente sul database, quindi comandi come
`user add` e `user token` non vengono registrati.

Alcune azioni dell'interfaccia non vengono ancora registrate: la rimozione di una licenza, le impostazioni
delle app, la pulizia dello stato dei task HA, gli alias degli inventari Terraform, l'eliminazione di uno stato
Terraform, le esecuzioni dei workflow e gli inviti ai progetti. Non vengono registrate neppure le descrizioni dei
template, le viste, la pulizia della cache del progetto e le sincronizzazioni pianificate degli archivi dei segreti.
Per gli eventi previsti nelle prossime versioni, consulta [Eventi di audit](/reference/audit-events).

## Prossimi passi {#whats-next}

- [Eventi di audit](/reference/audit-events) — il formato degli eventi e tutti gli eventi registrati.
- [Opzioni di configurazione](/reference/configuration#audit-log) — tutte le opzioni `audit.*` e le variabili d'ambiente.
- [Log](/admin-guide/logs) — log del server, delle attività e dei task.
