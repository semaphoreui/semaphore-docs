# Integrationen

Integrationen ermöglichen die Interaktion zwischen Semaphore und externen Diensten wie GitHub und GitLab.

![Liste der Integrationen](/assets/integrations-list.webp)

Die Webhook-URL des Projekts wird oberhalb der Liste angezeigt. Jede Integration hat einen Namen und die Vorlage, die sie startet; klicken Sie auf eine Integration, um ihre Matcher und Wert-Extraktoren zu konfigurieren.

![Details einer Integration](/assets/integration-detail.webp)

Über eine Integration können Sie eine bestimmte Vorlage auslösen, indem Sie einen speziellen Endpunkt (Alias) aufrufen, für den Sie eine der folgenden Authentifizierungsmethoden konfigurieren können:
* GitHub-Webhooks
* Token
* HMAC (SHA-256)
* HMAC (SHA-512)
* Keine Authentifizierung

Der Alias ist eine URL im folgenden Format: `/api/integrations/<random_string>`. Unterstützt werden `GET`- und `POST`-Anfragen.

## HMAC-Authentifizierung {#hmac-authentication}

Die HMAC-Authentifizierungsmethoden (`hmac` / SHA-256 und `hmac-sha512` / SHA-512) prüfen, ob der Webhook-Body mit einem gemeinsamen Geheimnis signiert wurde.

Konfigurieren Sie:

1. **Auth header** — den Anfrage-Header, der die Signatur enthält (zum Beispiel `X-Signature` oder `X-Hub-Signature-256`).
2. **Auth secret** — einen Login/Passwort-Zugang aus dem Schlüsselspeicher; Semaphore verwendet den **Passwortwert** als HMAC-Geheimnis.

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

Mit Matchern können Sie Parameter der eingehenden Anfrage definieren. Wenn diese Parameter übereinstimmen, wird die Vorlage aufgerufen.

## Wert-Extraktoren {#value-extractors}

Mit einem Extraktor können Sie Daten aus dem Header oder dem Body der Anfrage (JSON-Feld oder Zeichenkette) übernehmen und an die Aufgabe übergeben. Jeder extrahierte Wert hat einen **Variablentyp**:

* **Environment**: Der Wert wird den Umgebungsvariablen der Aufgabe hinzugefügt und überschreibt eine gleichnamige Variable aus der Variablengruppe.
* **Task parameter**: Der Wert wird zu einem Aufgabenparameter, zum Beispiel zu einer Survey-Variable oder einem Prompt.

## Aufgabenparameter {#task-parameters}

Integrationen können Aufgaben mit Parametern auslösen. Verwenden Sie Wert-Extraktoren, um eine JSON-Payload für die Aufgabenparameter zu erstellen, und konfigurieren Sie die Vorlage so, dass sie abgefragte Werte akzeptiert.

## Hinweise zu Aliassen und Matchern {#notes-on-aliases-and-matchers}

Ein Projekt-Alias (die URL oberhalb der Integrationsliste) wird von allen Integrationen des Projekts gemeinsam genutzt: Semaphore prüft die Matcher jeder Integration und startet die Vorlagen, deren Matcher zutreffen. Eine Integration kann außerdem ihren eigenen Alias haben; Anfragen an diesen starten die jeweilige Integration, ohne Matcher auszuwerten. Bevorzugen Sie bei Bedarf Token-/HMAC-Authentifizierung und übergeben Sie Parameter über Extraktoren.
