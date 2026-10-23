---
title: "Высокая доступность"
---

# Высокая доступность <Enterprise />

:::info
Высокая доступность доступна в редакции **Semaphore Enterprise**.
:::

Semaphore UI поддерживает развёртывание в режиме высокой доступности (HA) active-active, при котором несколько экземпляров работают одновременно за балансировщиком нагрузки. Каждый экземпляр полностью способен обрабатывать запросы UI, вызовы API, запланированные задания и выполнение задач. Если один экземпляр выходит из строя, остальные узлы продолжают работать без перерыва.

## Архитектура {#architecture}

Типичное развёртывание active-active состоит из следующих компонентов:

**Балансировщик нагрузки** — пользователи подключаются через балансировщик нагрузки (например, NGINX, HAProxy или облачный балансировщик). Балансировщик распределяет HTTP- и WebSocket-трафик между доступными узлами Semaphore.

**Узлы Semaphore** — на каждом узле работает идентичный экземпляр Semaphore UI. Любой узел может принимать запросы пользователей, запускать задания автоматизации, обрабатывать запланированные задачи и отправлять обновления в реальном времени. Все узлы равноправны — нет основного или резервного узла.

**Общая база данных** — все экземпляры подключаются к общей базе данных PostgreSQL или MySQL. База данных выступает единым источником истины для проектов, шаблонов, инвентарей, расписаний, истории задач, учётных записей пользователей и конфигурации RBAC.

:::warning
SQLite и BoltDB не поддерживаются для HA-развёртываний. Используйте PostgreSQL или MySQL.
:::

**Redis** — Redis обеспечивает слой координации, который позволяет нескольким узлам работать как единая система. Он выполняет три функции:

* **Распределённые блокировки** гарантируют, что конкретное задание в каждый момент времени выполняет только один экземпляр, предотвращая дублирование выполнения задач.
* **Общее состояние очереди задач** поддерживает очередь задач так, что каждое задание берёт ровно один worker. Все узлы видят одну и ту же очередь и координируют выполнение.
* **Обмен сообщениями Pub/Sub** позволяет узлам рассылать события, такие как обновления задач, уведомления кластера, инвалидация кэша и изменения состояния UI. Это поддерживает синхронизацию всех узлов в реальном времени.

## Предварительные требования {#prerequisites}

Перед настройкой HA вам понадобятся:

* Ключ подписки **Semaphore Enterprise**.
* Общая база данных **PostgreSQL** или **MySQL**, доступная со всех узлов.
* Сервер **Redis** или развёртывание **Redis Sentinel**, доступное со всех узлов. Redis Cluster не поддерживается.
* **Балансировщик нагрузки**, поддерживающий HTTP- и WebSocket-трафик.
* Два или более сервера для запуска экземпляров Semaphore.

Все узлы Semaphore должны использовать одну и ту же базу данных, один и тот же бэкенд Redis и одинаковую конфигурацию (за исключением `ha.node_id`, который должен быть уникальным для каждого узла).

## Конфигурация {#configuration}

Включите HA, добавив блок `ha` в `config.json` на каждом узле:

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

У каждого узла должен быть уникальный `ha.node_id`. Вся остальная конфигурация должна быть идентичной на всех узлах.

### Переменные окружения {#environment-variables}

Также HA можно настроить с помощью переменных окружения:

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Чтобы кластер переживал отказ самого сервера Redis, укажите вместо одного адреса развёртывание [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/). Задайте для `ha.engine` значение `redis_sentinel` и опишите настройки Sentinel в `ha.redis_sentinel`:

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

Каждый узел запрашивает у sentinel'ов текущий master и отслеживает failover без перезапуска: задача, выполнявшаяся в момент смены master'а, продолжает работу, а новые задачи, расписания и обновления в реальном времени продолжаются на повышенной реплике.

