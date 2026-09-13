# メール

AWS SMTP によるメール通知を設定する `config.json` の例:

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

主な設定の説明:
* `email_secure` &mdash; **StartTLS** を有効にし、接続を安全な暗号化チャネルにアップグレードします。
* `email_tls` &mdash; SMTP 接続で TLS の使用を強制します。
* `email_tls_min_version` &mdash; 許可する最小の TLS バージョン(例: `1.2`)。
