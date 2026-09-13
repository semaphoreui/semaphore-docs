# Метрики

:::info
Эндпоинт метрик доступен начиная с **Semaphore версии 2.20**. Если у вас более старая версия, обновитесь, чтобы использовать эту возможность.
:::

Semaphore предоставляет эндпоинт `GET /api/metrics` в стандартном текстовом формате Prometheus, поэтому существующая связка Prometheus + Grafana может отслеживать сервер без каких-либо внешних инструментов опроса.

Предоставляются две категории метрик:

- **Метрики процесса:** статистика среды выполнения Go и процесса — количество горутин, память (heap/resident), процессорное время, паузы GC. Они предоставляются стандартными Go/process-коллекторами Prometheus.
- **Метрики задач**, специфичные для нагрузки самого Semaphore:
  - `semaphore_tasks_running` (gauge): количество задач, выполняющихся прямо сейчас.
  - `semaphore_tasks_total{status}` (counter): общее количество завершённых задач с разбивкой по результату: `success`, `error`, `stopped`.

Обе категории обновляются в реальном времени при изменении состояния задач — задержки опроса нет, поскольку счётчики обновляются непосредственно внутри исполнителя задач в момент фактического изменения статуса задачи.

## Включение метрик {#enabling-metrics}

Эндпоинт по умолчанию отключён и требует HTTP Basic Auth со статическими учётными данными уровня сервиса — не привязанными к какой-либо учётной записи пользователя, поскольку Prometheus не умеет выполнять интерактивный вход:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

Или с помощью переменных окружения:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Параметры метрик {#metrics-options}

| Параметр   | Переменные окружения           | Описание     |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Включить или выключить эндпоинт `/api/metrics`. По умолчанию отключён. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Имя пользователя Basic Auth, необходимое для сбора метрик с эндпоинта. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Пароль Basic Auth, необходимый для сбора метрик с эндпоинта (конфиденциальный). |

Если `enabled` остаётся `false` (значение по умолчанию) либо учётные данные отсутствуют или неверны, каждый запрос к `/api/metrics` возвращает `401 Unauthorized`.

## Сбор метрик с помощью Prometheus {#scraping-with-prometheus}

Настройте задание сбора (scrape job) с `basic_auth`, используя указанные выше учётные данные:

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## Просмотр метрик в Grafana {#viewing-metrics-in-grafana}

Представление **Explore** в Grafana позволяет выполнять любой PromQL-запрос к метрикам напрямую и видеть необработанные результаты без предварительного создания дашборда:

![Grafana Explore с собранными метриками Semaphore](/assets/semaphore-grafana-explore.png)

Затем на основе тех же метрик можно построить дашборд — в этом примере обе категории охвачены четырьмя панелями: выполняющиеся задачи, общее количество задач по результату, горутины и резидентная память процесса.

![Дашборд Grafana с панелями Semaphore](/assets/semaphore-grafana-dashboard.png)
