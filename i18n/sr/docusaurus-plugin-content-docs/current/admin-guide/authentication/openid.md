# OpenID Connect

Semaphore podržava autentifikaciju putem OpenID Connect (OIDC).

Linkovi:

* [GitHub konfiguracija](/admin-guide/authentication/openid/github)
* [Google konfiguracija](/admin-guide/authentication/openid/google)
* [GitLab konfiguracija](/admin-guide/authentication/openid/gitlab)
* [Authelia konfiguracija](/admin-guide/authentication/openid/authelia)
* [Authentik konfiguracija](/admin-guide/authentication/openid/authentik)
* [Keycloak konfiguracija](/admin-guide/authentication/openid/keycloak)
* [Okta konfiguracija](/admin-guide/authentication/openid/okta)
* [PingFederate konfiguracija](/admin-guide/authentication/openid/pingfederate)
* [Azure konfiguracija](/admin-guide/authentication/openid/azure)
* [Zitadel konfiguracija](/admin-guide/authentication/openid/zitadel)
* [Pocket-ID konfiguracija](/admin-guide/authentication/openid/pocket-id)

Primer konfiguracije SSO provajdera:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### Konfigurisanje putem promenljive okruženja {#configure-via-environment-variable}

Kada se pokreće u kontejnerima, može biti zgodno da se provajderi konfigurišu pomoću jedne promenljive okruženja:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Ova vrednost mora biti validan JSON string koji odgovara gore navedenoj strukturi `oidc_providers`.

Sve opcije SSO provajdera:

| Parametar             | Opis                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Naziv provajdera koji se prikazuje na ekranu za prijavu.                                                    |
| `icon`                | [MDI ikona](https://pictogrammers.com/library/mdi/) koja se prikazuje ispred naziva provajdera na ekranu za prijavu. |
| `color`               | Boja provajdera koja se prikazuje na ekranu za prijavu.                                                     |
| `client_id`           | Client ID provajdera.                                                                                       |
| `client_id_file`      | Putanja do datoteke u kojoj je sačuvan client ID provajdera. Ima niži prioritet od `client_id`.             |
| `client_secret`       | Client Secret provajdera.                                                                                   |
| `client_secret_file`  | Putanja do datoteke u kojoj je sačuvan client secret provajdera. Ima niži prioritet od `client_secret`.     |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Claim izraz za korisničko ime[\*](#claim-expression).                           |
| `email_claim`         | Claim izraz za e-adresu[\*](#claim-expression).                                 |
| `name_claim`          | Claim izraz za ime profila[\*](#claim-expression).                              |
| `order`               | Pozicija dugmeta provajdera na ekranu za prijavu.                                                           |
| `allow_idp_initiated` | Uključuje [prijavu koju pokreće IdP](#idp-initiated-login) za ovog provajdera. Podrazumevano `false`.       |
| `return_via_state`    | Prosleđuje putanju za povratak nakon prijave kroz OAuth parametar `state` umesto kroz URL za preusmeravanje. Podrazumevano `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Claim izraz {#claim-expression}

Primer claim izraza:

```
email | {{ .username }}@your-domain.com
```

Semaphore prvo pokušava da preuzme polje email. Ako je prazno, izvršava se izraz koji sledi.

<div class="warning">
  Izraz <code>"username_claim": "|"</code> generiše nasumičan <code>username</code> za svakog korisnika koji se prijavi preko provajdera.
</div>

## Prijava koju pokreće IdP {#idp-initiated-login}

Podrazumevano Semaphore podržava samo prijavu koju pokreće **SP** (SP-initiated): korisnik otvori Semaphore, klikne na dugme provajdera i
biva preusmeren na provajdera identiteta (IdP).

Uz prijavu koju pokreće **IdP** (IdP-initiated) put može da počne kod provajdera identiteta — na primer klikom na
Semaphore pločicu u Okta kontrolnoj tabli, Azure *My Apps* ili u pokretaču aplikacija u Keycloak / Authentik.

Semaphore ovo implementira pomoću standardnog mehanizma **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). IdP
preusmerava pregledač na namenski **Initiate Login URI**, a Semaphore zatim započinje uobičajeni Authorization Code tok.
Sama autentifikacija je i dalje potpuna, bezbedna razmena koda — Semaphore nikada ne prihvata nezatraženi token.

### Uključivanje {#enabling-it}

Postavite `allow_idp_initiated` na `true` za provajdera:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### Konfigurisanje provajdera identiteta {#configuring-the-identity-provider}

U svom IdP-u postavite **Initiate Login URI** aplikacije na:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

gde je `<provider-id>` ključ pod `oidc_providers` (na primer `mysso`).

IdP mora da pošalje parametar `iss` (issuer) na ovu krajnju tačku; Semaphore odbija zahteve čiji `iss` ne odgovara
konfigurisanom provajderu. Opcioni parametar `login_hint` se prosleđuje IdP-u, a opcioni `target_link_uri`
određuje stranicu koja se otvara nakon prijave (mora da pokazuje nazad na Semaphore, u suprotnom se ignoriše).

Napomene za pojedine provajdere:

- **Okta** — postavite *Login initiated by* na *Either Okta or App* (ili *App Only*) i popunite *Initiate login URI*. Okta
  šalje i `iss` i `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** — postavite launch / home URL aplikacije na Initiate Login URI.
- **Azure AD / Entra** — *My Apps* koristi početni URL koji pokreće SP i ne šalje uvek `iss`; usmerite početni URL na
  `https://your-domain.com/api/auth/oidc/<provider-id>/login` umesto toga.

### Bezbednost {#security}

- Prijava koju pokreće IdP je **podrazumevano isključena** i mora se uključiti za svakog provajdera posebno.
- Parametar `iss` se proverava u odnosu na konfigurisanog izdavaoca kako bi se sprečila zamena provajdera.
- `target_link_uri` se prihvata samo kada pokazuje nazad na Semaphore (nema otvorenih preusmeravanja).
- Tok prolazi kroz potpunu Authorization Code razmenu sa CSRF `state` i `nonce`, tako da presretnuti ili ponovo poslati
  token ne može da se iskoristi za prijavu.

## Ekran za prijavu {#sign-in-screen}

Za svakog od konfigurisanih provajdera na stranicu za prijavu dodaje se dodatno dugme za prijavu:

![Snimak ekrana stranice za prijavu u Semaphore, sa dva dugmeta za prijavu. Na jednom piše "Sign In", na drugom "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
