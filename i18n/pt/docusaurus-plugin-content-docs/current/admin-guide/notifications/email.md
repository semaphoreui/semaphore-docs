# E-mail

Exemplo de `config.json` para configurar notificações por e-mail via SMTP da AWS:

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

Explicação das principais configurações:
* `email_secure` &mdash; habilita o **StartTLS** para atualizar a conexão para um canal seguro e criptografado.
* `email_tls` &mdash; força o uso de TLS nas conexões SMTP.
* `email_tls_min_version` &mdash; versão mínima de TLS permitida (por exemplo, `1.2`).
