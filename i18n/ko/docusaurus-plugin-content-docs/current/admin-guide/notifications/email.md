# 이메일

AWS SMTP 이메일 알림을 구성하는 `config.json` 예시:

```json
{
  "email_alert":          true,
  "email_sender":         "noreply@example.com",
  "email_host":           "email-smtp.us-east-1.amazonaws.com",
  "email_port":           "587",
  "email_secure":         true,
  "email_username":       "<aws-key>",
  "email_password":       "<aws-secret>",
  "email_tls":            true,
  "email_tls_min_version": "1.2"
}
```

주요 설정 설명:
* `email_secure` &mdash; **StartTLS**를 활성화하여 연결을 안전한 암호화 채널로 업그레이드합니다.
* `email_tls` &mdash; SMTP 연결에 TLS 사용을 강제합니다.
* `email_tls_min_version` &mdash; 허용되는 최소 TLS 버전(예: `1.2`).
