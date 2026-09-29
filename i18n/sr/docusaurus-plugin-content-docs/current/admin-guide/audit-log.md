---
title: Dnevnik revizije
description: Uključite bezbednosni dnevnik revizije, saznajte šta beleži i šaljite događaje revizije iz Semaphore Pro u SIEM preko Syslog-a sa TLS-om.
---

# Dnevnik revizije

Dnevnik revizije beleži aktivnosti važne za bezbednost: ko je izvršio radnju, šta je uradio, na koji objekat
je uticao, odakle je zahtev stigao i da li je uspeo. Administratori ga koriste za istraživanje izmena, dok
bezbednosni timovi koriste njegov dokumentovani format događaja za pravila otkrivanja i dokaze o usklađenosti.

Beleženje događaja revizije i lokalno skladištenje dostupni su u izdanju Semaphore Community. Semaphore Pro
može i da šalje zabeležene događaje u sistem za upravljanje bezbednosnim informacijama i događajima (SIEM).

## Po čemu se razlikuje od drugih dnevnika {#log-types}

| Dnevnik | Koristite ga za |
| --- | --- |
| Serverski dnevnik | Dijagnostikovanje grešaka pri pokretanju, konfiguraciji i radu Semaphore-a. |
| Dnevnik aktivnosti | Prikaz aktivnosti projekta korisnicima projekta. |
| Dnevnik i istorija zadataka | Pregled izvršavanja, statusa i izlaza zadataka. |
| Dnevnik revizije | Istraživanje autentifikacije i administrativnih radnji u celoj instalaciji. |

