---
title: 에디션
description: Semaphore Community, Pro, Enterprise에 포함된 내용과 유료 구독이 필요한 기능.
---

import EditionsTable from '@site/src/components/EditionsTable';

# 에디션

Semaphore는 하나의 코드베이스와 하나의 문서에서 세 가지 에디션으로 제공됩니다. 해당
페이지나 섹션에 에디션 배지가 없는 한, 이 문서에서 설명하는 모든 내용은 **Community**에서
사용할 수 있습니다.

| 에디션 | 설명 |
|---|---|
| **Community** | 오픈 소스 에디션입니다. 무료이며 셀프 호스팅이고 라이선스 키가 필요하지 않습니다. 아래 표에 나열되지 않은 모든 기능이 포함됩니다. |
| **Pro** | 워크플로우, 프로젝트 Runner, 외부 시크릿 스토리지, 컨테이너 실행기, 구조화된 로깅을 추가합니다. |
| **Enterprise** | 고가용성, 사용자 지정 역할이 포함된 확장 RBAC, Kubernetes 실행기, 엔터프라이즈 시크릿 스토리지를 추가합니다. |

Pro와 Enterprise는 라이선스 키로 활성화됩니다. [라이선스 활성화](/admin-guide/license)를
참고하세요. 서버가 실행 중인 에디션은 계정 메뉴에 표시됩니다. [내 계정](/user-guide/account)을
참고하세요.

## 기능 매트릭스 {#feature-matrix}

유료 에디션이 필요한 기능입니다. 여기에 없는 기능은 모든 에디션에서 사용할 수 있습니다.

<EditionsTable />

## 이 문서에서 에디션을 표시하는 방법 {#how-editions-are-marked}

제목 옆의 배지는 그 아래의 기능에 해당 에디션이 필요함을 의미합니다.

- <Pro /> 는 Pro 기능을 표시합니다.
- <Enterprise /> 는 Enterprise 기능을 표시합니다.

배지에는 해당 기능이 추가된 버전이 함께 표시될 수도 있습니다. 예를 들면
<FeatureState feature="extended-rbac" /> 와 같습니다. 배지를 클릭하면 이 페이지로
돌아옵니다.
