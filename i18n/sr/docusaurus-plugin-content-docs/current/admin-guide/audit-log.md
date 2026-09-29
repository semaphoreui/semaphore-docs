---
title: Dnevnik revizije
description: Bezbednosni dnevnik revizije koji Semaphore vodi za prijave, MFA, korisnike, dozvole, API tokene i podešavanja, i kako da ga uključite.
---

# Dnevnik revizije

Dnevnik revizije je bezbednosni revizijski trag: ko je šta uradio, odakle, nad kojim objektom i sa kojim
rezultatom. Čitaju ga bezbednosni analitičari i timovi za usklađenost, obično u SIEM-u. Svaki događaj ima
stabilnu, dokumentovanu šemu, pa analitičar može da piše pravila za otkrivanje bez poznavanja unutrašnjeg rada
Semaphore-a.

Dnevnik revizije je odvojen od [dnevnika aktivnosti](/admin-guide/logs). Dnevnik aktivnosti je feed za
korisnike projekta. Dnevnik revizije je trag za one koji proveravaju da li se sistem pravilno koristi.

## Kako radi {#overview}

Kada je dnevnik revizije uključen, Semaphore beleži događaj za svaku radnju važnu za bezbednost koja stigne
preko veb interfejsa ili API-ja: prijave i odjave, MFA provere, izmene korisnika, članova projekata, uloga i
dozvola, API tokene i sistemska podešavanja. Odbijeni zahtevi se takođe beleže: neuspešna prijava, nepoznat ili
istekao API token, odbijena dozvola, blokiran zahtev sa drugog sajta.

