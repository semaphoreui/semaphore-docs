# Datenbankmigrationen

Der Befehl `semaphore migrate` aktualisiert das Semaphore-Datenbankschema auf eine
bestimmte Semaphore-Version oder rollt es darauf zurück. Verwenden Sie ihn für
Upgrades und Downgrades.

```bash
semaphore migrate --help
```

:::info
Sie müssen `migrate` nur selten manuell ausführen. `semaphore server`, `semaphore setup`
und jeder andere CLI-Befehl, der auf die Datenbank zugreift, wenden ausstehende
Migrationen vor der Ausführung automatisch an. `migrate` dient dazu, Migrationen ohne
Start des Servers anzuwenden oder sie zurückzurollen.
:::

:::warning
Sichern Sie Ihre Datenbank immer, bevor Sie Migrationen anwenden oder zurückrollen.
:::

## Migrationen anwenden {#applying-migrations}

Alle ausstehenden Migrationen anwenden und die Datenbank auf den aktuellen Stand bringen:

```bash
semaphore migrate --config /path/to/config.json
```

Migrationen nur bis zu einer bestimmten Version anwenden:

```bash
semaphore migrate --apply-to 2.15.1
```

## Migrationen zurückrollen {#rolling-back-migrations}

Migrationen bis zu einer früheren Version rückgängig machen:

```bash
semaphore migrate --undo-to 2.13
```

Geben Sie die Semaphore-Version an, auf die Sie herabstufen. Die Binärdatei, mit der
Sie `migrate` ausführen, muss alle rückgängig zu machenden Migrationen kennen. Führen
Sie den Befehl daher mit der **neueren** Binärdatei aus, bevor Sie die ältere
installieren.

## Optionen {#options}

| Flag | Beschreibung |
|------|--------------|
| `--apply-to <version>` | Migrationen bis einschließlich dieser Version anwenden (z. B. `2.15` oder `2.14.4`). |
| `--undo-to <version>` | Migrationen bis zu dieser Version zurückrollen. |

`--apply-to` und `--undo-to` schließen sich gegenseitig aus; die Angabe beider führt
zu einem Fehler. Ohne eines der beiden Flags werden alle ausstehenden Migrationen
angewendet.

Nach Abschluss gibt der Befehl die verwendete Datenbankverbindung aus.

:::note
`semaphore migrate` akzeptiert aus Gründen der Abwärtskompatibilität weiterhin
`--err-log-size`, `--skip-task-output` und `--merge-existing-users`, ab Version 2.19
haben diese Flags jedoch keine Wirkung mehr. Sie gehörten zum unten beschriebenen
BoltDB-Import.
:::

## Migration von BoltDB zu SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Nur in den Versionen 2.17 und 2.18 verfügbar*

BoltDB ist seit Version 2.16 veraltet, und **die Unterstützung wurde in Version 2.19
entfernt**. Das Flag `--from-boltdb` und die Umgebungsvariable
`SEMAPHORE_MIGRATE_FROM_BOLTDB` existieren ab 2.19 nicht mehr, und `semaphore setup`
verweigert die Konfiguration einer BoltDB-Datenbank.

:::warning
Wenn Sie noch BoltDB verwenden, migrieren Sie, **bevor** Sie auf 2.19 oder neuer
aktualisieren. Installieren Sie Semaphore **2.17 oder 2.18**, führen Sie die unten
beschriebene Migration durch und aktualisieren Sie erst danach auf eine neuere Version.
:::

Installieren Sie zur Migration zunächst Semaphore 2.17 oder 2.18 und konfigurieren Sie
anschließend die Zieldatenbank (SQLite, MySQL oder PostgreSQL) in Ihrer `config.json`.
Führen Sie danach den folgenden Befehl aus, um alle Daten aus der alten BoltDB-Datei in
die neue Datenbank zu importieren:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

Der Befehl liest alle Projekte, Vorlagen, Inventories, Repositories, Schlüssel,
Benutzer und den Aufgabenverlauf aus BoltDB und schreibt sie in die Datenbank, die in
der aktuellen Semaphore-Konfiguration angegeben ist. Die ursprüngliche BoltDB-Datei
wird nicht verändert.

Zusätzliche Argumente (nur 2.17 und 2.18):

| Flag | Beschreibung |
|------|--------------|
| `--err-log-size <n>` | Maximale Anzahl der in der Ausgabe angezeigten Fehlerzeilen. |
| `--skip-task-output` | Aufgabenausgaben nicht importieren. |
| `--merge-existing-users` | Vorhandene Benutzer anhand des Benutzernamens wiederverwenden, statt bei Konflikten abzubrechen. |

Wenn Sie den Docker-Container von Semaphore UI verwenden, können Sie die
Umgebungsvariable `SEMAPHORE_MIGRATE_FROM_BOLTDB` setzen, um die vorhandene
BoltDB-Datenbank automatisch zu importieren. Der Import wird nur einmal beim ersten
Start des Containers ausgeführt. Beispiel:

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## Fehlerbehebung {#troubleshooting}

- Wenn eine Migration fehlschlägt, prüfen Sie die Logs auf Details und stellen Sie
  sicher, dass die CLI-Binärdatei dieselbe Version wie der Semaphore-Server hat.
- Stellen Sie sicher, dass die CLI dieselbe Konfigurationsdatei (und damit dieselbe
  Datenbank) wie der Server verwendet. Siehe
  [Wie die Konfigurationsdatei gefunden wird](/reference/cli#how-the-configuration-file-is-found).
