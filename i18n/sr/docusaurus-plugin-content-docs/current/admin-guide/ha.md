---
title: "Visoka dostupnost"
---

# Visoka dostupnost <Enterprise />

:::info
Visoka dostupnost je dostupna u izdanju **Semaphore Enterprise**.
:::

Semaphore UI podržava aktivno-aktivne instalacije visoke dostupnosti (HA) u kojima više instanci radi istovremeno iza balansera opterećenja. Svaka instanca je u potpunosti sposobna da obrađuje zahteve korisničkog interfejsa, API pozive, zakazane poslove i izvršavanje zadataka (Task). Ako jedna instanca otkaže, preostali čvorovi nastavljaju da rade bez prekida.

## Arhitektura {#architecture}

Tipična aktivno-aktivna instalacija sastoji se od sledećih komponenti:

**Balanser opterećenja** — Korisnici se povezuju preko balansera opterećenja (npr. NGINX, HAProxy ili balanser opterećenja u oblaku). Balanser opterećenja raspoređuje HTTP i WebSocket saobraćaj na dostupne Semaphore čvorove.

**Semaphore čvorovi** — Svaki čvor pokreće identičnu instancu Semaphore UI. Bilo koji čvor može primati korisničke zahteve, pokretati poslove automatizacije, obrađivati zakazane zadatke i slati ažuriranja u realnom vremenu. Svi čvorovi su ravnopravni — ne postoji primarni ni rezervni čvor.

**Deljena baza podataka** — Sve instance se povezuju na deljenu PostgreSQL ili MySQL bazu podataka. Baza podataka je jedini izvor istine za projekte (Project), šablone zadataka (Task Template), inventare (Inventory), rasporede (Schedule), istoriju zadataka, korisničke naloge i RBAC konfiguraciju.

:::warning
SQLite i BoltDB nisu podržani za HA instalacije. Koristite PostgreSQL ili MySQL.
:::

**Redis** — Redis obezbeđuje koordinacioni sloj koji omogućava da se više čvorova ponaša kao jedan sistem. Ima tri funkcije:

* **Distribuirane brave** obezbeđuju da samo jedna instanca izvršava dati posao u jednom trenutku, čime se sprečava dvostruko izvršavanje zadataka.
* **Deljeno stanje reda zadataka** održava red zadataka tako da svaki posao preuzima tačno jedan radnik. Svi čvorovi vide isti red i koordiniraju izvršavanje.
* **Pub/Sub razmena poruka** omogućava čvorovima da emituju događaje kao što su ažuriranja zadataka, obaveštenja klastera, poništavanje keša i promene stanja korisničkog interfejsa. Time svi čvorovi ostaju sinhronizovani u realnom vremenu.

## Preduslovi {#prerequisites}

Pre podešavanja HA potrebno vam je:

* Ključ pretplate na **Semaphore Enterprise**.
* Deljena **PostgreSQL** ili **MySQL** baza podataka dostupna sa svih čvorova.
* **Redis** server ili **Redis Sentinel** instalacija dostupna sa svih čvorova. Redis Cluster nije podržan.
* **Balanser opterećenja** koji podržava HTTP i WebSocket saobraćaj.
* Dva ili više servera za pokretanje Semaphore instanci.

Svi Semaphore čvorovi moraju koristiti istu bazu podataka, isti Redis backend i istu konfiguraciju (osim `ha.node_id`, koji mora biti jedinstven za svaki čvor).

## Konfiguracija {#configuration}

Uključite HA dodavanjem bloka `ha` u `config.json` na svakom čvoru:

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

Svaki čvor mora imati jedinstven `ha.node_id`. Sva ostala konfiguracija treba da bude identična na svim čvorovima.

### Promenljive okruženja {#environment-variables}

Alternativno, konfigurišite HA pomoću promenljivih okruženja:

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Da biste preživeli otkazivanje samog Redis servera, usmerite klaster na [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) instalaciju umesto na jednu adresu. Postavite `ha.engine` na `redis_sentinel` i opišite Sentinel postavku u `ha.redis_sentinel`:

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

Svaki čvor pita sentinele koji je trenutni primarni čvor i prati preuzimanje uloge (failover) bez ponovnog pokretanja: zadatak koji se izvršava u trenutku promene primarnog čvora nastavlja da radi, a novi zadaci, rasporedi i ažuriranja u realnom vremenu nastavljaju se na promovisanoj replici.

Ista postavka pomoću promenljivih okruženja (lista sentinela je JSON niz):

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Napomene:

