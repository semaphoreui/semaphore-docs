# Secrets aus entfernten Speichern synchronisieren

Semaphore kann sich mit einem externen Secret-Manager verbinden — etwa **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault** oder **Devolutions Server (DVLS)** — und Secrets daraus automatisch in den Key Store importieren. Anstatt Zugangsdaten von Hand in Semaphore zu kopieren und aktuell zu halten, verweisen Sie Semaphore auf Ihren entfernten Speicher, und Semaphore pflegt für Sie eine lokale Spiegelung.

**Sync-Pfade** sind die Regeln, die Semaphore mitteilen, *welche* Secrets aus einem entfernten Speicher importiert werden und *wie* sie nach dem Import benannt werden. Ein Secret-Manager kann Tausende von Secrets in vielen Ordnern enthalten; mit Sync-Pfaden wählen Sie nur die Teilbäume aus, die Sie interessieren, und steuern die Benennung der erstellten Schlüssel.

## Grundbegriffe {#key-concepts}

- **Entfernter Speicher** — eine konfigurierte Verbindung zu einem externen Secret-Manager, einschließlich seiner Adresse und der Zugangsdaten, mit denen Semaphore daraus liest.
- **Sync** — der Vorgang, bei dem Secrets aus dem entfernten Speicher gelesen und mit den in Semaphore gespeicherten Schlüsseln abgeglichen werden.
- **Sync-Pfad** — eine einzelne Importregel, bestehend aus einem *Pfad*, einem *Präfix* und einem *Trennzeichen*.

## Wie ein Sync-Pfad funktioniert {#how-a-sync-path-works}

Jeder Sync-Pfad hat drei Felder:

- **Pfad** — der Ort im entfernten Speicher, aus dem importiert wird. Das ist der Basisordner, das Präfix oder der Teilbaum, den Semaphore auflistet und liest. Alles, was darunter gefunden wird, kommt für den Import in Frage.
- **Präfix** — eine Zeichenkette, die jedem erzeugten Schlüsselnamen vorangestellt wird. Verwenden Sie es, um importierte Secrets in einen Namensraum zu stellen, damit sie nicht mit Schlüsseln aus anderen Pfaden oder anderen Speichern kollidieren (zum Beispiel `prod-`).
- **Trennzeichen** — das Zeichen, mit dem die Bestandteile des entfernten Speicherorts eines Secrets zu einem einzigen Schlüsselnamen verbunden werden. Da ein entferntes Secret mehrere Ordnerebenen tief liegen kann, bestimmt das Trennzeichen, wie diese Hierarchie zu einem lesbaren Namen abgeflacht wird.

Wenn ein Sync läuft, durchläuft Semaphore den **Pfad** und erzeugt für jedes gefundene Secret einen Schlüsselnamen, indem es den Speicherort des Secrets mit dem **Trennzeichen** zusammenfügt und das **Präfix** voranstellt. Der Typ des erstellten Schlüssels (SSH-Schlüssel, Login/Passwort oder eine einfache Secret-Zeichenkette) wird automatisch aus der Struktur des entfernten Secrets abgeleitet.

Sie können **mehrere Sync-Pfade** für einen einzelnen Speicher definieren. Jeder Pfad wird unabhängig importiert, sodass Sie aus mehreren nicht zusammenhängenden Bereichen desselben Secret-Managers importieren und jedem ein eigenes Präfix und Benennungsschema geben können.

:::tip
Für jeden Anbieter gelten sinnvolle Standardwerte — zum Beispiel verwenden HashiCorp Vault, OpenBao und AWS Secrets Manager standardmäßig `/` als Trennzeichen, Azure Key Vault `-` und Devolutions Server `\` —, sodass Sie in den meisten Fällen nur den Pfad ausfüllen müssen.
:::

## Einen Sync ausführen {#running-a-sync}

Ein Sync kann auf zwei Arten erfolgen:

1. **Manuell.** Öffnen Sie den Speicher und verwenden Sie die Aktion **Jetzt synchronisieren**. Semaphore gleicht diesen Speicher sofort mit seinen konfigurierten Sync-Pfaden ab. Das ist nützlich für einen ersten Import oder um eine Änderung sofort zu übernehmen.
2. **Automatisch, nach Zeitplan.** Aktivieren Sie **Schlüssel synchronisieren** für den Speicher und legen Sie ein **Sync-Intervall** in Minuten fest. Semaphore führt den Sync dann in diesem Rhythmus im Hintergrund erneut aus. Ein Intervall von `0` deaktiviert die automatische Synchronisierung, sodass nur die manuelle Option bleibt.

Jeder Speicher zeichnet auf, wann er zuletzt synchronisiert wurde und ob der letzte Versuch fehlgeschlagen ist, sodass Sie den Zustand der Spiegelung jederzeit einsehen können.

:::note
In einer Hochverfügbarkeitsumgebung werden automatische Syncs über die Knoten hinweg koordiniert, sodass ein bestimmter Sync jeweils nur auf einem Knoten läuft — es kommt nicht zu doppelten Importen.
:::

## Was die Synchronisierung mit Ihren Schlüsseln macht {#what-syncing-does-to-your-keys}

Ein Sync ist eine **vollständige Spiegelung**, keine einmalige Kopie. Bei jedem Lauf gleicht Semaphore den entfernten Speicher mit den zuvor importierten Schlüsseln ab:

- **Neue** Secrets, die unter einem Sync-Pfad gefunden werden, werden als Schlüssel erstellt.
- **Vorhandene** importierte Schlüssel werden **aktualisiert**, damit sie dem aktuellen entfernten Wert entsprechen.
- Schlüssel, die zuvor importiert wurden, aber im entfernten Speicher **nicht mehr existieren**, werden **entfernt**.

Es werden nur Schlüssel berührt, die Semaphore importiert hat — manuell erstellte Schlüssel werden von einem Sync niemals geändert oder gelöscht.

:::warning
Da importierte Schlüssel verwaltete Kopien der entfernten Secrets sind, entfernt das Löschen eines Speichers (oder das Deaktivieren seines Syncs) auch die Schlüssel, die daraus stammen.
:::

## Zwei Geltungsbereiche: gemeinsame Schlüssel und Umgebungsvariablen {#two-scopes-shared-keys-and-environment-variables}

Sync-Pfade können an zwei Stellen konfiguriert werden:

- **Speicherebene** — importierte Secrets werden zu **gemeinsamen Schlüsseln**, die im gesamten Projekt überall dort verfügbar sind, wo Schlüssel verwendet werden.
- **Umgebungsebene** — eine [Variablengruppe](/user-guide/environment) kann auf einen Speicher und dessen Sync-Pfade verweisen, um Secrets als **Umgebungsvariablen** zu importieren, die auf diese Gruppe beschränkt sind.

Der Mechanismus ist identisch; nur das Ziel der importierten Secrets unterscheidet sich.

## Hinweise und Einschränkungen {#notes-and-limitations}

- Die Synchronisierung wird nur für **externe** Speichertypen unterstützt (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). Der integrierte **Datenbank**-Speicher hält Secrets nativ und hat nichts zu synchronisieren.
- Die Zugangsdaten des entfernten Speichers selbst (das Token oder der Schlüssel, mit dem sich Semaphore authentifiziert) werden sicher und getrennt von den importierten Secrets gespeichert.
- Wenn der Sync deaktiviert wird und keine Pfade mehr vorhanden sind, wird die Sync-Konfiguration für diesen Speicher gelöscht.
