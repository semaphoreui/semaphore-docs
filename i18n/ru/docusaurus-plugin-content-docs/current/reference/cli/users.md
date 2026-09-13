# Пользователи

Команда `semaphore users` добавляет, изменяет, удаляет и показывает пользователей,
а также управляет их API-токенами и проверкой TOTP (2FA).

```bash
semaphore users --help
```

> `user` — псевдоним для `users`.

| Команда | Назначение |
|---------|---------|
| [`users add`](#add-a-user) | Создать пользователя. |
| [`users change-by-login`](#change-a-user) | Обновить пользователя, найденного по логину. |
| [`users change-by-email`](#change-a-user) | Обновить пользователя, найденного по email. |
| [`users get`](#show-a-user) | Вывести данные одного пользователя. |
| [`users list`](#list-users) | Вывести логины всех пользователей. |
| [`users delete`](#delete-a-user) | Удалить пользователя. |
| [`users token create`](#create-a-token) | Создать API-токен для пользователя. |
| [`users token list`](#list-tokens) | Показать API-токены пользователя. |
| [`users totp enable`](#totp-management) | Включить TOTP для пользователя. |
| [`users totp show`](#totp-management) | Показать данные TOTP пользователя. |
| [`users totp disable`](#totp-management) | Отключить TOTP для пользователя. |

## Добавление пользователя {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Флаг | Описание |
|------|-------------|
| `--login` | Логин пользователя. **Обязательный.** |
| `--name` | Отображаемое имя пользователя. **Обязательный.** |
| `--email` | Email пользователя. **Обязательный.** |
| `--password` | Пароль пользователя. Обязателен для обычных пользователей; недопустим для внешних. |
| `--admin` | Сделать нового пользователя администратором. |
| `--external` | Пометить нового пользователя как внешнего (LDAP или OIDC). Внешним пользователям нельзя задавать `--password`. |

При успехе команда выводит `User <login> <email> added!`.

## Изменение пользователя {#change-a-user}

Пользователя для изменения можно найти либо по логину, либо по email.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Флаг | Описание |
|------|-------------|
| `--login` | Для `change-by-login` — логин искомого пользователя (**обязательный**). Для `change-by-email` — новый логин пользователя. |
| `--email` | Для `change-by-email` — email искомого пользователя (**обязательный**). Для `change-by-login` — новый email пользователя. |
| `--name` | Новое имя пользователя. |
| `--password` | Новый пароль пользователя. |
| `--admin` | Выдать права администратора. |

Применяются только указанные флаги; пропущенные поля остаются без изменений.
`--admin` может только выдать права администратора. Отозвать их он не может —
для этого используйте веб-интерфейс.

## Просмотр пользователя {#show-a-user}

Вывести данные одного пользователя, найденного по логину или email.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

Требуется хотя бы один из флагов `--login` или `--email`. Вывод включает ID
пользователя, время создания, логин, имя, email и статус администратора. Если
пользователь не найден, команда выводит сообщение и завершается с ненулевым
статусом.

## Список пользователей {#list-users}

Вывести логины всех пользователей, по одному на строку.

```bash
semaphore user list
```

## Удаление пользователя {#delete-a-user}

Удалить пользователя, найденного по логину или email.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

Требуется хотя бы один из флагов `--login` или `--email`.

## Управление API-токенами {#api-token-management}

Управление API-токенами пользователя через CLI:

```bash
semaphore user token --help
```

### Создание токена {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Флаг | Описание |
|------|-------------|
| `--login` | Логин владельца токена. **Обязательный.** |
| `--name` | Имя токена. |
| `--ttl` | Срок жизни токена в формате Go duration (например `1h`, `30m`, `24h`). Если не указан, токен бессрочный. |

Команда выводит новый токен отдельной строкой и больше ничего, поэтому его
безопасно захватывать в скрипте:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

При недопустимом значении `--ttl` или неизвестном логине выводится сообщение об
ошибке, и команда завершается с ненулевым статусом.

### Список токенов {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` обязателен. В каждой строке через табуляцию выводятся имя токена, его
статус (`active` или `expired`) и время истечения в формате RFC 3339 (`never`,
если срок не ограничен). Значения токенов никогда не выводятся.

## Управление TOTP {#totp-management}

Управление проверкой по одноразовым паролям на основе времени (2FA) через CLI:

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Все подкоманды TOTP требуют `--login`.

- `enable` выводит одноразовый код восстановления, URL `otpauth://` и QR-код
  для сканирования. Сохраните код восстановления в надёжном месте. Команда
  завершается ошибкой, если TOTP для пользователя уже включён.
- `show` повторно выводит URL `otpauth://` и QR-код либо `TOTP disabled`, если у
  пользователя TOTP не настроен.
- `disable` удаляет проверку TOTP у пользователя. Команда завершается ошибкой,
  если TOTP не включён.

Издатель (issuer), отображаемый в приложениях-аутентификаторах, берётся из
опции конфигурации `mfa.totp.app_name` (`SEMAPHORE_TOTP_ISSUER`). По умолчанию —
`Semaphore`.
