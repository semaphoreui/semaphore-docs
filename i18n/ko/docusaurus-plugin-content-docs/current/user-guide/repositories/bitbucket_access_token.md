# Bitbucket 액세스 토큰

Semaphore에서 Bitbucket 액세스 토큰을 사용해 Bitbucket의 리포지토리에 접근할 수 있습니다.

먼저 읽기 권한이 있는 Bitbucket 리포지토리용 액세스 토큰을 생성해야 합니다.

![](/assets/bitbucket_access_token_1.webp)

생성하면 액세스 토큰이 표시됩니다. Semaphore에서 **액세스 키**를 생성할 때 필요하므로 클립보드에 복사하십시오.

![](/assets/bitbucket_access_token_2.webp)

1. Semaphore의 **키 저장소** 섹션으로 이동하여 **새 키** 버튼을 클릭합니다.
2. 키 유형으로 `Login with password`를 선택합니다.
3. **Login**에 `x-token-auth`를 입력하고 앞서 복사한 키를 **Password** 필드에 붙여넣습니다. 키를 저장합니다.<br/><br/>![](/assets/bitbucket_access_token_3.png)
4. **리포지토리** 섹션으로 이동하여 **새 리포지토리** 버튼을 클릭합니다.
5. 리포지토리의 HTTPS URL(`https://bitbucket.org/path/to/repo`)을 입력하고 올바른 브랜치를 입력한 후 앞서 생성한 **액세스 키**를 선택합니다.<br/><br/>![](/assets/bitbucket_access_token_4.webp)