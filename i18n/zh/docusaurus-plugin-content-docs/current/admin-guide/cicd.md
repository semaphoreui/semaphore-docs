# CI/CD 集成

Semaphore 既可以作为外部流水线中的一个步骤，也可以运行自己的简单构建与部署流水线。

## Semaphore 内部的构建与部署流水线 {#build-and-deploy-pipelines-inside-semaphore}

模板类型 **构建（Build）** 和 **部署（Deploy）**、制品版本管理以及 `semaphore_vars` 变量在用户指南中有详细说明：[构建与部署模板](/user-guide/task-templates/build-deploy)。带审批的多步骤流水线则通过[工作流（Workflow）](/user-guide/workflows)构建。

## 从外部 CI 系统启动 Semaphore 任务 {#starting-semaphore-tasks-from-an-external-ci-system}

从 GitHub Actions、GitLab CI、Jenkins 或任何其他系统触发任务有两种方式：

- **集成（Integration）**：每个项目一个 webhook URL，当请求匹配时启动某个模板。它支持 GitHub 签名、令牌和 HMAC，并可将请求字段作为变量传递给任务。参见[集成](/user-guide/integrations)。
- **REST API**：使用 API 令牌创建任务：

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

响应中包含任务 ID。轮询 `GET /api/project/1/tasks/{task_id}`，直到 `status` 变为 `success`、`error` 或 `stopped`。有关令牌和内置 Swagger 参考，请参阅 [API](/reference/api)。
