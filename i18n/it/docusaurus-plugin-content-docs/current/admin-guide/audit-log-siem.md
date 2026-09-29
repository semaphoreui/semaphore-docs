---
title: Inviare il log di audit a un SIEM
description: Configurare Semaphore Pro per inviare gli eventi di audit a un SIEM tramite Syslog con TLS e preparare rsyslog o Vector a riceverli.
---

# Inviare il log di audit a un SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro invia ogni evento del [log di audit](/admin-guide/audit-log) a un SIEM come messaggio Syslog
RFC 5424 su TLS.

## Prima di iniziare {#before-you-begin}

- Una licenza Semaphore Pro.
- Il [log di audit attivo](/admin-guide/audit-log#enable).
- Un ricevitore Syslog che accetti TLS, ad esempio rsyslog o Vector, vedi
  [Esempi di ricevitori](#receivers).
- Il certificato della CA che ha firmato il certificato del ricevitore, in formato PEM, se non è nell'archivio
  attendibile del sistema.

## Passaggi {#steps}

Per inviare il log di audit a un SIEM, segui questi passaggi:

1. Aggiungi la sezione `audit.syslog` a `config.json`:

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
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
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` e `address` sono obbligatori. `ca_file` aggiunge una CA all'archivio attendibile del sistema.
   `server_name` sostituisce il nome verificato nel certificato del ricevitore. `timeout` limita connessione e
   scrittura, 10 secondi per impostazione predefinita.
2. Riavvia Semaphore. Un file CA illeggibile o la mancanza di `id` o `address` interrompe l'avvio con un
   errore.
3. Accedi con una password errata. Il SIEM riceve un evento `auth.login` con esito `failure`.

## Come vengono consegnati gli eventi {#delivery}

- Semaphore conserva la propria posizione nel log sotto l'`id`. Dopo un riavvio riprende da lì, e gli eventi
  registrati mentre il ricevitore non era raggiungibile vengono inviati quando torna disponibile. Un nuovo `id`
  parte dall'evento corrente e non invia quelli precedenti.
- La consegna è best effort: un evento scritto su una connessione caduta senza avviso può andare perso.
- Un evento può arrivare due volte, ad esempio dopo un errore di rete o un failover. Elimina i duplicati in base
  a `event_id` e ordina gli eventi per `seq`.
- Con l'[alta disponibilità](/admin-guide/ha), invia un nodo alla volta. Un altro nodo subentra quando si
  ferma.

## Esempi di ricevitori {#receivers}

Semaphore invia messaggi RFC 5424 con framing a conteggio di ottetti (RFC 5425). Il corpo del messaggio è il JSON
dell'evento. L'`HOSTNAME` Syslog è l'ID del nodo o, senza HA, l'ID dell'istanza, e `MSGID` è l'`event_code`.

### rsyslog {#rsyslog}

Ricevere gli eventi tramite TLS e scrivere un evento JSON per riga:

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

### Vector {#vector}

Ricevere gli eventi tramite TLS e analizzare il JSON dell'evento:

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

## Passi successivi {#whats-next}

- [Log di audit](/admin-guide/audit-log) — lo schema dell'evento e cosa viene registrato.
- [Eventi di audit](/reference/audit-events) — ogni evento con i suoi esiti, motivi e metadati.
- [Configurazione](/reference/configuration) — ogni opzione `audit.*`.
