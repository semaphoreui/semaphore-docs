# AWS Secrets Manager als Secret-Speicher

<Enterprise />

Semaphore UI Enterprise kann **AWS Secrets Manager** anstelle der Datenbank als externen Speicher für Key-Store-Secrets verwenden.

## Konfigurationsoptionen {#configuration-options}

Wenn Sie unter **Key Store → Speicher** einen **AWS Secrets Manager**-Speicher erstellen, konfigurieren Sie:

| Feld | Beschreibung |
|-------|-------------|
| **Region** | AWS-Region, in der sich die Secrets befinden (zum Beispiel `us-east-1`). Erforderlich. |
| **Endpoint-URL** | Optionaler benutzerdefinierter Endpunkt. Leer lassen für den Standard-AWS-API-Endpunkt. Nützlich für LocalStack oder VPC-Endpunkte. |
| **IAM-Rolle / Instanzprofil verwenden** | Wenn aktiviert, verwendet Semaphore die umgebende AWS-Credentials-Kette (EC2-Instanzprofil, ECS-Task-Rolle, EKS IRSA usw.) und benötigt keine statischen Zugriffsschlüssel. |
| **Access Key ID** | Erforderlich, wenn der IAM-Rollen-Modus deaktiviert ist. |
| **Secret Access Key** | Erforderlich, wenn der IAM-Rollen-Modus deaktiviert ist. Kann in der Datenbank gespeichert, aus einer Umgebungsvariable gelesen oder aus einer Datei geladen werden. |

### IAM-Rolle vs. Zugriffsschlüssel {#iam-role-vs-access-keys}

- **IAM-Rolle / Instanzprofil** (empfohlen auf AWS): Aktivieren Sie **IAM-Rolle / Instanzprofil verwenden** und erteilen Sie dem Semaphore-Server oder Runner-Host die Berechtigung, die referenzierten Secrets zu lesen. Es werden keine langlebigen Schlüssel in Semaphore gespeichert.
- **Zugriffsschlüssel**: Lassen Sie das Kontrollkästchen deaktiviert und geben Sie ein Zugriffsschlüsselpaar eines IAM-Benutzers oder einer IAM-Rolle mit `secretsmanager:GetSecretValue` an (sowie die zugehörigen List-/Describe-Berechtigungen für die Synchronisierung).

Beim Bearbeiten eines bestehenden Speichers geht Semaphore vom IAM-Rollen-Modus aus, wenn keine Access Key ID gespeichert wurde.

## Verwendung {#how-to-use}

1. Öffnen Sie in Ihrem Projekt **Key Store → Speicher** und erstellen Sie einen **AWS Secrets Manager**-Speicher.
2. Wählen Sie beim Erstellen oder Bearbeiten eines Schlüssels diesen Speicher aus und geben Sie den Namen oder die ARN des Secrets im AWS Secrets Manager an.
3. Konfigurieren Sie optional [Sync-Pfade](/user-guide/key-store/secret-sync), um Secrets automatisch nach Zeitplan zu importieren.

Der Speicher kann im Nur-Lese-Modus betrieben werden.

## Secrets synchronisieren {#syncing-secrets}

Secrets im AWS Secrets Manager können wie bei anderen externen Speichern in den Key Store importiert und synchron gehalten werden. Das Standard-Pfadtrennzeichen ist `/`. Siehe [Secrets aus entfernten Speichern synchronisieren](/user-guide/key-store/secret-sync).
