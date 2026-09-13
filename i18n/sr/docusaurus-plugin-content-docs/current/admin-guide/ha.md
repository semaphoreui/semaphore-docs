# Visoka dostupnost

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
* **Redis** instanca (ili Redis klaster) dostupna sa svih čvorova.
* **Balanser opterećenja** koji podržava HTTP i WebSocket saobraćaj.
* Dva ili više servera za pokretanje Semaphore instanci.

Svi Semaphore čvorovi moraju koristiti istu bazu podataka, istu Redis instancu i istu konfiguraciju (osim `ha.node_id`, koji mora biti jedinstven za svaki čvor).

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

### Šta se dešava ako jedan Semaphore čvor otkaže? {#what-happens-if-one-semaphore-node-fails}

Balanser opterećenja usmerava saobraćaj na preostale čvorove. Pokrenuti poslovi se nastavljaju na drugim instancama, a nove poslove preuzima bilo koji dostupni čvor.

### Mogu li da skaliram horizontalno? {#can-i-scale-horizontally}

Da. Možete dodati Semaphore čvorove iza balansera opterećenja da biste povećali veb/API kapacitet, i dodati [runnere](/admin-guide/runners) da biste povećali kapacitet izvršavanja zadataka.
