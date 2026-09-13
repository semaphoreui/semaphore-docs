# Migrazioni del database

Il comando `semaphore migrate` aggiorna o riporta indietro lo schema del database di Semaphore
per farlo corrispondere a una determinata versione di Semaphore. Da usare per upgrade e downgrade.

```bash
semaphore migrate --help
```

:::info
Raramente è necessario eseguire `migrate` manualmente. `semaphore server`, `semaphore setup`
e ogni altro comando CLI che accede al database applicano automaticamente le migrazioni
in sospeso prima di essere eseguiti. `migrate` serve per applicare le migrazioni senza
avviare il server, oppure per annullarle.
:::

:::warning
Effettuare sempre un backup del database prima di applicare o annullare le migrazioni.
:::

## Applicare le migrazioni {#applying-migrations}

Applicare tutte le migrazioni in sospeso e aggiornare il database:

```bash
semaphore migrate --config /path/to/config.json
```

Applicare le migrazioni solo fino a una versione specifica:

```bash
semaphore migrate --apply-to 2.15.1
```

## Annullare le migrazioni {#rolling-back-migrations}

Annullare le migrazioni fino a una versione precedente:

```bash
semaphore migrate --undo-to 2.13
```

Usare la versione di Semaphore verso cui si sta effettuando il downgrade. Il binario con cui si esegue `migrate`
deve conoscere ogni migrazione da annullare, quindi eseguirlo con il binario **più recente**
prima di installare quello precedente.

## Opzioni {#options}

| Flag | Descrizione |
|------|-------------|
| `--apply-to <version>` | Applica le migrazioni fino a questa versione inclusa (ad esempio `2.15` o `2.14.4`). |
| `--undo-to <version>` | Annulla le migrazioni fino a questa versione. |

`--apply-to` e `--undo-to` si escludono a vicenda; passarli entrambi genera un errore.
Senza alcuno dei due flag, vengono applicate tutte le migrazioni in sospeso.

Al termine il comando stampa la connessione al database utilizzata.

:::note
`semaphore migrate` accetta ancora `--err-log-size`, `--skip-task-output` e
`--merge-existing-users` per retrocompatibilità, ma dalla versione 2.19 in poi non
hanno alcun effetto. Appartenevano all'importazione da BoltDB descritta di seguito.
:::

## Migrazione da BoltDB a SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Disponibile solo nelle versioni 2.17 e 2.18*

BoltDB è stato deprecato a partire dalla versione 2.16 e **il supporto è stato rimosso nella
versione 2.19**. Il flag `--from-boltdb` e la variabile d'ambiente `SEMAPHORE_MIGRATE_FROM_BOLTDB`
non esistono più dalla 2.19 in poi, e `semaphore setup` rifiuta di
configurare un database BoltDB.

:::warning
Se si utilizza ancora BoltDB, effettuare la migrazione **prima** di aggiornare alla 2.19 o successiva.
Installare Semaphore **2.17 o 2.18**, eseguire la migrazione descritta di seguito e solo dopo
aggiornare a una versione più recente.
:::

Per migrare, installare prima Semaphore versione 2.17 o 2.18, quindi configurare il
database di destinazione (SQLite, MySQL o PostgreSQL) nel proprio `config.json`. Fatto
questo, eseguire il seguente comando per importare tutti i dati dal vecchio file BoltDB
nel nuovo database:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

Il comando legge tutti i progetti, i template, gli inventory, i repository, le chiavi,
gli utenti e la cronologia dei task da BoltDB e li scrive nel database specificato
nella configurazione corrente di Semaphore. Il file BoltDB originale non viene
modificato.

Argomenti aggiuntivi (solo 2.17 e 2.18):

| Flag | Descrizione |
|------|-------------|
| `--err-log-size <n>` | Numero massimo di righe di errore mostrate nell'output. |
| `--skip-task-output` | Non importare gli output dei task. |
| `--merge-existing-users` | Riutilizza gli utenti esistenti abbinati per nome utente invece di fallire in caso di conflitto. |

Se si utilizza il container Docker di Semaphore UI, è possibile impostare la
variabile d'ambiente `SEMAPHORE_MIGRATE_FROM_BOLTDB` per importare automaticamente il
database BoltDB esistente. L'importazione viene eseguita una sola volta, al primo avvio del
container. Esempio:

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

## Risoluzione dei problemi {#troubleshooting}

- Se una migrazione fallisce, controllare i log per i dettagli e assicurarsi che il binario della CLI
  sia della stessa versione del server Semaphore.
- Assicurarsi che la CLI usi lo stesso file di configurazione (e quindi lo stesso
  database) del server. Consultare
  [Come viene individuato il file di configurazione](/reference/cli#how-the-configuration-file-is-found).
