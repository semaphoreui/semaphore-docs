# Интеграция с CI/CD

Semaphore может быть шагом во внешнем конвейере, а также может запускать собственные простые конвейеры сборки и развёртывания.

## Конвейеры сборки и развёртывания внутри Semaphore {#build-and-deploy-pipelines-inside-semaphore}

Типы шаблонов **Build** и **Deploy**, версионирование артефактов и переменная `semaphore_vars` описаны в руководстве пользователя: [Шаблоны сборки и развёртывания](/user-guide/task-templates/build-deploy). Многошаговые конвейеры с согласованиями строятся с помощью [Workflows](/user-guide/workflows).

## Запуск задач Semaphore из внешней CI-системы {#starting-semaphore-tasks-from-an-external-ci-system}

Есть два способа запустить задачу из GitHub Actions, GitLab CI, Jenkins или любой другой системы:

- **Интеграции**: URL вебхука для каждого проекта, который запускает шаблон при совпадении запроса с условиями. Поддерживает подписи GitHub, токены и HMAC и может передавать поля запроса в задачу как переменные. См. [Интеграции](/user-guide/integrations).
- **REST API**: создайте задачу с помощью API-токена:

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

Ответ содержит ID задачи. Опрашивайте `GET /api/project/1/tasks/{task_id}`, пока `status` не станет `success`, `error` или `stopped`. Информацию о токенах и встроенном справочнике Swagger см. в разделе [API](/reference/api).
