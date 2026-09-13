# CI/CD 連携

Semaphore は外部パイプラインの 1 つのステップとして利用できるほか、簡単なビルドおよびデプロイのパイプラインを自身で実行することもできます。

## Semaphore 内でのビルド・デプロイパイプライン {#build-and-deploy-pipelines-inside-semaphore}

テンプレートタイプの **ビルド** と **デプロイ**、アーティファクトのバージョニング、および `semaphore_vars` 変数については、ユーザーガイドの[ビルド・デプロイテンプレート](/user-guide/task-templates/build-deploy)で説明しています。承認を含む複数ステップのパイプラインは[ワークフロー](/user-guide/workflows)で構築します。

## 外部 CI システムから Semaphore のタスクを開始する {#starting-semaphore-tasks-from-an-external-ci-system}

GitHub Actions、GitLab CI、Jenkins、その他のシステムからタスクをトリガーする方法は 2 つあります。

- **インテグレーション**: プロジェクトごとの Webhook URL で、リクエストが条件に一致したときにテンプレートを開始します。GitHub の署名、トークン、HMAC に対応しており、リクエストのフィールドを変数としてタスクに渡せます。[インテグレーション](/user-guide/integrations)を参照してください。
- **REST API**: API トークンを使用してタスクを作成します。

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

レスポンスにはタスク ID が含まれます。`status` が `success`、`error`、`stopped` のいずれかになるまで `GET /api/project/1/tasks/{task_id}` をポーリングしてください。トークンと組み込みの Swagger リファレンスについては [API](/reference/api) を参照してください。
