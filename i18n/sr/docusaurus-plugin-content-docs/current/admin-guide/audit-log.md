---
title: Dnevnik revizije
description: Uključite dnevnik revizije da biste videli ko je šta uradio u Semaphore-u i šaljite događaje revizije iz Semaphore Pro u SIEM preko Syslog-a ili HEC-a.
---

# Dnevnik revizije

Dnevnik revizije beleži važne radnje u Semaphore-u: ko se prijavio, ko je izmenio korisnika ili ulogu, ko je
napravio API token. Svaki događaj pokazuje ko je to uradio, kada, sa koje adrese i da li je uspelo.
Koristite ga da saznate šta se desilo u vašoj instalaciji ili šaljite događaje u svoj SIEM da budu uz
ostale dnevnike.

Dnevnik revizije je dostupan u svim izdanjima. Za slanje događaja u SIEM potreban je Semaphore Pro.

## Šta se beleži {#recorded-events}

Semaphore trenutno beleži prijave, aktivnost naloga, projekata i zadataka:

- prijave, neuspele pokušaje prijave, odjave i provere drugog faktora;
- odbijene API tokene, odbijene zahteve i blokirane međusajtne zahteve;
- izmene korisnika, lozinki, dvofaktorske autentifikacije, spoljnih identiteta i API tokena;
- izmene članova projekta, uloga i dozvola za šablone;
- izmene projekata, inventara, repozitorijuma, šablona, rasporeda, integracija, konfiguracija hostova,
  okruženja, kredencijala i skladišta tajni, kao i izvoz i vraćanje rezervnih kopija projekata;
- izmene sistemskih podešavanja i aktivaciju Pro licence;
- pokretanja zadataka sa njihovim okidačem (API, raspored, integracija, automatsko pokretanje, tok rada), odobrenja, zaustavljanja,
  završetke i obrisanu istoriju zadataka;
- promene runner-a, registracije (uključujući odbijene registracione tokene), odjave i izveštaje runner-a
  sa nevažećim statusom;
- svako pokretanje servera.

Kompletna lista je na stranici
[Događaji revizije](/reference/audit-events).

Lozinke, tokeni, tajne vrednosti i izlaz zadataka nikada se ne pojavljuju u događajima revizije. API tokeni
se prikazuju otiskom umesto vrednošću. Neuspela prijava čuva uneto korisničko ime, pa ono može sadržati
adresu e-pošte.

U događaju završetka zadatka `metadata.result` prikazuje
status koji je Semaphore dao zadatku, a `metadata.end_reason` kaže zašto ga je Semaphore završio: `timeout` kada je trajao
predugo, `runner_lost` kada njegov runner više nije odgovarao. Argumenti zadatka, promenljive, oznake runner-a i tokeni
se ne beleže.

Tokom postepene nadogradnje HA klastera zadatak pokrenut na nadograđenom čvoru, a završen na čvoru koji
još nije nadograđen, nema događaj završetka.

URL-ovi repozitorijuma, URL-ovi konfiguracija hostova i aliasi integracija takođe se ne beleže.

Ponekad Semaphore sačuva ili obriše objekat, ali kasniji deo istog zahteva ne uspe. Interfejs ili API tada
prikazuje grešku, iako je objekat kreiran ili obrisan. Takav događaj se beleži kao uspešan sa
`metadata.partial=true`, a `reason` navodi šta nije završeno:

- `secret_failed`: okruženje je sačuvano ili obrisano, ali neke njegove tajne nisu sačuvane ili nisu uklonjene;
- `inventory_failed`: šablon je kreiran, ali njegov inventar za Terraform workspace nije;
- `restore_failed`: projekat je vraćen iz rezervne kopije, ali ne i svi njegovi objekti;
- `setup_failed`: projekat je kreiran, ali nije potpuno podešen, na primer njegov tvorac nije dodat kao vlasnik.

## Uključivanje dnevnika revizije {#enable}

Dnevnik revizije je podrazumevano isključen. Da biste ga uključili, podesite `audit.enabled` i dajte
instalaciji ime u `audit.instance_id`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

ID instance ima od 1 do 255 znakova bez razmaka. Dodaje se svakom događaju, pa možete razlikovati svoje
instalacije kada šalju događaje na isto mesto.

