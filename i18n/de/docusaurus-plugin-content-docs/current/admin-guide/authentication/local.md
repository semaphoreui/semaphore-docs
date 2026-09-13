---
title: Lokale Konten
description: Passwortanmeldung gegen die Semaphore-Datenbank – wie Passwörter gespeichert werden, TOTP-Zwei-Faktor-Authentifizierung, Sitzungsdauer und das Abschalten von Passwörtern.
---

# Lokale Konten

Ein lokales Konto speichert sein Passwort in der Semaphore-Datenbank. Jede Installation
beginnt mit einem solchen Konto, angelegt durch `semaphore setup` oder durch die
`SEMAPHORE_ADMIN_*`-Variablen, und über dieses Konto erreichen Sie den Server, bevor es
einen Identitätsanbieter gibt.

Behalten Sie mindestens einen lokalen Administrator, auch wenn Single Sign-on funktioniert.
Es ist der einzige Weg zurück, wenn der Identitätsanbieter nicht erreichbar ist.

## Wie Passwörter gespeichert werden {#how-passwords-are-stored}

Passwörter werden mit **Argon2id** und den OWASP-Mindestparametern gehasht, und die
Parameter werden zusammen mit jedem Hash im
[PHC-String-Format](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md)
festgehalten. Versionen vor 2.20 verwendeten bcrypt; diese Hashes funktionieren weiterhin
und werden bei der nächsten erfolgreichen Anmeldung des Besitzers jeweils durch einen
Argon2id-Hash ersetzt. Konten, die sich nie wieder anmelden, behalten ihren bcrypt-Hash –
setzen Sie deren Passwörter zurück, um sie zu aktualisieren.

Die vollständige Parametertabelle finden Sie unter [Sicherheit](/admin-guide/security#password-hashing).

Semaphore erzwingt keine Passwortrichtlinie – keine Mindestlänge, keine Komplexität, kein
Ablauf. Wenn Sie eine benötigen, verwenden Sie ein Verzeichnis oder einen Identitätsanbieter,
denn dorthin gehören solche Richtlinien.

## Konten verwalten {#manage-accounts}

Administratoren verwalten Benutzer in der Weboberfläche, und dieselben Operationen gibt es
auf der Kommandozeile – für Skripte und für die Wiederherstellung, wenn sich niemand mehr
anmelden kann:

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

Alle Flags finden Sie unter [`semaphore users`](/reference/cli/users), und unter
[Teams](/user-guide/team) steht, was eine Rolle einem Benutzer erlaubt, sobald er angemeldet ist.

:::warning
Ein Passwort auf der Kommandozeile landet in Ihrer Shell-History und in der Prozessliste der
Maschine. Verwenden Sie es für den ersten Administrator und für die Wiederherstellung und
ändern Sie das Passwort danach über die Weboberfläche.
:::

## Zwei-Faktor-Authentifizierung {#two-factor-authentication}

Semaphore unterstützt TOTP: die sechsstelligen Codes, die von Google Authenticator, Aegis,
1Password und ähnlichen Apps erzeugt werden. Es ist standardmäßig deaktiviert und gilt nur für
die Konten, die es aktivieren – es wird niemandem aufgezwungen.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| Option | Wirkung |
|---|---|
| `mfa.totp.enabled` | Erlaubt Benutzern, TOTP für ihr Konto einzurichten. Ohne diese Option kann sich niemand registrieren. |
| `mfa.totp.allow_recovery` | Gibt bei der Einrichtung einen Wiederherstellungscode aus, damit ein verlorenes Telefon kein verlorenes Konto bedeutet. Seine Eingabe **entfernt die TOTP-Einrichtung** und meldet den Benutzer an; er richtet TOTP anschließend erneut ein. Der Code wird als bcrypt-Hash gespeichert. |
| `mfa.totp.app_name` | Die Aussteller-Bezeichnung, die die Authenticator-App anzeigt. Setzen Sie sie, wenn Sie mehr als ein Semaphore betreiben. |

Benutzer richten TOTP auf ihrer eigenen Kontoseite ein. Ein Administrator kann den zweiten
Faktor einer Person, die ihr Gerät verloren hat, einsehen oder entfernen:

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

`mfa.totp.enabled` wieder auszuschalten löscht keine bestehenden Einrichtungen; es sorgt nur
dafür, dass der zweite Faktor nicht mehr abgefragt wird. Schalten Sie es wieder ein, gelten die
alten Einrichtungen erneut.

## Sitzungsdauer {#session-lifetime}

Eine Sitzung läuft nach **sieben Tagen ohne Aktivität** ab. Dieses Inaktivitäts-Zeitlimit ist
fest eingebaut und nicht konfigurierbar.

Ein absolutes Limit ist es dagegen schon, und es wird ab dem Zeitpunkt der Anmeldung gemessen
und nicht ab der letzten Anfrage, sodass auch eine aktiv genutzte Sitzung endet:

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

Der Standardwert `0` bedeutet kein absolutes Limit. Setzen Sie ihn dort, wo ein gemeinsam
genutzter Arbeitsplatz oder eine Compliance-Vorgabe verlangt, dass sich Personen regelmäßig
erneut authentifizieren.

## Passwortanmeldung abschalten {#turn-password-sign-in-off}

Sobald ein Identitätsanbieter konfiguriert ist und Sie überprüft haben, dass sich ein echter
Benutzer darüber anmelden kann, weist `password_login_disable` die Passwortmethode vollständig
zurück:

```json
{
  "password_login_disable": true
}
```

LDAP und OpenID Connect sind davon nicht betroffen. Bestehende lokale Konten behalten ihre
Rollen und ihre Historie; sie haben lediglich keine Möglichkeit mehr, sich zu authentifizieren.

:::danger
Diese Option wirkt sofort und gilt für jedes lokale Konto, auch für Ihres. Stellen Sie sicher,
dass Single Sign-on funktioniert – indem Sie sich damit anmelden, nicht indem Sie das Log
lesen –, bevor Sie sie setzen. Ein Fehler lässt sich nur beheben, indem Sie die
Konfigurationsdatei auf dem Server bearbeiten und neu starten.
:::

## Wie geht es weiter {#whats-next}

- [LDAP und Active Directory](/admin-guide/authentication/ldap) – Authentifizierung gegen ein Verzeichnis.
- [OpenID Connect](/admin-guide/authentication/openid) – Single Sign-on mit einem Identitätsanbieter.
- [Sicherheit](/admin-guide/security) – Hashing-Parameter, Verschlüsselung und Härtung.
