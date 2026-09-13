---
id: encryption
title: Chiavi di cifratura
sidebar_label: Chiavi di cifratura
description: Come Semaphore cifra i segreti, configura le chiavi di cifratura e le ruota senza interruzioni del servizio.
---

# Chiavi di cifratura

Semaphore cifra i dati più sensibili che memorizza — i **segreti delle Access Key**
(chiavi private SSH, coppie login/password, stringhe segrete) e la **chiave di firma
JWT** — utilizzando AES‑256‑GCM. Questa pagina spiega come configurare tali chiavi, come
funziona la rotazione e come gestirla in sicurezza.

:::info Due chiavi, due scopi

| Chiave | Protegge | Puntatore attivo |
|-----|----------|----------------|
| **Chiave dei segreti** | Segreti delle Access Key memorizzati nel database | `active.secret_key` |
| **Chiave delle opzioni** | Opzioni cifrate del DB (la chiave di firma JWT) | `active.option_key` |

Se non è configurata alcuna chiave delle opzioni, le opzioni ricadono sulla chiave dei segreti.
:::

---

## Avvio rapido {#quick-start}

La configurazione più semplice è una singola chiave fornita nella configurazione principale:

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

Generare una chiave con:

```bash
openssl rand -base64 32
```

Tutto qui — Semaphore ora cifra i segreti con `key1`. La stessa chiave viene usata per
la chiave di firma JWT (le opzioni ricadono sulla chiave dei segreti).

:::tip Produzione
Preferire i **riferimenti `file:`** o una **`keys_folder`** (vedere sotto) rispetto a
`value:` inline, in modo che il materiale della chiave risieda in un secret montato anziché nella configurazione.
:::

---

## Come vengono identificate le chiavi {#how-keys-are-identified}

Ogni chiave ha un **id chiave** derivato dal materiale stesso della chiave — un'impronta,
`base64url(sha256(key))[:8]`. L'id (non la chiave) viene memorizzato insieme a ogni
valore cifrato, quindi la decifratura è una ricerca diretta della chiave esatta che lo ha scritto.

Questo significa che:

- **Le etichette possono essere rinominate liberamente.** `key1`, `secrets_key_primary.txt` — servono
  agli esseri umani. Il database non le memorizza mai, solo l'impronta.
- **Una chiave non può mai essere puntata in modo errato.** Se cambiano i byte di una chiave, diventa un *nuovo*
  id; i vecchi dati continuano a fare riferimento al vecchio id.
- **La rimozione di una chiave fallisce in modo esplicito**, non silenzioso — un id chiave mancante è un
  errore esplicito, mai un output corrotto.

Gli id non vengono mai impostati manualmente; è Semaphore a calcolarli.

---

## Il file delle chiavi {#the-keys-file}

`encryption.keys_file` punta a un file il cui contenuto è un **registro di chiavi**
più i **puntatori** alla chiave attiva per ciascuno scopo. Viene interpretato come **YAML o JSON,
indipendentemente dall'estensione del file**.

Esistono due modi per fornire il registro — una mappa inline, una cartella di file, oppure
entrambi combinati.

### Mappa inline {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

