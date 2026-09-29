---
title: Отправьте журнал аудита в SIEM
description: Настройте Semaphore Pro на отправку событий аудита в SIEM по Syslog с TLS и настройте приём в rsyslog или Vector.
---

# Отправьте журнал аудита в SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro отправляет каждое событие [журнала аудита](/admin-guide/audit-log) в SIEM как сообщение Syslog
по RFC 5424 поверх TLS.

## Перед началом {#before-you-begin}

- Лицензия Semaphore Pro.
- [Включённый журнал аудита](/admin-guide/audit-log#enable).
- Приёмник Syslog с поддержкой TLS, например rsyslog или Vector, см. [Примеры приёмников](#receivers).
- Сертификат CA, которым подписан сертификат приёмника, в формате PEM, если его нет в системном хранилище
  доверенных сертификатов.

## Шаги {#steps}

Чтобы отправлять журнал аудита в SIEM, выполните следующие шаги:

1. Добавьте раздел `audit.syslog` в `config.json`:

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
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
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` и `address` обязательны. `ca_file` добавляет CA к системному хранилищу доверенных сертификатов.
   `server_name` заменяет имя, проверяемое в сертификате приёмника. `timeout` ограничивает подключение и
   запись, по умолчанию 10 секунд.
2. Перезапустите Semaphore. Нечитаемый файл CA или отсутствие `id` или `address` останавливает запуск с
   ошибкой.
3. Войдите с неверным паролем. SIEM получит событие `auth.login` с исходом `failure`.

## Как доставляются события {#delivery}

- Semaphore хранит свою позицию в журнале под `id`. После перезапуска он продолжает с неё, а события,
  записанные, пока приёмник был недоступен, отправляются, когда он снова доступен. Новый `id` начинает с
  текущего события и не отправляет старые.
- Доставка без гарантий: событие, записанное в соединение, которое тихо оборвалось, может потеряться.
- Событие может прийти дважды, например после сетевой ошибки или переключения узла. Удаляйте дубликаты по
  `event_id` и упорядочивайте события по `seq`.
- При [высокой доступности](/admin-guide/ha) отправляет один узел. Когда он останавливается, отправку
  берёт на себя другой.

## Примеры приёмников {#receivers}

Semaphore отправляет сообщения RFC 5424 с кадрированием по счётчику октетов (RFC 5425). Тело сообщения —
это JSON события. `HOSTNAME` в Syslog — это ID узла или, без HA, ID установки, а `MSGID` — это `event_code`.

### rsyslog {#rsyslog}

Приём событий по TLS и запись по одному событию JSON на строку:

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

### Vector {#vector}

Приём событий по TLS и разбор JSON события:

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

## Что дальше {#whats-next}

- [Журнал аудита](/admin-guide/audit-log) — схема события и что записывается.
- [События аудита](/reference/audit-events) — все события с исходами, причинами и метаданными.
- [Конфигурация](/reference/configuration) — все параметры `audit.*`.
