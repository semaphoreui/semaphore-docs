# 메트릭

:::info
메트릭 엔드포인트는 **Semaphore 버전 2.20**부터 사용할 수 있습니다. 이전 버전을 실행 중이라면 이 기능을 사용하기 위해 업그레이드하십시오.
:::

Semaphore는 표준 Prometheus 텍스트 노출 형식의 `GET /api/metrics` 엔드포인트를 제공하므로, 기존 Prometheus + Grafana 환경에서 별도의 외부 폴링 도구 없이 서버를 모니터링할 수 있습니다.

두 가지 범주의 메트릭이 노출됩니다:

- **프로세스 메트릭:** Go 런타임 및 프로세스 통계 — goroutine 수, 메모리(heap/resident), CPU 시간, GC 일시 정지. 이 메트릭은 Prometheus의 표준 Go/프로세스 수집기에서 별도 설정 없이 제공됩니다.
- **작업 메트릭**, Semaphore 고유의 워크로드에 대한 메트릭:
  - `semaphore_tasks_running` (gauge): 현재 실행 중인 작업의 수.
  - `semaphore_tasks_total{status}` (counter): 완료된 작업의 총 수를 결과별로 구분한 값: `success`, `error`, `stopped`.

두 메트릭 모두 작업 상태가 바뀔 때 실시간으로 갱신됩니다. 작업 상태가 실제로 변경되는 시점에 작업 runner 내부에서 카운터가 직접 갱신되므로 폴링 지연이 없습니다.

## 메트릭 활성화 {#enabling-metrics}

이 엔드포인트는 기본적으로 비활성화되어 있으며, 정적인 서비스 수준 자격 증명을 사용하는 HTTP Basic Auth가 필요합니다. Prometheus는 대화형 로그인을 할 수 없으므로 이 자격 증명은 어떤 사용자 계정에도 연결되지 않습니다:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

또는 환경 변수를 사용합니다:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### 메트릭 옵션 {#metrics-options}

| 매개변수  | 환경 변수         | 설명 |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | `/api/metrics` 엔드포인트를 켜거나 끕니다. 기본적으로 비활성화되어 있습니다. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | 엔드포인트를 스크랩하는 데 필요한 Basic Auth 사용자 이름. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | 엔드포인트를 스크랩하는 데 필요한 Basic Auth 비밀번호(민감 정보). |

`enabled`가 `false`(기본값)로 남아 있거나 자격 증명이 없거나 잘못된 경우, `/api/metrics`에 대한 모든 요청은 `401 Unauthorized`를 반환합니다.

## Prometheus로 스크랩하기 {#scraping-with-prometheus}

위의 자격 증명으로 `basic_auth`를 사용하는 스크랩 job을 구성합니다:

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

## Grafana에서 메트릭 보기 {#viewing-metrics-in-grafana}

Grafana의 **Explore** 뷰를 사용하면 대시보드를 먼저 만들지 않고도 메트릭에 대해 임의의 PromQL 쿼리를 직접 실행하고 원시 결과를 확인할 수 있습니다:

![스크랩된 Semaphore 메트릭을 보여 주는 Grafana Explore](/assets/semaphore-grafana-explore.png)

이후 같은 메트릭을 기반으로 대시보드를 구성할 수 있습니다. 이 예시는 실행 중인 작업, 결과별 작업 총계, goroutine, 프로세스 상주 메모리의 네 가지 패널로 두 범주를 모두 다룹니다.

![Semaphore 패널이 있는 Grafana 대시보드](/assets/semaphore-grafana-dashboard.png)
