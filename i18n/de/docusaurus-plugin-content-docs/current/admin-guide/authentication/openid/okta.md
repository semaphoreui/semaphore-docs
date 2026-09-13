
# Okta-Konfiguration

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

## IdP-initiierte Anmeldung {#idp-initiated-login}

Damit Benutzer die Anmeldung über die Kachel im Okta-Dashboard starten können, aktivieren Sie
die [IdP-initiierte Anmeldung](/admin-guide/authentication/openid#idp-initiated-login) für den Anbieter:

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

Öffnen Sie anschließend in der Okta Admin Console die **General**-Einstellungen Ihrer Anwendung und konfigurieren Sie den Abschnitt *Login*:

1. Setzen Sie **Login initiated by** auf *Either Okta or App* (oder *App Only*).
2. Setzen Sie **Initiate login URI** auf:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Optional) Aktivieren Sie unter **Application visibility** die Option *Display application icon to users*, damit die Kachel im
   Okta-Dashboard erscheint.

Okta sendet die Parameter `iss` und `target_link_uri`; Semaphore validiert `iss` gegen Ihre `provider_url` und startet
einen normalen Authorization-Code-Flow.


## Verwandte GitHub-Issues {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Hilfe bei der Konfiguration/Fehlersuche für OIDC mit Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 bricht die OIDC-Authentifizierung mit Keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — Testen von oidc_providers

[Alle Okta-bezogenen Issues anzeigen →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Verwandte GitHub-Diskussionen {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — Beim Einrichten von GitHub OpenID ist außer der E-Mail kein Parsen möglich
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML-Unterstützung?

[Alle Okta-bezogenen Diskussionen anzeigen →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
