---
id: encryption
title: Ключи шифрования
sidebar_label: Ключи шифрования
description: Как Semaphore шифрует секреты, как настраиваются ключи шифрования и как выполнять их ротацию без простоя.
---

# Ключи шифрования

Semaphore шифрует самые чувствительные из хранимых данных — **секреты ключей доступа (Access Key)**
(закрытые SSH-ключи, пары логин/пароль, секретные строки) и **ключ подписи
JWT** — с помощью AES‑256‑GCM. На этой странице описано, как настроить эти ключи, как
работает ротация и как безопасно ею пользоваться.

:::info Два ключа, два назначения

| Ключ | Что защищает | Активный указатель |
|-----|----------|----------------|
| **Ключ секретов** | Секреты ключей доступа, хранящиеся в базе данных | `active.secret_key` |
| **Ключ опций** | Зашифрованные опции в БД (ключ подписи JWT) | `active.option_key` |

Если ключ опций не настроен, для опций используется ключ секретов.
:::

---

## Быстрый старт {#quick-start}

Самая простая конфигурация — один ключ, указанный в основном конфиге:

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

Сгенерируйте ключ командой:

```bash
openssl rand -base64 32
```

Готово — теперь Semaphore шифрует секреты ключом `key1`. Тот же ключ используется для
ключа подписи JWT (для опций по умолчанию используется ключ секретов).

:::tip Production
Предпочитайте **ссылки `file:`** или **`keys_folder`** (см. ниже) вместо встроенного
`value:`, чтобы ключевой материал хранился в смонтированном секрете, а не в конфиге.
:::

---

## Как идентифицируются ключи {#how-keys-are-identified}

У каждого ключа есть **идентификатор ключа (key id)**, вычисляемый из самого ключевого материала — отпечаток
`base64url(sha256(key))[:8]`. Вместе с каждым зашифрованным значением хранится идентификатор (а не ключ),
поэтому при расшифровке нужный ключ находится напрямую — именно тот, которым данные были записаны.

Это означает:

- **Метки можно свободно переименовывать.** `key1`, `secrets_key_primary.txt` — они
  предназначены для людей. База данных никогда их не хранит, только отпечаток.
- **Ключ невозможно «перепутать».** Измените байты ключа — и это будет *новый*
  идентификатор; старые данные продолжат ссылаться на старый идентификатор.
- **Удаление ключа приводит к явной ошибке**, а не к тихому сбою — отсутствующий идентификатор ключа
  всегда даёт явную ошибку, а не мусор на выходе.

Вы никогда не задаёте идентификаторы вручную; Semaphore вычисляет их сам.

---

## Файл ключей {#the-keys-file}

`encryption.keys_file` указывает на файл, содержащий **реестр ключей**
и **указатели** на активный ключ для каждого назначения. Он разбирается как **YAML или JSON
независимо от расширения файла**.

Реестр можно задать двумя способами — встроенной картой, папкой с файлами или
их комбинацией.

### Встроенная карта {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

