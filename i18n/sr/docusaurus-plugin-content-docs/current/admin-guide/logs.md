# Logovi

Semaphore upisuje serverske logove na **stdout**, a logove **zadataka** (Task) i **aktivnosti** (Activity) čuva u **bazi podataka**, čime centralizuje ključne informacije iz logova i eliminiše potrebu za posebnim pravljenjem rezervnih kopija log fajlova. Jedini podaci koji se čuvaju na fajl sistemu su keš podaci.

---

## Serverski log {#server-log}

Semaphore ne loguje u fajlove. Umesto toga, svi logovi aplikacije upisuju se na **stdout**.  
Ako Semaphore radi kao systemd servis, logove možete pregledati sledećom komandom:

```bash
journalctl -u semaphore.service -f
```

Ako Semaphore radi u Docker kontejneru, logove možete pregledati sledećom komandom:
```
docker logs -f my-semaphore-container
```

Ovo daje pregled logova uživo (u realnom vremenu).

---

## Log aktivnosti {#activity-log}

Log aktivnosti beleži korisničke radnje izvršene u Semaphore-u, uključujući:

- Dodavanje ili uklanjanje resursa (npr. šablona, inventara, repozitorijuma).
- Dodavanje ili uklanjanje članova tima.

### Pro verzija 2.10 i novije {#pro-version-210-and-later}

**Semaphore Pro** 2.10+ podržava upisivanje loga aktivnosti i loga zadataka u fajl. Da biste ovo omogućili, dodajte sledeću konfiguraciju u svoj `config.json`:

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


Ili to možete uraditi pomoću sledećih promenljivih okruženja:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Opcije logovanja aktivnosti (događaja) {#activity-events-logging-options}

Opcije logovanja aktivnosti (događaja) omogućavaju vam da podesite kako Semaphore beleži korisničke radnje i sistemske događaje u fajl. Ova podešavanja kontrolišu ponašanje logovanja događaja, uključujući to da li je uključeno, format zapisa u logu i konkretna podešavanja logera. Kada je uključeno, korisničke radnje poput kreiranja šablona ili upravljanja timovima upisuju se u navedeni log fajl u skladu sa ovim podešavanjima.

| Parametar             | Promenljive okruženja | Opis           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Uključuje logovanje događaja u fajl. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Format zapisa u logu. Ostavite prazno za sirovi format ili postavite na `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Opcije logera](#logger-options). |

#### Opcije logovanja zadataka {#tasks-logging-options}

Opcije logovanja zadataka omogućavaju vam da podesite kako Semaphore beleži detalje izvršavanja zadataka u fajl. Ova podešavanja kontrolišu logovanje događaja vezanih za zadatke, uključujući pokretanje zadataka, njihov završetak i status izvršavanja. Kada je uključeno, sve operacije nad zadacima i njihovi ishodi upisuju se u navedeni log fajl u skladu sa ovim podešavanjima, što daje detaljan revizioni trag istorije izvršavanja zadataka.

| Parametar             | Promenljive okruženja | Opis           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Uključuje logovanje zadataka u fajl. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Format zapisa u logu. Ostavite prazno za sirovi format ili postavite na `json`. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Opcije logera](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Opcije logera. |



#### Opcije logera {#logger-options}

| Parametar             | Tip | Opis           |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Putanja i naziv fajla u koji se upisuju logovi. Rezervne kopije log fajlova čuvaju se u istom direktorijumu.  Ako je prazno, koristi se `processname`-lumberjack.log u privremenom direktorijumu. |
| `maxsize`      | Integer | Maksimalna veličina log fajla u megabajtima pre nego što se rotira. Podrazumevano je 100 megabajta. |
| `maxage`       | Integer | Maksimalan broj dana čuvanja starih log fajlova na osnovu vremenske oznake zapisane u njihovom nazivu.  Imajte u vidu da se dan definiše kao 24 sata i ne mora tačno odgovarati kalendarskim danima zbog letnjeg računanja vremena, prestupnih sekundi itd. Podrazumevano se stari log fajlovi ne uklanjaju na osnovu starosti. |
| `maxbackups`   | Integer | Maksimalan broj starih log fajlova koji se čuvaju.  Podrazumevano se čuvaju svi stari log fajlovi (mada MaxAge i dalje može dovesti do njihovog brisanja). |
| `localtime`    | Boolean | Određuje da li se za formatiranje vremenskih oznaka u rezervnim fajlovima koristi lokalno vreme računara.  Podrazumevano se koristi UTC vreme. |
| `compress`     | Boolean | Određuje da li rotirane log fajlove treba komprimovati pomoću gzip-a. Podrazumevano se kompresija ne vrši. |



Svaki red u fajlu ima sledeći format:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Istorija zadataka {#task-history}

Semaphore čuva informacije o izvršavanju zadataka u bazi podataka. Istorija zadataka pruža detaljan pregled svih izvršenih zadataka, uključujući njihov status i logove. Zadatke možete pratiti u realnom vremenu ili pregledati istorijske logove kroz veb interfejs.

### Podešavanje zadržavanja zadataka {#configuring-task-retention}

Podrazumevano Semaphore čuva sve zadatke u bazi podataka. Ako pokrećete veliki broj zadataka, oni mogu zauzeti značajan prostor na disku.

Broj zadataka koji se zadržavaju po šablonu možete podesiti na jedan od sledećih načina:

1. **Promenljiva okruženja**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **Opcija u `config.json`**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

Kada broj zadataka premaši ovo ograničenje, najstariji logovi zadataka se automatski brišu.

---

## Podrška za syslog protokol {#syslog-protocol-support}

Semaphore može da prosleđuje zapise iz loga aktivnosti i loga zadataka spoljnom syslog kolektoru radi dugoročnog čuvanja ili centralizovanog nadzora. Prosleđivanje na syslog je podrazumevano isključeno.

Podesite syslog podršku u `config.json`:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

Iste opcije su dostupne i preko promenljivih okruženja ako ne želite da menjate JSON fajl:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Syslog opcije {#syslog-options}

| Parametar             | Promenljive okruženja | Opis           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Uključuje ili isključuje prosleđivanje na syslog. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protokol kojim se pristupa kolektoru, npr. `udp` ili `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Adresa kolektora u formatu `host:port`. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Opcioni identifikator koji se dodaje na početak svake poruke. |


Ponovo pokrenite Semaphore servis nakon izmene ovih vrednosti da bi se primenilo novo syslog odredište.

---

## SIEM integracija {#siem-integration}

Semaphore 2.20+ beleži bezbednosni revizioni trag pogodan za prosleđivanje SIEM sistemu (Splunk, Elastic Security, QRadar, Wazuh itd.).

Svaki revizioni događaj sadrži **radnju** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), **IP adresu klijenta** i **user agent**, pored korisnika koji je izvršio radnju i objekta na koji se odnosi. Osim izmena resursa, Semaphore loguje:

- Uspešne prijave (lozinkom, LDAP i OpenID), odjave, neuspešne pokušaje prijave i neuspešne MFA verifikacije.
- Kreiranje, izmenu i brisanje korisničkih naloga i promene lozinki.
- Kreiranje i brisanje API tokena (loguje se samo kratki prefiks tokena, nikada tajna).

Postoje tri načina da isporučite revizione događaje svom SIEM sistemu:

1. **Preuzimanje (pull):** čitajte `/api/events` (pogledajte [API dokumentaciju](/admin-guide/api)).
2. **Kolektor fajlova:** uključite fajl loga aktivnosti (Pro, vidi iznad) i šaljite `events.log` (preporučuje se JSON format) pomoću Filebeat-a, Fluentd-a ili Splunk Universal Forwarder-a.
3. **Revizioni webhook (Pro):** šaljite događaje u realnom vremenu preko HTTPS-a — na generičku JSON krajnju tačku ili Splunk HTTP Event Collector.

### Revizioni webhook {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

Ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Opcije revizionog webhook-a {#audit-webhook-options}

| Parametar             | Promenljive okruženja | Opis           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Uključuje ili isključuje prosleđivanje revizionih događaja. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | Puni URL krajnje tačke primaoca. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Format sadržaja: prazno za običan JSON ili `splunk_hec` za Splunk HEC omotač. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | Dodatna HTTP zaglavlja, npr. HEC token: `{"Authorization": "Splunk <token>"}`. |

Isporuka je asinhrona: događaji se stavljaju u red u memoriji i ponovo šalju do tri puta sa odlaganjem, tako da nedostupan primalac nikada ne usporava niti obara korisničke zahteve. Ako primalac ostane nedostupan, događaji iz reda se odbacuju uz upozorenje u serverskom logu.

## Rezime {#summary}

- **Serverski log:** Upisuje se na stdout; može se pregledati pomoću `journalctl` ako radi pod systemd-om.  
- **Log aktivnosti i zadataka:** Prati sve korisničke radnje. Opciono, **Pro 2.10+** može da ih upisuje u fajl.  
- **Istorija zadataka:** Čuva logove izvršavanja zadataka u realnom vremenu i istorijske logove. Zadržavanje se podešava po šablonu.

Pridržavanje ovih smernica obezbeđuje vam odgovarajući uvid u rad Semaphore UI uz kontrolu zauzeća prostora i zadržavanja logova.
