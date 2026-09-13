# Email

Esempio di `config.json` per configurare le notifiche email tramite SMTP di AWS:

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

Spiegazione delle impostazioni principali:
* `email_secure` &mdash; abilita **StartTLS** per promuovere la connessione a un canale sicuro e cifrato.
* `email_tls` &mdash; forza l'uso di TLS per le connessioni SMTP.
* `email_tls_min_version` &mdash; versione minima di TLS consentita (ad es. `1.2`).