Каждая запись — это [`KeySource`](#keysource): либо `value` (base64 прямо в файле), **либо**
`file` (путь к файлу, содержащему ключ в base64) — но никогда оба сразу.

### Папка с файлами ключей {#folder-of-key-files}

Укажите в `keys_folder` каталог; **каждый обычный файл — это один ключ**, помеченный
своим именем файла. Идеально подходит для смонтированных секретов Docker/Kubernetes.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Совместимость с Kubernetes
`keys_folder` пропускает записи, начинающиеся с точки (`..data`, `..2024_*`), и следует по
символическим ссылкам, поэтому напрямую работает с тем, как Kubernetes монтирует тома
`Secret`/`ConfigMap`.
:::

### Комбинированный вариант {#combined}

`keys` и `keys_folder` объединяются в один реестр; `active` может указывать по метке
*или* по имени файла:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## Ротация (без простоя) {#rotation-zero-downtime}

Активный ключ шифрует **новые** записи; любой другой ключ из реестра по-прежнему может
**расшифровывать** старые данные. Таким образом, ротация сводится к следующему: добавьте ключ, переключите указатель,
перешифруйте данные в фоне, затем удалите старый ключ.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

Ни на одном из шагов перезапуск процесса не требуется.

### Применение изменений без перезапуска {#applying-changes-without-a-restart}

Semaphore перечитывает файл ключей (и файлы ключей, на которые он ссылается) и атомарно
подменяет ключи в памяти. Есть два триггера:

| Триггер | Поведение |
|---------|-----------|
| **Наблюдатель за файлом** | Опрашивает файл каждые `encryption.keys_poll_interval` (по умолчанию `15s`). Установите `"0"`, чтобы отключить. |
| **`SIGHUP`** | `kill -HUP <pid>` принудительно выполняет немедленную перезагрузку (только Unix). |

:::caution Windows
В Windows нет `SIGHUP`. Полагайтесь на **опрос файла** (по умолчанию) — он работает на всех
платформах — или перезапустите службу.
:::

При перезагрузке новые ключи сначала проверяются, и при любой ошибке текущие ключи
остаются без изменений.

---

## Команды CLI {#cli-commands}

### `vault check` {#vault-check}

Только чтение. Сообщает для каждого идентификатора ключа, сколько хранимых секретов им зашифровано, чтобы вы
видели, что находится на активном ключе и что можно безопасно удалить.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Статусы: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)` и `MISSING KEY` (ключ, на который есть ссылки, отсутствует — код выхода 1).

### `vault rekey` {#vault-rekey}

Перешифровывает все хранимые секреты (и ключ подписи JWT) активным ключом.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Обратная совместимость {#backward-compatibility}

Обновление безопасно и **не требует миграции данных**:

- Существующие установки, в которых задан **`access_key_encryption`** (или
  переменная окружения `SEMAPHORE_ACCESS_KEY_ENCRYPTION`), продолжают работать без изменений — этот
  одиночный ключ становится активным ключом секретов.
- Данные, записанные более старыми версиями Semaphore (без идентификатора ключа), по-прежнему расшифровываются. При следующей записи
  или после `vault rekey` они получают идентификатор ключа.
- **Полное отсутствие шифрования** (ключ не настроен) по-прежнему означает, что секреты хранятся как
  обычный base64 и расшифровываются так же.

Чтобы перевести старую установку с одним ключом на файл ключей, просто добавьте старый ключ
в реестр:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

Старые данные расшифровываются ключом `old`; выполните `vault rekey`, чтобы перенести всё на `new`.

---

## Kubernetes и Docker {#kubernetes--docker}

Смонтируйте ключи как том `Secret` и укажите на него в `keys_folder`:

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

Когда вы обновляете `Secret`, Kubernetes обновляет смонтированные файлы, и
опрос файла применяет изменения в течение `keys_poll_interval` — без перезапуска pod’а.

---

## Рекомендации по безопасности {#security-best-practices}

:::danger Защитите файл ключей
- Ограничьте права доступа: `chmod 0400`, владелец — служебный пользователь Semaphore.
- **Никогда не коммитьте настоящие ключи** в систему контроля версий — добавьте файл в `.gitignore`.
- Делайте резервные копии в безопасном месте. **Потеря всех ключей означает потерю всех зашифрованных данных.**
- Предпочитайте смонтированные секреты (`file:` / `keys_folder`) встроенному `value:`, а переменные
  окружения — обоим вариантам без шифрования: `value:` хранит ключ в файле конфигурации.
:::

---

## Справочник {#reference}

### `encryption` (основной конфиг) {#encryption-main-config}

| Поле | Переменная окружения | По умолчанию | Описание |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Путь к файлу ключей (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | Как часто опрашивается файл ключей. `"0"` отключает опрос. |

### Устаревшие одиночные ключи (основной конфиг) {#legacy-flat-keys-main-config}

| Поле | Переменная окружения | Описание |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Один ключ секретов, без ротации. Используется, если `keys_file` не задан. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Один ключ опций, без ротации. По умолчанию используется ключ секретов. |

### Файл ключей {#keys-file}

| Поле | Описание |
|-------|-------------|
| `keys` | Карта `метка → KeySource` (встроенный реестр). |
| `keys_folder` | Каталог с файлами ключей (один обычный файл на ключ, метка — имя файла). |
| `active.secret_key` | Метка (в `keys`) активного ключа секретов. |
| `active.option_key` | Метка активного ключа опций. |
| `active.secret_key_file` | Имя файла в `keys_folder` активного ключа секретов (относительное). |
| `active.option_key_file` | Имя файла в `keys_folder` активного ключа опций (относительное). |

### KeySource {#keysource}

| Поле | Описание |
|-------|-------------|
| `value` | Ключевой материал в base64 прямо в файле. |
| `file` | Путь к файлу, содержащему ключ в base64. |

`value` и `file` взаимоисключающие. Ключи должны быть base64-представлением **16, 24 или 32
байт** (AES‑128/192/256).

---

## Устранение неполадок {#troubleshooting}

| Симптом | Причина / решение |
|---------|-------------|
| Паника при запуске: `encryption_keys… not found` / `invalid` | Файл ключей или файл ключа, на который есть ссылка, отсутствует/повреждён, либо ключ не является корректным base64 от 16/24/32 байт. Исправьте файл; быстрый отказ при запуске сделан намеренно. |
| `vault check` показывает `MISSING KEY <id>` (код выхода 1) | Данные были зашифрованы ключом, которого больше нет в реестре. Верните этот ключ, прежде чем данные можно будет расшифровать. |
| `cannot decrypt access key, perhaps encryption key was changed` | Устаревшее значение (без префикса) не удаётся расшифровать ни одним из настроенных ключей. Убедитесь, что исходный ключ присутствует (в реестре или в `access_key_encryption`). |
| Ротация не применяется | Проверьте `keys_poll_interval` (не `"0"`) и что файл ключей действительно изменился; либо отправьте `SIGHUP`. |
| `active.secret_key: no key labelled "…"` | Активный указатель ссылается на метку/имя файла, которых нет в `keys`/`keys_folder`. |
