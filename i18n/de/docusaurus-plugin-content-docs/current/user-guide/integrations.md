---
title: Integrationen
description: Vorlagen und Workflows über eingehende Webhooks starten – mit Endpunkten, Integrationsgruppen, Authentifizierungsmethoden, Matchern und Wert-Extraktoren.
---

# Integrationen

Integrationen ermöglichen es externen Diensten wie GitHub, GitLab oder einem CI-Server, Aufgaben in Semaphore zu starten, indem sie eine Webhook-URL aufrufen. Drei Objekte beschreiben eine Integration: Ein **Endpunkt** legt fest, wo die Anfrage eintrifft und wie sie authentifiziert wird, eine **Integrationsgruppe** legt fest, welche Integrationen von diesem Endpunkt aus laufen, und eine **Integration** legt fest, was mit welchen Parametern gestartet wird.

![Liste der Integrationen](/assets/integrations-list.webp)

## Funktionsweise {#how-it-works}

| Objekt | Was es enthält | Wo |
|---|---|---|
| **Endpunkt** | Einen Namen und eine Beschreibung, einen oder mehrere **Aliasse** (öffentliche URLs im Format `/api/integrations/<random_string>`) sowie die **Authentifizierung**, mit der jede Anfrage an diese URLs geprüft wird. | Projekt → **Endpunkte** |
| **Integrationsgruppe** | Eine Menge von Integrationen, die von einem Endpunkt aus laufen. Eine Gruppe übernimmt normalerweise die Authentifizierung des Endpunkts; sie kann sie mit einer eigenen Methode und einem eigenen Geheimnis **überschreiben**. | Projekt → **Integrationen**, ein Abschnitt pro Gruppe |
| **Integration** | Die zu startende Vorlage oder der Workflow (Pro), ihre Aufgabenparameter, die [Matcher](#matchers), die Anfragen filtern, und die [Wert-Extraktoren](#value-extractors), die die Aufgabe mit Daten versorgen. | Innerhalb ihrer Gruppe |

Wenn eine Anfrage an einem Alias eintrifft, ermittelt Semaphore den Endpunkt, prüft die Anfrage gegen die Authentifizierung jeder Gruppe (die des Endpunkts oder die eigene der Gruppe) und startet jede Integration einer autorisierten Gruppe, deren Matcher die Anfrage alle akzeptieren. Eine Integration ohne Matcher läuft bei jeder autorisierten Anfrage. Die Antwort ist immer `204 No Content`; die Header `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` und `X-Semaphore-Task-ID` benennen, was gestartet wurde. `GET` und `POST` werden akzeptiert.

![Details einer Integration](/assets/integration-detail.webp)

Die Alias-Zeichenkette ist das einzige Geheimnis eines nicht authentifizierten Endpunkts: Behandeln Sie die URL wie ein Passwort und entfernen Sie einen Alias, um ihn zu widerrufen. Ein Endpunkt kann mehrere Aliasse haben, sodass Sie jedem Absender eine eigene URL geben und sie einzeln widerrufen können.

## Authentifizierung {#authentication}

Ein Endpunkt – oder eine Gruppe, die ihn überschreibt – prüft Anfragen mit einer der folgenden Methoden:

* **GitHub-Webhooks** — der Header `X-Hub-Signature-256`, HMAC-SHA256 des Bodys mit dem Geheimnis
* **Bitbucket-Webhooks** — der Header `x-hub-signature`, HMAC-SHA256 des Bodys
* **Token** — ein Header Ihrer Wahl muss dem Geheimnis entsprechen
* **HMAC (SHA-256)** und **HMAC (SHA-512)** — ein Header Ihrer Wahl enthält die Signatur des Bodys
* **BasicAuth** — Login und Passwort eines Login/Passwort-Zugangs
* **Keine Authentifizierung** — jede Anfrage mit einer gültigen Alias-URL wird durchgelassen

Das Geheimnis stammt aus dem [Schlüsselspeicher](./key-store) des Projekts: ein Schlüssel vom Typ **Zeichenkette** (sein Wert ist das Geheimnis) oder ein **Login/Passwort**-Zugang (sein Passwort ist das Geheimnis). BasicAuth ist die Ausnahme: Es prüft zusätzlich den Login und benötigt daher einen Login/Passwort-Zugang. Das Formular bietet nur Schlüssel an, deren Typ zur Methode passt, und die API lehnt die übrigen ab.

## HMAC-Authentifizierung {#hmac-authentication}

Die HMAC-Authentifizierungsmethoden (`hmac` / SHA-256 und `hmac-sha512` / SHA-512) prüfen, ob der Webhook-Body mit einem gemeinsamen Geheimnis signiert wurde.

Konfigurieren Sie am Endpunkt (oder an der Gruppe, die ihn überschreibt):

1. **Auth header** — den Anfrage-Header, der die Signatur enthält (zum Beispiel `X-Signature`).
2. **Auth secret** — einen Schlüssel vom Typ **Zeichenkette** aus dem Schlüsselspeicher oder einen Login/Passwort-Zugang.

Der Absender muss einen **reinen hexadezimalen** HMAC-Digest des unveränderten Anfrage-Bodys in diesen Header schreiben (ohne Präfix `sha256=` / `sha512=`). Semaphore vergleicht ihn mit dem `HMAC-SHA256`- oder `HMAC-SHA512`-Wert des Bodys, der mit dem konfigurierten Geheimnis berechnet wurde.

Beispiel (SHA-512) mit OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Matcher {#matchers}

Matcher beschreiben die Anfragen, auf die eine Integration reagiert: ein Header oder ein Body-Feld (JSON-Pfad oder der gesamte Body als Zeichenkette), das mit einem Wert verglichen wird. Alle Matcher einer Integration müssen zutreffen; eine Integration ohne Matcher läuft bei jeder Anfrage, die ihre Gruppe durchlässt. Verwenden Sie Matcher, um verschiedene Integrationen eines Endpunkts für verschiedene Ereignisse auszuführen – zum Beispiel eine Vorlage für `push` und eine andere für `release`.

## Wert-Extraktoren {#value-extractors}

Mit einem Extraktor können Sie Daten aus dem Header oder dem Body der Anfrage (JSON-Feld oder Zeichenkette) übernehmen und an die Aufgabe übergeben. Jeder extrahierte Wert hat einen **Variablentyp**:

* **Environment**: Der Wert wird den Umgebungsvariablen der Aufgabe hinzugefügt und überschreibt eine gleichnamige Variable aus der Variablengruppe.
* **Task parameter**: Der Wert wird zu einem Aufgabenparameter, zum Beispiel zu einer Survey-Variable oder einem Prompt.

## Aufgabenparameter {#task-parameters}

Integrationen können Aufgaben mit Parametern auslösen. Verwenden Sie Wert-Extraktoren, um eine JSON-Payload für die Aufgabenparameter zu erstellen, und konfigurieren Sie die Vorlage so, dass sie abgefragte Werte akzeptiert.

## Upgrade von älteren Versionen {#upgrading-from-older-versions}

Vor Version 2.20.19 trug eine Integration ihre eigene Authentifizierung, und Aliasse existierten entweder für das gesamte Projekt oder für eine einzelne Integration. Das Upgrade konvertiert diese Konfiguration, ohne zu ändern, was eine bestehende URL bewirkt:

| Vorher | Nach dem Upgrade |
|---|---|
| Projekt-Aliasse (die URL oberhalb der Integrationsliste) | Ein Endpunkt namens **Default** ohne Authentifizierung, der sie alle enthält |
| Eine Integration, die über den Projekt-Alias erreichbar war („Projekt-Alias verwenden" aktiviert) | Eine eigene Gruppe am Endpunkt **Default**. Hatte die Integration eine Authentifizierung, **überschreibt** die Gruppe damit die des Endpunkts |
| Eine Integration mit eigenen Aliassen | Ein nach der Integration benannter Endpunkt mit ihren Aliassen und ihrer Authentifizierung sowie eine eigene Gruppe an diesem Endpunkt |
| Matcher und Wert-Extraktoren | Unverändert |

Jede Integration landet allein in einer nach ihr benannten Gruppe; anschließend können Sie Gruppen beliebig zusammenführen oder Endpunkte umbenennen. Zwei Details unterscheiden sich vom alten Verhalten: Eine Integration hinter dem Projekt-Alias ohne Matcher lief früher nie und läuft jetzt bei jeder autorisierten Anfrage, und die eigenen Aliasse einer Integration, die zugleich den Projekt-Alias nutzte (und die nie auf etwas zutrafen), werden verworfen. Projekt-Backups, die mit einer älteren Version erstellt wurden, werden beim Wiederherstellen auf dieselbe Weise konvertiert.
