
# Настройка Okta

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

## Вход, инициированный IdP {#idp-initiated-login}

Чтобы пользователи могли начинать вход с плитки в панели Okta, включите
[вход, инициированный IdP](/admin-guide/authentication/openid#idp-initiated-login), для провайдера:

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

Затем в Okta Admin Console откройте настройки **General** вашего приложения и настройте раздел *Login*:

1. Установите **Login initiated by** в *Either Okta or App* (или *App Only*).
2. Установите **Initiate login URI**:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Необязательно) В разделе **Application visibility** включите *Display application icon to users*, чтобы плитка отображалась в
   панели Okta.

Okta передаёт параметры `iss` и `target_link_uri`; Semaphore проверяет `iss` на соответствие вашему `provider_url` и запускает
обычный поток Authorization Code.


## Связанные Issues на GitHub {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Помощь с настройкой/отладкой OIDC Azure AD
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 ломает аутентификацию oidc с keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — Тестирование oidc_providers

[Все issues, связанные с Okta →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Связанные обсуждения на GitHub {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — При настройке GitHub OpenID не удаётся разобрать ничего, кроме Email
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; Поддержка SAML?

[Все обсуждения, связанные с Okta →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
