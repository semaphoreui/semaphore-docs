---
title: Autentifikacija preko JWT proksija
description: Prijavljivanje korisnika na osnovu potpisanog JWT-a koji dodaje reverse proxy za autentifikaciju, kao što je Pomerium, sa svim auth.jwt opcijama i podešavanjem odjave.
---

# Autentifikacija preko JWT proksija

Kada Semaphore radi iza reverse proxy-ja koji vrši autentifikaciju (npr. Pomerium, Cloudflare Access ili OAuth2 Proxy), proksi može da prosledi identitet korisnika kroz potpisano JWT zaglavlje. Semaphore proverava JWT prema JWKS endpointu i automatski kreira ili pronalazi korisnika.

Tako se izbegava dupliranje OIDC konfiguracije između proksija i Semaphore-a.

## Kako radi {#how-it-works}

1. Reverse proxy autentifikuje korisnika i dodaje potpisani JWT u podešeno HTTP zaglavlje.
2. Semaphore proverava ovo zaglavlje pri svakom zahtevu. Ako postoji, token se proverava prema JWKS endpointu.
3. Ako je token ispravan, korisnik se pronalazi na isti način kao kod LDAP-a i OIDC-a: prvo po spoljnom identitetu sačuvanom za claim `sub` iz tokena, zatim po e-adresi onako kako dozvoljava `external_auth_email_matching`, a u suprotnom se kreira novi spoljni korisnik. Vidite [Kako nastaje zapis o korisniku](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Ako zaglavlje postoji, ali token nije ispravan, Semaphore odmah vraća `401 Unauthorized` -- postojeća autentifikacija bearer tokenom i sesijom se ne pokušava.
5. Ako zaglavlje ne postoji, uobičajena autentifikacija (bearer token, kolačić sesije) nastavlja se kao i obično.

Korisnici kreirani putem JWT autentifikacije označeni su kao **spoljni**, a njihov identitet se čuva sa ID-em provajdera `jwt` i claim-om `sub` iz tokena. Token bez claim-a `sub` se odbija. Lokalni (ne-spoljni) korisnici se nikada ne upoređuju po e-adresi.

Proksiju se veruje u pogledu e-adrese koju stavi u token. Uz podrazumevanu vrednost `auto` za `external_auth_email_matching`, korisnik kreiran u nekoj ranijoj verziji — koja je JWT korisnike upoređivala samo po e-adresi — povezuje se sa svojim `sub` pri sledećem zahtevu. Uz `never` takvi korisnici se ne upoređuju, a njihovi zahtevi ne uspevaju jer bi novi nalog ponovo upotrebio njihovu e-adresu. Pustite ih da se jednom prijave uz `auto` pre nego što pređete na `never`.

## Bezbednosna razmatranja {#security-considerations}

Semaphore prijavljuje svakoga čiji zahtev nosi ispravan token u podešenom
zaglavlju. Potpis sprečava klijenta da izmisli token, ali ne i da ponovo upotrebi
token koji već ima, pa proksi mora biti jedini put do servera:

- Postarajte se da Semaphore ne bude dostupan bez prolaska kroz proksi. Vežite ga za
  privatnu adresu ili zaštitite njegov port firewall-om; vidite [Mrežna bezbednost](/admin-guide/security/network).
- Podesite proksi da uklanja JWT zaglavlje iz dolaznih zahteva klijenata i da ga postavlja
  tek nakon što autentifikuje korisnika.
- Postavite `audience` na vrednost koju proksi koristi za Semaphore. Bez toga se prihvata
  i token koji je proksi izdao za neku drugu aplikaciju, a potpisan je istim ključevima.

## Konfiguracija {#configuration}

Kada je JWT autentifikacija uključena, i `header` i `jwks_url` su obavezni. Semaphore to proverava pri pokretanju.

### Konfiguraciona datoteka {#config-file}

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "header": "X-Pomerium-Jwt-Assertion",
      "jwks_url": "https://auth.example.com/.well-known/pomerium/jwks.json",
      "audience": "https://semaphore.example.com",
      "issuer": "https://auth.example.com"
    }
  }
}
```

### Promenljive okruženja {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker primer {#docker-example}

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_JWT_AUTH_ENABLED=true \
  -e SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion \
  -e SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json \
  -e SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com \
  -e SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com \
  semaphoreui/semaphore:latest
```

## Opcije {#options}

| Parametar | Promenljiva okruženja | Opis |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Uključuje autentifikaciju preko JWT proksija. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | HTTP zaglavlje koje sadrži JWT. **Obavezno.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL JWKS endpointa za proveru potpisa. **Obavezno.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Očekivani claim `aud`. Ako je prazno, audience se ne proverava. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Očekivani claim `iss`. Ako je prazno, izdavalac se ne proverava. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | JWT claim za e-adresu korisnika. Podrazumevano: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | JWT claim za ime korisnika koje se prikazuje. Podrazumevano: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | JWT claim za korisničko ime. Podrazumevano: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL na koji link za odjavu preusmerava nakon brisanja Semaphore sesije. Vidite [Odjava](#logout). |

## Podržani algoritmi {#supported-algorithms}

Semaphore prihvata tokene potpisane algoritmima **ES256**, **ES384**, **ES512**, **RS256**, **RS384** ili **RS512**. Svaki token mora imati claim `exp`; tokeni bez njega se odbijaju.

## Odjava {#logout}

Klik na odjavu u Semaphore-u briše kolačić Semaphore sesije, ali sesija reverse proxy-ja ostaje netaknuta -- pa sledeći zahtev odmah ponovo autentifikuje istog korisnika.

Da biste korisnika potpuno odjavili, postavite `signout_url` na endpoint za odjavu proksija. Nakon brisanja Semaphore sesije, pregledač se preusmerava tamo.

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "signout_url": "https://auth.example.com/.pomerium/sign_out"
    }
  }
}
```

Primeri za uobičajene proksije:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Dostupnost JWKS-a {#jwks-availability}

Semaphore preuzima JWKS pri pokretanju. Ako JWKS endpoint nije dostupan, server se ipak pokreće. Skup ključeva se osvežava u pozadini svakog sata, kao i kada je token potpisan ključem čiji ID Semaphore još nije video, najviše jednom u pet minuta. JWT autentifikacija vraća grešku dok ključevi ne postanu dostupni.
