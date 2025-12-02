# Email notifications

Example `config.json` for configuring AWS SMTP email notifications:

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

Explanation of key setting:
* `email_secure` &mdash; enables **StartTLS** to upgrade the connection to a secure, encrypted channel.
* `email_tls` &mdash; force TLS usage for SMTP connections.
* `email_tls_min_version` &mdash; minimal allowed TLS version (e.g. `1.2`).