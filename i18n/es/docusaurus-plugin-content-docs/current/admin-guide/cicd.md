# Integración con CI/CD

Semaphore puede ser un paso dentro de una canalización externa y también puede ejecutar sus propias canalizaciones sencillas de compilación y despliegue.

## Canalizaciones de compilación y despliegue dentro de Semaphore {#build-and-deploy-pipelines-inside-semaphore}

Los tipos de plantilla **Build** y **Deploy**, el versionado de artefactos y la variable `semaphore_vars` se describen en la guía del usuario: [Plantillas de compilación y despliegue](/user-guide/task-templates/build-deploy). Las canalizaciones de varios pasos con aprobaciones se construyen con [Workflows](/user-guide/workflows).

## Iniciar tareas de Semaphore desde un sistema de CI externo {#starting-semaphore-tasks-from-an-external-ci-system}

Hay dos formas de disparar una tarea desde GitHub Actions, GitLab CI, Jenkins o cualquier otro sistema:

- **Integraciones**: una URL de webhook por proyecto que inicia una plantilla cuando la petición coincide. Admite firmas de GitHub, tokens y HMAC, y puede pasar campos de la petición a la tarea como variables. Consulte [Integraciones](/user-guide/integrations).
- **API REST**: cree una tarea con un token de API:

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

La respuesta contiene el identificador de la tarea. Consulte `GET /api/project/1/tasks/{task_id}` de forma periódica hasta que el `status` sea `success`, `error` o `stopped`. Consulte [API](/reference/api) para obtener información sobre los tokens y la referencia de Swagger integrada.
