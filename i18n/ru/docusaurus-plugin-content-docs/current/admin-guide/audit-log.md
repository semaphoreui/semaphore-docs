---
title: Журнал аудита
description: Включите журнал аудита, чтобы видеть, кто что сделал в Semaphore, и отправляйте события аудита из Semaphore Pro в SIEM по Syslog или HEC.
---

# Журнал аудита

Журнал аудита хранит записи о важных действиях в Semaphore: кто вошёл в систему, кто изменил пользователя
или роль, кто создал API-токен. Каждое событие показывает, кто это сделал, когда, с какого адреса и
получилось ли. С его помощью можно выяснить, что произошло в вашей установке, или отправлять события в SIEM,
чтобы они хранились рядом с остальными журналами.

Журнал аудита есть во всех редакциях. Для отправки событий в SIEM нужен Semaphore Pro.

## Что записывается {#recorded-events}

Сейчас Semaphore записывает входы в систему, действия с учётными записями, проектами и задачами:

- входы, неудачные попытки входа, выходы и проверки второго фактора;
- отклонённые API-токены, запрещённые запросы и заблокированные межсайтовые запросы;
- изменения пользователей, паролей, двухфакторной аутентификации, внешних учётных записей и API-токенов;
- изменения участников проекта, ролей и прав на шаблоны;
- изменения проектов, инвентарей, репозиториев, шаблонов, расписаний, интеграций, конфигураций хостов,
  окружений, учётных данных и хранилищ секретов, а также экспорт и восстановление резервных копий проектов;
- изменения системных настроек и активацию лицензии Pro;
- запуски задач с их источником (API, расписание, интеграция, автозапуск, workflow), подтверждения, остановки,
  завершения и удалённую историю задач;
- изменения раннеров, регистрации (включая отклонённые токены регистрации), отмены регистрации и отчёты раннеров
  с недопустимым статусом;
- каждый запуск сервера.

Полный список — на странице
[События аудита](/reference/audit-events).

Пароли, токены, значения секретов и вывод задач никогда не попадают в события аудита. API-токены
показываются отпечатком, а не значением. При неудачном входе сохраняется введённое имя для входа, поэтому
там может оказаться адрес электронной почты.

В событии завершения задачи `metadata.result` показывает
статус, который Semaphore присвоил задаче, а `metadata.end_reason` говорит, почему Semaphore её завершил: `timeout`, если она работала
слишком долго, `runner_lost`, если её раннер перестал отвечать. Аргументы задачи, переменные, теги раннеров и токены
не записываются.

Во время плавающего обновления HA-кластера у задачи, запущенной на обновлённом узле и завершённой на ещё не
обновлённом, нет события завершения.

URL репозиториев, URL конфигураций хостов и псевдонимы интеграций тоже не записываются.

Бывает, что Semaphore сохраняет или удаляет объект, но следующая часть того же запроса завершается ошибкой.
Интерфейс или API тогда показывает ошибку, хотя объект уже создан или удалён. Такое событие записывается как
успешное с `metadata.partial=true`, а `reason` говорит, что не было выполнено:

- `secret_failed`: окружение сохранено или удалено, но часть его секретов не сохранена или не удалена;
- `inventory_failed`: шаблон создан, но инвентарь для его рабочей области Terraform — нет;
- `restore_failed`: проект восстановлен из резервной копии, но не все его объекты;
- `setup_failed`: проект создан, но настроен не до конца, например его создатель не добавлен как владелец.

## Включение журнала аудита {#enable}

По умолчанию журнал аудита выключен. Чтобы включить его, задайте `audit.enabled` и дайте установке имя в
`audit.instance_id`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Или через переменные окружения:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

ID установки — от 1 до 255 символов без пробелов. Он добавляется в каждое событие, поэтому установки можно
различить, даже если они отправляют события в одно место.

