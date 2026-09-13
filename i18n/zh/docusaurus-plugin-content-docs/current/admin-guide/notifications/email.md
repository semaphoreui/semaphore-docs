# 电子邮件

用于配置 AWS SMTP 电子邮件通知的 `config.json` 示例：

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

关键设置说明：
* `email_secure` &mdash; 启用 **StartTLS**，将连接升级为安全的加密通道。
* `email_tls` &mdash; 强制 SMTP 连接使用 TLS。
* `email_tls_min_version` &mdash; 允许的最低 TLS 版本（例如 `1.2`）。
