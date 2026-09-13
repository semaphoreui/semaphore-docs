# Email

Пример `config.json` для настройки email-уведомлений через AWS SMTP:

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

Пояснение ключевых настроек:
* `email_secure` &mdash; включает **StartTLS** для перевода соединения в защищённый, зашифрованный канал.
* `email_tls` &mdash; принудительно использовать TLS для SMTP-соединений.
* `email_tls_min_version` &mdash; минимально допустимая версия TLS (например, `1.2`).
