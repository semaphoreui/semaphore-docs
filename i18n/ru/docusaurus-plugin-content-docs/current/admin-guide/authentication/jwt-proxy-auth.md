---
title: Аутентификация через JWT-прокси
description: Вход пользователей по подписанному JWT, который добавляет аутентифицирующий обратный прокси, например Pomerium, со всеми параметрами auth.jwt и настройкой выхода.
---

# Аутентификация через JWT-прокси

Когда Semaphore работает за аутентифицирующим обратным прокси (например, Pomerium, Cloudflare Access или OAuth2 Proxy), прокси может передавать личность пользователя в заголовке с подписанным JWT. Semaphore проверяет JWT по конечной точке JWKS и автоматически создаёт или находит пользователя.

Так не приходится дублировать настройки OIDC в прокси и в Semaphore.

## Как это работает {#how-it-works}

1. Обратный прокси аутентифицирует пользователя и добавляет подписанный JWT в настроенный HTTP-заголовок.
2. Semaphore проверяет наличие этого заголовка в каждом запросе. Если он есть, токен проверяется по конечной точке JWKS.
3. Если токен действителен, пользователь находится так же, как для LDAP и OIDC: сначала по внешней личности, сохранённой для claim `sub` токена, затем по адресу электронной почты, насколько это разрешает `external_auth_email_matching`, а иначе создаётся новый внешний пользователь. См. [Как появляется запись пользователя](/admin-guide/authentication#how-a-user-record-comes-to-exist).
4. Если заголовок есть, но токен недействителен, Semaphore сразу возвращает `401 Unauthorized` -- аутентификация по bearer-токену и по сессии не выполняется.
5. Если заголовка нет, обычная аутентификация (bearer-токен, cookie сессии) выполняется как обычно.

Пользователи, созданные через JWT-аутентификацию, помечаются как **внешние**, а их личность сохраняется с идентификатором провайдера `jwt` и claim `sub` токена. Токен без claim `sub` отклоняется. Локальные (не внешние) пользователи никогда не сопоставляются по адресу электронной почты.

Прокси доверяют в отношении адреса электронной почты, который он помещает в токен. При значении `external_auth_email_matching` по умолчанию, `auto`, пользователь, созданный более ранней версией — которая сопоставляла пользователей JWT только по адресу электронной почты, — привязывается к своему `sub` при следующем запросе. При `never` такие пользователи не сопоставляются, и их запросы завершаются ошибкой, потому что новая учётная запись повторно использовала бы их адрес электронной почты. Дайте им один раз войти в режиме `auto`, прежде чем переключаться на `never`.

## Вопросы безопасности {#security-considerations}

Semaphore впускает любого, чей запрос содержит действительный токен в настроенном
заголовке. Подпись не позволяет клиенту придумать токен, но не мешает повторно
использовать уже имеющийся, поэтому прокси должен быть единственным путём внутрь:

- Убедитесь, что к Semaphore нельзя обратиться в обход прокси. Привяжите его к
  частному адресу или закройте его порт межсетевым экраном; см. [Сетевая безопасность](/admin-guide/security/network).
- Настройте прокси так, чтобы он удалял заголовок JWT из входящих запросов клиентов и
  устанавливал его только после аутентификации пользователя.
- Задайте в `audience` значение, которое прокси использует для Semaphore. Без этого будет
  принят и токен, выпущенный прокси для другого приложения и подписанный теми же ключами.

## Настройка {#configuration}

Когда JWT-аутентификация включена, обязательны и `header`, и `jwks_url`. Semaphore проверяет это при запуске.

### Файл конфигурации {#config-file}

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

### Переменные окружения {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Пример для Docker {#docker-example}

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

## Параметры {#options}

| Параметр | Переменная окружения | Описание |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | Включить аутентификацию через JWT-прокси. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | HTTP-заголовок, содержащий JWT. **Обязательный.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | URL конечной точки JWKS для проверки подписи. **Обязательный.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | Ожидаемый claim `aud`. Если пусто, audience не проверяется. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | Ожидаемый claim `iss`. Если пусто, издатель не проверяется. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | Claim JWT с адресом электронной почты пользователя. По умолчанию: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | Claim JWT с отображаемым именем пользователя. По умолчанию: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | Claim JWT с именем пользователя. По умолчанию: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | URL, на который ссылка выхода перенаправляет после очистки сессии Semaphore. См. [Выход](#logout). |

## Поддерживаемые алгоритмы {#supported-algorithms}

Semaphore принимает токены, подписанные **ES256**, **ES384**, **ES512**, **RS256**, **RS384** или **RS512**. У каждого токена должен быть claim `exp`; токены без него отклоняются.

## Выход {#logout}

Нажатие кнопки выхода в Semaphore очищает cookie сессии Semaphore, но сессия обратного прокси при этом не затрагивается -- поэтому следующий запрос сразу снова аутентифицирует того же пользователя.

Чтобы полностью завершить сеанс пользователя, задайте в `signout_url` конечную точку выхода прокси. После очистки сессии Semaphore браузер перенаправляется туда.

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

Примеры для распространённых прокси:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## Доступность JWKS {#jwks-availability}

Semaphore загружает JWKS при запуске. Если конечная точка JWKS недоступна, сервер всё равно запускается. Набор ключей обновляется в фоне каждый час, а также когда токен подписан ключом с идентификатором, которого Semaphore ещё не видел, — не чаще одного раза в пять минут. Пока ключи недоступны, JWT-аутентификация возвращает ошибку.
