
# Terraform/OpenTofu

Mit Semaphore UI können Sie Terraform-Code ausführen. Dazu müssen Sie eine **Terraform-Code-Vorlage** erstellen.

1. Gehen Sie zum Bereich **Aufgabenvorlagen** und klicken Sie auf die Schaltfläche **Neue Vorlage**.
2. Wählen Sie **Terraform** als App-Typ aus.
3. Richten Sie die Vorlage ein und klicken Sie auf die Schaltfläche **Erstellen**.
4. Klicken Sie auf **Ausführen**, um die Vorlage auszuführen.

## Variablen übergeben {#passing-variables}

Variablen aus den ausgewählten **Variablengruppen** werden als Umgebungsvariablen injiziert. Stellen Sie den Namen das Präfix `TF_VAR_` voran, damit Terraform sie als Eingabevariablen übernimmt:

| Schlüssel der Variablengruppe | Terraform-Variable |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

Für sensible Werte verwenden Sie den Tab **Secrets** in den Variablengruppen — diese werden im Ruhezustand verschlüsselt gespeichert.

## Workspaces {#workspaces}

Semaphore unterstützt Terraform/OpenTofu-Workspaces nativ. Siehe [Workspaces](./workspaces) zum Erstellen und Wechseln von Workspaces sowie zur Verwendung von SSH-Schlüsseln für private Module.

## Backend-Überschreibung und HTTP-Backend (Pro) {#backend-override-and-http-backend-pro}

Sie können das Backend in einer Vorlage überschreiben, um das integrierte HTTP-Backend zu verwenden, ohne Ihren Terraform-Code zu ändern. Details finden Sie unter [HTTP-Backend (Pro)](./states).

## Destroy-Flag und State-Migration {#destroy-flag-and-state-migration}

Der Dialog zum Ausführen einer Aufgabe enthält Schalter für `-destroy` und `-migrate-state`. Verwenden Sie diese, wenn Sie Infrastruktur abbauen oder den Terraform-State migrieren.

## Hinweise {#notes}

- Semaphore führt vor jedem Lauf automatisch `terraform init` aus.
- Der State wird von dem Backend verwaltet, das in Ihrem Terraform-Code konfiguriert ist (lokal, S3, GCS usw.), sofern Sie nicht das integrierte HTTP-Backend (Pro) verwenden.
