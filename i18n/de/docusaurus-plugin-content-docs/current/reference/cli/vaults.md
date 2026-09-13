# Vaults

Der Befehl `semaphore vault` verwaltet die Verschlüsselung der Geheimnisse, die
Semaphore in der Datenbank speichert — **Access-Key-Geheimnisse** (SSH-Schlüssel,
Login/Passwort-Paare, geheime Zeichenketten) und den **JWT-Signaturschlüssel**.

```bash
semaphore vault --help
```

> `vault` ist ein Alias für `vaults`.

Er hat zwei Unterbefehle:

| Befehl | Zweck |
|--------|-------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Alle gespeicherten Geheimnisse mit dem aktiven Verschlüsselungsschlüssel neu verschlüsseln. |
| [`vault check`](#checking-key-usage-vault-check) | Melden, welche Schlüssel-ID jedes gespeicherte Geheimnis verschlüsselt (nur lesend). |

Wie Verschlüsselungsschlüssel konfiguriert und rotiert werden, erfahren Sie unter
[Verschlüsselungsschlüssel](/admin-guide/security/encryption).

## Geheimnisse neu verschlüsseln (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

Verschlüsselt alle lokal gespeicherten Geheimnisse — Access-Key-Geheimnisse und den
JWT-Signaturschlüssel — mit dem **aktiven** Verschlüsselungsschlüssel neu und trägt
dessen Schlüssel-ID in jeden Wert ein. Geheimnisse, die in einem externen
Secret-Storage liegen, werden übersprungen (sie sind nicht mit dem Semaphore-Keyring
verschlüsselt).

```bash
semaphore vault rekey
```

### Schlüsselrotation ohne Ausfallzeit {#zero-downtime-key-rotation}

Der aktive Schlüssel verschlüsselt neue Schreibvorgänge; jeder andere Schlüssel im
Keyset kann alte Daten weiterhin entschlüsseln. Die Rotation läuft daher so ab:
Schlüssel hinzufügen, den aktiven Zeiger umschalten, im Hintergrund neu verschlüsseln,
dann den alten Schlüssel entfernen.

1. Fügen Sie dem Keyset einen neuen Schlüssel hinzu (eine Datei in `keys_folder` oder
   ein Eintrag unter `keys:`) und richten Sie den aktiven Zeiger (`active.secret_key`
   oder `secret_key_file`) darauf. Die Änderung wird innerhalb von
   `keys_poll_interval` (Standard `15s`) übernommen oder sofort mit
   `kill -HUP <pid>` — ein Neustart ist nicht erforderlich.
2. Führen Sie `semaphore vault rekey` aus, um vorhandene Daten mit dem neuen Schlüssel
   neu zu verschlüsseln.
3. Führen Sie [`semaphore vault check`](#checking-key-usage-vault-check) aus; sobald
   der alte Schlüssel `0 rows` anzeigt, kann er gefahrlos aus dem Keyset entfernt
   werden.

### Optionen {#options}

| Flag | Beschreibung |
|------|--------------|
| `--old-key <key>` | Expliziter alter Verschlüsselungsschlüssel für eine Legacy-Migration von einem einzelnen Schlüssel. Nicht erforderlich, wenn der alte Schlüssel bereits als sekundärer Schlüssel im Keyset enthalten ist. Dient zum Entschlüsseln von Daten ohne Präfix (Legacy), die keine eingetragene Schlüssel-ID haben. |
| `--backup <file>` | Vor der Neuverschlüsselung ein Backup der aktuellen Access-Key-Chiffretexte nach `<file>` schreiben. |
| `--rollback <file>` | Access-Key-Chiffretexte aus einer Backup-Datei wiederherstellen, statt neu zu verschlüsseln. |

### Backup und Rollback {#backup-and-rollback}

Erstellen Sie vor der Neuverschlüsselung einen Snapshot der aktuellen Chiffretexte und
stellen Sie ihn wieder her, falls etwas schiefgeht:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

Das Backup ist eine JSON-Lines-Datei mit einem Eintrag pro Access Key (`project_id`,
`key_id`, `secret`). Ein Rollback schreibt diese Chiffretexte unverändert zurück.

### Legacy-Migration von einem einzelnen Schlüssel {#legacy-single-key-migration}

Wenn Ihre Daten von einer älteren Semaphore-Version verschlüsselt wurden, die den
einzelnen Schlüssel `access_key_encryption` verwendete (keine Rotation, keine
eingetragene Schlüssel-ID), übergeben Sie diesen Schlüssel explizit, damit die Daten
entschlüsselt werden können, bevor sie mit dem aktiven Schlüssel neu verschlüsselt
werden:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

Das ist nicht mehr nötig, sobald der alte Schlüssel Teil des Keysets ist — Semaphore
ermittelt für jeden Wert anhand der eingetragenen ID den passenden Schlüssel und
entschlüsselt automatisch damit.

## Schlüsselverwendung prüfen (`vault check`) {#checking-key-usage-vault-check}

Nur lesend. Meldet pro Schlüssel-ID, wie viele lokal gespeicherte
Access-Key-Geheimnisse (und der JWT-Signaturschlüssel) mit diesem Schlüssel
verschlüsselt sind, sowie den Status des JWT-Signaturschlüssels. Führen Sie den Befehl
nach `vault rekey` aus, um zu bestätigen, dass ein stillgelegter Schlüssel gefahrlos
entfernt werden kann: Ein Schlüssel ohne Referenzen kann aus dem Keyset gelöscht
werden.

```bash
semaphore vault check
```

Beispielausgabe:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Jede Schlüssel-ID wird mit einem der folgenden Status gemeldet:

| Status | Bedeutung |
|--------|-----------|
| `active` | Der Schlüssel verschlüsselt derzeit neue Schreibvorgänge. |
| `retired, rekey pending` | Der Schlüssel verschlüsselt noch einige Zeilen; führen Sie `vault rekey` aus, um sie auf den aktiven Schlüssel zu übertragen. |
| `retired, SAFE TO REMOVE` | Keine Zeilen verweisen auf den Schlüssel (`0 rows`) — er kann aus dem Keyset entfernt werden. |
| `legacy (no id)` | Zeilen, die verschlüsselt wurden, bevor es Schlüssel-IDs gab; führen Sie rekey aus, um eine ID einzutragen. |
| `MISSING KEY (cannot decrypt)` | Eine referenzierte Schlüssel-ID fehlt im Keyset. |

Die letzte Zeile gibt an, welcher Schlüssel den JWT-Signaturschlüssel verschlüsselt,
oder `JWT signing key: not set`, falls noch keiner erzeugt wurde.

Wenn ein Geheimnis auf eine Schlüssel-ID verweist, die im Keyset fehlt, markiert der
Befehl diese Zeilen und **beendet sich mit einem Exit-Status ungleich null** — fügen
Sie den fehlenden Schlüssel wieder zum Keyset hinzu, damit diese Daten entschlüsselt
werden können.
