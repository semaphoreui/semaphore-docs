
# Konfigurationsdatei

## Konfigurationsdatei erstellen {#creating-configuration-file}

Semaphore verwendet für seine Kernkonfiguration eine Datei `config.json`. Sie können diese Datei interaktiv mit den integrierten Werkzeugen oder über einen webbasierten Konfigurator erzeugen.

### Per CLI erzeugen {#generate-via-cli}

Verwenden Sie die folgenden Befehle, um die Konfigurationsdatei interaktiv zu erzeugen:

* Für den Semaphore-Server:
  ```
  semaphore setup
  ```
* Für den Semaphore-Runner:
  ```
  semaphore runner setup
  ```
  
  :::tip
    Weitere Details zur Runner-Konfiguration finden Sie im Abschnitt <a href="./../runners">Runner</a>.
  :::

### Auf der Website erzeugen {#generate-on-the-website}

Alternativ können Sie den webbasierten interaktiven Konfigurator verwenden:
* [Server-Konfigurator](https://semaphoreui.com/install/binary/2_13/config)
* [Runner-Konfigurator](https://semaphoreui.com/install/binary/2_13/runner)

## Beispiel einer Konfigurationsdatei {#configuration-file-example}

Semaphore verwendet eine Konfigurationsdatei `config.json` mit folgendem Inhalt:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Verwendung der Konfigurationsdatei {#configuration-file-usage}

* Für den Semaphore-Server:

```bash
semaphore server --config ./config.json
```

* Für den Semaphore-Runner:

```bash
semaphore runner start --config ./config.json
```

## Verzeichnis für Geheimnisse {#secrets-directory}

Semaphore liest Geheimnisdateien (zum Beispiel [dateibasierte Key-Store-Einträge](/user-guide/key-store/env-and-file-sources) oder von der Festplatte gelesene HashiCorp-Vault- und OpenBao-Tokens) ausschließlich aus einem konfigurierbaren Verzeichnis.

| Option | Umgebungsvariable | Beschreibung |
|--------|-------------------|--------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Verzeichnis für Geheimnisdateien. Standard: `/tmp/semaphore`. |
| `secrets_path` (Legacy) | `SEMAPHORE_SECRETS_PATH` | Einstellung auf oberster Ebene, die aus Gründen der Abwärtskompatibilität beibehalten wird. Wird nur verwendet, wenn `dirs.secrets` nicht gesetzt ist oder noch auf dem Standardpfad steht. |

**Vorrang**: Ein vom Standard abweichendes `dirs.secrets` hat Vorrang vor dem veralteten `secrets_path`. Wenn Sie `SEMAPHORE_SECRETS_PATH` setzen, wendet Semaphore den Wert auf beide Felder an.

Beispiel mit dem aktuellen Layout:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Ältere Installationen verwenden möglicherweise noch:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Schlüsseldateien, die im Tab **File** des Key-Store-Formulars ausgewählt werden, sowie Token-Dateien, auf die externe Secret-Storages verweisen, müssen sich innerhalb dieses Verzeichnisses befinden. Pfade außerhalb werden mit `file path must be inside secrets path` abgelehnt. Siehe [Schlüssel aus Umgebungsvariablen und Dateien](/user-guide/key-store/env-and-file-sources).

## Git-Operationen {#git-operations}

Semaphore klont und aktualisiert die Aufgaben-Repositories vor jedem Lauf. Zwei Optionen steuern dieses Verhalten:

| Option | Umgebungsvariable | Beschreibung |
|--------|-------------------|--------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Implementierung des Git-Clients: `cmd_git` (Standard, verwendet die `git`-Binärdatei des Systems) oder `go_git` (reiner Go-Client). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Anzahl der Versuche für Clone- und Pull-Operationen, bevor die Aufgabe fehlschlägt. Standard: `4`. Setzen Sie den Wert auf `1`, um nur einen Versuch ohne Wiederholungen durchzuführen. |

Wenn ein Clone oder Pull fehlschlägt und noch Versuche übrig sind, wartet Semaphore mit exponentiellem Backoff (beginnend bei 1 Sekunde, mit jedem Versuch verdoppelt, maximal 60 Sekunden) und protokolliert eine Meldung wie `Git pull failed (...), retrying in 2s`. Wiederholungen gelten nur für Netzwerkoperationen; ein fehlgeschlagener Checkout oder ein Authentifizierungsfehler lässt die Aufgabe nach Ausschöpfung aller Versuche weiterhin fehlschlagen.

Wenn Ihr Git-Server zeitweise nicht erreichbar ist, erhöhen Sie `git_attempts`. Wenn die Fehler sofort auftreten und dauerhaft sind (falsche Zugangsdaten, fehlendes Repository), beheben Sie die eigentliche Ursache — Wiederholungen helfen dann nicht.