Dnevnik revizije je nezavisan od [dnevnika aktivnosti](/admin-guide/logs#activity-log). Uključivanje ili izvoz
jednog dnevnika ne uključuje niti izvozi drugi.

## Šta se beleži {#recorded-events}

Trenutno izdanje beleži podržane događaje autentifikacije i upravljanja identitetima, uključujući:

- uspešne i neuspešne prijave, odjave i TOTP provere;
- odbijene API tokene, uskraćene dozvole i blokirane zahteve sa drugih sajtova;
- izmene korisnika, lozinki, TOTP registracije, spoljnih identiteta i API tokena;
- izmene članstva u projektu, uloga i dozvola šablona;
- izmene sistemskih podešavanja i aktiviranje Pro licence;
- početak beleženja revizije pri pokretanju servera.

Uspešna prijava beleži se nakon što korisnik završi sve potrebne korake autentifikacije, uključujući TOTP.
Sve dostupne događaje i događaje planirane za kasnija izdanja pogledajte u odeljku
[Događaji revizije](/reference/audit-events).

## Osetljivi podaci izostavljeni iz događaja {#sensitive-data}

Događaji revizije identifikuju radnju bez kopiranja njenih akreditiva ili tajnog sadržaja. Ne sadrže lozinke,
pristupne kodove, TOTP tajne i QR kodove, kodove za oporavak, kolačiće sesije, neobrađene tokene, OAuth kodove
i tvrdnje, privatne ključeve, pristupne fraze, tajne vrednosti, vrednosti okruženja i anketa, tela webhook
zahteva, izlaz zadataka ni URL-ove repozitorijuma.

API tokeni se identifikuju otiskom, a ne svojom vrednošću. Neuspešna prijava sadrži uneti identifikator za
prijavu, skraćen na 64 bajta. Ako se korisnici prijavljuju adresom e-pošte, taj identifikator može da sadrži
adresu e-pošte.

## Uključite dnevnik revizije {#enable}

Izaberite stabilno ime instalacije, a zatim podesite `audit.enabled` i `audit.instance_id` u datoteci
`config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

ID instance mora da sadrži od 1 do 255 ASCII znakova za štampanje bez razmaka. Pojavljuje se u svakom
događaju i omogućava SIEM-u da razlikuje više instalacija Semaphore-a.

Možete koristiti i promenljive okruženja:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Ponovo pokrenite Semaphore da biste primenili izmenu. Beleženje počinje nakon ponovnog pokretanja; prethodne
aktivnosti se ne dodaju u dnevnik revizije. Prvi događaj je `audit.lifecycle` sa radnjom `start`.

Sve opcije i promenljive okruženja pogledajte u odeljku
[Opcije konfiguracije](/reference/configuration#audit-log).

## Beležite adresu klijenta iza proksija {#trusted-proxies}

HTTP događaj revizije podrazumevano beleži adresu koja se direktno povezala sa Semaphore-om. Ako je ta adresa
reverzni proksi, dodajte samo mreže proksija u `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Ili podesite:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore veruje zaglavljima `X-Forwarded-For` i `X-Real-IP` samo kada stižu iz ovih mreža. Nemojte dodavati
mreže klijenata: klijent u pouzdanoj mreži mogao bi da izabere izvornu adresu koja se beleži u njegovim
događajima. Kada više proksija dopunjava `X-Forwarded-For`, Semaphore beleži krajnju desnu adresu koja nije
pouzdani proksi.

## Skladištenje i ograničenja {#storage}

Semaphore čuva događaje revizije u svojoj bazi podataka. Ovo izdanje nema preglednik revizije, API za
reviziju, automatsko zadržavanje ni čišćenje. Pratite rast baze podataka i uključite podatke revizije u pravila
za pravljenje rezervnih kopija baze podataka.

Beleženje revizije ne blokira radnju koja se beleži. Ako čuvanje događaja ne uspe, Semaphore upisuje grešku u
serverski dnevnik i nastavlja prvobitnu operaciju. Lokalni zapisi zaštićeni su istim kontrolama pristupa bazi
podataka kao i ostatak Semaphore-a; nisu nepromenljivi niti omogućavaju otkrivanje neovlašćenih izmena.

Svako pokretanje servera beleži `audit.lifecycle/start`. Događaj zaustavljanja ne postoji. Gašenje, pad ili
isključen dnevnik revizije vide se kao period bez događaja pre kasnijeg događaja pokretanja.

## Izvoz u SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro može da šalje uspešno zabeležene događaje postojećem TLS Syslog prijemniku, kao što su rsyslog
ili Vector. Prijemnik može da čuva događaje ili da ih prosleđuje vašem SIEM-u.

Pre nego što počnete, pripremite:

- ime hosta i port prijemnika;
- stabilan ID odredišta, kao što je `security-syslog`;
- CA sertifikat kojim je potpisan sertifikat prijemnika, ako host Semaphore-a već ne veruje tom CA sertifikatu.

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

Ili koristite promenljive okruženja:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` i `address` su obavezni. Zadržite isti ID kada menjate adresu ili sertifikat prijemnika kako bi Semaphore
nastavio od sačuvane pozicije. Novi ID počinje od događaja zabeleženih nakon inicijalizacije tog odredišta;
događaji koji su tada već bili sačuvani ne šalju se na njega.

`ca_file` dodaje sertifikate u sistemsko skladište pouzdanih sertifikata. `server_name` zamenjuje ime hosta
koje se proverava u sertifikatu prijemnika. Semaphore zahteva TLS 1.2 ili noviji i uvek proverava sertifikat
servera. Ne podržava isključivanje provere ni korišćenje klijentskog sertifikata za ovu vezu.

Ponovo pokrenite Semaphore. Nevažeća podešavanja odredišta ili nečitljiva CA datoteka sprečavaju pokretanje
Semaphore-a.

### Proverite isporuku {#verify-siem-delivery}

Nakon ponovnog pokretanja, pronađite novi događaj na prijemniku i potvrdite:

- da je `event_code` postavljen na `audit.lifecycle`;
- da je `action` postavljen na `start`;
- da je `outcome` postavljen na `success`;
- da se `instance_id` podudara sa podešenim imenom instalacije;
- da `metadata.destinations` sadrži ID odredišta.

### Ponašanje isporuke {#delivery}

- Ako prijemnik nije dostupan, Semaphore zadržava zabeležene događaje lokalno i pokušava ponovo kada prijemnik
  postane dostupan. Korisnički zahtevi se normalno nastavljaju.
- Isporuka preko Syslog-a obavlja se bez garancije. Događaj upisan u vezu koja otkaže bez obaveštavanja
  Semaphore-a može biti izgubljen.
- Mrežne greške, ponovna pokretanja i HA prebacivanje mogu dovesti do duplih isporuka. Uklonite duplikate po
  vrednosti `event_id`, a događaje poređajte po vrednosti `seq`.
- U [HA instalaciji](/admin-guide/ha) jedan čvor obično šalje na odredište u datom trenutku. Izvoz se pauzira
  ako Redis nije dostupan, dok se beleženje nastavlja u deljenoj bazi podataka.

Semaphore šalje poruke po standardu RFC 5424 preko TLS-a i sa uokvirivanjem brojem okteta. Telo poruke sadrži
JSON događaja revizije. `HOSTNAME` je ID HA čvora ili ID instance kada postoji samo jedan čvor; `MSGID` je
`event_code`.

### Primer rsyslog prijemnika {#rsyslog}

Ovaj fragment konfiguracije za rsyslog prihvata TLS vezu i upisuje po jedan JSON objekat događaja u svaki red:

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

### Primer Vector prijemnika {#vector}

Ova konfiguracija za Vector prihvata TLS vezu, obrađuje JSON događaja i upisuje ga u datoteku:

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

### Rešavanje problema sa izvozom {#troubleshoot-export}

- Ako se Semaphore ne pokrene, proverite da li su podešeni i `audit.syslog.id` i `audit.syslog.address` i da li
  CA datoteka sadrži čitljive PEM sertifikate.
- Ako TLS veza ne uspe, proverite da li sertifikat prijemnika važi za `server_name` i da li mu se lanac završava
  sistemskim ili podešenim CA sertifikatom.
- Ako događaj još nije stigao, proverite serverski dnevnik Semaphore-a i dnevnik prijema na prijemniku. Nakon
  neuspeha ponovni pokušaji izvoza koriste odlaganje.
- Ako se događaji pojavljuju dvaput, uklonite duplikate po vrednosti `event_id`; duplikati se očekuju nakon
  nekih ponovnih pokušaja i prebacivanja.

## Radnje bez pokrivenosti revizijom {#not-recorded}

Komanda `semaphore` direktno menja bazu podataka, pa se CLI radnje na serveru, kao što su `user add` i
`user token`, ne beleže. Pristup serveru i bazi podataka mora se zasebno kontrolisati.

Ovo izdanje takođe nema događaj revizije za uklanjanje licence, podešavanja aplikacije tokom rada, brisanje
stanja HA zadataka, alijase Terraform inventara, pokretanja radnih tokova ni pozivnice u projekte.
[Katalog događaja](/reference/audit-events) označava događaje planirane za kasnija izdanja.

## Šta dalje {#whats-next}

- [Događaji revizije](/reference/audit-events) — polja događaja, dostupni i planirani događaji i pokrivenost usklađenosti.
- [Opcije konfiguracije](/reference/configuration#audit-log) — sve opcije `audit.*` i promenljive okruženja.
- [Dnevnici](/admin-guide/logs) — serverski dnevnik, dnevnik aktivnosti i dnevnici zadataka.
