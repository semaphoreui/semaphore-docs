---
title: Authentifizierung
description: Die drei Möglichkeiten, wie sich Benutzer bei Semaphore anmelden – lokale Konten, LDAP und OpenID Connect –, wie sie sich kombinieren lassen und wie Identitäten verknüpft werden.
---

# Authentifizierung

Semaphore bietet drei Möglichkeiten, die Identität einer Person festzustellen. Sie sind
voneinander unabhängig und können alle gleichzeitig aktiv sein, sodass der Anmeldebildschirm
ein Passwortformular, eine Verzeichnisanmeldung und eine Schaltfläche pro Identitätsanbieter
anbieten kann.

| Methode | Wer prüft das Passwort | Wann Sie sie einsetzen |
|---|---|---|
| [Lokale Konten](/admin-guide/authentication/local) | Semaphore, gegen seine eigene Datenbank | Sie haben kein Verzeichnis oder benötigen einen Notfall-Administrator. |
| [LDAP und Active Directory](/admin-guide/authentication/ldap) | Ihr Verzeichnisserver | Die Personen existieren bereits in LDAP oder AD und Sie möchten nur einen Satz Zugangsdaten. |
| [OpenID Connect](/admin-guide/authentication/openid) | Ihr Identitätsanbieter | Sie nutzen Single Sign-on: Keycloak, Okta, Entra ID, Google, GitHub und andere. |

Die Authentifizierung beantwortet nur, *wer* der Benutzer ist. Was er tun darf, wird
getrennt davon entschieden – über seine Serverrolle und über seine Rolle in jedem Projekt,
siehe [Teams](/user-guide/team).

## Wie ein Benutzerdatensatz entsteht {#how-a-user-record-comes-to-exist}

Jede Person, die sich anmeldet, hat einen Datensatz in der Semaphore-Datenbank, unabhängig
von der verwendeten Methode. Ein lokales Konto wird von einem Administrator oder mit
`semaphore user add` angelegt. Ein LDAP- oder OIDC-Konto entsteht bei der ersten
erfolgreichen Anmeldung, und Semaphore speichert dazu eine **externe Identität**: die
Provider-ID zusammen mit der Benutzer-ID, die dieser Anbieter zurückgegeben hat.

Diese externe Identität ist das, worauf spätere Anmeldungen abgeglichen werden. Das
Umbenennen einer Person im Verzeichnis erzeugt daher kein zweites Konto. Sorgfalt erfordert
dagegen die *erste* Anmeldung eines bereits vorhandenen Benutzers, für den noch keine externe
Identität existiert. Die Option `external_auth_email_matching` entscheidet, was dann passiert:

| Wert | Verhalten |
|---|---|
| `auto` (Standard) | Verknüpfung über die E-Mail-Adresse, aber nur für externe Benutzer, die noch keine Identität haben. Damit werden vor 2.20 angelegte Konten einmalig übernommen, sonst nichts. |
| `always` | Verknüpfung über die E-Mail-Adresse für jeden externen Benutzer. Nutzen Sie das, wenn sich eine Person über mehrere Anbieter anmeldet. |
| `never` | Niemals über die E-Mail-Adresse verknüpfen; Identitäten werden ausschließlich über die Provider-ID abgeglichen. |

Lokale Passwortkonten werden in keinem Modus über die E-Mail-Adresse abgeglichen. Ein
OIDC-Anbieter, bei dem ein Benutzer seine E-Mail-Adresse selbst wählen kann, ließe sich sonst
dazu missbrauchen, das Konto eines Administrators zu übernehmen.

:::warning
Die Provider-ID – der Schlüssel in `oidc_providers` oder `ldap_providers` – ist Teil jeder
gespeicherten Identität. Ein Umbenennen macht die darauf verweisenden Identitäten
verwaist, und die betroffenen Benutzer erhalten bei der nächsten Anmeldung neue, leere Konten.
Wählen Sie sie einmalig.
:::

## Methoden kombinieren {#combining-methods}

Ein realistisches Setup aktiviert Single Sign-on für die Benutzer und behält einen lokalen
Administrator für den Tag, an dem der Identitätsanbieter nicht erreichbar ist:

1. Konfigurieren Sie den Anbieter und bestätigen Sie, dass sich ein echter Benutzer darüber anmelden kann.
2. Geben Sie diesem Benutzer die Rollen, die er benötigt.
3. Behalten Sie ein lokales Administratorkonto mit einem starken Passwort und aktiviertem
   [TOTP](/admin-guide/authentication/local#two-factor-authentication).
4. Setzen Sie `password_login_disable`, damit alle anderen keine Passwörter mehr verwenden können.

Halten Sie diese Reihenfolge ein. `password_login_disable` vor Schritt 1 zu setzen funktioniert
genau wie angekündigt und sperrt Sie aus Ihrem eigenen Server aus.

## In diesem Abschnitt {#in-this-section}

| Seite | Inhalt |
|---|---|
| [Lokale Konten](/admin-guide/authentication/local) | Passwörter, TOTP, einmalige Codes per E-Mail, Sitzungsdauer und das Abschalten der Passwortanmeldung. |
| [LDAP und Active Directory](/admin-guide/authentication/ldap) | Bind an ein Verzeichnis, Suchfilter, Attributzuordnungen und TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | Anbieterkonfiguration, Claim-Ausdrücke, IdP-initiierte Anmeldung und zwölf ausgearbeitete Anbieterbeispiele. |

## Womit Sie beginnen {#where-to-start}

Eine neue Installation enthält bereits den bei der Einrichtung angelegten lokalen
Administrator. Beginnen Sie daher mit [Lokalen Konten](/admin-guide/authentication/local),
um dieses Konto abzusichern, und ergänzen Sie anschließend
[OpenID Connect](/admin-guide/authentication/openid) oder
[LDAP](/admin-guide/authentication/ldap) für alle anderen.
