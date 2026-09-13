# Integrazione CI/CD

Semaphore può essere uno step di una pipeline esterna e può eseguire le proprie semplici pipeline di build e deploy.

## Pipeline di build e deploy all'interno di Semaphore {#build-and-deploy-pipelines-inside-semaphore}

I tipi di Task Template **Build** e **Deploy**, il versionamento degli artefatti e la variabile `semaphore_vars` sono descritti nella guida per utenti: [Task Template di build e deploy](/user-guide/task-templates/build-deploy). Le pipeline multi-step con approvazioni si realizzano con i [Workflow](/user-guide/workflows).

## Avvio di Task di Semaphore da un sistema CI esterno {#starting-semaphore-tasks-from-an-external-ci-system}

Esistono due modi per avviare un Task da GitHub Actions, GitLab CI, Jenkins o qualsiasi altro sistema:

- **Integration**: un URL webhook per ogni Project che avvia un Task Template quando la richiesta corrisponde. Supporta firme GitHub, token e HMAC e può passare i campi della richiesta al Task come variabili. Vedere [Integration](/user-guide/integrations).
- **API REST**: creare un Task con un token API:

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

La risposta contiene l'ID del Task. Interrogare `GET /api/project/1/tasks/{task_id}` fino a quando lo `status` non è `success`, `error` oppure `stopped`. Vedere [API](/reference/api) per i token e il riferimento Swagger integrato.
