# CI/CD 통합

Semaphore는 외부 파이프라인의 한 단계가 될 수 있으며, 자체적으로 간단한 빌드 및 배포 파이프라인을 실행할 수도 있습니다.

## Semaphore 내부의 빌드 및 배포 파이프라인 {#build-and-deploy-pipelines-inside-semaphore}

템플릿 유형 **빌드** 및 **배포**, 아티팩트 버전 관리, `semaphore_vars` 변수는 사용자 가이드의 [빌드 및 배포 템플릿](/user-guide/task-templates/build-deploy)에서 설명합니다. 승인 단계가 있는 다단계 파이프라인은 [워크플로](/user-guide/workflows)로 구성합니다.

## 외부 CI 시스템에서 Semaphore 작업 시작하기 {#starting-semaphore-tasks-from-an-external-ci-system}

GitHub Actions, GitLab CI, Jenkins 또는 기타 시스템에서 작업을 트리거하는 방법은 두 가지가 있습니다.

- **통합**: 요청이 조건과 일치할 때 템플릿을 시작하는 프로젝트별 웹훅 URL입니다. GitHub 서명, 토큰, HMAC를 지원하며 요청 필드를 변수로 작업에 전달할 수 있습니다. [통합](/user-guide/integrations)을 참조하십시오.
- **REST API**: API 토큰으로 작업을 생성합니다.

```bash
curl -X POST https://semaphore.example.com/api/project/1/tasks \
  -H 'Authorization: Bearer YOUR_API_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"template_id": 5, "message": "Triggered by CI"}'
```

응답에는 작업 ID가 포함됩니다. `status`가 `success`, `error` 또는 `stopped`가 될 때까지 `GET /api/project/1/tasks/{task_id}`를 폴링합니다. 토큰과 내장 Swagger 참조에 대해서는 [API](/reference/api)를 참조하십시오.
