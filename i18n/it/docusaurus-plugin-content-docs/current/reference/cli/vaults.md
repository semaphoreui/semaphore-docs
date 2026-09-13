# Vault

Il comando `semaphore vault` gestisce la cifratura dei segreti che Semaphore
memorizza nel database: i **segreti delle Access Key** (chiavi SSH, coppie login/password,
stringhe segrete) e la **chiave di firma JWT**.

```bash
semaphore vault --help
```

> `vault` è un alias di `vaults`.

Ha due sottocomandi:

| Comando | Scopo |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Ricifra tutti i segreti memorizzati con la chiave di cifratura attiva. |
| [`vault check`](#checking-key-usage-vault-check) | Riporta quale id di chiave cifra ciascun segreto memorizzato (sola lettura). |

Per la configurazione e la rotazione delle chiavi di cifratura, consultare
[Chiavi di cifratura](/admin-guide/security/encryption).

## Ricifrare i segreti (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

Ricifra tutti i segreti memorizzati localmente (segreti delle Access Key e chiave di firma
JWT) con la chiave di cifratura **attiva**, imprimendo l'id di tale chiave in ogni
valore. I segreti gestiti da uno storage di segreti esterno vengono saltati (non sono
cifrati con il keyring di Semaphore).

```bash
semaphore vault rekey
```

### Rotazione delle chiavi senza downtime {#zero-downtime-key-rotation}

La chiave attiva cifra le nuove scritture; ogni altra chiave del keyset può ancora
decifrare i dati precedenti. La rotazione consiste quindi in: aggiungere una chiave, spostare il puntatore attivo,
ricifrare in background e infine eliminare la vecchia chiave.

1. Aggiungere una nuova chiave al keyset (un file in `keys_folder`, oppure una voce `keys:`) e
   far puntare il puntatore attivo (`active.secret_key`, oppure `secret_key_file`) a essa.
   La modifica viene applicata entro `keys_poll_interval` (predefinito `15s`), oppure
   immediatamente con `kill -HUP <pid>`, senza bisogno di riavvio.
2. Eseguire `semaphore vault rekey` per ricifrare i dati esistenti con la nuova chiave.
3. Eseguire [`semaphore vault check`](#checking-key-usage-vault-check); quando la vecchia
   chiave mostra `0 rows`, può essere rimossa in sicurezza dal keyset.

### Opzioni {#options}

| Flag | Descrizione |
|------|-------------|
| `--old-key <key>` | Vecchia chiave di cifratura esplicita per una migrazione legacy a chiave singola. Non necessaria quando la vecchia chiave è già presente nel keyset come secondaria. Usata per decifrare i dati senza prefisso (legacy) privi di id di chiave impresso. |
| `--backup <file>` | Scrive in `<file>` un backup dei testi cifrati correnti delle Access Key prima di ricifrare. |
| `--rollback <file>` | Ripristina i testi cifrati delle Access Key da un file di backup invece di ricifrare. |

### Backup e rollback {#backup-and-rollback}

Effettuare uno snapshot dei testi cifrati correnti prima di ricifrare, e ripristinarlo
se qualcosa va storto:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

Il backup è un file JSON Lines, con una voce per ogni Access Key (`project_id`,
`key_id`, `secret`). Un rollback riscrive quei testi cifrati così come sono.

### Migrazione legacy a chiave singola {#legacy-single-key-migration}

Se i dati sono stati cifrati da una versione precedente di Semaphore che usava la singola
chiave `access_key_encryption` (senza rotazione, senza id di chiave impresso), passare quella chiave
esplicitamente in modo che possa essere decifrata prima di essere ricifrata con la chiave attiva:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

Non è necessario una volta che la vecchia chiave fa parte del keyset: Semaphore individua ogni
valore tramite l'id impresso e lo decifra automaticamente con la chiave corrispondente.

## Verificare l'uso delle chiavi (`vault check`) {#checking-key-usage-vault-check}

Sola lettura. Riporta, per ogni id di chiave, quanti segreti delle Access Key memorizzati localmente (e
la chiave di firma JWT) sono cifrati con quella chiave, oltre allo stato della chiave di firma JWT. Eseguirlo
dopo `vault rekey` per confermare che una chiave ritirata possa essere rimossa in sicurezza: una chiave con zero
riferimenti può essere eliminata dal keyset.

```bash
semaphore vault check
```

Esempio di output:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Ogni id di chiave viene riportato con uno dei seguenti stati:

| Stato | Significato |
|--------|---------|
| `active` | La chiave cifra attualmente le nuove scritture. |
| `retired, rekey pending` | La chiave cifra ancora alcune righe; eseguire `vault rekey` per spostarle sulla chiave attiva. |
| `retired, SAFE TO REMOVE` | Nessuna riga fa riferimento alla chiave (`0 rows`): può essere rimossa dal keyset. |
| `legacy (no id)` | Righe cifrate prima dell'introduzione degli id di chiave; eseguire il rekey per imprimere un id. |
| `MISSING KEY (cannot decrypt)` | Un id di chiave referenziato è assente dal keyset. |

L'ultima riga indica quale chiave cifra la chiave di firma JWT, oppure
`JWT signing key: not set` se non ne è ancora stata generata alcuna.

Se un segreto fa riferimento a un id di chiave assente dal keyset, il comando
segnala quelle righe ed **esce con uno stato diverso da zero**: aggiungere di nuovo la chiave mancante
al keyset prima che quei dati possano essere decifrati.
