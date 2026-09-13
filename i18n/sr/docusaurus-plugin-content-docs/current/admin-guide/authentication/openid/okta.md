
# Okta konfiguracija

```yaml title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## Prijava koju pokreće IdP {#idp-initiated-login}

Da biste korisnicima omogućili da započnu prijavu sa pločice u Okta kontrolnoj tabli, uključite
[prijavu koju pokreće IdP](/admin-guide/authentication/openid#idp-initiated-login) za provajdera:

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

Zatim u Okta Admin Console otvorite podešavanja **General** svoje aplikacije i konfigurišite odeljak *Login*:

1. Postavite **Login initiated by** na *Either Okta or App* (ili *App Only*).
2. Postavite **Initiate login URI** na:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Opciono) Pod **Application visibility** uključite *Display application icon to users* da bi se pločica pojavila na
   Okta kontrolnoj tabli.

Okta šalje parametre `iss` i `target_link_uri`; Semaphore proverava `iss` u odnosu na vaš `provider_url` i započinje
uobičajeni Authorization Code tok.


## Povezani GitHub problemi {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Pomoć sa konfigurisanjem/otklanjanjem grešaka OIDC Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 kvari OIDC autentifikaciju sa Keycloak-om
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — testiranje oidc_providers

[Pogledajte sve probleme povezane sa Okta →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Povezane GitHub diskusije {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — Pri podešavanju GitHub OpenID-a parsiranje nije moguće osim za e-adresu
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Podrška za SAML?

[Pogledajte sve diskusije povezane sa Okta →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
