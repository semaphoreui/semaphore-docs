---
title: "고가용성"
---

# 고가용성 <Enterprise />

:::info
고가용성은 **Semaphore Enterprise** 에디션에서 사용할 수 있습니다.
:::

Semaphore UI는 로드 밸런서 뒤에서 여러 인스턴스가 동시에 실행되는 액티브-액티브 고가용성(HA) 배포를 지원합니다. 모든 인스턴스는 UI 요청, API 호출, 예약 작업, 태스크 실행을 완전하게 처리할 수 있습니다. 한 인스턴스에 장애가 발생해도 나머지 노드가 중단 없이 계속 동작합니다.

## 아키텍처 {#architecture}

일반적인 액티브-액티브 배포는 다음 구성 요소로 이루어집니다.

**로드 밸런서** — 사용자는 로드 밸런서(예: NGINX, HAProxy 또는 클라우드 로드 밸런서)를 통해 접속합니다. 로드 밸런서는 HTTP 및 WebSocket 트래픽을 사용 가능한 Semaphore 노드에 분산합니다.

**Semaphore 노드** — 각 노드는 동일한 Semaphore UI 인스턴스를 실행합니다. 어떤 노드든 사용자 요청을 받고, 자동화 작업을 시작하고, 예약된 태스크를 처리하고, 실시간 업데이트를 전송할 수 있습니다. 모든 노드는 동등하며, 주 노드나 대기 노드가 따로 없습니다.

**공유 데이터베이스** — 모든 인스턴스는 공유 PostgreSQL 또는 MySQL 데이터베이스에 연결됩니다. 데이터베이스는 프로젝트, 템플릿, 인벤토리, 스케줄, 태스크 이력, 사용자 계정, RBAC 구성의 단일 진실 공급원(single source of truth) 역할을 합니다.

:::warning
SQLite와 BoltDB는 HA 배포에서 지원되지 않습니다. PostgreSQL 또는 MySQL을 사용하십시오.
:::

**Redis** — Redis는 여러 노드가 하나의 시스템처럼 동작하도록 하는 조정 계층을 제공합니다. 다음 세 가지 기능을 담당합니다.

* **분산 잠금**은 특정 작업을 한 번에 하나의 인스턴스만 실행하도록 보장하여 태스크가 중복 실행되는 것을 방지합니다.
* **공유 태스크 큐 상태**는 작업이 정확히 하나의 워커에 의해 처리되도록 태스크 큐를 유지합니다. 모든 노드는 동일한 큐를 보고 실행을 조정합니다.
* **Pub/Sub 메시징**은 태스크 업데이트, 클러스터 알림, 캐시 무효화, UI 상태 변경 등의 이벤트를 노드가 브로드캐스트할 수 있게 합니다. 이를 통해 모든 노드가 실시간으로 동기화됩니다.

## 사전 요구 사항 {#prerequisites}

HA를 설정하기 전에 다음이 필요합니다.

* **Semaphore Enterprise** 구독 키.
* 모든 노드에서 접근 가능한 공유 **PostgreSQL** 또는 **MySQL** 데이터베이스.
* 모든 노드에서 접근 가능한 **Redis** 서버 또는 **Redis Sentinel** 배포. Redis Cluster는 지원되지 않습니다.
* HTTP 및 WebSocket 트래픽을 지원하는 **로드 밸런서**.
* Semaphore 인스턴스를 실행할 두 대 이상의 서버.

모든 Semaphore 노드는 동일한 데이터베이스, Redis 백엔드, 구성을 사용해야 합니다(노드마다 고유해야 하는 `ha.node_id` 제외).

## 구성 {#configuration}

각 노드의 `config.json`에 `ha` 블록을 추가하여 HA를 활성화합니다.

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

각 노드는 고유한 `ha.node_id`를 가져야 합니다. 그 외의 모든 구성은 노드 간에 동일해야 합니다.

### 환경 변수 {#environment-variables}

또는 환경 변수를 사용하여 HA를 구성할 수 있습니다.

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Redis 서버 자체의 장애를 견디려면 단일 주소 대신 [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) 배포를 클러스터의 연결 대상으로 지정하십시오. `ha.engine`을 `redis_sentinel`로 설정하고 Sentinel 구성을 `ha.redis_sentinel`에 기술합니다.

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

