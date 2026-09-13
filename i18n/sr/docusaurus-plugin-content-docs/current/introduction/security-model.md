---
title: Bezbednosni model
description: Šta Semaphore štiti, koje su granice poverenja u instalaciji, ko može da izazove izvršavanje koda i koje odluke ostaju na vama.
---

# Bezbednosni model

Semaphore drži kredencijale za vašu infrastrukturu i nad njom pokreće kod. Iz toga
slede dva svojstva, a oba oblikuju svaku drugu odluku na ovoj stranici:
**tajne nikada ne smeju da se vrate u pregledač** i **svako ko može da pokrene zadatak
može da pokrene kod na mašinama do kojih taj zadatak dopire**.

Ova stranica objašnjava model. Za podešavanja koja ga sprovode pogledajte
[Bezbednost](/admin-guide/security).

## Granice poverenja {#trust-boundaries}

| Granica | Prelaze je | Zaštićena je |
|---|---|---|
| Pregledač ↔ server | Sesije, API tokeni | TLS, sigurni kolačići, [obrnuti proksi](/admin-guide/reverse-proxy) |
| Server ↔ baza podataka | Celokupno trajno stanje | Mrežna ograničenja; tajne se šifruju pre upisivanja |
| Server ↔ runner | Sadržaji poslova, uključujući tajne | HTTPS i bearer token po runner-u |
| Zadatak ↔ hostovi kojima se upravlja | Vaša automatizacija | Ključevi koje ste dali šablonu |

Zadatak se nalazi sa druge strane svake od tih granica. On u svom okruženju prima tajne
koje su mu potrebne, a od tog trenutka kod u vašem repozitorijumu odlučuje
šta se sa njima dešava.

## Identitet {#identity}

Korisnici se autentifikuju na jedan od tri načina, a sva tri završavaju istom sesijom:

- **Lokalni nalozi.** Lozinke se heširaju pomoću Argon2id (bcrypt pre verzije 2.20, uz nadogradnju
  pri prvoj prijavi). Može se zahtevati TOTP dvofaktorska autentifikacija.
- **[LDAP ili Active Directory](/admin-guide/authentication/ldap).** Direktorijum proverava lozinku;
  Semaphore čuva samo nalog.
- **[OpenID Connect](/admin-guide/authentication/openid).** Provajder vrši autentifikaciju, a Semaphore
  mapira claim-ove na korisnike.

Neinteraktivni pristup koristi **API tokene** koje kreira korisnik i koji nose dozvole
tog korisnika. Runner-i uopšte ne koriste korisnički identitet: autentifikuju se sopstvenim
tokenom izdatim pri registraciji.

I zadaci mogu da nose identitet. Uz [task JWT-ove](/user-guide/task-templates/jwt) pokretanje
dobija kratkotrajni potpisani token koji imenuje projekat, šablon i korisnika, a koji
spoljno skladište tajni može da proveri umesto da vi čuvate dugotrajni kredencijal.

## Autorizacija {#authorization}

Postoje dva nivoa i oni su nezavisni.

**Nivo servera.** Administrator upravlja korisnicima, globalnim runner-ima i podešavanjima servera.
Biti administrator servera samo po sebi ne daje članstvo u projektu.

**Nivo projekta.** Svaki član ima jednu ulogu u svakom projektu:

| Uloga | Sme |
|---|---|
| **Owner** | Sve u projektu, uključujući članove i brisanje. |
| **Manager** | Pokretanje zadataka i upravljanje resursima i šablonima. |
| **Task Runner** | Pokretanje zadataka. Ništa drugo. |
| **Guest** | Čitanje. |

Enterprise dodaje [prilagođene uloge](/user-guide/team) <FeatureState feature="extended-rbac" />
kada su te četiri pregrube.

Granica koja je bitna za bezbednost prolazi između uloga **Task Runner** i **Manager**.
Manager može da promeni šta šablon izvršava i zato može da pokrene proizvoljan kod
sa kredencijalima tog projekta. Task Runner može da pokrene samo ono što već postoji —
osim ako šablon izlaže upite ili survey promenljive koje dospevaju do komandne linije,
u kom slučaju je autor šablona namerno proširio tu granicu.

## Tajne {#secrets}

Tajne vrednosti — privatni SSH ključevi, lozinke, tokeni, tajne promenljive — šifruju se
ključem iz `access_key_encryption` pre čuvanja, pa sam dump baze podataka
ne otkriva njihov sadržaj. API nikada ne vraća tajnu vrednost; interfejs pokazuje da je
tajna postavljena, ali ne i koja je.

Tajne dospevaju do zadatka kroz njegovo okruženje u trenutku pokretanja. Zato se
izlaz zadatka isplati tretirati kao osetljiv: playbook koji ispiše promenljivu ispisuje
je u log koji drugi članovi projekta mogu da pročitaju.

Ako radije ne biste uopšte držali tajne,
[spoljna skladišta tajni](/user-guide/key-store) čuvaju vrednosti u HashiCorp Vault-u,
OpenBao-u, AWS Secrets Manager-u ili Devolutions Server-u i preuzimaju ih pri svakom pokretanju.

## Izvršavanje koda kome se ne veruje {#executing-untrusted-code}

Uz podrazumevanu postavku, zadatak je proces na Semaphore serveru sa serverskim
sistemom datoteka i mrežnim pristupom. To je prikladno kada je svako ko može da menja
šablon već od poverenja i u odnosu na server.

Kada nije tako, izmestite izvršavanje sa servera:

- [Runner](/admin-guide/runners) smešta zadatke na drugu mašinu, pa kompromitovanje
  zadatka ne kompromituje veb servis ili bazu podataka.
- Izvršilac **Docker** ili **Kubernetes** daje svakom poslu svež kontejner ili Pod,
  pa jedno pokretanje ne može da čita datoteke drugog pokretanja niti datoteke hosta.
- Odvojeni projekti sa odvojenim ključevima znače da zadatak može da dopre samo do onoga što
  dozvoljavaju kredencijali njegovog sopstvenog projekta.

:::warning
Repozitorijum koji član projekta može da menja jeste kod koji će se izvršiti sa
kredencijalima tog projekta. Zaštitite granu iz koje šablon gradi ili usmerite šablone
na granu u koju samo recenzenti mogu da pišu.
:::

## Šta ostaje na vama {#what-is-left-to-you}

Semaphore je samostalno hostovan, pa su delovi modela vaša odgovornost:

- TLS ispred servisa, bilo ugrađeni bilo preko [obrnutog proksija](/admin-guide/reverse-proxy).
- Mrežno ograničavanje baze podataka i administratorske površine servera.
- Rezervne kopije baze podataka i ključa `access_key_encryption` — drugo je beskorisno
  bez prvog, a prvo je nečitljivo bez drugog.
- Održavanje verzije aktuelnom. Prijavite ranjivosti na `security@semaphoreui.com`.

## Šta sledi {#whats-next}

- [Bezbednost](/admin-guide/security) — konkretna podešavanja, parametri heširanja i koraci učvršćivanja.
- [Arhitektura](/introduction/architecture) — komponente koje ove granice razdvajaju.
- [Timovi](/user-guide/team) — dodeljivanje uloga u projektu.
