# Ihr Konto

Ihre persönlichen Einstellungen finden Sie im Kontomenü am unteren Ende der Seitenleiste. Klicken Sie auf Ihren Namen, um es zu öffnen.

![Kontomenü](/assets/user-menu.webp)

| Eintrag | Beschreibung |
|---|---|
| Version | Die auf dem Server laufende Version von Semaphore UI. |
| **API Tokens** | Persönliche Tokens für die [REST-API](/admin-guide/api). |
| **Edit Account** | Ihr Name, Benutzername, Ihre E-Mail-Adresse, Ihre Benachrichtigungseinstellung und Ihr Passwort. |
| **Sign Out** | Beendet die Sitzung. |

Neben dem Menü finden Sie den Schalter für den **Dunkelmodus** und die **Sprachauswahl**. Beide Einstellungen werden in Ihrem Browser gespeichert.

## Konto bearbeiten {#edit-account}

![Dialog zum Bearbeiten des Kontos](/assets/account-edit.webp)

Der Tab **Settings** enthält:

| Feld | Beschreibung |
|---|---|
| **Name** | Anzeigename, der im Task-Verlauf und in der Aktivität angezeigt wird. |
| **Username** | Anmeldename. |
| **Email** | Adresse für E-Mail-Benachrichtigungen und die Passwortwiederherstellung. |
| **Send alerts** | E-Mail-Benachrichtigungen zu Tasks erhalten. Benachrichtigungen werden nur gesendet, wenn der [E-Mail-Kanal](/admin-guide/notifications/email) konfiguriert ist und das Projekt Benachrichtigungen erlaubt. |

Die Badges neben den Checkboxen zeigen Ihre globalen Kennzeichen: **Pro user** auf einer Pro-Instanz, **Admin** für Administratoren, **External** für Konten, die über LDAP oder OpenID Connect verwaltet werden. Externe Benutzer können hier ihren Benutzernamen und ihr Passwort nicht ändern.

Im Tab **Security** können Sie Ihr Passwort ändern. Wenn der Administrator zeitbasierte Einmalpasswörter aktiviert hat, wird der zweite Faktor im selben Tab konfiguriert.

![Tab Security](/assets/account-security.webp)

## API-Tokens {#api-tokens}

Wählen Sie im Kontomenü **API Tokens**. Die Seite listet Ihre Tokens mit Erstellungsdatum, Ablaufdatum und Status auf. Der Link **API Reference** öffnet die in Ihrer Instanz integrierte Swagger UI.

![API-Tokens](/assets/api-tokens.webp)

Klicken Sie auf **New Token**, geben Sie dem Token einen Namen und wählen Sie den Ablaufzeitpunkt. Der Token-Wert wird nach der Erstellung nur einmal angezeigt, kopieren Sie ihn also sofort.

![Dialog für neues Token](/assets/api-token-new.webp)

Verwenden Sie das Token im Header `Authorization: Bearer`, siehe [API](/admin-guide/api). Um ein Token zu widerrufen, löschen Sie es aus der Liste.