각 노드는 sentinel에 현재 마스터를 조회하며 재시작 없이 페일오버를 따라갑니다. 마스터가 변경되는 동안 실행 중이던 태스크는 그대로 계속 실행되고, 새 태스크, 스케줄, 실시간 업데이트는 승격된 레플리카에서 이어집니다.

환경 변수를 사용한 동일한 구성(sentinel 목록은 JSON 배열입니다).

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

참고 사항:

* `ha.engine`이 어떤 블록을 읽을지 결정합니다. `redis`(기본값)는 `ha.redis`를, `redis_sentinel`은 `ha.redis_sentinel`을 읽습니다. 다른 블록이 있어도 무시되며 시작 시 경고가 로그에 기록됩니다.
* `redis_sentinel`을 사용할 때는 `master_name`과 `addrs`의 주소가 최소 하나 필요하며, 이들이 없으면 노드가 시작되지 않습니다.
* `user`와 `pass`는 Redis 데이터 노드에 대한 인증에 사용됩니다. sentinel 자체에 인증이 필요한 경우(`sentinel.conf`의 `requirepass`) `sentinel_user`와 `sentinel_pass`도 설정하십시오.
* `tls`와 `tls_skip_verify`는 Sentinel 연결과 Redis 데이터 노드 연결에 모두 적용됩니다.

### 구성 참조 {#configuration-reference}

| 구성 파일 옵션 | 환경 변수 | 설명 |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | 고가용성 모드를 활성화합니다. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | 이 노드의 고유 식별자입니다. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Redis 서버 주소(예: `localhost:6379`)입니다. |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Redis 데이터베이스 번호입니다. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Redis 서버 비밀번호입니다. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Redis 서버 사용자 이름입니다. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Redis 연결에 TLS를 활성화합니다. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Redis의 TLS 인증서 검증을 건너뜁니다. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Redis 백엔드: `redis`(단일 서버, 기본값) 또는 `redis_sentinel`입니다. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Sentinel에 구성된 모니터링 대상 마스터의 이름입니다. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Sentinel 주소(`host:port`)입니다. 환경 변수에서는 JSON 배열입니다. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Sentinel 노드 자체의 사용자 이름입니다. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Sentinel 노드 자체의 비밀번호입니다. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | 데이터 노드의 Redis 데이터베이스 번호입니다. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Redis 데이터 노드의 사용자 이름입니다. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Redis 데이터 노드의 비밀번호입니다. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Sentinel 및 Redis 연결에 TLS를 활성화합니다. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Sentinel 및 Redis 연결의 TLS 인증서 검증을 건너뜁니다. |

사용 가능한 전체 옵션 목록은 [구성](/admin-guide/configuration)을 참조하십시오.

## 로드 밸런서 {#load-balancer}

Semaphore 노드 앞에 로드 밸런서를 배치하여 트래픽을 분산합니다. 실시간 UI 업데이트를 위해 로드 밸런서는 **WebSocket 연결**을 지원해야 합니다.

### NGINX 예제 {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

NGINX 구성에 대한 자세한 내용은 [리버스 프록시](/admin-guide/reverse-proxy/nginx)를 참조하십시오.

## 작업 실행 방식 {#how-job-execution-works}

다중 노드 배포에서 태스크 실행은 다음과 같이 조정된 흐름을 따릅니다.

1. **사용자가 태스크를 트리거합니다.** 사용자가 UI 또는 API를 통해 작업을 시작합니다. 요청은 어떤 Semaphore 노드에든 도달할 수 있습니다.
2. **태스크 메타데이터가 저장됩니다.** 요청을 받은 노드가 태스크 메타데이터를 데이터베이스에 기록하고 Redis를 통해 작업을 알립니다.
3. **노드가 태스크를 가져갑니다.** 사용 가능한 노드 중 하나가 Redis에서 태스크를 가져와 분산 잠금을 획득하고 데이터베이스에 실행 중으로 표시합니다.
4. **태스크가 실행됩니다.** 노드가 태스크를 로컬에서 실행하거나 [원격 runner](/admin-guide/runners)에 위임합니다. 진행 상황과 로그는 데이터베이스에 다시 기록됩니다.
5. **결과가 브로드캐스트됩니다.** 태스크 업데이트가 Redis Pub/Sub를 통해 전파되어 모든 노드와 연결된 UI 클라이언트가 동기화 상태를 유지합니다.

