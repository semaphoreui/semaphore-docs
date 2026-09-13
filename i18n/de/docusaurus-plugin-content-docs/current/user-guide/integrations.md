# Integrationen

Integrationen ermöglichen die Interaktion zwischen Semaphore und externen Diensten wie GitHub und GitLab.

![Liste der Integrationen](/assets/integrations-list.webp)

Die Webhook-URL des Projekts wird oberhalb der Liste angezeigt. Jede Integration hat einen Namen und die Vorlage, die sie startet; klicken Sie auf eine Integration, um ihre Matcher und Wert-Extraktoren zu konfigurieren.

![Details einer Integration](/assets/integration-detail.webp)

Über eine Integration können Sie eine bestimmte Vorlage auslösen, indem Sie einen speziellen Endpunkt (Alias) aufrufen, für den Sie eine der folgenden Authentifizierungsmethoden konfigurieren können:
* GitHub-Webhooks
* Token
* HMAC
* Keine Authentifizierung

Der Alias ist eine URL im folgenden Format: `/api/integrations/<random_string>`. Unterstützt werden `GET`- und `POST`-Anfragen.

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
