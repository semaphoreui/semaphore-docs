# E-Mail

Beispiel für eine `config.json` zur Konfiguration von E-Mail-Benachrichtigungen über AWS SMTP:

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

Erläuterung der wichtigsten Einstellungen:
* `email_secure` &mdash; aktiviert **StartTLS**, um die Verbindung auf einen sicheren, verschlüsselten Kanal hochzustufen.
* `email_tls` &mdash; erzwingt die Verwendung von TLS für SMTP-Verbindungen.
* `email_tls_min_version` &mdash; minimal zulässige TLS-Version (z. B. `1.2`).
