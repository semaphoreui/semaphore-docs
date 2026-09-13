---
title: Lokalni nalozi
description: Prijava lozinkom prema bazi podataka Semaphore-a - kako se lozinke čuvaju, TOTP dvofaktorska autentifikacija, trajanje sesije i isključivanje lozinki.
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

Semaphore podržava TOTP: šestocifrene kodove koje generišu Google Authenticator, Aegis,
1Password i slične aplikacije. Podrazumevano je isključen i važi za one naloge koji ga uključe
— ne nameće se svima.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| Opcija | Dejstvo |
|---|---|
| `mfa.totp.enabled` | Dozvoljava korisnicima da dodaju TOTP svom nalogu. Bez toga niko ne može da se registruje. |
| `mfa.totp.allow_recovery` | Izdaje jedan kod za oporavak pri registraciji, tako da izgubljen telefon ne znači i izgubljen nalog. Njegovim unosom **uklanja se TOTP registracija** i korisnik se prijavljuje; nakon toga se registruje ponovo. Kod se čuva kao bcrypt heš. |
| `mfa.totp.app_name` | Oznaka izdavaoca koju prikazuje aplikacija za autentifikaciju. Podesite je kada imate više od jednog Semaphore-a. |

Korisnici se registruju sa sopstvene stranice naloga. Administrator može da pregleda ili
ukloni drugi faktor nekome ko je izgubio uređaj:

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

Ponovno isključivanje `mfa.totp.enabled` ne briše ničiju registraciju; samo prestaje da traži
drugi faktor. Uključite ga ponovo i stare registracije opet važe.

## Trajanje sesije {#session-lifetime}

Sesija ističe nakon **sedam dana bez aktivnosti**. To vreme neaktivnosti je ugrađeno i ne
može se podesiti.

Apsolutno ograničenje može, a meri se od trenutka prijave, a ne od poslednjeg zahteva, pa se
i aktivno korišćena sesija završava:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

Podrazumevana vrednost `0` znači da apsolutnog ograničenja nema. Postavite je tamo gde
deljena radna stanica ili pravilo usklađenosti zahtevaju da se ljudi periodično ponovo
autentifikuju.

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
- [Bezbednost](/admin-guide/security) — parametri heširanja, šifrovanje i očvršćavanje.
