# E-pošta

Primer `config.json` za podešavanje obaveštenja e-poštom preko AWS SMTP-a:

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

Objašnjenje ključnih podešavanja:
* `email_secure` &mdash; uključuje **StartTLS** za nadogradnju veze na bezbedan, šifrovan kanal.
* `email_tls` &mdash; nameće korišćenje TLS-a za SMTP veze.
* `email_tls_min_version` &mdash; najniža dozvoljena verzija TLS-a (npr. `1.2`).
