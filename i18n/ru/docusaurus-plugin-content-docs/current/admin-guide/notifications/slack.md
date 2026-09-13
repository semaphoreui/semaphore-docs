# Slack

Уведомления в Slack позволяют получать обновления о ваших рабочих процессах Semaphore в реальном времени прямо в каналах Slack. Эта интеграция помогает командам быть в курсе статусов сборок, результатов развёртываний и других важных событий без необходимости постоянно проверять панель Semaphore.

Чтобы настроить уведомления в Slack, нужно создать URL webhook, который свяжет Semaphore с нужным каналом Slack. Этот webhook служит безопасным мостом для обмена данными между двумя платформами.

## Создание webhook в Slack {#creating-slack-webhook}

### Шаг 1. Откройте настройки Slack API {#step-1-open-slack-api-settings}

1. Перейдите на [https://api.slack.com/apps](https://api.slack.com/apps).
2. Нажмите **Create New App** → выберите **From Scratch**.
3. Задайте имя приложения (например, `Semaphore Bot`) и выберите ваше **рабочее пространство Slack**.

---

### Шаг 2. Включите входящие webhook {#step-2-enable-incoming-webhooks}

1. В настройках приложения перейдите в **Features → Incoming Webhooks**.
2. Переключите **Activate Incoming Webhooks** → **On**.

---

### Шаг 3. Создайте URL webhook {#step-3-create-a-webhook-url}

1. Нажмите **Add New Webhook to Workspace**.
2. Выберите канал, в который должны отправляться сообщения.
3. Нажмите **Allow**.
4. Вы увидите **Webhook URL** вида:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Шаг 4. Проверьте webhook {#step-4-test-your-webhook}

Для проверки используйте `curl`:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

Если всё настроено верно, вы увидите сообщение в выбранном канале Slack.


## Настройка Semaphore {#semaphore-configuration}

Получив URL webhook Slack, вы можете настроить отправку уведомлений в Semaphore несколькими способами:

Включить уведомления в Slack можно либо через файлы конфигурации, либо через переменные окружения.

### Способ 1: файл конфигурации {#method-1-configuration-file}

Добавьте следующие настройки в файл конфигурации Semaphore:

- `slack_alert`: установите `true`, чтобы включить уведомления в Slack
- `slack_url`: ваш URL webhook из предыдущего шага

Пример `config.json`:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### Способ 2: переменные окружения {#method-2-environment-variables}

Также для настройки уведомлений в Slack можно использовать переменные окружения. Этот способ особенно удобен для контейнерных развёртываний или когда вы хотите хранить конфиденциальную информацию отдельно от файлов конфигурации.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
