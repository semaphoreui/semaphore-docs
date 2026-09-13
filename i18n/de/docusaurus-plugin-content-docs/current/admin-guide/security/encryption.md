---
id: encryption
title: Verschlüsselungsschlüssel
sidebar_label: Verschlüsselungsschlüssel
description: Wie Semaphore Geheimnisse verschlüsselt, Verschlüsselungsschlüssel konfiguriert und sie ohne Ausfallzeit rotiert.
---

# Verschlüsselungsschlüssel

Semaphore verschlüsselt die sensibelsten Daten, die es speichert – **Access-Key-Geheimnisse**
(private SSH-Schlüssel, Login/Passwort-Paare, geheime Zeichenketten) und den **JWT-Signaturschlüssel** –
mit AES‑256‑GCM. Diese Seite erklärt, wie Sie diese Schlüssel konfigurieren, wie
die Rotation funktioniert und wie Sie sie sicher betreiben.

:::info Zwei Schlüssel, zwei Zwecke

| Schlüssel | Schützt | Aktiver Zeiger |
|-----|----------|----------------|
| **Secrets-Schlüssel** | In der Datenbank gespeicherte Access-Key-Geheimnisse | `active.secret_key` |
| **Options-Schlüssel** | Verschlüsselte DB-Optionen (der JWT-Signaturschlüssel) | `active.option_key` |

Wenn kein Options-Schlüssel konfiguriert ist, greifen die Optionen auf den Secrets-Schlüssel zurück.
:::

---

## Schnellstart {#quick-start}

Die einfachste Konfiguration ist ein einzelner Schlüssel, der in der Hauptkonfiguration angegeben wird:

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

Generieren Sie einen Schlüssel mit:

```bash
openssl rand -base64 32
```

Das war's – Semaphore verschlüsselt Geheimnisse jetzt mit `key1`. Derselbe Schlüssel wird für
den JWT-Signaturschlüssel verwendet (Optionen greifen auf den Secrets-Schlüssel zurück).

:::tip Produktion
Bevorzugen Sie **`file:`-Verweise** oder einen **`keys_folder`** (siehe unten) gegenüber einem inline
angegebenen `value:`, damit das Schlüsselmaterial in einem eingebundenen Secret und nicht in der Konfiguration liegt.
:::

---

## Wie Schlüssel identifiziert werden {#how-keys-are-identified}

Jeder Schlüssel hat eine **Schlüssel-ID**, die aus dem Schlüsselmaterial selbst abgeleitet wird – ein Fingerabdruck,
`base64url(sha256(key))[:8]`. Die ID (nicht der Schlüssel) wird zusammen mit jedem
verschlüsselten Wert gespeichert, sodass die Entschlüsselung ein direktes Nachschlagen genau des Schlüssels ist, der den Wert geschrieben hat.

Das bedeutet:

- **Bezeichnungen können frei umbenannt werden.** `key1`, `secrets_key_primary.txt` – diese sind
  für Menschen gedacht. Die Datenbank speichert sie nie, nur den Fingerabdruck.
- **Ein Schlüssel kann nie falsch zugeordnet werden.** Ändern Sie die Bytes eines Schlüssels, wird daraus eine *neue*
  ID; die alten Daten verweisen weiterhin auf die alte ID.
- **Das Entfernen eines Schlüssels schlägt deutlich fehl**, nicht stillschweigend – eine fehlende Schlüssel-ID ist ein expliziter
  Fehler, niemals unbrauchbare Ausgabe.

Sie setzen IDs nie von Hand; Semaphore berechnet sie.

---

## Die Schlüsseldatei {#the-keys-file}

`encryption.keys_file` verweist auf eine Datei, deren Inhalt eine **Registry von Schlüsseln**
plus **Zeiger** auf den aktiven Schlüssel je Zweck ist. Sie wird als **YAML oder JSON geparst,
unabhängig von der Dateiendung**.

Es gibt zwei Möglichkeiten, die Registry bereitzustellen – eine Inline-Map, ein Ordner mit Dateien oder
beides kombiniert.

### Inline-Map {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