## HA의 내부 동작 방식 {#under-the-hood}

Semaphore 노드는 서로 직접 통신하지 않습니다. 노드 간에 합의가 필요한 모든 정보는 Redis를 거칩니다. 어떤 노드가 살아 있는지, 어떤 태스크가 어떤 노드에 속하는지, 어떤 노드가 스케줄을 실행하는지, 어떤 UI 메시지를 중계할지 등입니다. 이 상태의 각 요소는 만료 시간이 있는 소수의 Redis 키로 저장되므로, 장애가 발생한 노드가 무언가를 오래 남겨 둘 수 없습니다. 영속적인 데이터(태스크, 템플릿, 로그, runner)는 항상 데이터베이스에 저장되며, Redis는 조정 상태만 보관합니다.

모든 키는 고정된 접두사 `ha:`와 `tasks:`를 사용합니다. 이 접두사는 구성으로 변경할 수 없으므로, 하나의 Redis 서버를 공유하는 두 Semaphore 클러스터는 서로 다른 데이터베이스 번호(`ha.redis.db`)를 사용해야 합니다.

### 노드 레지스트리 {#node-registry}

모든 노드는 시작 시 자신을 등록한 뒤 10초마다 레코드를 갱신합니다. 레코드는 30초 후 만료되므로, 갱신을 멈춘 노드는 늦어도 30초 후에는 죽은 것으로 간주됩니다. 정상 종료 시 노드는 자신의 레코드를 즉시 제거합니다.

| 키 | 유형 | 용도 |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | 노드 하나의 하트비트: `node_id`, `started_at`, `version`, `last_beat`. 마지막 갱신 후 30초가 지나면 만료됩니다. |
| `ha:nodes` | set | 등록된 모든 노드의 ID. 하트비트 키가 만료된 멤버는 다른 노드들이 정리합니다. |

노드 레지스트리는 클러스터 대시보드에 표시되는 내용이며, 고아 정리기(아래 참조)가 태스크 소유자가 아직 살아 있는지 판단할 때 참조하는 정보이기도 합니다.

### 태스크 큐와 실행 중인 태스크 {#task-queue}

태스크 큐는 공유되므로, 한 노드에서 시작된 태스크를 다른 어떤 노드든 디스패치하고, 감시하고, 마무리할 수 있습니다. Redis에는 태스크 ID와 몇 가지 임시 필드만 저장되며, 태스크 자체는 필요로 하는 노드가 데이터베이스에서 불러옵니다.

| 키 | 유형 | 용도 |
| --- | --- | --- |
| `tasks:queue` | list | 디스패치를 기다리는 태스크의 ID(순서대로). |
| `tasks:claim:<task_id>` | string | 태스크를 소유한 노드의 ID. 큐에서 제거하는 것과 함께 원자적으로 기록되므로, 태스크는 정확히 하나의 노드만 가져갑니다. 5분 후 만료되며, 소유자가 1분마다 갱신합니다. |
| `tasks:running` | set | 현재 실행 중인 태스크의 ID. |
| `tasks:active:<project_id>` | set | 프로젝트에서 활성 상태(대기 중 또는 실행 중)인 태스크의 ID. 프로젝트별 동시 실행 제한에 사용됩니다. |
| `tasks:task_project` | hash | `task_id` → `project_id`. 어떤 노드든 데이터베이스에서 태스크를 불러올 수 있도록 합니다. |
| `tasks:aliases` | hash | 별칭으로 참조되는 태스크의 `alias` → `task_id`. |
| `tasks:runtime:<task_id>` | hash | runner ID나 태스크를 시작한 사용자처럼 태스크 실행 중에 변경되는 필드. |
| `tasks:finalize:<task_id>` | string | 원격 runner에서 실행된 태스크의 최종 결과를 기록하는 노드가 획득하는 잠금. 5분 후 만료됩니다. |

`tasks:task_project`, `tasks:aliases`, `tasks:runtime:*`의 항목은 태스크가 끝나면 제거되며, 안전장치로 7일 후에 추가로 만료됩니다.

