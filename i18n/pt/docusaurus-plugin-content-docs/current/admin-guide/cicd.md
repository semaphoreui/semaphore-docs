# Integração com CI/CD

O Semaphore pode ser uma etapa de um pipeline externo e também pode executar os seus próprios pipelines simples de build e deploy.

## Pipelines de build e deploy dentro do Semaphore {#build-and-deploy-pipelines-inside-semaphore}

Os tipos de template **Build** e **Deploy**, o versionamento de artefatos e a variável `semaphore_vars` estão descritos no guia do usuário: [Templates de build e deploy](/user-guide/task-templates/build-deploy). Pipelines com várias etapas e aprovações são construídos com [Workflows](/user-guide/workflows).

## Iniciando tarefas do Semaphore a partir de um sistema de CI externo {#starting-semaphore-tasks-from-an-external-ci-system}

Há duas maneiras de disparar uma tarefa a partir do GitHub Actions, GitLab CI, Jenkins ou qualquer outro sistema:

- **Integrações**: uma URL de webhook por projeto que inicia um template quando a requisição corresponde. Oferece suporte a assinaturas do GitHub, tokens e HMAC, e pode passar campos da requisição para a tarefa como variáveis. Consulte [Integrações](/user-guide/integrations).
- **API REST**: crie uma tarefa com um token de API:

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

A resposta contém o ID da tarefa. Consulte `GET /api/project/1/tasks/{task_id}` periodicamente até que o `status` seja `success`, `error` ou `stopped`. Consulte [API](/reference/api) para saber mais sobre tokens e a referência Swagger integrada.
