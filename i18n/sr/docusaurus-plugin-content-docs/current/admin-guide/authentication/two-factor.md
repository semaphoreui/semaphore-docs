---
title: Dvofaktorska autentifikacija
description: Kako TOTP dvofaktorska autentifikacija radi u Semaphore-u, kako se uključuje za server, podešava za nalog, kako se prijaviti kodom i kako se oporaviti.
---

# Dvofaktorska autentifikacija

Dvofaktorska autentifikacija (2FA) traži drugi dokaz posle prvog koraka prijave: šestocifreni
kod iz aplikacije za autentifikaciju na telefonu korisnika. Ukradena lozinka tada sama nije
dovoljna da se uđe.

Semaphore drugi faktor sprovodi pomoću TOTP-a — jednokratnih lozinki zasnovanih na vremenu,
standarda na kom rade Google Authenticator, Microsoft Authenticator, Aegis, 1Password, Bitwarden
i slične aplikacije. Dostupan je u svim izdanjima.

## Kako radi {#how-it-works}

Dva prekidača odlučuju da li prijava traži kod:

- **Server** mora da dozvoli TOTP — opcija `mfa.totp.enabled`. Podrazumevano je isključena.
- **Nalog** mora da ima podešen TOTP. Svaki korisnik ga uključuje za sopstveni nalog; ne
  nameće se svima.

Kada su oba uključena, prijava prolazi kroz dva koraka:

1. Korisnik se prijavljuje kao i obično — lozinkom, preko LDAP-a ili preko OpenID Connect
   provajdera. Drugi faktor važi za sva tri načina.
2. Semaphore otvara sesiju, ali je označava kao neverifikovanu, i traži kod. Dok kod ne bude
   prihvaćen, svaki API poziv u toj sesiji odbija se sa `401` i
   `{"error":"TOTP_REQUIRED"}`.
3. Korisnik unosi kod koji prikazuje aplikacija. Semaphore ga proverava prema tajni sačuvanoj
   za nalog; ispravan kod verifikuje sesiju i korisnik je unutra.

Kod se menja na svakih 30 sekundi, a aplikacija ga izračunava iz tajne koju je primila
jednom, kada je nalog podešen. Semaphore i telefon nikada ne komuniciraju, pa telefonu nije
potrebna mrežna veza — samo približno tačan sat.

## Uključivanje za server {#turn-it-on-for-the-server}

Dodajte odeljak `mfa.totp` u konfiguracionu datoteku i ponovo pokrenite Semaphore:

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

