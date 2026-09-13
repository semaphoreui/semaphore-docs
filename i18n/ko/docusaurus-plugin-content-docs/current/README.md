---
title: Semaphore UI 문서
sidebar_label: 홈
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Semaphore UI 문서

Semaphore UI는 **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell**, **Python** 자동화를 실행하기 위한 자체 호스팅 웹 UI 및 API입니다. 팀이 한곳에서 playbook과 스크립트를 실행하고, 자격 증명을 암호화하여 보관하고, 작업을 예약하고, 누가 언제 무엇을 실행했는지 확인할 수 있습니다.

단일 Go 바이너리 또는 Docker 이미지로 제공되며, Linux, macOS, Windows에서 실행되고 데이터는 SQLite, MySQL 또는 PostgreSQL에 저장합니다.

:::tip[빠른 시작]

한 줄의 명령으로 SQLite와 함께 Semaphore를 실행한 다음 [http://localhost:3000](http://localhost:3000)을 열고 `admin` / `changeme`로 로그인합니다.

```bash
docker run -d -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore-data:/var/lib/semaphore \
  semaphoreui/semaphore:latest
```

프로덕션 환경에서는 Docker Compose, 패키지, Kubernetes, 바이너리 설치 방법을 다루는 [설치](/admin-guide/installation)를 참고하십시오. 그다음 [시작하기](/getting-started)를 따라 첫 번째 작업을 실행해 보십시오.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>설치 및 구성</h3></div>
      <div className="card__body">
        <p>서버를 실행하고 데이터베이스, ID 공급자, 네트워크에 연결합니다.</p>
        <ul>
          <li><Link to="/admin-guide/installation">설치</Link></li>
          <li><Link to="/admin-guide/configuration">구성</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">리버스 프록시 및 TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> 및 <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">보안 강화</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>자동화 실행</h3></div>
      <div className="card__body">
        <p>작업을 프로젝트로 구성하고, 저장소와 자격 증명을 연결하고, 필요할 때 또는 일정에 따라 작업을 실행합니다.</p>
        <ul>
          <li><Link to="/getting-started">시작하기: 6단계로 첫 번째 작업 실행</Link></li>
          <li><Link to="/user-guide/projects">프로젝트</Link> 및 <Link to="/user-guide/team">팀</Link></li>
          <li><Link to="/user-guide/task-templates">작업 템플릿</Link> 및 <Link to="/user-guide/tasks">작업</Link></li>
          <li><Link to="/user-guide/key-store">키 저장소</Link>, <Link to="/user-guide/inventory">인벤토리</Link>, <Link to="/user-guide/environment">변수 그룹</Link></li>
          <li><Link to="/user-guide/schedules">일정</Link> 및 <Link to="/user-guide/workflows">워크플로</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>대규모 운영</h3></div>
      <div className="card__body">
        <p>실행을 분산하고, 이중화하여 운영하고, 서비스를 관측 가능하고 최신 상태로 유지합니다.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runner</Link></li>
          <li><Link to="/admin-guide/ha">고가용성</Link></li>
          <li><Link to="/admin-guide/upgrading">업그레이드</Link></li>
          <li><Link to="/admin-guide/logs">로그</Link> 및 <Link to="/admin-guide/metrics">메트릭</Link></li>
          <li><Link to="/admin-guide/notifications">알림</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>참조</h3></div>
      <div className="card__body">
        <p>찾는 내용을 이미 알고 있을 때 확인하는 정확한 옵션과 엔드포인트입니다.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">구성 파일</Link> 및 <Link to="/admin-guide/configuration/env-vars">환경 변수</Link></li>
          <li><Link to="/admin-guide/api">REST API</Link></li>
          <li><Link to="/admin-guide/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">CI/CD 통합</Link></li>
          <li><Link to="/faq/troubleshooting">문제 해결 FAQ</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## 도구별 가이드 {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## 도움말 및 커뮤니티 {#help-and-community}

- **질문:** [Discord](https://discord.gg/5R6k7hNGcH)에서 질문하십시오.
- **버그 및 기능 요청:** [GitHub](https://github.com/semaphoreui/semaphore/issues)에 이슈를 등록하십시오.
- **소스 코드:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro 및 Enterprise:** [라이선스 활성화](/admin-guide/license).
