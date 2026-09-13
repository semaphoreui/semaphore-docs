# JWT для задач

Когда [выпуск JWT включён на сервере](/admin-guide/security/jwt),
шаблон может выпускать короткоживущий подписанный token для каждой создаваемой им задачи.
Token передаётся выполняемому playbook или скрипту через переменную окружения
`SEMAPHORE_JWT`, и его можно обменять на учётные данные
в любой системе, поддерживающей аутентификацию по JWT, —
например, OpenBao или HashiCorp Vault.

Преимущество по сравнению с долгоживущим секретом, хранящимся в
[хранилище ключей](/user-guide/key-store), в том, что каждая задача получает **новый token,
идентифицирующий конкретный запуск задачи** (проект, шаблон, идентификатор пользователя), который
истекает вскоре после завершения задачи.

## Включение JWT в шаблоне {#enabling-jwts-on-a-template}

В форме шаблона прокрутите до раздела **JWT** (он отображается только если
администратор [включил выпуск JWT](/admin-guide/security/jwt)) и
отметьте **JWT enabled**.

Для каждого шаблона можно настроить следующие параметры:

| Поле | Описание |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Одна или несколько строк, помещаемых в claim `aud`. Укажите здесь идентификатор(ы), которые ожидает ваша целевая система (например, URL сервера OpenBao). Поддерживается до 32 записей. |
| TTL | Время жизни token'а в виде длительности (`30s`, `10m`, `1h`, ...). Если оставить пустым, используется глобальное значение `jwt.default_ttl`. TTL не должен превышать глобальное значение `jwt.max_ttl`. |

## Claims token'а {#token-claims}

Каждый token содержит следующие claims, на которые можно полагаться при предоставлении
доступа в целевой системе:

| Claim | Пример | Примечания |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Настраивается администратором. |
| `aud` | `https://bao.example.com` | Из списка audience шаблона. |
| `sub` | `task:1234` | Уникален для каждого запуска задачи. |
| `iat` / `nbf` / `exp` | | Стандартные временные claims. |
| `jti` | | Уникальный идентификатор token'а. |
| `project_id` | `7` | Проект, к которому относится шаблон. |
| `template_id` | `42` | Шаблон, создавший задачу. |
| `user_id` | `67` | Пользователь, запустивший задачу (отсутствует для запусков по расписанию / из интеграций) |

Используйте эти claims, чтобы **ограничить** доступ на принимающей стороне. Например, роль
OpenBao, принимающая только token'ы с `project_id = 7` и определённым
`template_id`.

## Использование token'а внутри задачи {#using-the-token-inside-a-task}

Semaphore экспортирует token как `SEMAPHORE_JWT` в окружении
процесса задачи.

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## Пример: OpenBao {#example-openbao}

Следующее пошаговое руководство настраивает OpenBao на доверие к JWT от Semaphore и
обменивает их на демонстрационный пароль.
Замените `semaphore.example.com` и `bao.example.com` на ваши собственные имена хостов.

### 1. Настройте метод аутентификации JWT {#1-configure-the-jwt-auth-method}

Включите метод аутентификации JWT и укажите ему конечную точку JWKS вашего
экземпляра Semaphore. OpenBao использует полученный оттуда открытый ключ для проверки
каждого token'а.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Определите политику {#2-define-a-policy}

Предоставьте разрешения, необходимые задаче. Пример ниже разрешает чтение
демонстрационных учётных данных, расположенных по пути `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Определите роль OpenBao, привязанную к шаблону {#3-define-an-openbao-role-bound-to-a-template}

Роль OpenBao определяет, **каким задачам Semaphore** разрешено использовать какую
политику. Используйте специфичные для Semaphore claims (`project_id`, `template_id`, ...)
в качестве `bound_claims`, чтобы роль мог использовать только нужный шаблон:

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

Всегда ограничивайте каждую роль как минимум claim'ом `project_id` или `template_id`.
Без такой привязки **любой** JWT, выпущенный вашим экземпляром Semaphore,
сможет использовать эту роль.

Полный список поддерживаемых параметров конфигурации можно найти [здесь](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Настройте шаблон {#4-configure-the-template}

В шаблоне Semaphore, который запускает playbook развёртывания:

- Отметьте **JWT enabled**.
- Укажите в **Audience** значение `https://bao.example.com` — оно соответствует
  `bound_audiences` в роли OpenBao.
- При желании задайте **TTL** равным `15m`, чтобы token истекал вскоре после
  завершения задачи.

### 5. Используйте token в задаче {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

Теперь задача аутентифицируется в OpenBao без какого-либо заранее разделяемого секрета :tada:
