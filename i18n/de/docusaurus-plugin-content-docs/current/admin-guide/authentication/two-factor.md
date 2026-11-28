---
title: Zwei-Faktor-Authentifizierung
description: Wie die TOTP-Zwei-Faktor-Authentifizierung in Semaphore funktioniert, wie Sie sie für den Server einschalten, für ein Konto einrichten, sich mit einem Code anmelden und wieder Zugang erhalten.
---

# Zwei-Faktor-Authentifizierung

Die Zwei-Faktor-Authentifizierung (2FA) verlangt nach dem ersten Anmeldeschritt einen zweiten
Nachweis: einen sechsstelligen Code aus einer Authenticator-App auf dem Telefon des Benutzers.
Ein gestohlenes Passwort allein reicht dann nicht mehr aus, um hineinzukommen.

Semaphore setzt den zweiten Faktor mit TOTP um – zeitbasierten Einmalpasswörtern, dem Standard
hinter Google Authenticator, Microsoft Authenticator, Aegis, 1Password, Bitwarden und ähnlichen
Apps. Er ist in jeder Edition verfügbar.

## Wie es funktioniert {#how-it-works}

Zwei Schalter entscheiden, ob bei einer Anmeldung ein Code abgefragt wird:

- **Der Server** muss TOTP erlauben – die Option `mfa.totp.enabled`. Sie ist standardmäßig
  deaktiviert.
- **Das Konto** muss TOTP eingerichtet haben. Jeder Benutzer schaltet es für sein eigenes Konto
  ein; es wird niemandem aufgezwungen.

Sind beide eingeschaltet, durchläuft eine Anmeldung zwei Schritte:

1. Der Benutzer meldet sich wie gewohnt an – mit einem Passwort, über LDAP oder über einen
   OpenID-Connect-Anbieter. Der zweite Faktor gilt für alle drei.
2. Semaphore öffnet eine Sitzung, markiert sie aber als nicht verifiziert und fragt den Code ab.
   Bis der Code akzeptiert ist, wird jeder API-Aufruf in dieser Sitzung mit `401` und
   `{"error":"TOTP_REQUIRED"}` abgewiesen.
3. Der Benutzer gibt den Code ein, den die App anzeigt. Semaphore prüft ihn gegen das für das
   Konto gespeicherte Geheimnis; ein korrekter Code verifiziert die Sitzung, und der Benutzer
   ist angemeldet.

Der Code wechselt alle 30 Sekunden, und die App berechnet ihn aus einem Geheimnis, das sie
einmalig bei der Einrichtung des Kontos erhalten hat. Semaphore und das Telefon kommunizieren
nie miteinander, daher braucht das Telefon keine Netzwerkverbindung – nur eine ungefähr
richtig gehende Uhr.

## Für den Server einschalten {#turn-it-on-for-the-server}

Fügen Sie der Konfigurationsdatei den Abschnitt `mfa.totp` hinzu und starten Sie Semaphore neu:

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