Ogni voce è un [`KeySource`](#keysource): o `value` (base64 inline) **oppure**
`file` (percorso di un file contenente la chiave base64) — mai entrambi.

### Cartella di file chiave {#folder-of-key-files}

Far puntare `keys_folder` a una directory; **ogni file regolare è una chiave**, etichettata con
il proprio nome file. Ideale per i secret montati di Docker/Kubernetes.

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

:::note Compatibile con Kubernetes
`keys_folder` ignora le voci che iniziano con un punto (`..data`, `..2024_*`) e segue
i link simbolici, quindi funziona direttamente con il modo in cui Kubernetes monta i volumi
`Secret`/`ConfigMap`.
:::

### Combinato {#combined}

`keys` e `keys_folder` si fondono in un unico registro; `active` può puntare per etichetta
*oppure* per nome file:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## Rotazione (senza interruzioni) {#rotation-zero-downtime}

La chiave attiva cifra le **nuove** scritture; ogni altra chiave nel registro può ancora
**decifrare** i vecchi dati. La rotazione consiste quindi in: aggiungere una chiave, spostare il puntatore,
ricifrare in background, quindi eliminare la vecchia chiave.

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

In nessun passaggio è necessario riavviare il processo.

### Applicare le modifiche senza riavvio {#applying-changes-without-a-restart}

Semaphore rilegge il file delle chiavi (e i file chiave a cui fa riferimento) e sostituisce
atomicamente le chiavi in memoria. Due meccanismi di attivazione:

| Attivazione | Comportamento |
|---------|-----------|
| **Watcher di file** | Effettua il polling ogni `encryption.keys_poll_interval` (predefinito `15s`). Impostare a `"0"` per disabilitarlo. |
| **`SIGHUP`** | `kill -HUP <pid>` forza un ricaricamento immediato (solo Unix). |

:::caution Windows
Windows non ha `SIGHUP`. Affidarsi al **poller** (l'impostazione predefinita) — funziona su ogni
piattaforma — oppure riavviare il servizio.
:::

Un ricaricamento convalida prima le nuove chiavi e, in caso di errore, lascia intatte le chiavi
in uso.

---

## Comandi CLI {#cli-commands}

### `vault check` {#vault-check}

Sola lettura. Riporta, per ogni id chiave, quanti segreti memorizzati cifra, così da poter
vedere cosa si trova sulla chiave attiva e cosa è sicuro rimuovere.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Stati: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)` e `MISSING KEY` (una chiave referenziata è assente — codice di uscita 1).

### `vault rekey` {#vault-rekey}

Ricifra tutti i segreti memorizzati (e la chiave di firma JWT) con la chiave attiva.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Compatibilità con le versioni precedenti {#backward-compatibility}

L'aggiornamento è sicuro e **non richiede alcuna migrazione dei dati**:

- Le installazioni esistenti che impostano **`access_key_encryption`** (o la
  variabile d'ambiente `SEMAPHORE_ACCESS_KEY_ENCRYPTION`) continuano a funzionare senza modifiche — quella
  chiave semplice diventa la chiave dei segreti attiva.
- I dati scritti da versioni precedenti di Semaphore (senza id chiave) vengono ancora decifrati. Alla successiva scrittura,
  o dopo `vault rekey`, vengono contrassegnati nuovamente con un id chiave.
- **Nessuna cifratura** (nessuna chiave configurata) continua a memorizzare i segreti come
  semplice base64 e a decifrarli allo stesso modo.

Per migrare una vecchia installazione a chiave singola verso un file delle chiavi, è sufficiente includere la vecchia chiave
nel registro:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

I vecchi dati vengono decifrati tramite `old`; eseguire `vault rekey` per spostare tutto su `new`.

---

## Kubernetes e Docker {#kubernetes--docker}

Montare le chiavi come volume `Secret` e far puntare `keys_folder` a esso:

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

Quando si aggiorna il `Secret`, Kubernetes aggiorna i file montati e il
poller applica la modifica entro `keys_poll_interval` — senza riavvio del pod.

---

## Best practice di sicurezza {#security-best-practices}

:::danger Proteggere il file delle chiavi
- Limitare i permessi: `chmod 0400`, di proprietà dell'utente del servizio Semaphore.
- **Non eseguire mai il commit di chiavi reali** nel controllo di versione — aggiungere il file a `.gitignore`.
- Eseguirne il backup in modo sicuro. **Perdere tutte le chiavi significa perdere tutti i dati cifrati.**
- Preferire i secret montati (`file:` / `keys_folder`) rispetto a `value:` inline, e le variabili
  d'ambiente rispetto a nessuno dei due — `value:` mantiene la chiave nel file di configurazione.
:::

---

## Riferimento {#reference}

### `encryption` (configurazione principale) {#encryption-main-config}

| Campo | Variabile d'ambiente | Predefinito | Descrizione |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Percorso del file delle chiavi (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | Frequenza di polling del file delle chiavi. `"0"` disabilita il polling. |

### Chiavi semplici legacy (configurazione principale) {#legacy-flat-keys-main-config}

| Campo | Variabile d'ambiente | Descrizione |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Singola chiave dei segreti, senza rotazione. Usata quando `keys_file` non è impostato. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Singola chiave delle opzioni, senza rotazione. Ricade sulla chiave dei segreti. |

### File delle chiavi {#keys-file}

| Campo | Descrizione |
|-------|-------------|
| `keys` | Mappa `etichetta → KeySource` (registro inline). |
| `keys_folder` | Directory di file chiave (un file regolare per chiave, etichettato con il nome file). |
| `active.secret_key` | Etichetta (in `keys`) della chiave dei segreti attiva. |
| `active.option_key` | Etichetta della chiave delle opzioni attiva. |
| `active.secret_key_file` | Nome file in `keys_folder` della chiave dei segreti attiva (relativo). |
| `active.option_key_file` | Nome file in `keys_folder` della chiave delle opzioni attiva (relativo). |

### KeySource {#keysource}

| Campo | Descrizione |
|-------|-------------|
| `value` | Materiale della chiave in base64 inline. |
| `file` | Percorso di un file contenente la chiave base64. |

`value` e `file` si escludono a vicenda. Le chiavi devono essere il base64 di **16, 24 o 32
byte** (AES‑128/192/256).

---

## Risoluzione dei problemi {#troubleshooting}

| Sintomo | Causa / soluzione |
|---------|-------------|
| Panic all'avvio: `encryption_keys… not found` / `invalid` | Il file delle chiavi o un file chiave referenziato è mancante/malformato, oppure una chiave non è un base64 valido di 16/24/32 byte. Correggere il file; l'avvio fallisce subito di proposito. |
| `vault check` mostra `MISSING KEY <id>` (uscita 1) | I dati sono stati cifrati con una chiave non più presente nel registro. Aggiungere nuovamente quella chiave prima di poterli decifrare. |
| `cannot decrypt access key, perhaps encryption key was changed` | Un valore legacy (senza prefisso) non può essere decifrato da nessuna chiave configurata. Assicurarsi che la chiave originale sia presente (nel registro o in `access_key_encryption`). |
| Rotazione non applicata | Controllare `keys_poll_interval` (non `"0"`) e che il file delle chiavi sia effettivamente cambiato; oppure inviare `SIGHUP`. |
| `active.secret_key: no key labelled "…"` | Il puntatore attivo indica un'etichetta/nome file che non è presente in `keys`/`keys_folder`. |
