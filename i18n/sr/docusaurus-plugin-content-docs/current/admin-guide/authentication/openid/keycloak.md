
# Keycloak konfiguracija

```yaml title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```

## Uloge u projektu na osnovu grupa <Enterprise /> {#project-roles-from-groups}

Da biste koristili [mapiranja grupa](/admin-guide/authentication/openid#project-roles-from-groups), dodajte mapper koji upisuje grupe korisnika u ID token:

1. U Keycloak Admin Console otvorite svoj klijent, idite na **Client scopes** i otvorite scope `<client-id>-dedicated`.
2. Dodajte mapper **By configuration** i izaberite **Group Membership**.
3. Postavite **Token Claim Name** na `groups` i uključite **Add to ID token**.
4. Izaberite kako se šalju grupe pomoću **Full group path**. Kada je uključeno, Keycloak šalje putanju svake grupe, na primer `/devops` ili `/platform/sre`, i mapiranje grupe mora da koristi tu putanju. Kada je isključeno, Keycloak šalje samo naziv grupe, na primer `sre`.

Zatim postavite `groups_claim` za provajdera:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "groups_claim": "groups"
    }
  }
}
```

Ne dodajte `groups` u `scopes`. Keycloak odbija scope koji ne poznaje, a mapperu nije potreban dodatni scope.

## Prijava koju pokreće IdP {#idp-initiated-login}

Da biste korisnicima omogućili da pokrenu Semaphore iz pokretača aplikacija u Keycloak **Account Console**, uključite
[prijavu koju pokreće IdP](/admin-guide/authentication/openid#idp-initiated-login) za provajdera:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

Zatim u Keycloak Admin Console otvorite svog klijenta i postavite **Home URL** (Keycloak ≥ 19; starije verzije ga zovu
*Base URL*) na:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Kada korisnik klikne na aplikaciju u pokretaču, Keycloak preusmerava na ovaj URL sa parametrom `iss`. Semaphore
proverava `iss` u odnosu na vaš `provider_url` (izdavaoca realm-a) i započinje uobičajeni Authorization Code tok.


## Povezani GitHub problemi {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Kako isključiti proveru sertifikata za Keycloak server  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Opcija za isključivanje TLS provere  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Odjava iz Keycloak sesije prilikom odjave iz Semaphore-a  

[Pogledajte sve probleme povezane sa Keycloak-om →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Povezane GitHub diskusije {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Korisničko ime se razlikuje od `preferred_username` u OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Podrška za SAML?

[Pogledajte sve diskusije povezane sa Keycloak-om →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