Та же настройка с помощью переменных окружения (список sentinel'ов — JSON-массив):

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Примечания:

* `ha.engine` определяет, какой блок считывается. `redis` (значение по умолчанию) считывает `ha.redis`; `redis_sentinel` считывает `ha.redis_sentinel`. Другой блок, если он присутствует, игнорируется, а при запуске в лог выводится предупреждение.
* При `redis_sentinel` обязательны `master_name` и хотя бы один адрес в `addrs`; без них узел откажется запускаться.
* `user` и `pass` используются для аутентификации на узлах данных Redis. Если сами sentinel'ы требуют аутентификации (`requirepass` в `sentinel.conf`), задайте также `sentinel_user` и `sentinel_pass`.
* `tls` и `tls_skip_verify` применяются как к подключениям к Sentinel, так и к подключениям к узлам данных Redis.

### Справочник по конфигурации {#configuration-reference}

| Опция файла конфигурации | Переменная окружения | Описание |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Включить режим высокой доступности. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Уникальный идентификатор этого узла. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Адрес сервера Redis (например, `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Номер базы данных Redis. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Пароль сервера Redis. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Имя пользователя сервера Redis. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Включить TLS для подключения к Redis. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Пропустить проверку TLS-сертификата для Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Бэкенд Redis: `redis` (один сервер, по умолчанию) или `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Имя отслеживаемого master'а, как он настроен в Sentinel. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Адреса sentinel'ов в формате `host:port`. В переменной окружения — JSON-массив. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Имя пользователя для самих узлов Sentinel. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Пароль для самих узлов Sentinel. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Номер базы данных Redis на узлах данных. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Имя пользователя для узлов данных Redis. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Пароль для узлов данных Redis. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Включить TLS для подключений к Sentinel и Redis. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Пропустить проверку TLS-сертификата для подключений к Sentinel и Redis. |

Полный список доступных опций см. в разделе [Конфигурация](/admin-guide/configuration).

## Балансировщик нагрузки {#load-balancer}

Разместите балансировщик нагрузки перед узлами Semaphore для распределения трафика. Балансировщик должен поддерживать **WebSocket-соединения** для обновления UI в реальном времени.

### Пример для NGINX {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

Подробнее о настройке NGINX см. в разделе [Обратный прокси](/admin-guide/reverse-proxy/nginx).

## Как происходит выполнение заданий {#how-job-execution-works}

В многоузловом развёртывании выполнение задач проходит по координированной схеме:

1. **Пользователь запускает задачу.** Пользователь запускает задание через UI или API. Запрос может попасть на любой узел Semaphore.
2. **Метаданные задачи сохраняются.** Принявший запрос узел записывает метаданные задачи в базу данных и сигнализирует о новой работе через Redis.
3. **Узел берёт задачу.** Один из доступных узлов получает задачу из Redis, захватывает распределённую блокировку и помечает задачу как выполняющуюся в базе данных.
4. **Задача выполняется.** Узел выполняет задачу локально или делегирует её [удалённому runner'у](/admin-guide/runners). Прогресс и логи записываются обратно в базу данных.
5. **Результаты рассылаются.** Обновления задачи распространяются через Redis Pub/Sub, поэтому все узлы и подключённые клиенты UI остаются синхронизированными.

## Масштабирование с помощью runner'ов {#scaling-with-runners}

HA также позволяет горизонтально масштабировать выполнение задач. Вместо запуска заданий только на самих узлах Semaphore выполнение можно делегировать нескольким [runner'ам](/admin-guide/runners). Это позволяет:

* Распределять нагрузку по вашей инфраструктуре.
* Масштабировать мощность автоматизации независимо от слоя web/API.
* Изолировать среды выполнения, чтобы ограничить масштаб последствий сбоев.
* Выполнять задачи параллельно на множестве узлов.

Инструкции по настройке см. в разделе [Runner'ы](/admin-guide/runners).

## Преимущества {#benefits}

* **Повышенная надёжность** — если один экземпляр выходит из строя, остальные продолжают обслуживать трафик и выполнять задания.
* **Обслуживание без простоя** — узлы можно обновлять или перезапускать по отдельности, не останавливая систему.
* **Горизонтальная масштабируемость** — добавляйте узлы Semaphore за балансировщиком нагрузки для увеличения мощности.
* **Отсутствие зависимости от основного узла** — все узлы равноправны, что избавляет от сложных механизмов failover.
* **Согласованное состояние кластера** — общая база данных и координация через Redis поддерживают синхронизацию всех экземпляров.

## FAQ {#faq}

### Что такое высокая доступность active-active? {#what-is-active-active-high-availability}

HA в режиме active-active означает, что несколько экземпляров приложения работают одновременно и все они обслуживают запросы. Основного узла нет — любой экземпляр может обрабатывать трафик и выполнять задания.

### Почему Semaphore использует Redis в режиме HA? {#why-does-semaphore-use-redis-in-ha-mode}

Redis выступает слоем координации между экземплярами. Он предоставляет распределённые блокировки, общее состояние очереди задач и обмен сообщениями Pub/Sub, чтобы узлы не выполняли одно и то же задание одновременно.

### Какую базу данных использовать для HA-развёртываний? {#what-database-should-i-use-for-ha-deployments}

Semaphore поддерживает PostgreSQL и MySQL в качестве общей базы данных. SQLite и BoltDB нельзя использовать в режиме HA, так как они не поддерживают одновременный доступ из нескольких процессов.

### Что произойдёт, если Redis выйдет из строя? {#what-happens-if-redis-fails}

При одном сервере Redis (`ha.engine: redis`) узлы не смогут координироваться, пока Redis не вернётся в работу. При использовании [Redis Sentinel](#redis-sentinel) sentinel'ы повышают реплику, и каждый узел Semaphore автоматически переключается на неё — обычно в течение нескольких секунд и без перезапуска.

### Что произойдёт, если один узел Semaphore выйдет из строя? {#what-happens-if-one-semaphore-node-fails}

Балансировщик нагрузки направит трафик на оставшиеся узлы. Выполняющиеся задания продолжат работу на других экземплярах, а новые задания будут подхвачены любым доступным узлом.

### Можно ли масштабироваться горизонтально? {#can-i-scale-horizontally}

Да. Вы можете добавлять узлы Semaphore за балансировщиком нагрузки для увеличения мощности web/API и добавлять [runner'ы](/admin-guide/runners) для увеличения мощности выполнения задач.