Događaji se čuvaju u bazi podataka Semaphore-a. Semaphore Pro može da ih šalje u SIEM, pogledajte
[Izvoz u SIEM](#siem-export).

## Šema događaja {#event-schema}

Svaki događaj je JSON objekat sa istim poljima. Za listu događaja, njihovih ishoda, razloga i metapodataka,
pogledajte [Događaji revizije](/reference/audit-events).

| Polje | Opis |
| --- | --- |
| `event_id` | Jedinstveni ID događaja. Koristite ga za uklanjanje duplikata u SIEM-u. |
| `seq` | Redni broj bez praznina koji raste sa svakim događajem. Koristite ga za redosled događaja. |
| `timestamp` | Vreme događaja u UTC-u. |
| `schema_version` | Verzija ove šeme. Menja se samo kada se polje preimenuje, ukloni ili promeni tip. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` ili `audit`. |
| `event_code` | Na šta se događaj odnosi, na primer `iam.api_token`. |
| `type` | Vrsta izmene: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` ili `info`. |
| `action` | Šta je urađeno, na primer `create`. |
| `outcome` | `success` ili `failure`. |
| `reason` | Zašto radnja nije uspela, iz fiksne liste za svaki događaj. Prazno kod uspeha. |
| `actor` | Ko je delovao: njegov `type` (`user`, `anonymous`, `system`, `runner`, `integration`), `id` i `name`. Za korisnika i `auth` (`session` ili `api_token`), a za API token `token_fingerprint`. |
| `source` | Za zahteve veb interfejsu i API-ju: `ip` i `user_agent` klijenta. |
| `target` | Objekat radnje: njegov `type`, `id` i `name`. |
| `scope` | `project_id` za događaje unutar projekta. |
| `request_id` | ID HTTP zahteva. Semaphore ga vraća i u zaglavlju odgovora `X-Request-ID`. |
| `instance_id` | Ime ove instalacije Semaphore-a, iz `audit.instance_id`. |
| `node_id` | Čvor koji je zabeležio događaj, kada je uključena [visoka dostupnost](/admin-guide/ha). |
| `metadata` | Dodatni detalji koji zavise od događaja. |

`timestamp` je vreme baze podataka, u mikrosekundama, ili u milisekundama na SQLite-u. Redosled događaja
određujte po `seq`: dva događaja mogu imati isto vreme, ali nikada isti `seq`.

Na MySQL-u kolona `created` tabele `audit_event` koristi vremensku zonu opcije veze `loc`, podrazumevano
UTC. `timestamp` svakog događaja je uvek u UTC-u.

Svako pokretanje servera beleži `audit.lifecycle` sa radnjom `start`. Događaj zaustavljanja ne postoji:
zaustavljanje, pad ili isključivanje dnevnika revizije vide se kao vremenska praznina pre sledećeg `start`.

## Šta se nikada ne beleži {#never-recorded}

Dnevnik revizije nikada ne sadrži lozinke, jednokratne kodove, TOTP tajne i QR kodove, kodove za oporavak,
kolačiće sesije, tokene, OAuth kodove i tvrdnje, privatne ključeve, lozinke za ključeve, vrednosti tajni,
vrednosti okruženja i anketa, sadržaj webhook-ova, izlaz zadataka, adrese e-pošte ni URL-ove. API token se
identifikuje samo po otisku: prvih 16 heksadecimalnih znakova njegovog SHA-256 heša.

ID korisnika i korisničko ime identifikuju onoga ko je delovao. Neuspešna prijava beleži uneto korisničko ime,
skraćeno na 64 bajta, jer je potrebno za istragu neuspešnih prijava.

## Uključite dnevnik revizije {#enable}

Podesite `audit.enabled` i dajte instalaciji ime u `audit.instance_id`. Ime ima od 1 do 255 ASCII znakova za
štampanje bez razmaka i pojavljuje se u svakom događaju.

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
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Ponovo pokrenite Semaphore da biste primenili izmenu. Za sve opcije pogledajte
[Konfiguracija](/reference/configuration).

## Adresa klijenta iza reverznog proksija {#trusted-proxies}

Iza reverznog proksija, direktni sagovornik Semaphore-a je proksi, a adresa klijenta dolazi iz zaglavlja
`X-Forwarded-For` ili `X-Real-IP`. Semaphore čita ova zaglavlja samo kada je direktni sagovornik u
`audit.trusted_proxy_cidrs`. U suprotnom beleži adresu sagovornika, pa klijent ne može da lažira svoju adresu.

U `audit.trusted_proxy_cidrs` navedite samo svoje reverzne proksije, nikada mreže klijenata. Klijent unutar
pouzdanog opsega može da upiše bilo koju adresu u `X-Forwarded-For`.

Beleži se krajnja desna adresa u `X-Forwarded-For` koja nije pouzdani proksi.
`X-Real-IP` se koristi samo kada nema `X-Forwarded-For`, i samo ako ima jednu vrednost.

## Skladištenje {#storage}

Događaji se čuvaju u bazi podataka Semaphore-a i nikada se ne brišu: ova verzija nema period čuvanja.
Planirajte veličinu baze podataka prema broju prijava i izmena u vašoj instalaciji.

## Mapiranje usklađenosti {#compliance}

Semaphore beleži događaje koji su vam potrebni za ove kontrole. Sam po sebi ne čini vašu instalaciju
usklađenom.

| Zahtev | Pokriveno sa | Status |
| --- | --- | --- |
| PCI DSS 10.2.1.1 pristup osetljivim podacima (analog: tajne) | `iam.mfa/view_qr` | Dostupno |
| PCI DSS 10.2.1.1 pristup osetljivim podacima (analog: tajne) | `resource.project_backup/export` | Planirano |
| PCI DSS 10.2.1.2 radnje administratora / ISO 27002 8.15 korišćenje privilegija | `iam.*`, `system.*` | Dostupno |
| PCI DSS 10.2.1.2 radnje administratora / ISO 27002 8.15 korišćenje privilegija | `resource.*`, `secret.*` | Planirano |
| PCI DSS 10.2.1.2 radnje administratora / ISO 27002 8.15 korišćenje privilegija | `runner.*`, `task.control`, `task.history` | Planirano |
| PCI DSS 10.2.1.3 pristup dnevnicima revizije | Nije primenljivo: Semaphore ne daje pristup revizijskom tragu. | — |
| PCI DSS 10.2.1.4 nevažeći pokušaji logičkog pristupa / ISO odbijeni pokušaji pristupa | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Dostupno |
| PCI DSS 10.2.1.4 nevažeći pokušaji logičkog pristupa / ISO odbijeni pokušaji pristupa | `runner.lifecycle/register` failure | Planirano |
| PCI DSS 10.2.1.5 izmene akreditiva za identifikaciju i autentifikaciju | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Dostupno |
| PCI DSS 10.2.1.5 izmene akreditiva za identifikaciju i autentifikaciju | `runner.credential` | Planirano |
| PCI DSS 10.2.1.6 pokretanje, zaustavljanje i pauziranje dnevnika revizije / ISO aktiviranje bezbednosnih sistema | `audit.lifecycle/start`; zaustavljanje se vidi kao praznina pre njega | Dostupno |
| PCI DSS 10.2.1.7 kreiranje i brisanje sistemskih objekata | `resource.*` create/delete | Planirano |
| PCI DSS 10.2.1.7 kreiranje i brisanje sistemskih objekata | `runner.lifecycle` create/delete | Planirano |
| PCI DSS 10.2.2 obavezna polja | `actor`, `event_code` i `action`, `timestamp`, `outcome`, `source` ili `node_id`, `target` ili `scope` | Dostupno |
| PCI DSS 10.3.3 brza rezervna kopija na centralni server dnevnika | Izvoz u SIEM preko Syslog+TLS | Dostupno |
| PCI DSS 10.3.3 brza rezervna kopija na centralni server dnevnika | Izvoz u SIEM preko Splunk HEC | Planirano |

Planirani događaji se ne beleže u ovoj verziji.

## Šta se ne beleži u ovoj verziji {#not-recorded}

- Radnje izvršene komandom `semaphore` na serveru, kao što su `user add` ili `user token`. One direktno menjaju
  bazu podataka, a ko može da ih pokrene može da izmeni i tabelu revizije.
- Uklanjanje licence, podešavanja aplikacija u radu, brisanje stanja HA zadataka, aliasi Terraform inventara,
  pokretanja workflow-a i pozivnice u projekte. Za njih još ne postoji događaj revizije.

## Izvoz u SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro šalje dnevnik revizije u SIEM preko Syslog-a sa TLS-om. Čuva svoju poziciju u dnevniku za SIEM,
pa se događaji zabeleženi dok SIEM nije dostupan šalju kada ponovo postane dostupan. Za korake pogledajte
[Šaljite dnevnik revizije u SIEM](/admin-guide/audit-log-siem).

## Šta dalje {#whats-next}

- [Šaljite dnevnik revizije u SIEM](/admin-guide/audit-log-siem) — izvezite događaje preko Syslog+TLS.
- [Događaji revizije](/reference/audit-events) — svaki događaj sa ishodima, razlozima i metapodacima.
- [Konfiguracija](/reference/configuration) — svaka opcija `audit.*`.