노드는 단일 원자적 연산으로 큐에서 태스크를 가져갑니다. 태스크가 아직 큐에 있는지 확인하고, 클레임을 기록하고, 큐에서 태스크를 제거하고, 실행 중 세트에 추가합니다. 두 노드가 동시에 시도하면 하나만 성공합니다.

**고아 정리기.** 모든 노드는 1분에 한 번, 소유자가 죽은 실행 중 태스크, 즉 클레임이 만료되었거나 소유자의 하트비트가 사라진 태스크를 검토합니다. 데이터베이스에 이미 완료된 것으로 표시된 태스크는 Redis에서 그냥 제거됩니다. runner에 한 번도 전달되지 않은 태스크는 살아 있는 노드가 디스패치하도록 큐에 다시 넣습니다. 이미 runner에서 실행 중인 태스크는 그대로 둡니다. runner는 계속 작업하며, 데이터베이스에 완료로 표시되면 태스크가 정리됩니다.

### 잠금 {#locks}

잠금은 `SET NX`로 생성되는 단일 키입니다. 키 생성에 성공한 노드가 잠금을 보유합니다. 모든 잠금에는 만료 시간이 있고, 오래 유지되는 잠금은 소유자가 갱신하므로, 장애가 발생한 노드의 잠금은 자동으로 해제됩니다.

| 키 | 만료 | 용도 |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55초 | 스케줄마다, 1분마다 하나의 잠금. 이를 생성한 노드가 스케줄을 실행하고, 나머지 노드는 건너뜁니다. |
| `ha:wf:lock:<project_id>:<run_id>` | 30초, 10초마다 갱신 | 특정 워크플로 실행을 한 번에 하나의 노드만 진행시킵니다. |
| `ha:wf:start:<project_id>:<template_id>` | 10초 | 새 워크플로 실행을 생성하는 동안의 짧은 잠금. 두 노드가 같은 워크플로를 두 번 시작하지 않도록 합니다. |
| `ha:audit:export:<destination_id>` | 30초, 10초마다 갱신 | 특정 대상으로 감사 이벤트를 내보내는 노드는 하나뿐입니다. Redis를 사용할 수 없으면 어떤 노드도 내보내지 않으므로, 이벤트가 두 번 전송되는 일은 없습니다. |

스케줄과 워크플로 잠금은 페일 오픈(fail open) 방식입니다. Redis에 연결할 수 없으면 노드는 작업을 건너뛰지 않고 계속 진행하며, 데이터베이스의 조건부 업데이트가 결과의 정확성을 보장합니다. 감사 내보내기 리스는 페일 클로즈(fail closed) 방식입니다. 중복된 내보내기는 되돌릴 수 없기 때문입니다.

### Pub/Sub 채널 {#pubsub-channels}

| 채널 | 용도 |
| --- | --- |
| `ha:ws:broadcast` | UI용 WebSocket 메시지. 노드는 자신에게 연결된 브라우저에 메시지를 전달하고 이 채널에 발행합니다. 다른 노드들은 이를 자신의 브라우저에 중계합니다. |
| `tasks:events` | 태스크 큐와 실행 중 세트의 변경, 런타임 필드 업데이트, 강제 중지 요청. 노드는 이 이벤트를 사용하여 메모리에 있는 큐의 상태를 최신으로 유지하고, 다른 노드가 중지를 요청한 태스크를 중지합니다. |

메시지에는 보낸 노드의 ID가 포함되므로, 노드는 자신이 보낸 메시지를 무시합니다.

### Runner 캐시 키 {#runner-cache-keys}