Dieselben Einstellungen lassen sich als Umgebungsvariablen angeben:

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Option | Umgebungsvariable | Wirkung |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Erlaubt Benutzern, TOTP einzurichten, und sorgt dafür, dass bei der Anmeldung der Code abgefragt wird. Ohne diese Option wird die Einstellung niemandem angezeigt. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Gibt jedem Benutzer bei der Einrichtung von TOTP einen einmaligen [Wiederherstellungscode](#recovery-code) und erlaubt ihm, sich damit anzumelden, wenn das Telefon verloren ist. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | Der Ausstellername, den eine Authenticator-App neben dem Konto anzeigt. Standardwert ist `Semaphore`. Eine Änderung gilt nur für Konten, die danach eingerichtet werden. |

Jede Option ist außerdem in der
[Konfigurationsreferenz](/reference/configuration) aufgeführt.

## TOTP für Ihr Konto einrichten {#set-up-totp-for-your-account}

Installieren Sie zuerst eine Authenticator-App auf Ihrem Telefon. Dann:

1. Öffnen Sie ein Projekt, klicken Sie unten in der Seitenleiste auf Ihren Namen und wählen Sie
   **Edit Account**.
2. Öffnen Sie den Tab **Security**.
3. Schalten Sie unter **Two-factor authentication** die Option **Time-based one-time password**
   ein. Semaphore erzeugt sofort das Geheimnis und zeigt es als QR-Code an.
4. Fügen Sie in der Authenticator-App ein Konto hinzu und scannen Sie den QR-Code. Die App zeigt
   nun einen sechsstelligen Code für `Semaphore` oder für den in `mfa.totp.app_name` festgelegten
   Namen an.
5. Wenn unter dem QR-Code ein **Recovery code** angezeigt wird, kopieren Sie ihn mit der
   Schaltfläche daneben und bewahren Sie ihn sicher auf – in einem Passwortmanager oder auf
   Papier. Er wird nur jetzt angezeigt.
6. Schließen Sie den Dialog.

<div style={{maxWidth: 450}}>

![Der Tab Security des Dialogs Edit User mit eingeschalteter Zwei-Faktor-Authentifizierung: ein QR-Code zum Scannen und darunter ein Wiederherstellungscode](/assets/two-factor-enrol.webp)

</div>

Der Schalter wirkt sofort; es gibt kein **Save** zu drücken und keinen Testcode einzugeben.
Vergewissern Sie sich, dass die App einen Code für Semaphore anzeigt, bevor Sie sich abmelden –
die nächste Anmeldung fragt danach.

Sie können den Tab **Security** später erneut öffnen, um den QR-Code auf einem zweiten Gerät zu
scannen. Der Wiederherstellungscode wird nicht noch einmal angezeigt.

## Mit einem Code anmelden {#sign-in-with-a-code}

Nach dem Schritt mit Passwort, LDAP oder Single Sign-on zeigt Semaphore **Two-step verification**
an:

![Der Bildschirm Two-step verification, der nach dem sechsstelligen Code aus der Authenticator-App fragt](/assets/two-factor-verify.webp)

Geben Sie die sechs Ziffern ein, die die App gerade anzeigt. Das Formular wird nach der sechsten
Ziffer automatisch abgeschickt. Ein falscher oder veralteter Code zeigt einen Fehler an und lässt
Sie auf demselben Bildschirm; warten Sie auf den nächsten Code und versuchen Sie es erneut.

**Return to login** bricht diese Anmeldung ab und beginnt von vorn.

## Den Wiederherstellungscode verwenden {#recovery-code}

Wenn das Telefon verloren oder zurückgesetzt ist, verschafft der Wiederherstellungscode dem
Benutzer selbstständig wieder Zugang:

1. Melden Sie sich wie gewohnt mit Ihrem Passwort an.
2. Klicken Sie unter **Two-step verification** auf **Use recovery code**.
3. Geben Sie den Wiederherstellungscode ein und klicken Sie auf **Send**.

Semaphore meldet Sie an und **entfernt TOTP von Ihrem Konto**. Der Wiederherstellungscode ist
damit ebenfalls verbraucht. Richten Sie TOTP sofort erneut ein, wie
[oben](#set-up-totp-for-your-account) beschrieben, um ein neues Geheimnis und einen neuen
Wiederherstellungscode zu erhalten.

**Use recovery code** erscheint nur, wenn auf dem Server `mfa.totp.allow_recovery`
eingeschaltet ist. Wiederherstellungscodes sind 16 Zeichen lang und werden nur als bcrypt-Hash
gespeichert, sodass niemand – auch kein Administrator – den Code eines Benutzers später
auslesen kann.

## Den zweiten Faktor entfernen {#remove-the-second-factor}

**Ihr eigenes Konto.** Schalten Sie **Time-based one-time password** im Tab **Security** von
**Edit Account** aus. TOTP wird sofort entfernt, und die nächste Anmeldung fragt nur noch den
ersten Schritt ab. Löschen Sie den Semaphore-Eintrag auch aus Ihrer Authenticator-App; er passt
zu nichts mehr.

**Das Konto einer anderen Person.** Ein Benutzer, der sein Telefon verloren hat und keinen
Wiederherstellungscode besitzt, kann TOTP nicht selbst entfernen. Ein Administrator oder ein
Benutzer, dessen globale Rolle die Benutzerverwaltung erlaubt, öffnet **Users**, bearbeitet
diesen Benutzer und schaltet den Schalter im Tab **Security** aus. Der Benutzer meldet sich nur
mit dem Passwort an und richtet TOTP erneut ein.

### Den zweiten Faktor über die Kommandozeile verwalten {#manage-the-second-factor-from-the-command-line}

Auf dem Server geht dasselbe auch ohne Weboberfläche – nützlich, wenn der einzige Administrator
sein Telefon verloren hat:

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` richtet TOTP für einen Benutzer ein und gibt die
`otpauth://`-URL, einen QR-Code und einen Wiederherstellungscode im Terminal aus; `show` gibt
die URL und den QR-Code einer bestehenden Einrichtung aus. Beide geben das Geheimnis selbst aus,
führen Sie sie also nur dort aus, wo niemand sonst das Terminal sehen kann, und übergeben Sie
den QR-Code direkt seinem Besitzer. Die vollständige Syntax finden Sie unter
[`semaphore users`](/reference/cli/users#totp-management).

## Für den Server ausschalten {#turn-it-off-for-the-server}

Setzen Sie `mfa.totp.enabled` auf `false` oder entfernen Sie den Abschnitt und starten Sie neu.
Die Anmeldung fragt dann keine Codes mehr ab, und die Einstellung **Two-factor authentication**
verschwindet aus **Security**.

Keine Einrichtung wird gelöscht. Schalten Sie die Option wieder ein, fragt jedes Konto, das TOTP
hatte, erneut nach seinem Code – mit demselben Geheimnis, ohne dass etwas noch einmal gescannt
werden muss.

## Wissenswertes {#things-to-know}

- **API-Tokens umgehen den zweiten Faktor.** Eine Anfrage mit einem `Authorization: Bearer`-Token
  wird nie nach einem Code gefragt. Ein Token kann nur aus einer vollständig angemeldeten Sitzung
  erstellt werden, aber Tokens, die schon vor der Einrichtung von TOTP existierten, funktionieren
  weiter. Prüfen Sie sie nach dem Einschalten von TOTP auf der Seite **API Tokens**.
- **Semaphore begrenzt die Versuche für den Code nicht.** Sechs Ziffern sind ein kleiner Raum,
  setzen Sie daher in Ihrem [Reverse Proxy](/admin-guide/reverse-proxy) ein Rate Limit auf
  `POST /api/auth/verify` und `POST /api/auth/recovery`.
- **Das Geheimnis wird unverändert in der Datenbank gespeichert.** Wer die Tabelle `user__totp`
  oder ein Backup der Datenbank lesen kann, kann für jedes Konto gültige Codes erzeugen. Schützen
  Sie Backups so wie die Konfigurationsdatei.
- **TOTP kann nicht verpflichtend gemacht werden.** Semaphore hat keine Option, die Benutzer zur
  Einrichtung zwingt. Wenn Ihre Richtlinie für alle einen zweiten Faktor verlangt, setzen Sie ihn
  in Ihrem Identitätsanbieter durch und melden Sie die Benutzer über
  [OpenID Connect](/admin-guide/authentication/openid) an.

Das Einrichten, Entfernen und Verwenden des zweiten Faktors wird im
[Audit-Log](/admin-guide/audit-log) als `iam.mfa`- und `auth.mfa`-Ereignisse festgehalten; die
Liste finden Sie unter [Audit-Ereignisse](/reference/audit-events).

## Wie geht es weiter {#whats-next}

- [Lokale Konten](/admin-guide/authentication/local) – Passwörter, Sitzungsdauer und das
  Abschalten der Passwortanmeldung.
- [Sicherheit](/admin-guide/security) – Hashing-Parameter, Verschlüsselung und Härtung.
- [`semaphore users`](/reference/cli/users#totp-management) – die TOTP-Befehle.
