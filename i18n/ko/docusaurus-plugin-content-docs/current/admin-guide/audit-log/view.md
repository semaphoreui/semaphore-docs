---
title: 감사 로그 보기
description: "웹 UI에서 감사 로그를 확인합니다. 최신 이벤트와 이벤트의 모든 필드를 보고, Semaphore Pro에서는 필터와 CSV 또는 JSON Lines 내보내기를 사용할 수 있습니다."
---

# 감사 로그 보기

관리자는 사용자 메뉴에서 **Audit log**를 엽니다. 최신 이벤트가 먼저 나오고 한 페이지에 50개씩 표시됩니다.

![최신 이벤트가 먼저 나오는 감사 로그](/assets/audit-log-list.png)

이벤트를 클릭하면 이벤트의 모든 필드를 볼 수 있습니다. 복사 버튼은 Semaphore가 SIEM으로 보내는 형식으로 이벤트를 복사합니다.

![모든 필드가 표시된 이벤트](/assets/audit-log-card.png)

## 필터링과 내보내기 <FeatureState feature="audit-log-filters" /> {#filter-export}

기간, 사용자, 이벤트 종류, 결과, 프로젝트, IP 주소로 필터링할 수 있습니다. 이벤트에서 사용자, 주소, 객체, 프로젝트는 링크이며, 클릭하면 해당 값으로 로그를 필터링합니다.

![이벤트의 주소로 필터링한 로그](/assets/audit-log-filters.png)

필터 조합으로 찾은 이벤트가 적으면 Semaphore는 한 번에 2초씩 검색하고 어디까지 거슬러 올라갔는지 표시합니다. 계속하려면 **Search older**를 클릭하세요.

**Export**는 필터와 일치하는 모든 이벤트를 CSV 또는 JSON Lines 파일로 저장합니다. 내보내기는 매번 `audit.log/export` 이벤트로 기록됩니다.

![CSV 또는 JSON Lines로 내보내기](/assets/audit-log-export.png)