Ponovo pokrenite Semaphore. Beleženje počinje posle ponovnog pokretanja; ranije radnje se ne dodaju. Sve
opcije su opisane na stranici [Opcije konfiguracije](/reference/configuration#audit-log).

## Beleženje adrese klijenta iza proksija {#trusted-proxies}

Ako Semaphore radi iza reverznog proksija, događaji prikazuju adresu proksija umesto adrese korisnika. Da
biste beležili stvarnu adresu klijenta, navedite mreže svojih proksija u `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore tada uzima adresu klijenta iz `X-Forwarded-For` ili `X-Real-IP`, ali samo za zahteve koji dolaze
iz tih mreža. Ako zahtevi prolaze kroz više proksija, navedite ih sve. Ne navodite mreže iz kojih se
povezuju vaši korisnici: bilo ko u njima mogao bi da upiše bilo koju adresu u ta zaglavlja.

## Čuvanje {#storage}

Događaji se čuvaju u bazi podataka Semaphore-a, pa ih vaše uobičajene rezervne kopije baze sadrže. Semaphore
ne prikazuje događaje revizije u interfejsu i ne briše stare događaje, zato pratite veličinu baze.

Dnevnik revizije nikada ne smeta vašim korisnicima. Ako događaj ne može da se sačuva, Semaphore upisuje
grešku u dnevnik servera, a radnja se nastavlja kao i obično.

## Izvoz u SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro može da šalje događaje revizije Syslog prijemniku preko TLS-a, na primer rsyslog-u ili
Vector-u, kao i svakom prijemniku protokola Splunk HTTP Event Collector (HEC), na primer Splunk-u, Vector-u,
Fluent Bit-u, OpenTelemetry Collector-u ili Cribl-u. Možete podesiti jedno Syslog i jedno HEC odredište, ili
oba odjednom.

Biće vam potrebni:

- ime hosta i port prijemnika;
- ime za ovo odredište, na primer `security-syslog`;
- CA sertifikat prijemnika, ako mu host Semaphore-a još ne veruje.

Dodajte `audit.syslog` u `config.json`:

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

Ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` i `address` su obavezni. Semaphore pamti koje je događaje već poslao svakom odredištu, zato zadržite
isti `id` kada menjate adresu ili sertifikat. Novi `id` počinje od novih događaja.

Semaphore uvek proverava sertifikat prijemnika i koristi TLS 1.2 ili noviji. `ca_file` dodaje vaš CA među
pouzdane sertifikate, a `server_name` zadaje ime koje se proverava u sertifikatu kada se razlikuje od
adrese.

Ponovo pokrenite Semaphore. Ako su podešavanja neispravna ili CA datoteka ne može da se pročita, Semaphore
se neće pokrenuti.

### Provera da događaji stižu {#verify-siem-delivery}

Semaphore beleži događaj pri svakom pokretanju. Posle ponovnog pokretanja potražite ga na prijemniku:
`event_code` je `audit.lifecycle`, `action` je `start`, a `metadata.destinations` sadrži ID vašeg
odredišta.

### Slanje događaja preko HEC-a {#hec}

Potrebni su vam URL HEC krajnje tačke, HEC token, naziv ovog odredišta, na primer `security-hec`, i
sertifikat CA prijemnika ako mu host Semaphore-a već ne veruje.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

Ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN=<HEC token>
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`, `url` i `token` su obavezni, a URL mora da počinje sa `https://`. Koristite drugačiji `id` nego za
Syslog. `source` i `sourcetype` imaju podrazumevane vrednosti `semaphore` i `semaphore:audit`. Sertifikati se
proveravaju na isti način kao za Syslog, a važe standardne promenljive `HTTPS_PROXY` i `NO_PROXY`.

Semaphore šalje do 100 događaja po zahtevu. Polje `event` svakog HEC događaja sadrži JSON događaja revizije,
`time` je vreme događaja, a `host` je ID HA čvora, ili ID instance na jednom čvoru.

Ponovo pokrenite Semaphore, a zatim proverite da događaji stižu kako je opisano [iznad](#verify-siem-delivery).

### Kako se događaji isporučuju {#delivery}

- Ako prijemnik nije dostupan, događaji čekaju u bazi podataka i šalju se kada se vrati. Korisnici ništa ne
  primećuju.
- Posle mrežnih grešaka, ponovnih pokretanja ili HA failover-a neki događaji mogu stići dvaput. Koristite
  `event_id` da odbacite duplikate i `seq` da poređate događaje.
- Preko Syslog-a, ako se veza prekine bez greške, događaj poslat u tom trenutku može da se izgubi.
- U [HA instalaciji](/admin-guide/ha) događaje svakom odredištu šalje jedan po jedan čvor. Ako Redis nije dostupan, slanje se
  pauzira, a događaji se i dalje beleže.
- Preko HEC-a se događaj smatra poslatim tek kada prijemnik odgovori statusom 2xx. Svaki drugi odgovor,
  uključujući 4xx, ponavlja se. Ako prijemnik padne nakon odgovora, događaji koje još nije sačuvao mogu da se
  izgube.

Preko Syslog-a se svaki događaj šalje kao Syslog poruka po RFC 5424 sa JSON-om događaja kao telom. `HOSTNAME` je ID HA
čvora, ili ID instance na jednom čvoru, a `MSGID` je kôd događaja.

Primeri u nastavku su minimalni i samo pokazuju kako se primaju događaji. Prihvataju vezu od bilo kog klijenta
koji može da dođe do porta. U produkciji zaštitite prijemnik tako da samo vaši Semaphore serveri mogu da mu šalju
događaje.

### Primer za rsyslog {#rsyslog}

Ova rsyslog konfiguracija prihvata TLS vezu i upisuje po jedan događaj u red:

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

### Primer za Vector {#vector}

Ova Vector konfiguracija prihvata TLS vezu, čita JSON događaja i upisuje ga u datoteku:

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

### Primer za Vector sa HEC-om {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Primer za Splunk {#splunk}

Napravite HEC token u Splunk-u (**Settings → Data inputs → HTTP Event Collector**), dozvolite mu indeks
`security` i podesite `url` na `https://<splunk>:8088/services/collector/event`. Da biste pronašli događaje,
pretražite `index=security sourcetype="semaphore:audit"`.

Ostavite **Enable indexer acknowledgement** isključeno za ovaj token: Semaphore ga ne koristi.

### Rešavanje problema sa izvozom {#troubleshoot-export}

- **Semaphore se ne pokreće.** Proverite da su podešeni i `audit.syslog.id` i `audit.syslog.address`, ili
  `audit.splunk_hec.id`, `url` i `token` za HEC, i da CA datoteka sadrži PEM sertifikate.
- **TLS veza ne uspeva.** Proverite da sertifikat prijemnika odgovara `server_name` i da ga je potpisao CA
  kome Semaphore veruje.
- **Događaji ne stižu.** Proverite dnevnik servera Semaphore-a i dnevnik prijemnika. Posle greške Semaphore
  malo sačeka pre ponovnog pokušaja.
- **Neki događaji stižu dvaput.** To se može desiti posle ponovljenih pokušaja i failover-a. Odbacite
  duplikate prema `event_id`.
- **HEC odgovara sa 400, 401 ili 403.** Proverite token, indekse u koje sme da piše i da je potvrda indeksera za njega isključena. Token se nikada ne pojavljuje
  u dnevniku Semaphore-a.

## Šta se ne beleži {#not-recorded}

Alat komandne linije `semaphore` radi direktno sa bazom podataka, pa se komande kao što su `user add` i
`user token` ne beleže.

Neke radnje u interfejsu se ne beleže: uklanjanje licence, podešavanja aplikacija, brisanje stanja HA
zadataka, aliasi Terraform inventara, brisanje Terraform stanja, pokretanja workflow-a i pozivnice u projekat.
Opisi šablona, prikazi, brisanje keša projekta i zakazane sinhronizacije skladišta tajni takođe se ne beleže.

## Šta dalje {#whats-next}

- [Događaji revizije](/reference/audit-events) — format događaja i svi događaji koji se beleže.
- [Opcije konfiguracije](/reference/configuration#audit-log) — sve `audit.*` opcije i promenljive okruženja.
- [Dnevnici](/admin-guide/logs) — dnevnici servera, aktivnosti i zadataka.
