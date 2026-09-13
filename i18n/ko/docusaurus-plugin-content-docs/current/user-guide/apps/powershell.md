
# PowerShell

Semaphore는 Windows 호스트에서(또는 Windows 러너에서) PowerShell 스크립트를 실행할 수 있습니다. 이를 위해 **PowerShell** 작업 템플릿을 생성하십시오.

## PowerShell 템플릿 생성 {#creating-a-powershell-template}

1. **작업 템플릿** 섹션으로 이동하여 **새 템플릿** 버튼을 클릭합니다.
2. 앱 유형으로 **PowerShell**을 선택합니다.
3. 템플릿을 설정합니다:

| 필드 | 설명 |
|---|---|
| **이름** | 템플릿을 설명하는 이름 |
| **리포지토리** | `.ps1` 스크립트가 들어 있는 리포지토리 |
| **Playbook / Script** | 스크립트의 상대 경로, 예: `scripts/deploy.ps1` |
| **변수 그룹** | 값이 환경 변수로 주입되는 변수 그룹 |

4. **생성**을 클릭합니다.
5. **실행**을 클릭해 템플릿을 실행합니다.

## 스크립트에 변수 전달 {#passing-variables-to-scripts}

선택한 **변수 그룹**의 변수는 스크립트가 실행되기 전에 환경 변수로 주입됩니다. PowerShell에서 `$env:VARIABLE_NAME`으로 접근하십시오:

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Windows 호스트에서 실행 {#running-on-windows-hosts}

PowerShell 템플릿에는 다음 중 하나가 필요합니다:
- **Windows 러너** — Windows 호스트에 배포된 Semaphore 러너입니다. [러너](/admin-guide/runners)를 참조하십시오.
- Windows에서 실행되는 Semaphore 서버 자체.

## 참고 사항 {#notes}

- 스크립트는 비대화형으로 실행됩니다. 사용자 입력이 필요한 프롬프트는 사용하지 마십시오.
- 종료 코드 `0`은 성공을 의미하며, 0이 아닌 종료 코드는 작업을 실패로 표시합니다.
