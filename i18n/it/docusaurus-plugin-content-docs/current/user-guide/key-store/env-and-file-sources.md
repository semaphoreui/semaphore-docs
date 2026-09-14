# Chiavi da variabili d'ambiente e file

Oltre ad archiviare un segreto nel database, una voce del Key Store può leggere il proprio valore al momento dell'esecuzione del task
da un **file** sul server Semaphore oppure da una **variabile d'ambiente** del processo del server Semaphore.
Questo è utile quando la credenziale è già provisionata al di fuori di Semaphore, ad esempio:

* una chiave SSH montata nel container di Semaphore come secret di Docker o Kubernetes;
* un token scritto su disco da un agent (HashiCorp Vault Agent, cert-manager, ecc.) e ruotato regolarmente;
* una password iniettata nell'ambiente del container dall'orchestratore.

Semaphore non copia il valore nel proprio database. Ogni volta che un task ha bisogno della chiave, il server
legge nuovamente il file o la variabile, quindi la rotazione della credenziale su disco ha effetto a partire dal task successivo.

:::info
Il file o la variabile viene letto dal **server Semaphore**, non da un runner. Quando si utilizzano runner remoti,
montare il file sull'host del server; il server risolve il segreto e lo consegna al runner.
:::

## Scelta della sorgente {#choosing-the-source}

Quando si crea o si modifica una chiave (**Key Store → New Key**), nella parte superiore del modulo sono presenti le schede della sorgente:

| Scheda | Da dove proviene il valore | Cosa inserire |
|--------|----------------------------|---------------|
| **Local** | Database di Semaphore (cifrato) | Il login, la password o la chiave privata nel modulo |
| **Storage** <Pro /> | Un archivio di segreti esterno come [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | L'archivio e il percorso del segreto |
| **Env** | Una variabile d'ambiente del processo del server Semaphore | Il nome della variabile, ad esempio `PROD_SSH_KEY` |
| **File** | Un file sul server Semaphore | Il percorso **assoluto** del file, ad esempio `/var/lib/semaphore/secrets/prod.json` |

Con **Env** o **File** selezionati, i campi login, password e chiave privata scompaiono. L'intera
credenziale, incluso il login per le chiavi SSH e Accesso con password, deve trovarsi nel file o nella variabile.

## 1. Consentire la directory {#allow-the-directory}

Per motivi di sicurezza, Semaphore legge solo i file di chiave che si trovano all'interno della propria **directory dei segreti**. Qualsiasi altro
percorso viene rifiutato all'avvio di un task:

```
Failed to install inventory: file path must be inside secrets path
```

La directory dei segreti predefinita è `/tmp/semaphore`. Impostarla sulla directory in cui si trovano i file di chiave
tramite `dirs.secrets` in `config.json` oppure la variabile d'ambiente `SEMAPHORE_SECRETS_PATH`.
Consultare [Directory dei segreti](/admin-guide/configuration/config-file#secrets-directory) per le regole di precedenza.

Esempio con Docker Compose che monta una directory dell'host e la consente:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

Frammento equivalente di `config.json`:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Regole per il percorso inserito nella scheda **File**:

* deve essere assoluto (`/var/lib/semaphore/secrets/prod.json`, non `prod.json`);
* non deve contenere segmenti `..`;
* deve risolversi in una posizione all'interno della directory dei segreti (le sottodirectory sono ammesse);
* il file deve essere leggibile dall'utente con cui viene eseguito Semaphore (nell'immagine Docker ufficiale è `semaphore`, UID 1001).

Le variabili d'ambiente non hanno alcuna restrizione di questo tipo; il server legge semplicemente la variabile indicata dal proprio ambiente.

## 2. Formattare il valore {#format-the-value}

Il contenuto del file (o il valore della variabile) dipende dal tipo di chiave. Un singolo carattere di fine riga
alla fine di un file viene ignorato; tutto il resto viene utilizzato così com'è.

### Chiave SSH {#ssh-key}

Semaphore si aspetta un **documento JSON**, non un file di chiave privata PEM o OpenSSH grezzo:

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — il nome utente SSH, passato ad Ansible come `--user`. Lasciarlo vuoto per lasciare che sia l'inventory a decidere (`ansible_user`). Per i repository Git un login vuoto corrisponde per impostazione predefinita a `git`.
* `passphrase` — la passphrase della chiave privata, oppure una stringa vuota.
* `private_key` — la chiave privata con le interruzioni di riga codificate come `\n`.

Generare il documento a partire da una chiave esistente con `jq`, che si occupa dell'escaping:

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

Quindi creare una chiave di tipo **SSH**, aprire la scheda **File** e inserire `/var/lib/semaphore/secrets/prod_ssh.json`
(il percorso come visto **all'interno** del container).

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
Far puntare la scheda **File** a una chiave privata grezza come `~/.ssh/id_ed25519` non funziona.
Il file viene interpretato come JSON e il task non riesce a caricare l'inventory.
:::

### Accesso con password {#login-with-password}

Anche in questo caso un documento JSON:

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

Lasciare `login` vuoto per utilizzare la chiave come semplice token o password, ad esempio come password di Ansible Vault.

## Esempio con variabile d'ambiente {#environment-variable-example}

Lo stesso formato JSON si applica alla scheda **Env**. In Docker Compose:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

Creare una chiave **SSH**, selezionare la scheda **Env** e inserire `PROD_SSH_KEY` come nome della variabile.

:::tip
Le variabili d'ambiente sono visibili a tutti i processi del container e spesso finiscono nei
metadati e nei log dell'orchestratore. Quando possibile, preferire la scheda **File** con un secret montato.
:::

## Risoluzione dei problemi {#troubleshooting}

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| `file path must be absolute` | È stato inserito un percorso relativo | Inserire il percorso completo che inizia con `/` |
| `file path must not contain traversal segments` | Il percorso contiene `..` | Inserire il percorso risolto |
| `file path must be inside secrets path` | Il file si trova al di fuori di `dirs.secrets` | Impostare `SEMAPHORE_SECRETS_PATH` sulla directory del file, oppure spostare il file |
| `no such file or directory` | Il percorso è errato oppure non è montato nel container | Verificare il mount del volume e utilizzare il percorso interno al container |
| `permission denied` | Il processo di Semaphore non può leggere il file | Correggere il proprietario o i permessi del file |
| `invalid character '-' looking for beginning of value` | È stata fornita una chiave privata grezza al posto del documento JSON | Incapsulare la chiave come mostrato sopra |
