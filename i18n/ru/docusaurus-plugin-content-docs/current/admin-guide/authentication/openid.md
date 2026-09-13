# OpenID Connect

Semaphore поддерживает аутентификацию через OpenID Connect (OIDC).

Ссылки:

* [Настройка GitHub](/admin-guide/authentication/openid/github)
* [Настройка Google](/admin-guide/authentication/openid/google)
* [Настройка GitLab](/admin-guide/authentication/openid/gitlab)
* [Настройка Authelia](/admin-guide/authentication/openid/authelia)
* [Настройка Authentik](/admin-guide/authentication/openid/authentik)
* [Настройка Keycloak](/admin-guide/authentication/openid/keycloak)
* [Настройка Okta](/admin-guide/authentication/openid/okta)
* [Настройка PingFederate](/admin-guide/authentication/openid/pingfederate)
* [Настройка Azure](/admin-guide/authentication/openid/azure)
* [Настройка Zitadel](/admin-guide/authentication/openid/zitadel)
* [Настройка Pocket-ID](/admin-guide/authentication/openid/pocket-id)

Пример конфигурации SSO-провайдера:

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

### Настройка через переменную окружения {#configure-via-environment-variable}

При работе в контейнерах может быть удобно настраивать провайдеров с помощью одной переменной окружения:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

Это значение должно быть корректной JSON-строкой, соответствующей структуре `oidc_providers`, приведённой выше.

Все параметры SSO-провайдера:

| Параметр              | Описание                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Имя провайдера, отображаемое на экране входа.                                                               |
| `icon`                | [MDI-иконка](https://pictogrammers.com/library/mdi/), отображаемая перед именем провайдера на экране входа. |
| `color`               | Цвет кнопки провайдера на экране входа.                                                                     |
| `client_id`           | Client ID провайдера.                                                                                       |
| `client_id_file`      | Путь к файлу, в котором хранится client ID провайдера. Имеет меньший приоритет, чем `client_id`.            |
| `client_secret`       | Client Secret провайдера.                                                                                   |
| `client_secret_file`  | Путь к файлу, в котором хранится client secret провайдера. Имеет меньший приоритет, чем `client_secret`.    |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Выражение claim для имени пользователя[\*](#claim-expression).                 |
| `email_claim`         | Выражение claim для email[\*](#claim-expression).                               |
| `name_claim`          | Выражение claim для имени профиля[\*](#claim-expression).                       |
| `order`               | Позиция кнопки провайдера на экране входа.                                                                  |
| `allow_idp_initiated` | Включить [вход, инициированный IdP](#idp-initiated-login), для этого провайдера. По умолчанию `false`.       |
| `return_via_state`    | Передавать путь возврата после входа через параметр OAuth `state` вместо redirect URL. По умолчанию `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Выражение claim {#claim-expression}

Пример выражения claim:

```
email | {{ .username }}@your-domain.com
```

Semaphore сначала пытается получить поле email. Если оно пустое, выполняется следующее за ним выражение.

<div class="warning">
  Выражение <code>"username_claim": "|"</code> генерирует случайное <code>username</code> для каждого пользователя, входящего через этого провайдера.
</div>

## Вход, инициированный IdP {#idp-initiated-login}

По умолчанию Semaphore поддерживает только вход, **инициированный SP**: пользователь открывает Semaphore, нажимает кнопку провайдера и
перенаправляется к провайдеру идентификации (IdP).

При входе, **инициированном IdP**, путь может начинаться на стороне провайдера идентификации — например, нажатием на
плитку Semaphore в панели Okta, в Azure *My Apps* или в лаунчере приложений Keycloak / Authentik.

Semaphore реализует это с помощью стандартного механизма **Third-Party Initiated Login**
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). IdP
перенаправляет браузер на специальный **Initiate Login URI**, после чего Semaphore запускает обычный поток Authorization Code.
Сама аутентификация по-прежнему представляет собой полный, безопасный обмен кодом — Semaphore никогда не принимает непрошеный токен.

### Включение {#enabling-it}

Установите `allow_idp_initiated` в `true` для провайдера:

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

### Настройка провайдера идентификации {#configuring-the-identity-provider}

В вашем IdP укажите для приложения **Initiate Login URI**:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

где `<provider-id>` — это ключ внутри `oidc_providers` (например, `mysso`).

IdP должен передавать на этот эндпоинт параметр `iss` (issuer); Semaphore отклоняет запросы, у которых `iss` не совпадает
с настроенным провайдером. Необязательный параметр `login_hint` передаётся IdP, а необязательный `target_link_uri`
задаёт страницу, которая откроется после входа (он должен указывать обратно на Semaphore, иначе игнорируется).

Замечания по конкретным провайдерам:

- **Okta** — установите *Login initiated by* в *Either Okta or App* (или *App Only*) и заполните *Initiate login URI*. Okta
  передаёт и `iss`, и `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** — укажите в качестве URL запуска / домашнего URL приложения Initiate Login URI.
- **Azure AD / Entra** — *My Apps* использует стартовый URL, инициированный SP, и не всегда передаёт `iss`; вместо этого укажите в качестве стартового URL
  `https://your-domain.com/api/auth/oidc/<provider-id>/login`.

### Безопасность {#security}

- Вход, инициированный IdP, **по умолчанию отключён** и должен включаться для каждого провайдера отдельно.
- Параметр `iss` проверяется на соответствие настроенному issuer, чтобы предотвратить подмену провайдера.
- `target_link_uri` принимается только в том случае, если он указывает обратно на Semaphore (без открытых редиректов).
- Поток проходит через полный обмен Authorization Code с CSRF-параметром `state` и `nonce`, поэтому перехваченный или повторно
  отправленный токен нельзя использовать для входа.

## Экран входа {#sign-in-screen}

Для каждого из настроенных провайдеров на страницу входа добавляется дополнительная кнопка входа:

![Скриншот страницы входа Semaphore с двумя кнопками входа. На одной написано "Sign In", на другой — "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
