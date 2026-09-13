# Correo electrónico

Ejemplo de `config.json` para configurar notificaciones por correo electrónico mediante SMTP de AWS:

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

Explicación de los ajustes clave:
* `email_secure` &mdash; habilita **StartTLS** para elevar la conexión a un canal seguro y cifrado.
* `email_tls` &mdash; fuerza el uso de TLS en las conexiones SMTP.
* `email_tls_min_version` &mdash; versión mínima de TLS permitida (p. ej. `1.2`).
