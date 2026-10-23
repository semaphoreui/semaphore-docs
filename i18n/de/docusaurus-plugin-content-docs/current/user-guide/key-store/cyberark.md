---
title: CyberArk-Secret-Speicher
description: Enterprise-Option zum Lesen und Speichern von Key-Store-Secrets in CyberArk Privileged Access Manager über die PVWA-REST-API.
sidebar_custom_props:
  edition: pro
---

# CyberArk-Secret-Speicher <Enterprise />

Semaphore UI Enterprise kann **CyberArk Privileged Access Manager** (PAM Self-Hosted oder Privilege Cloud) als externen Speicher für Key-Store-Secrets anstelle der Datenbank verwenden. Semaphore kommuniziert mit der Password Vault Web Access (PVWA) REST-API: Jeder Semaphore-Schlüssel entspricht einem CyberArk-**Konto** in einem **Safe**.

## Konfigurationsoptionen {#configuration-options}

Wenn Sie unter **Key Store → Speicher** einen **CyberArk**-Speicher erstellen, konfigurieren Sie:

| Feld | Beschreibung |
|-------|-------------|
| **Server-URL** | PVWA-Basisadresse, zum Beispiel `https://pvwa.example.com`. Ein nachgestelltes `/PasswordVault` wird akzeptiert. Erforderlich. |
| **TLS-Zertifikatsprüfung überspringen** | Deaktiviert die Zertifikatsprüfung. Nur für Testumgebungen. |
| **Authentifizierungsmethode** | PVWA-Anmeldemethode für den Semaphore-Benutzer: `CyberArk` (Standard), `LDAP`, `RADIUS` oder `Windows`. |
| **Benutzername** | Der PVWA-Benutzer, mit dem sich Semaphore anmeldet. Erforderlich. |
| **Passwort** | Passwort dieses Benutzers. Kann in der Datenbank gespeichert, aus einer Umgebungsvariable gelesen oder aus einer Datei geladen werden. |
| **Standard-Safe** | Safe, der verwendet wird, wenn ein Schlüssel ein Konto ohne Safe-Präfix referenziert, und der Standard-Sync-Pfad. |
| **Plattform-ID für neue Konten** | Plattform, die von Semaphore erstellten Konten zugewiesen wird (z. B. `UnixSSH`). Nur erforderlich, wenn der Speicher nicht schreibgeschützt ist und Sie Schlüssel aus Semaphore erstellen. |
| **Adresse für neue Konten** | Optionale Adresseigenschaft für von Semaphore erstellte Konten. Einige Plattformen erfordern dies. |

Der Speicher kann im Nur-Lese-Modus betrieben werden. In diesem Modus liest und synchronisiert Semaphore nur Konten und erstellt, aktualisiert oder löscht nichts im Tresor.

### Erforderliche PVWA-Berechtigungen {#required-pvwa-permissions}

Gewähren Sie dem Semaphore-Benutzer die folgenden Berechtigungen für jeden verwendeten Safe:

| Operation | Safe-Berechtigungen |
|-----------|--------------------|
| Schlüssel lesen, Sync | **Konten auflisten**, **Konten abrufen** |
| Schlüssel aus Semaphore erstellen | **Konten hinzufügen** |
| Schlüssel aus Semaphore aktualisieren | **Passwortwert aktualisieren**, **Kontoeigenschaften aktualisieren** |
| Schlüssel aus Semaphore löschen | **Konten löschen** |

Semaphore fordert immer eine gleichzeitige PVWA-Sitzung (`concurrentSession`) an, sodass mehrere Semaphore-Knoten oder eine laufende Aufgabe und ein geplanter Sync denselben Benutzer teilen können, ohne sich gegenseitig abzumelden. Dies erfordert PVWA 11.3 oder neuer.

:::warning
Aktivieren Sie nicht "Begründung erforderlich" oder Ticket-System-Integrationen für Safes, die von Semaphore verwendet werden. Semaphore sendet eine feste Begründung, kann jedoch keine Ticketnummern bereitstellen.
:::

## Verwendung {#how-to-use}

1. Öffnen Sie in Ihrem Projekt **Key Store → Speicher** und erstellen Sie einen **CyberArk**-Speicher.
2. Wählen Sie beim Erstellen oder Bearbeiten eines Schlüssels diesen Speicher aus und geben Sie das Konto als `Safe/AccountName` an. Der Kontoname ist der in PVWA angezeigte Objektname. Wenn der Speicher einen Standard-Safe hat, reicht `AccountName` allein aus.
3. Konfigurieren Sie optional [Sync-Pfade](/user-guide/key-store/secret-sync), um ganze Safes automatisch nach Zeitplan zu importieren.

### Zuordnung von Schlüsseltypen {#key-type-mapping}

| Semaphore-Schlüsseltyp | CyberArk-Konto |
|------------------------|----------------|
| **Anmeldung mit Passwort** | Passwort-Konto: `userName` wird zum Login, das Konto-Secret zum Passwort. |
| **SSH** | Schlüssel-Konto (`secretType: key`): `userName` wird zum Login, das Konto-Secret ist der private Schlüssel. SSH-Schlüssel mit Passphrase können nicht in CyberArk gespeichert werden. |
| **Secret / Zeichenkette** | Passwort-Konto ohne Benutzernamen. Das Konto-Secret wird unverändert verwendet. |

Wenn Semaphore ein Konto erstellt, wird die automatische Verwaltung durch den Central Policy Manager (CPM) deaktiviert, damit CyberArk ein gerade geschriebenes Secret nicht sofort rotiert. Wenn CyberArk die Anmeldedaten rotieren soll, verwalten Sie das Konto über PVWA und markieren Sie den Speicher in Semaphore als schreibgeschützt.

## Secrets synchronisieren {#syncing-secrets}

Ein Sync-Pfad ist der Name eines Safes. Semaphore importiert jedes Konto des Safes als Schlüssel, der nach dem Konto benannt ist (mit dem optionalen Präfix). Der Schlüsseltyp wird aus dem Konto erkannt: Schlüsselkonten werden zu SSH-Schlüsseln, Passwortkonten mit Benutzernamen zu Anmeldung-mit-Passwort-Schlüsseln und Passwortkonten ohne Benutzernamen zu einfachen Secrets. Siehe [Secrets aus entfernten Speichern synchronisieren](/user-guide/key-store/secret-sync).
