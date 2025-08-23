<div class="breadcrumbs">
    <a href="/administration-guide/notifications">Notifications</a>
    → Email notifications
</div>

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
}
```