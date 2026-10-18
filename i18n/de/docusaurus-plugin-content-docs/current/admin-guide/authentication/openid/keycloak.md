
# Keycloak-Konfiguration

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

## Projektrollen aus Gruppen <Enterprise /> {#project-roles-from-groups}

Für [Gruppenzuordnungen](/admin-guide/authentication/openid#project-roles-from-groups) fügen Sie einen Mapper hinzu, der die Gruppen des Benutzers in das ID-Token schreibt:

1. Öffnen Sie in der Keycloak Admin Console Ihren Client, wechseln Sie zu **Client scopes** und öffnen Sie den Scope `<client-id>-dedicated`.
2. Fügen Sie einen Mapper **By configuration** hinzu und wählen Sie **Group Membership**.
3. Setzen Sie **Token Claim Name** auf `groups` und schalten Sie **Add to ID token** ein.
4. Legen Sie mit **Full group path** fest, wie die Gruppen gesendet werden. Ist die Option eingeschaltet, sendet Keycloak den Pfad jeder Gruppe, zum Beispiel `/devops` oder `/platform/sre`, und die Gruppenzuordnung muss diesen Pfad verwenden. Ist sie ausgeschaltet, sendet Keycloak nur den Namen der Gruppe, zum Beispiel `sre`.

Setzen Sie dann `groups_claim` für den Anbieter:

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

Fügen Sie `groups` nicht zu `scopes` hinzu. Keycloak lehnt einen unbekannten Scope ab, und der Mapper braucht keinen zusätzlichen Scope.

## IdP-initiierte Anmeldung {#idp-initiated-login}

Damit Benutzer Semaphore über den Anwendungs-Launcher der Keycloak **Account Console** starten können, aktivieren Sie
die [IdP-initiierte Anmeldung](/admin-guide/authentication/openid#idp-initiated-login) für den Anbieter:

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

Öffnen Sie anschließend in der Keycloak Admin Console Ihren Client und setzen Sie die **Home URL** (Keycloak ≥ 19; ältere Versionen nennen sie
*Base URL*) auf:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Wenn ein Benutzer im Launcher auf die Anwendung klickt, leitet Keycloak mit dem Parameter `iss` an diese URL weiter. Semaphore
validiert `iss` gegen Ihre `provider_url` (den Realm-Issuer) und startet einen normalen Authorization-Code-Flow.


## Verwandte GitHub-Issues {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Deaktivieren der Zertifikatsprüfung für den Keycloak-Server  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Option zum Deaktivieren der TLS-Prüfung  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Abmeldung von der Keycloak-Sitzung beim Abmelden von Semaphore  

[Alle Keycloak-bezogenen Issues anzeigen →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Verwandte GitHub-Diskussionen {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Benutzername weicht von `preferred_username` in OpenID ab
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML-Unterstützung?

[Alle Keycloak-bezogenen Diskussionen anzeigen →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
