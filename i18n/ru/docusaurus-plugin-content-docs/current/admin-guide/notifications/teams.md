# Microsoft Teams

Уведомления в Microsoft Teams доставляют результаты задач Semaphore прямо в канал Teams. Каждое сообщение — это карточка с названием шаблона, статусом задачи, именем пользователя, который её запустил, и кнопкой, открывающей задачу в Semaphore.

Чтобы настроить уведомления в Teams, нужен URL вебхука, который свяжет Semaphore с каналом. В Teams такой URL создаётся в приложении **Workflows**. Оно работает на базе Microsoft Power Automate и не связано с Workflows в Semaphore.

:::warning
В мае 2026 года Microsoft отключила коннекторы Office 365 в Teams, включая старый коннектор **Incoming Webhook**. URL вебхука на `webhook.office.com` больше не доставляет сообщения. Создайте новый URL в приложении Workflows, как описано ниже.
:::

## Создание вебхука в Teams {#creating-teams-webhook}

### Шаг 1. Откройте Workflows для канала {#step-1-open-workflows-for-the-channel}

1. В Microsoft Teams перейдите в команду и канал, который должен получать уведомления.
2. Нажмите **More options (…)** рядом с названием канала.
3. Выберите **Workflows**.

---

### Шаг 2. Создайте поток из шаблона {#step-2-create-a-workflow-from-the-template}

1. Найдите шаблон **Send webhook alerts to a channel** и выберите его.
2. Проверьте параметры потока: **Team** и **Channel**, куда будут публиковаться сообщения.
3. Нажмите **Save**.

Semaphore отправляет запрос без заголовков аутентификации, поэтому используйте именно этот шаблон, а не его варианты *from specific people* и *from people in an org*.

---

### Шаг 3. Скопируйте URL вебхука {#step-3-copy-the-webhook-url}

1. После создания потока Teams покажет ссылку на его вебхук. Скопируйте её.
2. URL длинный и выглядит примерно так:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

Параметр `sig` — единственная защита вебхука: любой, у кого есть URL, может писать в канал. Обращайтесь со всем URL как с секретом.

---

### Шаг 4. Проверьте вебхук {#step-4-test-your-webhook}

Для проверки используйте `curl`:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

Тело запроса устроено так же, как сообщения, которые отправляет Semaphore: сообщение с одним вложением Adaptive Card. Если всё настроено верно, в ответ придёт `202 Accepted`, а карточка появится в выбранном канале Teams через несколько секунд.


## Настройка Semaphore {#semaphore-configuration}

Получив URL вебхука Teams, включите уведомления в Teams через файл конфигурации или через переменные окружения. Чтобы изменение вступило в силу, перезапустите Semaphore.

### Способ 1: файл конфигурации {#method-1-configuration-file}

Добавьте следующие настройки в файл конфигурации Semaphore:

- `microsoft_teams_alert`: установите `true`, чтобы включить уведомления в Teams
- `microsoft_teams_url`: ваш URL вебхука из предыдущего шага

Пример `config.json`:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Способ 2: переменные окружения {#method-2-environment-variables}

Также можно использовать переменные окружения. Этот способ особенно удобен для контейнерных развёртываний или когда вы не хотите хранить URL вебхука в файле конфигурации.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
URL содержит символы `&` и `%`. Задавая переменную в командной оболочке, заключите его в одинарные кавычки. В юните systemd поместите его в `EnvironmentFile`, а не в строку `Environment=`, где с `%` начинается спецификатор.
:::

## Включение уведомлений для проекта {#enabling-notifications-for-a-project}

Настройки выше включают канал для всего сервера, и все сообщения приходят в один канал, которому принадлежит вебхук. Проект получает их, только если использует серверные каналы, а шаблон задачи может подавлять сообщения об успехе или ошибке. См. [Как работает доставка](/admin-guide/notifications#how-delivery-works) — там же описано, как отправить тестовое сообщение, не запуская задачу.

Уведомление в Teams отправляется, когда задача завершилась успешно, завершилась с ошибкой или ожидает подтверждения.

Чтобы отправлять уведомления одного проекта в другой канал Teams, создайте [оповещение проекта](/user-guide/alerts#project-alerts) типа Microsoft Teams со своим URL вебхука.

## Содержимое сообщения {#message-content}

| Элемент карточки | Значение |
|---|---|
| Заголовок | `Ansible Task Template Execution by:` и имя пользователя, запустившего задачу, или `—`, если задачу запустил не пользователь. |
| **Task** | Название шаблона задачи. |
| **Status** | Статус задачи со значком, например `✅ SUCCESS`, `❌ ERROR` или `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Номер задачи. |
| Кнопка **Task URL** | Открывает задачу в Semaphore. Ссылка строится из `web_host`, поэтому укажите в этом параметре адрес, по которому пользователи открывают Semaphore. |

## Устранение неполадок {#troubleshooting}

Запрос отправляет сервер Semaphore, а не раннер, и результат записывается в журнал задачи. Semaphore отправляет каждое сообщение один раз и не повторяет попытку.

| Журнал задачи | Что проверить |
|---|---|
| Нет строк о Microsoft Teams | Отправка не выполнялась. Проверьте, что `microsoft_teams_alert` равен `true`, проект использует серверные каналы, а шаблон не подавляет уведомление. |
| `Can't send microsoft teams alert! Error: …` | Сервер не смог подключиться к хосту вебхука. Разрешите исходящий HTTPS с сервера к хосту из URL. За прокси задайте `HTTPS_PROXY` для сервера Semaphore, см. [Работа за корпоративным прокси](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | Вебхук отклонил запрос. Проверьте, что URL скопирован полностью, включая параметр `sig`, а поток включён и не удалён. Microsoft ограничивает вебхук четырьмя запросами в секунду. |
| `Sent successfully microsoft teams alert`, но карточки в канале нет | Поток принял запрос, но затем завершился с ошибкой. Откройте поток в приложении **Workflows** и посмотрите историю его запусков. Поток принадлежит пользователю, который его создал, и перестаёт работать, когда этот пользователь покидает организацию или теряет доступ к каналу, поэтому добавьте потоку совладельцев. |
