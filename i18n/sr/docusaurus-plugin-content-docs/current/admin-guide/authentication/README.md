---
title: Autentifikacija
description: Tri načina na koja se korisnici prijavljuju na Semaphore - lokalni nalozi, LDAP i OpenID Connect - kako se kombinuju i kako se identiteti povezuju.
---

# Autentifikacija

Semaphore ima tri načina da utvrdi ko je neko. Nezavisni su i mogu svi biti uključeni
istovremeno, pa ekran za prijavu može ponuditi formu za lozinku, prijavu preko direktorijuma
i po jedno dugme za svakog provajdera identiteta.

| Metod | Ko proverava lozinku | Koristite kada |
|---|---|---|
| [Lokalni nalozi](/admin-guide/authentication/local) | Semaphore, prema sopstvenoj bazi podataka | Nemate direktorijum ili vam je potreban administrator za slučaj nužde. |
| [LDAP i Active Directory](/admin-guide/authentication/ldap) | Vaš server direktorijuma | Ljudi već postoje u LDAP-u ili AD-u i želite jedinstven skup akreditiva. |
| [OpenID Connect](/admin-guide/authentication/openid) | Vaš provajder identiteta | Imate jedinstvenu prijavu: Keycloak, Okta, Entra ID, Google, GitHub i druge. |

Autentifikacija odgovara samo na pitanje *ko* je korisnik. Šta mu je dozvoljeno da radi
odlučuje se posebno, na osnovu njegove uloge na serveru i uloge u svakom projektu — vidite
[Timovi](/user-guide/team).

## Kako nastaje zapis o korisniku {#how-a-user-record-comes-to-exist}

Svaka osoba koja se prijavi ima red u bazi podataka Semaphore-a, bez obzira na to koji je
metod koristila. Lokalni nalog kreira administrator ili komanda `semaphore user add`. LDAP
ili OIDC nalog se kreira pri prvoj uspešnoj prijavi, a Semaphore uz njega čuva i **spoljni
identitet**: ID provajdera i ID korisnika koji je taj provajder vratio.

Upravo se po tom spoljnom identitetu upoređuju kasnije prijave, što znači da preimenovanje
nekoga u direktorijumu ne stvara drugi nalog. Pažnju traži *prva* prijava postojećeg
korisnika, kada spoljni identitet još ne postoji. Šta će se tada desiti odlučuje opcija
`external_auth_email_matching`:

| Vrednost | Ponašanje |
|---|---|
| `auto` (podrazumevano) | Povezuje po e-adresi, ali samo za spoljne korisnike koji još nemaju identitet. Time se jednokratno preuzimaju nalozi napravljeni pre verzije 2.20, i ništa više. |
| `always` | Povezuje po e-adresi bilo kog spoljnog korisnika. Koristite kada se jedna osoba prijavljuje preko više provajdera. |
| `never` | Nikada ne povezuje po e-adresi; identiteti se upoređuju isključivo po ID-u provajdera. |

Lokalni nalozi sa lozinkom se nikada ne upoređuju po e-adresi, ni u jednom režimu. U
suprotnom, OIDC provajder koji korisniku dozvoljava da sam izabere svoju e-adresu mogao bi
biti iskorišćen za preuzimanje administratorskog naloga.

:::warning
ID provajdera — ključ u `oidc_providers` ili `ldap_providers` — deo je svakog sačuvanog
identiteta. Njegovo preimenovanje ostavlja identitete koji ga referenciraju bez veze, a ti
korisnici pri sledećoj prijavi dobijaju nove, prazne naloge. Izaberite ga jednom.
:::

## Kombinovanje metoda {#combining-methods}

Realno podešavanje uključuje jedinstvenu prijavu za ljude i zadržava jednog lokalnog
administratora za dan kada provajder identiteta bude nedostupan:

1. Podesite provajdera i potvrdite da stvarni korisnik može da se prijavi preko njega.
2. Dodelite tom korisniku uloge koje su mu potrebne.
3. Zadržite jedan lokalni administratorski nalog sa jakom lozinkom i uključenim
   [TOTP-om](/admin-guide/authentication/local#two-factor-authentication).
4. Postavite `password_login_disable` da biste svima ostalima onemogućili prijavu lozinkom.

Radite to tim redosledom. Postavljanje `password_login_disable` pre koraka 1 radi tačno onako
kako je opisano i zaključava vas van sopstvenog servera.

## U ovom odeljku {#in-this-section}

| Stranica | Šta obrađuje |
|---|---|
| [Lokalni nalozi](/admin-guide/authentication/local) | Lozinke, TOTP, jednokratni kodovi putem e-pošte, trajanje sesije i isključivanje prijave lozinkom. |
| [LDAP i Active Directory](/admin-guide/authentication/ldap) | Povezivanje sa direktorijumom, filteri pretrage, mapiranja atributa i TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | Konfiguracija provajdera, claim izrazi, prijava koju pokreće IdP i dvanaest razrađenih primera provajdera. |

## Odakle početi {#where-to-start}

Nova instalacija već ima lokalnog administratora napravljenog tokom podešavanja, pa počnite
od [Lokalnih naloga](/admin-guide/authentication/local) da biste ga obezbedili, a zatim
dodajte [OpenID Connect](/admin-guide/authentication/openid) ili
[LDAP](/admin-guide/authentication/ldap) za sve ostale.