`ha:runner:*` 키는 다음 섹션에서 설명하는 [runner 캐시](#runner-cache)에 속합니다.

## Runner 캐시 {#runner-cache}

[runner](/admin-guide/runners)가 서버로 보내는 모든 요청에는 토큰이 포함되며, 서버는 다른 작업을 하기 전에 먼저 그 토큰을 runner 레코드로 변환해야 합니다. runner는 몇 초마다 폴링하고 작업이 실행되는 동안 매초 진행 상황을 보고하므로, 캐시가 없다면 이 요청 하나하나가 데이터베이스 쿼리를 발생시킵니다. runner 캐시는 그 대부분에 메모리에서 응답합니다.

단일 노드는 캐시를 자신의 메모리에 보관합니다. HA 모드에서는 이것으로 충분하지 않습니다. 노드 A에서 runner를 수정하면 노드 B가 이전 레코드를 계속 제공해서는 안 됩니다. 그래서 HA 모드에서는 캐시가 Redis에 있고 모든 노드가 공유하며, 어떤 노드를 통해 변경하든 모든 노드에서 즉시 보입니다.

:::note
이 캐시는 Runner 페이지의 **캐시 지우기** 동작과는 다릅니다. 그 동작은 runner 자체에 해당 머신의 작업 디렉터리를 삭제하도록 요청하는 것입니다.
:::

### 캐시되는 내용과 유지 기간 {#runner-cache-ttl}

캐시되는 값은 태그와 토큰을 제외한 runner 레코드입니다. 토큰은 절대 Redis에 도달하지 않습니다. 키는 토큰의 SHA-256 해시에서 파생되며, 레코드가 저장되기 전에 토큰 필드는 비워집니다.

항목은 최대 30초 동안 유지됩니다. 실제로는 그보다 훨씬 일찍 삭제되는데, Semaphore를 통해 이루어진 모든 변경이 캐시를 즉시 무효화하기 때문입니다.

* runner를 생성, 수정, 삭제, 재등록하거나 프로젝트를 삭제하면 모든 노드에서 캐시된 **모든** runner가 삭제됩니다.
* runner 하트비트는 **해당 runner의** 항목만 삭제하므로, 다른 항목을 건드리지 않고 저장된 "마지막 확인" 시각이 최신으로 유지됩니다. 하트비트는 `runners.offline_timeout_sec`의 3분의 1(최대 45초) 간격마다 최대 한 번 기록됩니다. 기본 타임아웃인 120초에서는 40초마다입니다.

30초 만료는 Semaphore를 거치지 않고 이루어진 변경, 예를 들어 `runner` 테이블을 직접 수정하거나 백업을 복원한 경우에만 의미가 있습니다.

### 오래된 쓰기를 방지하는 방법 {#runner-cache-generation}

캐시에서 찾지 못한 조회는 데이터베이스에서 runner를 읽은 다음 저장합니다. 이 두 단계 사이에 다른 노드가 runner를 변경할 수 있습니다. 조회가 변경 전에 읽은 내용을 절대 캐시하지 않도록, 캐시는 무효화할 때마다 증가하는 카운터를 유지합니다. 조회는 데이터베이스로 가기 전에 본 카운터 값을 기억하고, 그 사이에 카운터가 바뀌었으면 저장이 거부됩니다. 각 단계는 Redis에서 하나의 Lua 스크립트로 실행되므로, 카운터와 항목은 함께 읽고 함께 기록됩니다.

### Redis 키 {#runner-cache-redis-keys}

| 키 | 유형 | 용도 |
| --- | --- | --- |
| `ha:runner:gen` | string, 정수 | 카운터. 전체 캐시 무효화든 단일 runner 무효화든, 무효화할 때마다 1씩 증가합니다. |
| `ha:runner:inv` | string, 정수 | 마지막 전체 무효화 시점의 카운터 값. 모든 항목 키의 일부이므로, 전체 무효화가 일어나면 기존 항목 전체가 한꺼번에 접근 불가능해지고, 이후 스스로 만료됩니다. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, 바이너리 | 캐시된 runner 레코드. 30초 후 만료됩니다. |
| `ha:runner:forgot:<sha256(token)>` | string, 정수 | 이 runner의 마지막 하트비트 시점의 카운터 값. 하트비트 이전에 시작된 조회는 하트비트 이전의 레코드를 저장할 수 없습니다. 30초 후 만료됩니다. |

클러스터 대시보드는 `ha:runner:token:*` 키의 수를 runner 캐시의 크기로 표시합니다.

### Redis에 문제가 있을 때의 동작 {#runner-cache-failures}

캐시 때문에 runner 요청이 실패하는 일은 없습니다. 모든 캐시 연산은 500밀리초로 제한됩니다. Redis가 느리거나 연결할 수 없으면 조회는 미스로 처리되어 데이터베이스로 가며, 아무것도 저장되지 않습니다. 유의해야 할 한 가지 경우는 runner가 변경되는 순간 Redis가 다운되어 무효화가 실패하는 경우입니다. 이때 다른 노드들은 항목이 만료될 때까지, 최대 30초 동안 이전 레코드를 제공할 수 있습니다. 이 실패는 오류 수준으로 로그에 기록됩니다.

## Runner를 이용한 확장 {#scaling-with-runners}

HA는 태스크 실행의 수평 확장도 가능하게 합니다. Semaphore 노드 자체에서만 작업을 실행하는 대신, 여러 [runner](/admin-guide/runners)에 실행을 위임할 수 있습니다. 이를 통해 다음이 가능합니다.

* 인프라 전반에 워크로드를 분산합니다.
* 웹/API 계층과 독립적으로 자동화 처리 용량을 확장합니다.
* 실행 환경을 격리하여 장애 영향 범위를 제한합니다.
* 여러 노드에서 태스크를 병렬로 실행합니다.

설정 방법은 [Runner](/admin-guide/runners)를 참조하십시오.

## 이점 {#benefits}

* **향상된 안정성** — 한 인스턴스에 장애가 발생해도 다른 인스턴스가 트래픽 처리와 작업 실행을 계속합니다.
* **무중단 유지 보수** — 시스템을 중단하지 않고 노드를 개별적으로 업데이트하거나 재시작할 수 있습니다.
* **수평 확장성** — 로드 밸런서 뒤에 Semaphore 노드를 추가하여 용량을 늘릴 수 있습니다.
* **주 노드 의존성 없음** — 모든 노드가 동등하므로 복잡한 페일오버 메커니즘이 필요 없습니다.
* **일관된 클러스터 상태** — 공유 데이터베이스와 Redis 조정을 통해 모든 인스턴스가 동기화 상태를 유지합니다.

## FAQ {#faq}

### 액티브-액티브 고가용성이란 무엇입니까? {#what-is-active-active-high-availability}

액티브-액티브 HA는 여러 애플리케이션 인스턴스가 동시에 실행되며 모든 인스턴스가 요청을 처리하는 방식입니다. 주 노드가 없으므로 어떤 인스턴스든 트래픽을 처리하고 작업을 실행할 수 있습니다.

### Semaphore는 HA 모드에서 왜 Redis를 사용합니까? {#why-does-semaphore-use-redis-in-ha-mode}

Redis는 인스턴스 간의 조정 계층 역할을 합니다. 분산 잠금, 공유 태스크 큐 상태, Pub/Sub 메시징을 제공하여 노드들이 동일한 작업을 동시에 실행하지 않도록 보장합니다.

### HA 배포에는 어떤 데이터베이스를 사용해야 합니까? {#what-database-should-i-use-for-ha-deployments}

Semaphore는 공유 데이터베이스로 PostgreSQL과 MySQL을 지원합니다. SQLite와 BoltDB는 여러 프로세스의 동시 접근을 지원하지 않기 때문에 HA 모드에서 사용할 수 없습니다.

### Redis에 장애가 발생하면 어떻게 됩니까? {#what-happens-if-redis-fails}

단일 Redis 서버(`ha.engine: redis`)를 사용하는 경우 Redis가 복구될 때까지 노드들은 서로 조정할 수 없습니다. [Redis Sentinel](#redis-sentinel)을 사용하면 sentinel이 레플리카를 승격시키고 모든 Semaphore 노드가 재시작 없이, 보통 몇 초 내에 자동으로 전환됩니다.

### Semaphore 노드 하나에 장애가 발생하면 어떻게 됩니까? {#what-happens-if-one-semaphore-node-fails}

로드 밸런서가 트래픽을 나머지 노드로 라우팅합니다. 실행 중인 작업은 다른 인스턴스에서 계속되고, 새 작업은 사용 가능한 아무 노드나 가져가서 처리합니다.

### 수평 확장이 가능합니까? {#can-i-scale-horizontally}

예. 로드 밸런서 뒤에 Semaphore 노드를 추가하여 웹/API 용량을 늘리고, [runner](/admin-guide/runners)를 추가하여 태스크 실행 용량을 늘릴 수 있습니다.