Jeder Eintrag ist eine [`KeySource`](#keysource): entweder `value` (Inline-Base64) **oder**
`file` (Pfad zu einer Datei, die den Base64-Schlüssel enthält) – niemals beides.

### Ordner mit Schlüsseldateien {#folder-of-key-files}

Lassen Sie `keys_folder` auf ein Verzeichnis zeigen; **jede reguläre Datei ist ein Schlüssel**, bezeichnet durch
ihren Dateinamen. Ideal für eingebundene Docker-/Kubernetes-Secrets.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Kubernetes-freundlich
`keys_folder` überspringt Einträge mit vorangestelltem Punkt (`..data`, `..2024_*`) und folgt
Symlinks, sodass es direkt mit der Art und Weise funktioniert, wie Kubernetes `Secret`-/`ConfigMap`-Volumes
einbindet.
:::

### Kombiniert {#combined}

`keys` und `keys_folder` werden zu einer Registry zusammengeführt; `active` kann per Bezeichnung
*oder* per Dateiname verweisen:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## Rotation (ohne Ausfallzeit) {#rotation-zero-downtime}

Der aktive Schlüssel verschlüsselt **neue** Schreibvorgänge; jeder andere Schlüssel in der Registry kann alte Daten weiterhin
**entschlüsseln**. Die Rotation besteht daher aus: Schlüssel hinzufügen, Zeiger umstellen,
im Hintergrund neu verschlüsseln, dann den alten Schlüssel entfernen.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

In keinem Schritt ist ein Neustart des Prozesses erforderlich.

### Änderungen ohne Neustart anwenden {#applying-changes-without-a-restart}

Semaphore liest die Schlüsseldatei (und die darin referenzierten Schlüsseldateien) neu ein und tauscht die
Schlüssel im Speicher atomar aus. Zwei Auslöser:

| Auslöser | Verhalten |
|---------|-----------|
| **Datei-Watcher** | Fragt alle `encryption.keys_poll_interval` ab (Standard `15s`). Auf `"0"` setzen, um zu deaktivieren. |
| **`SIGHUP`** | `kill -HUP <pid>` erzwingt ein sofortiges Neuladen (nur Unix). |

:::caution Windows
Windows kennt kein `SIGHUP`. Verlassen Sie sich auf den **Poller** (Standard) – er funktioniert auf jeder
Plattform – oder starten Sie den Dienst neu.
:::

Ein Neuladen validiert zuerst die neuen Schlüssel und lässt bei einem Fehler die laufenden Schlüssel
unverändert.

---

## CLI-Befehle {#cli-commands}

### `vault check` {#vault-check}

Nur lesend. Meldet pro Schlüssel-ID, wie viele gespeicherte Geheimnisse damit verschlüsselt sind, sodass Sie
sehen können, was auf dem aktiven Schlüssel liegt und was sicher entfernt werden kann.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Status: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)` und `MISSING KEY` (ein referenzierter Schlüssel fehlt – Exit-Code 1).

### `vault rekey` {#vault-rekey}

Verschlüsselt alle gespeicherten Geheimnisse (und den JWT-Signaturschlüssel) mit dem aktiven Schlüssel neu.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Abwärtskompatibilität {#backward-compatibility}

Das Upgrade ist sicher und erfordert **keine Datenmigration**:

- Bestehende Installationen, die **`access_key_encryption`** (oder die
  Umgebungsvariable `SEMAPHORE_ACCESS_KEY_ENCRYPTION`) setzen, funktionieren unverändert weiter – dieser flache
  Schlüssel wird zum aktiven Secrets-Schlüssel.
- Daten, die von älteren Semaphore-Versionen geschrieben wurden (ohne Schlüssel-ID), lassen sich weiterhin entschlüsseln. Beim nächsten Schreibvorgang
  oder nach `vault rekey` werden sie mit einer Schlüssel-ID neu gestempelt.
- **Gar keine Verschlüsselung** (kein Schlüssel konfiguriert) speichert Geheimnisse weiterhin als
  reines Base64 und entschlüsselt sie auf dieselbe Weise.

Um eine alte Installation mit einem einzelnen Schlüssel auf eine Schlüsseldatei zu migrieren, nehmen Sie einfach den alten Schlüssel
in die Registry auf:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

Alte Daten werden über `old` entschlüsselt; führen Sie `vault rekey` aus, um alles auf `new` zu übertragen.

---

## Kubernetes & Docker {#kubernetes--docker}

Binden Sie Ihre Schlüssel als `Secret`-Volume ein und lassen Sie `keys_folder` darauf zeigen:

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

Wenn Sie das `Secret` aktualisieren, aktualisiert Kubernetes die eingebundenen Dateien und der
Poller übernimmt die Änderung innerhalb von `keys_poll_interval` – ohne Pod-Neustart.

---

## Bewährte Sicherheitspraktiken {#security-best-practices}

:::danger Schützen Sie die Schlüsseldatei
- Berechtigungen einschränken: `chmod 0400`, im Besitz des Semaphore-Dienstbenutzers.
- **Committen Sie niemals echte Schlüssel** in die Versionsverwaltung – fügen Sie die Datei zur `.gitignore` hinzu.
- Sichern Sie sie an einem sicheren Ort. **Der Verlust aller Schlüssel bedeutet den Verlust aller verschlüsselten Daten.**
- Bevorzugen Sie eingebundene Secrets (`file:` / `keys_folder`) gegenüber inline angegebenem `value:`, und Umgebungsvariablen
  gegenüber keinem von beiden – `value:` belässt den Schlüssel in der Konfigurationsdatei.
:::

---

## Referenz {#reference}

### `encryption` (Hauptkonfiguration) {#encryption-main-config}

| Feld | Umgebungsvariable | Standard | Beschreibung |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Pfad zur Schlüsseldatei (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | Wie oft die Schlüsseldatei abgefragt wird. `"0"` deaktiviert das Abfragen. |

### Veraltete flache Schlüssel (Hauptkonfiguration) {#legacy-flat-keys-main-config}

| Feld | Umgebungsvariable | Beschreibung |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Einzelner Secrets-Schlüssel, keine Rotation. Wird verwendet, wenn `keys_file` nicht gesetzt ist. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Einzelner Options-Schlüssel, keine Rotation. Greift auf den Secrets-Schlüssel zurück. |

### Schlüsseldatei {#keys-file}

| Feld | Beschreibung |
|-------|-------------|
| `keys` | Map von `label → KeySource` (Inline-Registry). |
| `keys_folder` | Verzeichnis mit Schlüsseldateien (eine reguläre Datei pro Schlüssel, bezeichnet durch den Dateinamen). |
| `active.secret_key` | Bezeichnung (in `keys`) des aktiven Secrets-Schlüssels. |
| `active.option_key` | Bezeichnung des aktiven Options-Schlüssels. |
| `active.secret_key_file` | Dateiname in `keys_folder` des aktiven Secrets-Schlüssels (relativ). |
| `active.option_key_file` | Dateiname in `keys_folder` des aktiven Options-Schlüssels (relativ). |

### KeySource {#keysource}

| Feld | Beschreibung |
|-------|-------------|
| `value` | Inline-Schlüsselmaterial als Base64. |
| `file` | Pfad zu einer Datei, die den Base64-Schlüssel enthält. |

`value` und `file` schließen sich gegenseitig aus. Schlüssel müssen Base64 von **16, 24 oder 32
Bytes** sein (AES‑128/192/256).

---

## Fehlerbehebung {#troubleshooting}

| Symptom | Ursache / Lösung |
|---------|-------------|
| Panic beim Start: `encryption_keys… not found` / `invalid` | Die Schlüsseldatei oder eine referenzierte Schlüsseldatei fehlt bzw. ist fehlerhaft, oder ein Schlüssel ist kein gültiges Base64 von 16/24/32 Bytes. Korrigieren Sie die Datei; der Start schlägt absichtlich sofort fehl. |
| `vault check` zeigt `MISSING KEY <id>` (Exit 1) | Daten wurden mit einem Schlüssel verschlüsselt, der nicht mehr in der Registry ist. Fügen Sie diesen Schlüssel wieder hinzu, bevor die Daten entschlüsselt werden können. |
| `cannot decrypt access key, perhaps encryption key was changed` | Ein veralteter (nicht präfixierter) Wert kann von keinem konfigurierten Schlüssel entschlüsselt werden. Stellen Sie sicher, dass der ursprüngliche Schlüssel vorhanden ist (in der Registry oder in `access_key_encryption`). |
| Rotation wird nicht angewendet | Prüfen Sie `keys_poll_interval` (nicht `"0"`) und ob sich die Schlüsseldatei tatsächlich geändert hat; oder senden Sie `SIGHUP`. |
| `active.secret_key: no key labelled "…"` | Der aktive Zeiger nennt eine Bezeichnung/einen Dateinamen, die/der nicht in `keys`/`keys_folder` vorhanden ist. |
