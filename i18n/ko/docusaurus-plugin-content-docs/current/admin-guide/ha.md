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
