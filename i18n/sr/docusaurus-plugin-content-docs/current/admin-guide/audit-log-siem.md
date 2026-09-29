---
title: Šaljite dnevnik revizije u SIEM
description: Podesite Semaphore Pro da šalje događaje revizije u SIEM preko Syslog-a sa TLS-om i pripremite rsyslog ili Vector za prijem.
---

# Šaljite dnevnik revizije u SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro šalje svaki događaj [dnevnika revizije](/admin-guide/audit-log) u SIEM kao Syslog poruku po
RFC 5424 preko TLS-a.

## Pre nego što počnete {#before-you-begin}

- Semaphore Pro licenca.
- [Uključen dnevnik revizije](/admin-guide/audit-log#enable).
- Syslog prijemnik koji prihvata TLS, na primer rsyslog ili Vector, pogledajte
  [Primeri prijemnika](#receivers).
- CA sertifikat kojim je potpisan sertifikat prijemnika, u PEM formatu, ako nije u sistemskom skladištu
  pouzdanih sertifikata.

## Koraci {#steps}

Da biste slali dnevnik revizije u SIEM, sledite ove korake:

1. Dodajte odeljak `audit.syslog` u `config.json`:

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

   Ili pomoću promenljivih okruženja:

   ```bash
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` i `address` su obavezni. `ca_file` dodaje CA u sistemsko skladište pouzdanih sertifikata.
   `server_name` zamenjuje ime koje se proverava u sertifikatu prijemnika. `timeout` ograničava povezivanje i
   upis, podrazumevano 10 sekundi.
2. Ponovo pokrenite Semaphore. Nečitljiva CA datoteka ili nedostatak `id` ili `address` zaustavlja pokretanje
   sa greškom.
3. Prijavite se sa pogrešnom lozinkom. SIEM prima događaj `auth.login` sa ishodom `failure`.

## Kako se događaji isporučuju {#delivery}

- Semaphore čuva svoju poziciju u dnevniku pod `id`. Posle ponovnog pokretanja nastavlja odatle, a događaji
  zabeleženi dok prijemnik nije bio dostupan šalju se kada ponovo postane dostupan. Novi `id` počinje od
  trenutnog događaja i ne šalje starije.
- Isporuka je bez garancija: događaj upisan u vezu koja je tiho prekinuta može da se izgubi.
- Događaj može da stigne dva puta, na primer posle mrežne greške ili prebacivanja na drugi čvor. Uklanjajte
  duplikate po `event_id` i određujte redosled događaja po `seq`.
- Uz [visoku dostupnost](/admin-guide/ha), šalje jedan čvor u isto vreme. Drugi čvor preuzima kada se on
  zaustavi.

## Primeri prijemnika {#receivers}

Semaphore šalje RFC 5424 poruke sa uokvirivanjem po broju okteta (RFC 5425). Telo poruke je JSON događaja.
Syslog `HOSTNAME` je ID čvora ili, bez HA, ID instance, a `MSGID` je `event_code`.

### rsyslog {#rsyslog}

Prijem događaja preko TLS-a i upis jednog JSON događaja po redu:

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

Prijem događaja preko TLS-a i parsiranje JSON-a događaja:

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

## Šta dalje {#whats-next}

- [Dnevnik revizije](/admin-guide/audit-log) — šema događaja i šta se beleži.
- [Događaji revizije](/reference/audit-events) — svaki događaj sa ishodima, razlozima i metapodacima.
- [Konfiguracija](/reference/configuration) — svaka opcija `audit.*`.