Перезапустите Semaphore. Запись начинается после перезапуска, более ранние действия не добавляются. Все
параметры описаны на странице [Параметры конфигурации](/reference/configuration#audit-log).

## Запись адреса клиента за прокси-сервером {#trusted-proxies}

Если Semaphore работает за обратным прокси, в событиях будет адрес прокси, а не пользователя. Чтобы
записывать настоящий адрес клиента, перечислите сети ваших прокси в `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Или через переменные окружения:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Тогда Semaphore берёт адрес клиента из `X-Forwarded-For` или `X-Real-IP`, но только для запросов из этих
сетей. Если запросы проходят через несколько прокси, перечислите их все. Не добавляйте сети, из которых
подключаются пользователи: любой в такой сети сможет подставить в эти заголовки произвольный адрес.

## Хранение {#storage}

События хранятся в базе данных Semaphore, поэтому обычные резервные копии базы их включают. Semaphore не
показывает события аудита в интерфейсе и не удаляет старые события, так что следите за размером базы.

Журнал аудита не мешает работе пользователей. Если событие не удалось сохранить, Semaphore пишет ошибку в
серверный журнал, а действие выполняется как обычно.

## Экспорт в SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro может отправлять события аудита в приёмник Syslog по TLS, например rsyslog или Vector, и в
любой приёмник протокола Splunk HTTP Event Collector (HEC), например Splunk, Vector, Fluent Bit,
OpenTelemetry Collector или Cribl. Можно настроить одно назначение Syslog и одно HEC или оба сразу.

Вам понадобятся:

- имя хоста и порт приёмника;
- имя для этого назначения, например `security-syslog`;
- сертификат CA приёмника, если хост Semaphore ему ещё не доверяет.

Добавьте `audit.syslog` в `config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

Или через переменные окружения:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` и `address` обязательны. Semaphore помнит, какие события уже отправил в каждое назначение, поэтому
сохраняйте тот же `id`, когда меняете адрес или сертификат. С новым `id` отправка начнётся с новых событий.

Semaphore всегда проверяет сертификат приёмника и использует TLS 1.2 или новее. `ca_file` добавляет ваш CA
к доверенным сертификатам, а `server_name` задаёт имя для проверки в сертификате, если оно отличается от
адреса.

Перезапустите Semaphore. Если настройки неверны или файл CA не читается, Semaphore не запустится.

### Проверка доставки {#verify-siem-delivery}

Semaphore записывает событие при каждом запуске. После перезапуска найдите его в приёмнике: `event_code`
равен `audit.lifecycle`, `action` — `start`, а `metadata.destinations` содержит ID вашего назначения.

### Отправка событий по HEC {#hec}

Понадобятся URL конечной точки HEC, токен HEC, имя для этого назначения, например `security-hec`, и
CA-сертификат приёмника, если хост Semaphore ещё не доверяет ему.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

Или с помощью переменных окружения:

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN=<HEC token>
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`, `url` и `token` обязательны, а URL должен начинаться с `https://`. Используйте `id`, отличный от
`id` для Syslog. По умолчанию `source` равен `semaphore`, а `sourcetype` — `semaphore:audit`. Сертификаты
проверяются так же, как для Syslog, и действуют стандартные переменные `HTTPS_PROXY` и `NO_PROXY`.

Semaphore отправляет до 100 событий в одном запросе. Поле `event` каждого события HEC содержит JSON события
аудита, `time` — время события, а `host` — ID узла HA или ID установки на одном узле.

Перезапустите Semaphore и проверьте, что события приходят, как описано [выше](#verify-siem-delivery).

### Как доставляются события {#delivery}

- Если приёмник недоступен, события ждут в базе данных и отправляются, когда он вернётся. Пользователи
  ничего не заметят.
- После сетевых ошибок, перезапусков или переключения узлов HA некоторые события могут прийти дважды.
  Используйте `event_id`, чтобы отбросить дубликаты, и `seq`, чтобы восстановить порядок.
- При отправке по Syslog, если соединение оборвётся без ошибки, событие, отправленное в этот момент, может потеряться.
- В [установке HA](/admin-guide/ha) в каждое назначение события отправляет один узел за раз. Если Redis недоступен, отправка
  приостанавливается, а события продолжают записываться.
- По HEC событие считается отправленным, только когда приёмник ответил статусом 2xx. Любой другой ответ, в том
  числе 4xx, приводит к повторной попытке. Если приёмник аварийно завершится после ответа, события, которые он
  ещё не сохранил, могут потеряться.

По Syslog каждое событие отправляется как сообщение Syslog RFC 5424, телом которого служит JSON события. `HOSTNAME` —
ID узла HA или ID установки на одном узле, а `MSGID` — код события.

Примеры ниже минимальны и показывают только, как принимать события. Они принимают подключение от любого
клиента, которому доступен порт. В продакшене защитите приёмник так, чтобы события могли отправлять только ваши
серверы Semaphore.

### Пример rsyslog {#rsyslog}

Эта конфигурация rsyslog принимает TLS-соединение и записывает по одному событию в строку:

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Пример Vector {#vector}

Эта конфигурация Vector принимает TLS-соединение, читает JSON события и записывает его в файл:

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Пример Vector с HEC {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Пример Splunk {#splunk}

Создайте в Splunk токен HEC (**Settings → Data inputs → HTTP Event Collector**), разрешите ему индекс
`security` и задайте `url` равным `https://<splunk>:8088/services/collector/event`. Чтобы найти события,
выполните поиск `index=security sourcetype="semaphore:audit"`.

Оставьте для этого токена выключенной опцию **Enable indexer acknowledgement**: Semaphore её не использует.

### Устранение неполадок экспорта {#troubleshoot-export}

- **Semaphore не запускается.** Проверьте, что заданы и `audit.syslog.id`, и `audit.syslog.address` (для HEC —
  `audit.splunk_hec.id`, `url` и `token`), а файл CA содержит сертификаты PEM.
- **TLS-соединение не устанавливается.** Проверьте, что сертификат приёмника соответствует `server_name` и
  подписан CA, которому доверяет Semaphore.
- **События не приходят.** Проверьте серверный журнал Semaphore и журнал приёмника. После сбоя Semaphore
  немного ждёт перед следующей попыткой.
- **Некоторые события приходят дважды.** Так бывает после повторных попыток и переключений узлов.
  Отбрасывайте дубликаты по `event_id`.
- **HEC отвечает 400, 401 или 403.** Проверьте токен, индексы, в которые ему разрешена запись, и что подтверждение индексатора для него выключено. Токен никогда не попадает в журнал Semaphore.

## Что не записывается {#not-recorded}

Утилита командной строки `semaphore` работает с базой данных напрямую, поэтому команды вроде `user add` и
`user token` не записываются.

Некоторые действия в интерфейсе не записываются: удаление лицензии, настройки приложений, очистка
состояния задач HA, псевдонимы инвентарей Terraform, удаление состояния Terraform, запуски workflow и приглашения
в проект. Описания шаблонов, представления, очистка кэша проекта и плановые синхронизации хранилищ секретов тоже
не записываются.

## Что дальше {#whats-next}

- [События аудита](/reference/audit-events) — формат событий и все записываемые события.
- [Параметры конфигурации](/reference/configuration#audit-log) — все параметры `audit.*` и переменные окружения.
- [Журналы](/admin-guide/logs) — серверный журнал, журнал активности и журналы задач.
