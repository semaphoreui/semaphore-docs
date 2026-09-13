
# Настройка Keycloak

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

## Вход, инициированный IdP {#idp-initiated-login}

Чтобы пользователи могли запускать Semaphore из лаунчера приложений **Account Console** в Keycloak, включите
[вход, инициированный IdP](/admin-guide/authentication/openid#idp-initiated-login), для провайдера:

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

Затем в Keycloak Admin Console откройте ваш клиент и укажите в **Home URL** (Keycloak ≥ 19; в более старых версиях это поле называется
*Base URL*):

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

Когда пользователь нажимает на приложение в лаунчере, Keycloak перенаправляет на этот URL с параметром `iss`. Semaphore
проверяет `iss` на соответствие вашему `provider_url` (issuer realm) и запускает обычный поток Authorization Code.


## Связанные Issues на GitHub {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Как отключить проверку сертификата для сервера Keycloak  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Опция для отключения проверки TLS  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Выход из сессии Keycloak при выходе из Semaphore  

[Все issues, связанные с Keycloak →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Связанные обсуждения на GitHub {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Имя пользователя отличается от `preferred_username` в OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Поддержка SAML?

[Все обсуждения, связанные с Keycloak →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
