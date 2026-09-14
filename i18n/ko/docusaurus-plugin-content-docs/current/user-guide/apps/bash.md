
# 셸/Bash 스크립트

Semaphore는 `/bin/bash`를 사용해 셸 스크립트를 실행할 수 있습니다. 이를 위해 **Bash Script** 작업 템플릿을 생성하십시오.

## Bash 템플릿 생성 {#creating-a-bash-template}

1. **작업 템플릿** 섹션으로 이동하여 **새 템플릿** 버튼을 클릭합니다.
2. 앱 유형으로 **Bash**를 선택합니다.
3. 템플릿을 설정합니다:

| 필드 | 설명 |
|---|---|
| **이름** | 템플릿을 설명하는 이름 |
| **리포지토리** | 셸 스크립트가 들어 있는 리포지토리 |
| **Playbook / Script** | 스크립트의 상대 경로, 예: `scripts/deploy.sh` |
| **변수 그룹** | 값이 환경 변수로 주입되는 변수 그룹 |

4. **생성**을 클릭합니다.
5. **실행**을 클릭해 템플릿을 실행합니다. 스크립트 템플릿의 새 작업 대화 상자에는 선택적 메시지만 있으며, 템플릿이 정의한 경우 설문 변수와 프롬프트가 추가로 표시됩니다.

<div class="DialogScreenshot">

![Bash 템플릿의 새 작업 대화 상자](/assets/task-new-bash.webp)

</div>

## 스크립트에 변수 전달 {#passing-variables-to-scripts}

선택한 **변수 그룹**의 변수는 환경 변수로 주입됩니다. 스크립트에서 `$VARIABLE_NAME`으로 접근하십시오:

```bash
#!/bin/bash
echo "Deploying to $TARGET_HOST"
```

## 참고 사항 {#notes}

- 스크립트를 실행 가능하게 만들거나(`chmod +x`) 유효한 셔뱅(`#!/bin/bash`)으로 시작하도록 하십시오.
- 스크립트는 비대화형으로 실행됩니다. 사용자 입력을 기다리는 프롬프트는 사용하지 마십시오.
- 종료 코드 `0`은 성공을 의미하며, 0이 아닌 종료 코드는 작업을 실패로 표시합니다.
- 매우 짧은 스크립트가 로그 출력을 생성하지 않는 경우, 문제 해결 가이드의 [Bash 스크립트 출력이 누락되거나 불완전함](/faq/troubleshooting#bash-script-output-is-missing-or-incomplete)을 참조하십시오.
- 원격 호스트에서 명령을 실행하려면 대신 [Ansible](./ansible)을 사용하십시오.
