---
title: "Devolutions Server als Secret-Speicher"
---

# Devolutions Server als Secret-Speicher <Enterprise />

Semaphore UI unterstützt Devolutions Server als Speicher für Secrets. 

![](/assets/dvls1.webp)

Sie können die folgenden Optionen angeben:
- **Devolutions-Server-URL** — Adresse Ihres Devolutions-Servers.
- **Vault-ID** — die Kennung des Vaults, in dem die Secrets gespeichert sind.
- **App-Schlüssel** — der Anwendungsschlüssel, der zur Authentifizierung verwendet wird.
- **Token** — Authentifizierungstoken. Das Token kann:
    - In der Datenbank gespeichert werden.
    - Über eine Umgebungsvariable bereitgestellt werden.
    - Über eine Datei bereitgestellt werden.

Der Speicher kann im Nur-Lese-Modus betrieben werden.
