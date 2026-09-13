---
title: "OpenBao 시크릿 스토리지"
---

# OpenBao 시크릿 스토리지 <Pro />

Semaphore UI는 [OpenBao](https://openbao.org)를 시크릿 스토리지로 지원합니다.

OpenBao는 HashiCorp Vault의 오픈 소스 포크로 API 호환성을 가지므로, 이 스토리지는 [HashiCorp Vault 스토리지](/user-guide/key-store/hashicorp-vault)와 완전히 동일하게 작동합니다.

다음 옵션을 제공할 수 있습니다:
- **Server URL** — OpenBao 서버의 주소.
- **Mount** — KV v2 시크릿 엔진의 마운트 경로(기본값 `secret`).
- **Namespace** — OpenBao 네임스페이스(v2.3+), 선택 사항.
- **Token** — 인증 token. token은 다음 방식으로 제공할 수 있습니다:
    - 데이터베이스에 저장.
    - 환경 변수를 통해 제공.
    - 파일을 통해 제공.
      :::warning
      token을 **파일**에서 가져오는 경우, 해당 파일은 Semaphore가 사용하는 시크릿 디렉터리 **내부**에 있어야 합니다. 이 디렉터리는 `dirs.secrets` 또는 `SEMAPHORE_SECRETS_PATH` 환경 변수를 사용하여 구성합니다. 이전 구성을 위해 레거시 최상위 `secrets_path` 옵션도 여전히 허용됩니다. 아무것도 설정되지 않은 경우 기본값은 `/tmp/semaphore`입니다. 우선순위에 대한 자세한 내용은 [시크릿 디렉터리](/admin-guide/configuration/config-file#secrets-directory)를 참조하십시오.
      :::

이 스토리지는 읽기 전용 모드로 작동할 수 있습니다.

## 사용 방법 {#how-to-use}

1. 프로젝트에서 **키 저장소** → **스토리지**를 열고 새 **OpenBao** 스토리지(URL, 마운트 경로, token)를 생성합니다.
2. 키 저장소에서 키를 생성하거나 편집할 때 스토리지 유형으로 OpenBao 스토리지를 선택합니다.
3. 자격 증명을 저장할 OpenBao 내의 시크릿 경로를 제공합니다.

## 시크릿 동기화 {#syncing-secrets}

OpenBao에 저장된 시크릿은 다른 외부 스토리지와 동일한 방식으로 키 저장소로 자동으로 가져와 동기화 상태를 유지할 수 있습니다. [원격 스토리지에서 시크릿 동기화](/user-guide/key-store/secret-sync)를 참조하십시오.

## 변수 그룹 {#variable-groups}

OpenBao는 [변수 그룹](/user-guide/environment)의 스토리지로도 사용할 수 있습니다. 변수 그룹을 편집할 때 스토리지 유형으로 OpenBao 스토리지를 선택하고 시크릿을 저장할 폴더의 경로를 지정합니다.
