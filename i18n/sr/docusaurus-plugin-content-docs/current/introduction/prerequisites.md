---
title: Preduslovi
description: Šta vam je potrebno pre instaliranja Semaphore-a - host, baza podataka, mrežni pristup, kredencijali i alati za automatizaciju koje vaši zadaci pozivaju.
---

# Preduslovi

Semaphore ima malo sopstvenih strogih zahteva. Najveći deo onoga što treba da pripremite
odnosi se na automatizaciju koju će pokretati i na okruženje oko nje. Prođite kroz
ovu stranicu pre [Instalacije](/admin-guide/installation) i sama instalacija
traje nekoliko minuta.

## Host {#a-host}

Semaphore se isporučuje kao jedna binarna datoteka i kao slika kontejnera, a radi na Linux-u,
macOS-u i Windows-u. Linux je ono na šta ciljaju paketi, Docker slike i Helm chart,
i ono što koristi većina instalacija.

Servis je lagan: to je Go proces koji opslužuje veb interfejs. Ono što zaista
troši memoriju i procesor jesu Ansible, Terraform i vaše skripte, koje se paralelno izvršavaju
na istoj mašini. Dimenzionišite host prema poslu, a ne prema Semaphore-u, i ograničite
konkurentnost podešavanjem projekta **Max number of parallel tasks** — ili premestite
izvršavanje na [runner-e](/admin-guide/runners) pa njih dimenzionišite.

Predvidite trajno skladište na dva mesta: bazu podataka i direktorijum u
`tmp_path` u koji se kloniraju repozitorijumi. U Docker-u to znači volumen; kontejner
bez njega gubi podatke pri ponovnom kreiranju.

## Baza podataka {#a-database}

Izaberite je pre instalacije, jer kasnija promena znači migraciju podataka.

| Mehanizam | Koristite ga kada |
|---|---|
| **SQLite** | Jedan server, jedan tim. Ugrađen je, nema šta da se podešava, podrazumevan je. |
| **PostgreSQL** ili **MySQL/MariaDB** | Servis je važan za više od nekolicine ljudi, želite rezervne kopije i nadzor sa svoje postojeće platforme za baze podataka ili planirate da pokrenete više od jednog čvora. |

[Visoka dostupnost](/admin-guide/ha) zahteva PostgreSQL ili MySQL uz Redis i
ne može da koristi SQLite. Ako vam je HA u planu, počnite sa PostgreSQL-om.

Kreirajte bazu podataka i korisnika sa pravima nad njom pre instalacije; Semaphore kreira
sopstvene tabele pri prvom pokretanju i pri svakoj nadogradnji.

## Mrežni pristup {#network-access}

| Semaphore mora da dopre do | Zbog |
|---|---|
| Vaših Git remote repozitorijuma | Kloniranja repozitorijuma na koje šabloni pokazuju. |
| Hostova i cloud API-ja koje automatizujete | Samog obavljanja posla. |
| Vašeg provajdera identiteta, ako ga koristite | Prijave preko [LDAP-a](/admin-guide/authentication/ldap) ili [OpenID Connect-a](/admin-guide/authentication/openid). |
| Vaših kanala za obaveštenja | E-pošte, Telegram-a, Slack-a i ostalih. |

Korisnici pristupaju veb interfejsu na portu `3000` osim ako ga promenite. Postavite
[TLS](/admin-guide/reverse-proxy) ispred njega pre nego što se bilo ko prijavi: preko njega
putuju sesije i API tokeni.

Ako će zadatke izvršavati runner, onda je *njemu* potreban pristup Git remote repozitorijumima i
ciljnim hostovima, kao i odlazni pristup Semaphore serveru. Server se nikada
ne povezuje na runner.

## Alati za automatizaciju {#automation-tooling}

Šta god zadatak pokreće mora biti instalirano tamo gde se pokreće — na serveru, na
runner-u ili u slici kontejnera koju izvršilac koristi.

- Docker slike dolaze sa Ansible-om, Terraform-om, OpenTofu-om i uobičajenim
  zavisnostima. Dodatni Python paketi idu u montirani `requirements.txt`; pogledajte
  [Instaliranje dodatnih Python zavisnosti](/admin-guide/installation/docker#installing-additional-python-dependencies).
- Instalacija preko paketa ili binarne datoteke daje vam samo Semaphore. Git, Python, Ansible
  i bilo koje kolekcije ili provajdere instalirajte sami; pogledajte
  [Ručnu instalaciju](/admin-guide/installation_manually).

Proverite da li se vaš playbook ili konfiguracija pokreće iz shell-a na toj mašini, kao
korisnik pod kojim Semaphore radi, pre nego što od njega napravite šablon. Gotovo svaka prijava
tipa „kod mene lokalno radi” svodi se na nedostajuću kolekciju, provajder ili Python paket.

## Kredencijali koje treba imati spremne {#credentials-to-have-ready}

Sakupite ih pre prvog šablona, jer je inače svaki od njih zasebno zaustavljanje:

- **Deploy ključ ili token** za svaki repozitorijum koji će Semaphore klonirati.
- **SSH ključevi ili prijave** koji se koriste za pristup hostovima kojima upravljate.
- Bilo koji **cloud kredencijali** koje vaš Terraform ili moduli zahtevaju.
- **Ansible Vault lozinka**, ako su vaši playbook-ovi šifrovani.

Svi oni pripadaju [Skladištu ključeva](/user-guide/key-store), a ne repozitorijumu.

## Odluke koje treba doneti prvo {#decisions-to-make-first}

Tri izbora su sada jeftina, a kasnije skupa:

1. **Mehanizam baze podataka**, kao što je gore opisano.
2. **URL koji će korisnici koristiti.** Postavite ga kao `web_host`. Obrnuti proksiji, OIDC redirect
   URI-ji, ciljevi webhook-ova i linkovi u obaveštenjima izvode se iz njega.
3. **`access_key_encryption`.** Generišite ga pri instalaciji, napravite mu zasebnu rezervnu kopiju
   i nikada ga nemarno ne rotirajte: svaka sačuvana tajna njime je šifrovana.

```bash
head -c32 /dev/urandom | base64
```

## Šta sledi {#whats-next}

- [Instalacija](/admin-guide/installation) — izaberite metod i instalirajte.
- [Konfiguracija](/admin-guide/configuration) — kako se opcije zadaju i šta znače.
- [Prvi koraci](/getting-started) — od instaliranog servera do prvog zadatka.