Ista podešavanja mogu se zadati i kao promenljive okruženja:

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Opcija | Promenljiva okruženja | Dejstvo |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Dozvoljava korisnicima da podese TOTP i čini da prijava traži kod. Bez nje podešavanje se nikome ne prikazuje. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Daje svakom korisniku jednokratni [kod za oporavak](#recovery-code) kada podesi TOTP i dozvoljava mu da se njime prijavi kada izgubi telefon. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | Naziv izdavaoca koji aplikacija za autentifikaciju prikazuje pored naloga. Podrazumevano je `Semaphore`. Pogledajte upozorenje ispod. |

:::warning ⚠️ Veb interfejs ne koristi `app_name` (2026-11-27)
Nalog podešen iz veb interfejsa u aplikaciji za autentifikaciju uvek nosi oznaku
`Semaphore:<email>`, bez obzira na vrednost `mfa.totp.app_name`. Samo
[`semaphore users totp enable`](#manage-the-second-factor-from-the-command-line) koristi
podešeni naziv. Ako imate više od jednog Semaphore-a, korisnici razlikuju unose po adresi
e-pošte ili preimenuju unos u svojoj aplikaciji.
:::

Svaka opcija je navedena i u
[referenci konfiguracije](/reference/configuration).

## Podešavanje TOTP-a za vaš nalog {#set-up-totp-for-your-account}

Prvo instalirajte aplikaciju za autentifikaciju na telefon. Zatim:

1. Otvorite projekat, kliknite na svoje ime pri dnu bočne trake i izaberite
   **Edit Account**.
2. Otvorite karticu **Security**.
3. U delu **Two-factor authentication** uključite **Time-based one-time password**.
   Semaphore odmah kreira tajnu i prikazuje je kao QR kod.
4. U aplikaciji za autentifikaciju dodajte nalog i skenirajte QR kod. Aplikacija počinje da
   prikazuje šestocifreni kod za `Semaphore`.
5. Ako se ispod QR koda prikaže **Recovery code**, kopirajte ga dugmetom pored njega i
   sačuvajte ga na bezbednom mestu — u menadžeru lozinki ili na papiru. Prikazuje se samo sada.
6. Zatvorite dijalog.

<div style={{maxWidth: 450}}>

![Kartica Security u dijalogu Edit User sa uključenom dvofaktorskom autentifikacijom: QR kod za skeniranje i kod za oporavak ispod njega](/assets/two-factor-enrol.webp)

</div>

Prekidač deluje odmah; nema dugmeta **Save** koje treba pritisnuti niti probnog koda koji treba
uneti. Proverite da aplikacija prikazuje kod za Semaphore pre nego što se odjavite — sledeća
prijava će ga tražiti.

Karticu **Security** možete kasnije ponovo otvoriti da biste QR kod skenirali na drugom
uređaju. Kod za oporavak se više ne prikazuje.

## Prijava kodom {#sign-in-with-a-code}

Posle koraka sa lozinkom, LDAP-om ili jedinstvenom prijavom, Semaphore prikazuje
**Two-step verification**:

![Ekran Two-step verification koji traži šestocifreni kod iz aplikacije za autentifikaciju](/assets/two-factor-verify.webp)

Ukucajte šest cifara koje aplikacija trenutno prikazuje. Forma se sama šalje posle šeste cifre.
Pogrešan ili zastareo kod prikazuje grešku i ostavlja vas na istom ekranu; sačekajte sledeći
kod i pokušajte ponovo.

**Return to login** napušta ovu prijavu i počinje iznova.

## Korišćenje koda za oporavak {#recovery-code}

Kada se telefon izgubi ili resetuje, kod za oporavak omogućava korisniku da se sam vrati
unutra:

1. Prijavite se svojom lozinkom kao i obično.
2. Na ekranu **Two-step verification** kliknite na **Use recovery code**.
3. Unesite kod za oporavak i kliknite na **Send**.

Semaphore vas prijavljuje i **uklanja TOTP sa vašeg naloga**. Time se troši i kod za oporavak.
Odmah ponovo podesite TOTP, kao što je opisano [iznad](#set-up-totp-for-your-account), da
biste dobili novu tajnu i novi kod za oporavak.

**Use recovery code** se prikazuje samo kada server ima uključenu opciju
`mfa.totp.allow_recovery`. Kodovi za oporavak imaju 16 znakova i čuvaju se samo kao bcrypt heš,
pa niko — uključujući administratore — kasnije ne može da pročita korisnikov kod.

## Uklanjanje drugog faktora {#remove-the-second-factor}

**Vaš sopstveni nalog.** Isključite **Time-based one-time password** na kartici **Security** u
**Edit Account**. TOTP se odmah uklanja i sledeća prijava traži samo prvi korak. Obrišite i
unos za Semaphore iz aplikacije za autentifikaciju; on više ničemu ne odgovara.

**Tuđi nalog.** Korisnik koji je izgubio telefon i nema kod za oporavak ne može sam da ukloni
TOTP. Administrator, ili korisnik čija globalna uloga dozvoljava upravljanje korisnicima,
otvara **Users**, uređuje tog korisnika i isključuje prekidač na kartici **Security**. Korisnik
se prijavljuje samo lozinkom i ponovo podešava TOTP.

### Upravljanje drugim faktorom iz komandne linije {#manage-the-second-factor-from-the-command-line}

Na serveru se isto može uraditi bez veb interfejsa — korisno kada je jedini administrator
izgubio telefon:

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` podešava TOTP za korisnika i u terminalu ispisuje
`otpauth://` URL, QR kod i kod za oporavak; `show` ispisuje URL i QR kod postojećeg podešavanja.
Obe komande ispisuju samu tajnu, pa ih pokrećite samo tamo gde niko drugi ne vidi terminal, a
QR kod predajte vlasniku lično. Potpuna sintaksa nalazi se u
[`semaphore users`](/reference/cli/users#totp-management).

## Isključivanje za server {#turn-it-off-for-the-server}

Postavite `mfa.totp.enabled` na `false`, ili uklonite odeljak, i ponovo pokrenite server.
Prijava tada prestaje da traži kodove, a podešavanje **Two-factor authentication** nestaje sa
kartice **Security**.

Ničije podešavanje se ne briše. Ponovo uključite opciju i svaki nalog koji je imao TOTP opet
traži svoj kod, sa istom tajnom — ništa ne treba skenirati dvaput.

## Šta treba znati {#things-to-know}

- **API tokeni preskaču drugi faktor.** Zahtev sa tokenom `Authorization: Bearer` nikada ne
  dobija zahtev za kod. Token se može kreirati samo iz potpuno prijavljene sesije, ali tokeni
  koji su postojali pre podešavanja TOTP-a nastavljaju da rade. Pregledajte ih na stranici
  **API Tokens** nakon uključivanja TOTP-a.
- **Semaphore ne ograničava broj pokušaja unosa koda.** Šest cifara je mali prostor, pa
  postavite ograničenje učestalosti za `POST /api/auth/verify` i `POST /api/auth/recovery` u
  svom [reverse proxy-ju](/admin-guide/reverse-proxy).
- **Tajna se u bazi podataka čuva onakva kakva jeste.** Svako ko može da čita tabelu
  `user__totp`, ili rezervnu kopiju baze podataka, može da generiše važeće kodove za svaki
  nalog. Štitite rezervne kopije kao što štitite konfiguracionu datoteku.
- **TOTP se ne može učiniti obaveznim.** Semaphore nema opciju koja primorava korisnike da ga
  podese. Ako vaša politika zahteva drugi faktor za sve, sprovedite je u svom provajderu
  identiteta i prijavljujte korisnike preko [OpenID Connect](/admin-guide/authentication/openid).

Podešavanje, uklanjanje i korišćenje drugog faktora beleže se u
[dnevniku revizije](/admin-guide/audit-log) kao događaji `iam.mfa` i `auth.mfa`; spisak je u
[Događajima revizije](/reference/audit-events).

## Šta dalje {#whats-next}

- [Lokalni nalozi](/admin-guide/authentication/local) — lozinke, trajanje sesije i isključivanje
  prijave lozinkom.
- [Bezbednost](/admin-guide/security) — parametri heširanja, šifrovanje i očvršćavanje.
- [`semaphore users`](/reference/cli/users#totp-management) — TOTP komande.
