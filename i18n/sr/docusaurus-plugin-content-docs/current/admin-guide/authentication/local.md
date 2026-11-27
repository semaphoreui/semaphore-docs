---
title: Lokalni nalozi
description: Prijava lozinkom prema bazi podataka Semaphore-a - kako se lozinke čuvaju, upravljanje nalozima, trajanje sesije i isključivanje lozinki.
---

# Lokalni nalozi

Lokalni nalog čuva svoju lozinku u bazi podataka Semaphore-a. Svaka instalacija počinje sa
jednim takvim nalogom, koji kreira `semaphore setup` ili promenljive `SEMAPHORE_ADMIN_*`, i
upravo preko tog naloga dolazite do servera pre nego što postoji ijedan provajder identiteta.

Zadržite bar jednog lokalnog administratora i nakon što jedinstvena prijava proradi. To je
jedini način da se vratite unutra kada je provajder identiteta nedostupan.

## Kako se lozinke čuvaju {#how-passwords-are-stored}

Lozinke se heširaju algoritmom **Argon2id** uz OWASP parametre minimalne jačine, a sami
parametri se beleže uz svaki heš u
[PHC string formatu](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).
Izdanja pre 2.20 koristila su bcrypt; ti heševi i dalje rade i svaki se zamenjuje Argon2id
hešom pri sledećoj uspešnoj prijavi vlasnika. Nalozi koji se više nikada ne prijave zadržavaju
svoj bcrypt heš, pa resetujte te lozinke da biste ih nadogradili.

Kompletna tabela parametara nalazi se u [Bezbednosti](/admin-guide/security#password-hashing).

Semaphore ne sprovodi politiku lozinki — nema minimalne dužine, nema složenosti, nema isteka.
Ako vam je potrebna, koristite direktorijum ili provajdera identiteta, jer takvim politikama
je tamo i mesto.

## Upravljanje nalozima {#manage-accounts}

Administratori upravljaju korisnicima u veb interfejsu, a iste operacije postoje i u
komandnoj liniji, radi skriptovanja i oporavka kada niko ne može da se prijavi:

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

Vidite [`semaphore users`](/reference/cli/users) za sve opcije i
[Timovi](/user-guide/team) za ono što uloga dozvoljava korisniku kada jednom uđe.

:::warning
Lozinka uneta u komandnoj liniji završava u istoriji vaše ljuske i u listi procesa te mašine.
Koristite to za prvog administratora i za oporavak, a lozinku zatim promenite kroz veb
interfejs.
:::

## Dvofaktorska autentifikacija {#two-factor-authentication}

Lokalni nalog može posle lozinke da zatraži drugi faktor: šestocifreni TOTP kod iz
aplikacije za autentifikaciju. Podrazumevano je isključen, za server se uključuje opcijom
`mfa.totp.enabled`, a svaki korisnik ga podešava za sopstveni nalog. Kako radi, kako se
uključuje, kako se prijaviti kodom i kako se oporaviti nakon gubitka telefona opisano je u
[Dvofaktorskoj autentifikaciji](/admin-guide/authentication/two-factor).

## Trajanje sesije {#session-lifetime}

Dva nezavisna ograničenja završavaju sesiju; koje god se prvo dostigne, odjavljuje korisnika.

**Vreme neaktivnosti** računa se od poslednjeg zahteva. Resetuje ga svaki autentifikovani
zahtev, uključujući pozadinsko periodično proveravanje (polling) otvorene kartice pregledača. Podrazumevana vrednost je 168 sati (sedam dana):

```json
{
  "auth": {
    "session_inactivity_hours": 8
  }
}
```

**Apsolutno ograničenje** računa se od trenutka prijave, a ne od poslednjeg zahteva, pa se i
aktivno korišćena sesija završava:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

Podrazumevana vrednost `0` znači da apsolutnog ograničenja nema. Postavite je tamo gde deljena
radna stanica ili pravilo usklađenosti zahtevaju da se ljudi periodično ponovo
autentifikuju. Pregledač ostavljen otvoren na stranici koja periodično proziva API održava
sesiju aktivnom, pa samo apsolutno ograničenje pouzdano završava takvu sesiju.

## Isključivanje prijave lozinkom {#turn-password-sign-in-off}

Kada je provajder identiteta podešen i kada ste proverili da stvarni korisnik može da se
prijavi preko njega, `password_login_disable` u potpunosti odbija metod sa lozinkom:

```json
{
  "password_login_disable": true
}
```

LDAP i OpenID Connect time nisu pogođeni. Postojeći lokalni nalozi zadržavaju svoje uloge i
svoju istoriju; jednostavno više nemaju način da se autentifikuju.

:::danger
Ova opcija se primenjuje odmah i važi za svaki lokalni nalog, uključujući i vaš. Potvrdite da
jedinstvena prijava radi — tako što ćete se njome prijaviti, a ne čitanjem dnevnika — pre nego
što je postavite. Oporavak od greške znači izmenu konfiguracione datoteke na serveru i
ponovno pokretanje.
:::

## Šta dalje {#whats-next}

- [LDAP i Active Directory](/admin-guide/authentication/ldap) — autentifikacija prema direktorijumu.
- [OpenID Connect](/admin-guide/authentication/openid) — jedinstvena prijava preko provajdera identiteta.
- [Dvofaktorska autentifikacija](/admin-guide/authentication/two-factor) — traženje TOTP koda posle lozinke.
- [Bezbednost](/admin-guide/security) — parametri heširanja, šifrovanje i očvršćavanje.
