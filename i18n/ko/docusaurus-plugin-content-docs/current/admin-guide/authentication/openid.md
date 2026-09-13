# OpenID Connect

Semaphore는 OpenID Connect(OIDC)를 통한 인증을 지원합니다.

링크:

* [GitHub 설정](/admin-guide/authentication/openid/github)
* [Google 설정](/admin-guide/authentication/openid/google)
* [GitLab 설정](/admin-guide/authentication/openid/gitlab)
* [Authelia 설정](/admin-guide/authentication/openid/authelia)
* [Authentik 설정](/admin-guide/authentication/openid/authentik)
* [Keycloak 설정](/admin-guide/authentication/openid/keycloak)
* [Okta 설정](/admin-guide/authentication/openid/okta)
* [PingFederate 설정](/admin-guide/authentication/openid/pingfederate)
* [Azure 설정](/admin-guide/authentication/openid/azure)
* [Zitadel 설정](/admin-guide/authentication/openid/zitadel)
* [Pocket-ID 설정](/admin-guide/authentication/openid/pocket-id)

SSO 제공자 설정 예시:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### 환경 변수로 설정하기 {#configure-via-environment-variable}

컨테이너에서 실행할 때는 단일 환경 변수로 제공자를 설정하는 것이 편리할 수 있습니다:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

이 값은 위의 `oidc_providers` 구조와 일치하는 유효한 JSON 문자열이어야 합니다.

모든 SSO 제공자 옵션:

| 매개변수             | 설명                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | 로그인 화면에 표시되는 제공자 이름.                                                              |
| `icon`                | 로그인 화면에서 제공자 이름 앞에 표시되는 [MDI 아이콘](https://pictogrammers.com/library/mdi/). |
| `color`               | 로그인 화면에 표시되는 제공자 이름.                                                              |
| `client_id`           | 제공자 클라이언트 ID.                                                                                         |
| `client_id_file`      | 제공자의 클라이언트 ID가 저장된 파일의 경로. `client_id`보다 우선순위가 낮습니다.           |
| `client_secret`       | 제공자 클라이언트 Secret.                                                                                     |
| `client_secret_file`  | 제공자의 클라이언트 Secret이 저장된 파일의 경로. `client_secret`보다 우선순위가 낮습니다.   |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | 사용자 이름 claim 표현식[\*](#claim-expression).                               |
| `email_claim`         | 이메일 claim 표현식[\*](#claim-expression).                                  |
| `name_claim`          | 프로필 이름 claim 표현식[\*](#claim-expression).                           |
| `order`               | 로그인 화면에서 제공자 버튼의 위치.                                                      |
| `allow_idp_initiated` | 이 제공자에 대해 [IdP 시작 로그인](#idp-initiated-login)을 활성화합니다. 기본값 `false`.                       |
| `return_via_state`    | 로그인 후 돌아갈 경로를 redirect URL 대신 OAuth `state` 매개변수로 전달합니다. 기본값 `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Claim 표현식 {#claim-expression}

claim 표현식 예시:

```
email | {{ .username }}@your-domain.com
```

Semaphore는 먼저 email 필드를 가져오려고 시도합니다. 이 값이 비어 있으면 그 뒤에 오는 표현식이 실행됩니다.

<div class="warning">
  <code>"username_claim": "|"</code> 표현식은 해당 제공자를 통해 로그인하는 각 사용자에게 무작위 <code>username</code>을 생성합니다.
</div>

## IdP 시작 로그인 {#idp-initiated-login}

기본적으로 Semaphore는 **SP 시작(SP-initiated)** 로그인만 지원합니다. 사용자가 Semaphore를 열고 제공자 버튼을 클릭하면
ID 제공자(IdP)로 리디렉션됩니다.

**IdP 시작(IdP-initiated)** 로그인을 사용하면 ID 제공자에서 로그인 과정을 시작할 수 있습니다. 예를 들어 Okta 대시보드, Azure *My Apps*,
또는 Keycloak / Authentik 애플리케이션 런처에서 Semaphore 타일을 클릭하는 방식입니다.

Semaphore는 표준 **Third-Party Initiated Login** 메커니즘
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin))을 사용하여 이를 구현합니다. IdP가
브라우저를 전용 **Initiate Login URI**로 리디렉션하면 Semaphore가 일반적인 Authorization Code 흐름을 시작합니다.
실제 인증은 여전히 완전하고 안전한 코드 교환으로 이루어지며, Semaphore는 요청하지 않은 token을 절대 받아들이지 않습니다.

### 활성화 {#enabling-it}

해당 제공자에 대해 `allow_idp_initiated`를 `true`로 설정합니다:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### ID 제공자 설정 {#configuring-the-identity-provider}

IdP에서 애플리케이션의 **Initiate Login URI**를 다음과 같이 설정합니다:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

여기서 `<provider-id>`는 `oidc_providers` 아래의 키입니다(예: `mysso`).

IdP는 이 엔드포인트로 `iss`(issuer) 매개변수를 보내야 합니다. Semaphore는 `iss`가 설정된 제공자와 일치하지 않는 요청을
거부합니다. 선택적 `login_hint` 매개변수는 IdP로 전달되며, 선택적 `target_link_uri`는
로그인 후 열 페이지를 지정합니다(Semaphore를 가리켜야 하며, 그렇지 않으면 무시됩니다).

제공자별 참고 사항:

- **Okta** — *Login initiated by*를 *Either Okta or App*(또는 *App Only*)으로 설정하고 *Initiate login URI*를 입력합니다. Okta는
  `iss`와 `target_link_uri`를 모두 보냅니다.
- **Keycloak / Authentik / Ping / OneLogin** — 애플리케이션의 시작(launch) / 홈 URL을 Initiate Login URI로 설정합니다.
- **Azure AD / Entra** — *My Apps*는 SP 시작 URL을 사용하며 `iss`를 항상 보내지는 않습니다. 시작 URL을
  `https://your-domain.com/api/auth/oidc/<provider-id>/login`으로 지정하십시오.

### 보안 {#security}

- IdP 시작 로그인은 **기본적으로 꺼져 있으며** 제공자별로 활성화해야 합니다.
- 제공자 혼동(provider mix-up)을 방지하기 위해 `iss` 매개변수는 설정된 issuer와 대조하여 검증됩니다.
- `target_link_uri`는 Semaphore를 가리키는 경우에만 허용됩니다(open redirect 없음).
- 이 흐름은 CSRF `state`와 `nonce`를 포함한 완전한 Authorization Code 교환을 거치므로, 가로채거나 재전송된
  token으로는 로그인할 수 없습니다.

## 로그인 화면 {#sign-in-screen}

설정된 각 제공자마다 로그인 페이지에 추가 로그인 버튼이 표시됩니다:

![두 개의 로그인 버튼이 있는 Semaphore 로그인 페이지 스크린샷. 하나는 "Sign In", 다른 하나는 "Sign in with MySSO"라고 표시되어 있습니다](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