* `ha.engine` određuje koji se blok čita. `redis` (podrazumevano) čita `ha.redis`; `redis_sentinel` čita `ha.redis_sentinel`. Drugi blok, ako postoji, ignoriše se i pri pokretanju se u log upisuje upozorenje.
* Sa `redis_sentinel` su obavezni `master_name` i najmanje jedna adresa u `addrs`; bez njih čvor odbija da se pokrene.
* `user` i `pass` služe za autentifikaciju na Redis čvorovima sa podacima. Ako i sami sentineli zahtevaju autentifikaciju (`requirepass` u `sentinel.conf`), postavite i `sentinel_user` i `sentinel_pass`.
* `tls` i `tls_skip_verify` važe i za vezu sa Sentinelom i za veze sa Redis čvorovima sa podacima.

### Referenca konfiguracije {#configuration-reference}

| Opcija konfiguracionog fajla | Promenljiva okruženja | Opis |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Uključuje režim visoke dostupnosti. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Jedinstveni identifikator ovog čvora. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Adresa Redis servera (npr. `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Broj Redis baze podataka. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Lozinka Redis servera. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Korisničko ime Redis servera. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Uključuje TLS za vezu sa Redis serverom. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Preskače proveru TLS sertifikata za Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Redis backend: `redis` (jedan server, podrazumevano) ili `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Naziv nadgledanog primarnog čvora kako je konfigurisan u Sentinelu. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Adrese sentinela, `host:port`. JSON niz u promenljivoj okruženja. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Korisničko ime za same Sentinel čvorove. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Lozinka za same Sentinel čvorove. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Broj Redis baze podataka na čvorovima sa podacima. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Korisničko ime za Redis čvorove sa podacima. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Lozinka za Redis čvorove sa podacima. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Uključuje TLS za Sentinel i Redis veze. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Preskače proveru TLS sertifikata za Sentinel i Redis veze. |

Pogledajte [Konfiguracija](/admin-guide/configuration) za potpunu listu dostupnih opcija.

## Balanser opterećenja {#load-balancer}

Postavite balanser opterećenja ispred Semaphore čvorova radi raspodele saobraćaja. Balanser opterećenja mora podržavati **WebSocket veze** za ažuriranja korisničkog interfejsa u realnom vremenu.

### NGINX primer {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

Pogledajte [Reverzni proksi](/admin-guide/reverse-proxy/nginx) za više detalja o NGINX konfiguraciji.

## Kako funkcioniše izvršavanje poslova {#how-job-execution-works}

U instalaciji sa više čvorova izvršavanje zadataka prati koordinisani tok:

1. **Korisnik pokreće zadatak.** Korisnik pokreće posao preko korisničkog interfejsa ili API-ja. Zahtev može stići na bilo koji Semaphore čvor.
2. **Metapodaci zadatka se čuvaju.** Čvor koji je primio zahtev upisuje metapodatke zadatka u bazu podataka i signalizira posao putem Redis servisa.
3. **Čvor preuzima zadatak.** Jedan od dostupnih čvorova preuzima zadatak iz Redis servisa, stiče distribuiranu bravu i označava ga kao pokrenut u bazi podataka.
4. **Zadatak se izvršava.** Čvor pokreće zadatak lokalno ili ga delegira [udaljenom runneru](/admin-guide/runners) (Runner). Napredak i logovi se upisuju nazad u bazu podataka.
5. **Rezultati se emituju.** Ažuriranja zadatka se šire preko Redis Pub/Sub mehanizma kako bi svi čvorovi i povezani klijenti korisničkog interfejsa ostali sinhronizovani.

## Kako HA radi ispod haube {#under-the-hood}

Semaphore čvorovi nikada ne komuniciraju direktno jedan sa drugim. Sve oko čega treba da se usaglase prolazi kroz Redis: ko je živ, koji zadatak pripada kom čvoru, ko pokreće raspored i koje poruke korisničkog interfejsa treba proslediti. Svaki deo tog stanja je mali skup Redis ključeva sa rokom isteka, tako da srušeni čvor ne može dugo ostaviti ništa za sobom. Trajni podaci (zadaci, šabloni, logovi, runneri) uvek žive u bazi podataka; Redis čuva samo koordinaciono stanje.

Svi ključevi koriste fiksne prefikse `ha:` i `tasks:`. Oni se ne mogu konfigurisati, pa dva Semaphore klastera koja dele jedan Redis server moraju koristiti različite brojeve baza (`ha.redis.db`).

### Registar čvorova {#node-registry}

Svaki čvor se registruje pri pokretanju, a zatim osvežava svoj zapis svakih 10 sekundi. Zapis ističe posle 30 sekundi, tako da se čvor koji prestane da osvežava smatra mrtvim najkasnije posle pola minuta. Pri urednom gašenju čvor odmah uklanja svoj zapis.

| Ključ | Tip | Namena |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Otkucaj (heartbeat) jednog čvora: `node_id`, `started_at`, `version`, `last_beat`. Ističe 30 s posle poslednjeg osvežavanja. |
| `ha:nodes` | set | ID-jevi svih registrovanih čvorova. Članove čiji je heartbeat ključ istekao uklanjaju ostali čvorovi. |

Registar čvorova je ono što prikazuje kontrolna tabla klastera (Cluster dashboard) i ono što čistač napuštenih zadataka (u nastavku) proverava da bi odlučio da li je vlasnik zadatka još uvek živ.

### Red zadataka i pokrenuti zadaci {#task-queue}

Red zadataka je deljen, pa zadatak pokrenut na jednom čvoru može biti raspoređen, praćen i završen na bilo kom drugom. Redis čuva samo ID-jeve zadataka i nekoliko prolaznih polja; sam zadatak iz baze podataka učitava onaj čvor kome je potreban.

| Ključ | Tip | Namena |
| --- | --- | --- |
| `tasks:queue` | list | ID-jevi zadataka koji čekaju na raspoređivanje, po redosledu. |
| `tasks:claim:<task_id>` | string | ID čvora koji je vlasnik zadatka. Upisuje se atomarno zajedno sa uklanjanjem iz reda, tako da zadatak preuzima tačno jedan čvor. Ističe posle 5 minuta; vlasnik ga osvežava svakog minuta. |
| `tasks:running` | set | ID-jevi zadataka koji se trenutno izvršavaju. |
| `tasks:active:<project_id>` | set | ID-jevi zadataka koji su aktivni (čekaju ili se izvršavaju) u projektu. Koristi se za ograničenja istovremenog izvršavanja po projektu. |
| `tasks:task_project` | hash | `task_id` → `project_id`, kako bi bilo koji čvor mogao da učita zadatak iz baze podataka. |
| `tasks:aliases` | hash | `alias` → `task_id` za zadatke kojima se pristupa preko alijasa. |
| `tasks:runtime:<task_id>` | hash | Polja koja se menjaju dok se zadatak izvršava, kao što su ID runnera i korisnik koji ga je pokrenuo. |
| `tasks:finalize:<task_id>` | string | Brava koju uzima čvor koji upisuje konačni rezultat zadatka izvršenog na udaljenom runneru. Ističe posle 5 minuta. |

Unosi u `tasks:task_project`, `tasks:aliases` i `tasks:runtime:*` uklanjaju se kada se zadatak završi, a dodatno ističu posle 7 dana kao sigurnosna mreža.

Čvor uzima zadatak iz reda jednom atomarnom operacijom: proverava da je zadatak još uvek u redu, upisuje preuzimanje, uklanja zadatak iz reda i dodaje ga u skup pokrenutih. Ako dva čvora pokušaju istovremeno, uspeva samo jedan.

**Čistač napuštenih zadataka.** Jednom u minutu svaki čvor pregleda pokrenute zadatke čiji je vlasnik mrtav, odnosno čije je preuzimanje isteklo ili je nestao heartbeat vlasnika. Zadatak koji baza podataka već prikazuje kao završen jednostavno se uklanja iz Redisa. Zadatak koji nikada nije predat runneru vraća se u red kako bi ga rasporedio živ čvor. Zadatak koji se već izvršava na runneru ostavlja se na miru: runner nastavlja da radi, a zadatak se čisti kada ga baza podataka prikaže kao završen.

### Brave {#locks}

Brave su pojedinačni ključevi koji se kreiraju pomoću `SET NX`: čvor koji uspe da kreira ključ drži bravu. Svaka brava ima rok isteka, a brave koje se drže duže vlasnik osvežava, pa srušeni čvor automatski oslobađa svoje brave.

| Ključ | Istek | Namena |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Jedna brava po rasporedu po minutu. Čvor koji je kreira pokreće raspored; ostali ga preskaču. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, osvežava se svakih 10 s | Samo jedan čvor u datom trenutku pomera dato izvršavanje toka rada (workflow). |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Kratka brava dok se kreira novo izvršavanje toka rada, kako dva čvora ne bi dvaput pokrenula isti tok rada. |
| `ha:audit:export:<destination_id>` | 30 s, osvežava se svakih 10 s | Samo jedan čvor izvozi događaje revizije na dato odredište. Ako Redis nije dostupan, nijedan čvor ne izvozi, pa se događaji nikada ne šalju dvaput. |

Brave rasporeda i tokova rada otkazuju otvoreno: ako Redis nije dostupan, čvor nastavlja umesto da preskoči posao, a uslovna ažuriranja u bazi podataka održavaju rezultat ispravnim. Zakup za izvoz revizije otkazuje zatvoreno, jer se dupliran izvoz ne može poništiti.

### Pub/Sub kanali {#pubsub-channels}

| Kanal | Namena |
| --- | --- |
| `ha:ws:broadcast` | WebSocket poruke za korisnički interfejs. Čvor isporučuje poruku sopstvenim povezanim pregledačima i objavljuje je ovde; ostali čvorovi je prosleđuju svojim. |
| `tasks:events` | Promene u redu zadataka i skupu pokrenutih, ažuriranja polja tokom izvršavanja i zahtevi za prinudno zaustavljanje. Čvorovi koriste ove događaje da održavaju ažurnim svoj prikaz reda u memoriji i da zaustave zadatak čije je zaustavljanje zatražio drugi čvor. |

Poruke nose ID čvora koji ih šalje, pa čvor ignoriše sopstvene poruke.

### Ključevi keša runnera {#runner-cache-keys}

Ključevi `ha:runner:*` pripadaju [kešu runnera](#runner-cache), koji je opisan u sledećem odeljku.

## Keš runnera {#runner-cache}

Svaki zahtev koji [runner](/admin-guide/runners) šalje serveru nosi njegov token, a server mora da pretvori taj token u zapis o runneru pre nego što uradi bilo šta drugo. Runneri se javljaju svakih nekoliko sekundi i izveštavaju o napretku svake sekunde dok se posao izvršava, pa bi bez keša svaki od tih zahteva koštao jedan upit ka bazi podataka. Keš runnera na većinu njih odgovara iz memorije.

Jedan čvor čuva keš u sopstvenoj memoriji. U HA režimu to nije dovoljno: ako izmenite runner na čvoru A, čvor B ne sme da nastavi da služi stari zapis. Zato u HA režimu keš živi u Redisu i dele ga svi čvorovi, a promena napravljena preko bilo kog čvora odmah je vidljiva svima.

:::note
Ovaj keš nije isto što i radnja **Clear cache** na stranici Runners. Ta radnja traži od samog runnera da obriše radne direktorijume na svojoj mašini.
:::

### Šta se kešira i koliko dugo {#runner-cache-ttl}

Keširana vrednost je zapis o runneru bez njegovih oznaka i bez tokena. Token nikada ne stiže u Redis: ključ se izvodi iz SHA-256 heša tokena, a polje tokena se prazni pre nego što se zapis sačuva.

Unos živi najviše 30 sekundi. U praksi se odbacuje mnogo ranije, jer svaka promena napravljena kroz Semaphore odmah poništava keš:

* Kreiranje, ažuriranje, brisanje ili ponovno registrovanje runnera, kao i brisanje projekta, odbacuje **svaki** keširani runner na svim čvorovima.
* Heartbeat runnera odbacuje **samo unos tog runnera**, tako da sačuvano vreme „poslednji put viđen" ostaje sveže bez diranja ostalih. Heartbeat se upisuje najviše jednom po intervalu koji iznosi trećinu `runners.offline_timeout_sec`, ograničeno na 45 sekundi; sa podrazumevanim vremenom isteka od 120 sekundi to je svakih 40 sekundi.

Istek od 30 sekundi je bitan samo za promene napravljene mimo Semaphorea, na primer direktnim uređivanjem tabele `runner` ili vraćanjem rezervne kopije.

### Kako se sprečavaju zastareli upisi {#runner-cache-generation}

Pretraga koja promaši keš čita runner iz baze podataka, a zatim ga upisuje. Između ta dva koraka drugi čvor može da izmeni runner. Da bi se osiguralo da pretraga nikada ne kešira ono što je pročitala pre promene, keš održava brojač koji raste pri svakom poništavanju. Pretraga pamti vrednost brojača koju je videla pre odlaska u bazu podataka, a upis se odbija ako je brojač u međuvremenu odmakao. Svaki korak se izvršava kao jedna Lua skripta u Redisu, pa se brojač i unos čitaju i upisuju zajedno.

### Redis ključevi {#runner-cache-redis-keys}

| Ključ | Tip | Namena |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | Brojač. Raste za jedan pri svakom poništavanju, bilo celog keša ili jednog runnera. |
| `ha:runner:inv` | string, integer | Vrednost brojača pri poslednjem potpunom poništavanju. Deo je ključa svakog unosa, pa potpuno poništavanje odjednom čini sve postojeće unose nedostupnim; oni zatim sami ističu. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | Keširani zapis o runneru. Ističe posle 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Vrednost brojača pri poslednjem heartbeatu ovog runnera. Pretraga koja je počela pre heartbeata ne može da sačuva zapis od pre heartbeata. Ističe posle 30 s. |

Kontrolna tabla klastera (Cluster dashboard) prikazuje broj ključeva `ha:runner:token:*` kao veličinu keša runnera.

### Ponašanje pri problemima sa Redisom {#runner-cache-failures}

Keš nikada ne dovodi do neuspeha zahteva runnera. Svaka operacija keša ograničena je na 500 milisekundi; ako je Redis spor ili nedostupan, pretraga se tretira kao promašaj i odlazi u bazu podataka, a ništa se ne upisuje. Jedini slučaj na koji treba obratiti pažnju jeste poništavanje koje ne uspe zato što je Redis nedostupan u trenutku kada se runner menja: ostali čvorovi tada mogu da služe stari zapis dok ne istekne, najkasnije 30 sekundi kasnije. Neuspeh se beleži u log na nivou greške.

## Skaliranje pomoću runnera {#scaling-with-runners}

HA takođe omogućava horizontalno skaliranje izvršavanja zadataka. Umesto da se poslovi izvršavaju samo na samim Semaphore čvorovima, izvršavanje se može delegirati većem broju [runnera](/admin-guide/runners). To vam omogućava da:

* Raspodelite opterećenje po svojoj infrastrukturi.
* Skalirate kapacitet automatizacije nezavisno od veb/API sloja.
* Izolujete okruženja za izvršavanje kako biste ograničili domet štete.
* Pokrećete zadatke paralelno na mnogo čvorova.

Pogledajte [Runneri](/admin-guide/runners) za uputstva za podešavanje.

## Prednosti {#benefits}

* **Veća pouzdanost** — Ako jedna instanca otkaže, ostale nastavljaju da opslužuju saobraćaj i izvršavaju poslove.
* **Održavanje bez prekida rada** — Čvorovi se mogu ažurirati ili ponovo pokretati pojedinačno bez zaustavljanja sistema.
* **Horizontalna skalabilnost** — Dodajte Semaphore čvorove iza balansera opterećenja da biste povećali kapacitet.
* **Bez zavisnosti od primarnog čvora** — Svi čvorovi su ravnopravni, čime se uklanjaju složeni mehanizmi preuzimanja uloge (failover).
* **Konzistentno stanje klastera** — Deljena baza podataka i Redis koordinacija održavaju sve instance sinhronizovanim.

## Česta pitanja {#faq}

### Šta je aktivno-aktivna visoka dostupnost? {#what-is-active-active-high-availability}

Aktivno-aktivna HA znači da više instanci aplikacije radi istovremeno i da sve one opslužuju zahteve. Ne postoji primarni čvor — bilo koja instanca može obrađivati saobraćaj i izvršavati poslove.

### Zašto Semaphore koristi Redis u HA režimu? {#why-does-semaphore-use-redis-in-ha-mode}

Redis služi kao koordinacioni sloj između instanci. Obezbeđuje distribuirane brave, deljeno stanje reda zadataka i Pub/Sub razmenu poruka kako bi se osiguralo da čvorovi ne izvršavaju isti posao istovremeno.

### Koju bazu podataka treba da koristim za HA instalacije? {#what-database-should-i-use-for-ha-deployments}

Semaphore podržava PostgreSQL i MySQL kao deljenu bazu podataka. SQLite i BoltDB se ne mogu koristiti u HA režimu jer ne podržavaju istovremeni pristup iz više procesa.

### Šta se dešava ako Redis otkaže? {#what-happens-if-redis-fails}

Sa jednim Redis serverom (`ha.engine: redis`) čvorovi ne mogu da se koordiniraju dok se Redis ne vrati. Sa [Redis Sentinelom](#redis-sentinel) sentineli promovišu repliku i svaki Semaphore čvor automatski prelazi na nju, obično u roku od nekoliko sekundi, bez ponovnog pokretanja.

### Šta se dešava ako jedan Semaphore čvor otkaže? {#what-happens-if-one-semaphore-node-fails}

Balanser opterećenja usmerava saobraćaj na preostale čvorove. Pokrenuti poslovi se nastavljaju na drugim instancama, a nove poslove preuzima bilo koji dostupni čvor.

### Mogu li da skaliram horizontalno? {#can-i-scale-horizontally}

Da. Možete dodati Semaphore čvorove iza balansera opterećenja da biste povećali veb/API kapacitet, i dodati [runnere](/admin-guide/runners) da biste povećali kapacitet izvršavanja zadataka.
