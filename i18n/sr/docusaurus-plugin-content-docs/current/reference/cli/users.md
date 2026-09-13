# Korisnici

Komanda `semaphore users` dodaje, menja, uklanja i pregleda korisnike i
upravlja njihovim API tokenima i TOTP (2FA) verifikacijom.

```bash
semaphore users --help
```

> `user` je alijas za `users`.

| Komanda | Namena |
|---------|---------|
| [`users add`](#add-a-user) | Kreira korisnika. |
| [`users change-by-login`](#change-a-user) | Ažurira korisnika pronađenog po loginu. |
| [`users change-by-email`](#change-a-user) | Ažurira korisnika pronađenog po e-adresi. |
| [`users get`](#show-a-user) | Ispisuje detalje jednog korisnika. |
| [`users list`](#list-users) | Ispisuje logine svih korisnika. |
| [`users delete`](#delete-a-user) | Uklanja korisnika. |
| [`users token create`](#create-a-token) | Kreira API token za korisnika. |
| [`users token list`](#list-tokens) | Prikazuje API tokene korisnika. |
| [`users totp enable`](#totp-management) | Uključuje TOTP za korisnika. |
| [`users totp show`](#totp-management) | Prikazuje TOTP detalje korisnika. |
| [`users totp disable`](#totp-management) | Isključuje TOTP za korisnika. |

## Dodavanje korisnika {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Fleg | Opis |
|------|-------------|
| `--login` | Login korisnika. **Obavezno.** |
| `--name` | Prikazno ime korisnika. **Obavezno.** |
| `--email` | E-adresa korisnika. **Obavezno.** |
| `--password` | Lozinka korisnika. Obavezna za obične korisnike; nije dozvoljena za eksterne korisnike. |
| `--admin` | Označava novog korisnika kao administratora. |
| `--external` | Označava novog korisnika kao eksternog (LDAP ili OIDC). Eksternim korisnicima se ne sme zadati `--password`. |

Po uspehu komanda ispisuje `User <login> <email> added!`.

## Izmena korisnika {#change-a-user}

Korisnika koga želite da izmenite možete pronaći po loginu ili po e-adresi.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Fleg | Opis |
|------|-------------|
| `--login` | Za `change-by-login`, login korisnika koga treba pronaći (**obavezno**). Za `change-by-email`, novi login korisnika. |
| `--email` | Za `change-by-email`, e-adresa korisnika koga treba pronaći (**obavezno**). Za `change-by-login`, nova e-adresa korisnika. |
| `--name` | Novo ime korisnika. |
| `--password` | Nova lozinka korisnika. |
| `--admin` | Dodeljuje administratorska prava. |

Primenjuju se samo flegovi koje navedete; izostavljena polja ostaju nepromenjena.
`--admin` može samo da dodeli administratorska prava. Ne može ih oduzeti; za to
koristite veb interfejs.

## Prikaz korisnika {#show-a-user}

Ispisuje detalje jednog korisnika, pronađenog po loginu ili e-adresi.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

Potreban je bar jedan od flegova `--login` ili `--email`. Izlaz sadrži
ID korisnika, vreme kreiranja, login, ime, e-adresu i administratorski status. Ako nijedan korisnik
ne odgovara, komanda ispisuje poruku i završava sa statusom različitim od nule.

## Lista korisnika {#list-users}

Ispisuje logine svih korisnika, po jedan u redu.

```bash
semaphore user list
```

## Brisanje korisnika {#delete-a-user}

Uklanja korisnika, pronađenog po loginu ili e-adresi.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

Potreban je bar jedan od flegova `--login` ili `--email`.

## Upravljanje API tokenima {#api-token-management}

Upravljajte API tokenima korisnika putem CLI-ja:

```bash
semaphore user token --help
```

### Kreiranje tokena {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Fleg | Opis |
|------|-------------|
| `--login` | Login vlasnika tokena. **Obavezno.** |
| `--name` | Naziv tokena. |
| `--ttl` | Trajanje tokena kao Go duration (npr. `1h`, `30m`, `24h`). Ako se izostavi, token nikada ne ističe. |

Komanda ispisuje novi token u zasebnom redu i ništa više, tako da ga je bezbedno
uhvatiti u skripti:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

Nevažeća vrednost `--ttl` ili nepoznat login se prijavljuju i komanda završava
sa statusom različitim od nule.

### Lista tokena {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` je obavezan. Svaki red sadrži naziv tokena, njegov status (`active` ili
`expired`) i vreme isteka u formatu RFC 3339 (`never` ako nema
isteka), razdvojene tabulatorima. Vrednosti tokena se nikada ne ispisuju.

## Upravljanje TOTP-om {#totp-management}

Upravljajte verifikacijom vremenski ograničenom jednokratnom lozinkom (2FA) putem CLI-ja:

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Sve TOTP potkomande zahtevaju `--login`.

- `enable` ispisuje jednokratni kod za oporavak, `otpauth://` URL i
  QR kod koji se može skenirati. Čuvajte kod za oporavak na bezbednom mestu. Komanda ne uspeva ako je TOTP
  već uključen za korisnika.
- `show` ponovo ispisuje `otpauth://` URL i QR kod, ili `TOTP disabled` ako
  korisnik nema podešen TOTP.
- `disable` uklanja TOTP verifikaciju korisnika. Ne uspeva ako TOTP nije
  uključen.

Izdavalac (issuer) koji se prikazuje u aplikacijama za autentifikaciju uzima se iz konfiguracione opcije `mfa.totp.app_name`
(`SEMAPHORE_TOTP_ISSUER`). Podrazumevana vrednost je `Semaphore`.
