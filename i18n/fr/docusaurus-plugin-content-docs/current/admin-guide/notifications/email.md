# E-mail

Exemple de `config.json` pour configurer les notifications par e-mail via AWS SMTP :

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

Explication des paramètres clés :
* `email_secure` &mdash; active **StartTLS** pour faire passer la connexion sur un canal sécurisé et chiffré.
* `email_tls` &mdash; force l'utilisation de TLS pour les connexions SMTP.
* `email_tls_min_version` &mdash; version minimale de TLS autorisée (par ex. `1.2`).
