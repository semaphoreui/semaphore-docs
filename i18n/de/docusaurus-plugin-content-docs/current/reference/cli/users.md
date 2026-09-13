# Benutzer

Der Befehl `semaphore users` fügt Benutzer hinzu, ändert, entfernt und zeigt sie an
und verwaltet ihre API-Tokens sowie die TOTP-Verifizierung (2FA).

```bash
semaphore users --help
```

> `user` ist ein Alias für `users`.

| Befehl | Zweck |
|--------|-------|
| [`users add`](#add-a-user) | Einen Benutzer anlegen. |
| [`users change-by-login`](#change-a-user) | Einen über den Login gefundenen Benutzer aktualisieren. |
| [`users change-by-email`](#change-a-user) | Einen über die E-Mail-Adresse gefundenen Benutzer aktualisieren. |
| [`users get`](#show-a-user) | Die Details eines Benutzers ausgeben. |
| [`users list`](#list-users) | Die Logins aller Benutzer ausgeben. |
| [`users delete`](#delete-a-user) | Einen Benutzer entfernen. |
| [`users token create`](#create-a-token) | Ein API-Token für einen Benutzer erstellen. |
| [`users token list`](#list-tokens) | Die API-Tokens eines Benutzers auflisten. |
| [`users totp enable`](#totp-management) | TOTP für einen Benutzer aktivieren. |
| [`users totp show`](#totp-management) | Die TOTP-Details eines Benutzers anzeigen. |
| [`users totp disable`](#totp-management) | TOTP für einen Benutzer deaktivieren. |

## Einen Benutzer hinzufügen {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Flag | Beschreibung |
|------|--------------|
| `--login` | Login des Benutzers. **Erforderlich.** |
| `--name` | Anzeigename des Benutzers. **Erforderlich.** |
| `--email` | E-Mail-Adresse des Benutzers. **Erforderlich.** |
| `--password` | Passwort des Benutzers. Für reguläre Benutzer erforderlich; für externe Benutzer nicht zulässig. |
| `--admin` | Den neuen Benutzer als Admin kennzeichnen. |
| `--external` | Den neuen Benutzer als extern (LDAP oder OIDC) kennzeichnen. Externen Benutzern darf kein `--password` übergeben werden. |

Bei Erfolg gibt der Befehl `User <login> <email> added!` aus.

## Einen Benutzer ändern {#change-a-user}

Sie können den zu ändernden Benutzer entweder über den Login oder über die
E-Mail-Adresse finden.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Flag | Beschreibung |
|------|--------------|
| `--login` | Bei `change-by-login` der Login des zu suchenden Benutzers (**erforderlich**). Bei `change-by-email` der neue Login des Benutzers. |
| `--email` | Bei `change-by-email` die E-Mail-Adresse des zu suchenden Benutzers (**erforderlich**). Bei `change-by-login` die neue E-Mail-Adresse des Benutzers. |
| `--name` | Neuer Name des Benutzers. |
| `--password` | Neues Passwort des Benutzers. |
| `--admin` | Admin-Rechte gewähren. |

Nur die angegebenen Flags werden angewendet; weggelassene Felder bleiben unverändert.
`--admin` kann Admin-Rechte nur gewähren, nicht entziehen; verwenden Sie dafür die
Weboberfläche.

## Einen Benutzer anzeigen {#show-a-user}

Gibt die Details eines einzelnen Benutzers aus, der über Login oder E-Mail-Adresse
gesucht wird.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

Mindestens eines von `--login` oder `--email` ist erforderlich. Die Ausgabe enthält
ID, Erstellungszeitpunkt, Login, Name, E-Mail-Adresse und Admin-Status des Benutzers.
Wird kein passender Benutzer gefunden, gibt der Befehl eine Meldung aus und beendet
sich mit einem Exit-Status ungleich null.

## Benutzer auflisten {#list-users}

Gibt die Logins aller Benutzer aus, einen pro Zeile.

```bash
semaphore user list
```

## Einen Benutzer löschen {#delete-a-user}

Entfernt einen Benutzer, der über Login oder E-Mail-Adresse gesucht wird.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

Mindestens eines von `--login` oder `--email` ist erforderlich.

## API-Token-Verwaltung {#api-token-management}

Verwalten Sie die API-Tokens eines Benutzers über die CLI:

```bash
semaphore user token --help
```

### Ein Token erstellen {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Flag | Beschreibung |
|------|--------------|
| `--login` | Login des Token-Besitzers. **Erforderlich.** |
| `--name` | Name des Tokens. |
| `--ttl` | Lebensdauer des Tokens als Go-Duration (z. B. `1h`, `30m`, `24h`). Ohne Angabe läuft das Token nie ab. |

Der Befehl gibt das neue Token in einer eigenen Zeile und sonst nichts aus, sodass es
sich sicher in einem Skript erfassen lässt:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

Ein ungültiger `--ttl`-Wert oder ein unbekannter Login wird gemeldet, und der Befehl
beendet sich mit einem Exit-Status ungleich null.

### Tokens auflisten {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` ist erforderlich. Jede Zeile enthält, durch Tabulatoren getrennt, den Namen
des Tokens, seinen Status (`active` oder `expired`) und seinen Ablaufzeitpunkt im
RFC-3339-Format (`never`, falls es nicht abläuft). Token-Werte werden nie ausgegeben.

## TOTP-Verwaltung {#totp-management}

Verwalten Sie die Verifizierung per zeitbasiertem Einmalpasswort (2FA) über die CLI:

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Alle TOTP-Unterbefehle erfordern `--login`.

- `enable` gibt einen einmaligen Wiederherstellungscode, die `otpauth://`-URL und
  einen scannbaren QR-Code aus. Bewahren Sie den Wiederherstellungscode an einem
  sicheren Ort auf. Der Befehl schlägt fehl, wenn TOTP für den Benutzer bereits
  aktiviert ist.
- `show` gibt die `otpauth://`-URL und den QR-Code erneut aus, oder `TOTP disabled`,
  wenn für den Benutzer kein TOTP eingerichtet ist.
- `disable` entfernt die TOTP-Verifizierung des Benutzers. Der Befehl schlägt fehl,
  wenn TOTP nicht aktiviert ist.

Der in Authenticator-Apps angezeigte Aussteller stammt aus der Konfigurationsoption
`mfa.totp.app_name` (`SEMAPHORE_TOTP_ISSUER`). Der Standardwert ist `Semaphore`.
