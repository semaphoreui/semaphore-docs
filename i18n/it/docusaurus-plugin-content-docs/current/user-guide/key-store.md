---
title: Key Store
description: Guida completa alle credenziali nel Key Store di Semaphore, generazione di coppie di chiavi SSH, password di accesso, token segreti e archivi esterni.
---

# Key Store

Il **Key Store** funge da archivio centralizzato delle credenziali di Semaphore. Gestisce i materiali di autenticazione necessari per clonare repository Git remoti, connettersi agli host dell'infrastruttura di destinazione, elevare i privilegi (`sudo`/`become`) e decifrare i segreti di Ansible Vault.

![Key Store](/assets/key-store-keys.webp)

Il Key Store è suddiviso in due visualizzazioni principali:
* **Scheda Keys**: Elenca tutte le credenziali configurate per il progetto corrente, mostrandone nome, backend di archiviazione, tipo e stato di sincronizzazione.
* **Scheda Storages (Pro)**: Configura backend di segreti esterni (come HashiCorp Vault, OpenBao, AWS Secrets Manager o CyberArk) per la risoluzione dinamica e la sincronizzazione automatizzata.

---

## Tipi di credenziali {#types}

Semaphore suddivide le credenziali archiviate in quattro tipologie fondamentali:

### 1. Chiavi SSH {#1-ssh}
Le chiavi SSH forniscono un'autenticazione crittografica asimmetrica per connettersi a nodi Linux/UNIX e clonare repository Git tramite SSH (`git@github.com:...`).

Durante la configurazione di una credenziale di tipo chiave SSH, è possibile specificare:
* **Nome chiave**: Un'etichetta descrittiva per la credenziale negli inventari e modelli del progetto.
* **Nome utente (Opzionale)**: L'account utente remoto predefinito utilizzato per la connessione SSH (ad esempio `ansible` o `ubuntu`).
* **Passphrase (Opzionale)**: La passphrase necessaria per decifrare chiavi private protette. I campi di immissione della passphrase includono un'icona di visibilità (`occhio`) e sono mascherati per impostazione predefinita.
* **Chiave privata**: Il testo non crittografato della chiave privata PEM/OpenSSH.

#### Generatore di chiavi SSH integrato {#built-in-ssh-key-generator}

Anziché eseguire manualmente `ssh-keygen` su macchine esterne, Semaphore include un **generatore di coppie di chiavi SSH integrato con un clic** direttamente nella finestra modale:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Seleziona **Chiave SSH** dal menu a discesa **Tipo**.
2. Seleziona la casella **Genera chiave SSH**.
3. L'area di testo per la **chiave privata** manuale verrà automaticamente disabilitata e bloccata.
4. Fai clic su **Crea**. Semaphore genererà automaticamente una coppia di chiavi crittograficamente sicura (ED25519/RSA), cifrerà la chiave privata nel database e mostrerà la chiave pubblica in una finestra di dialogo dedicata:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Usa il pulsante **Copia negli appunti** per copiare la chiave pubblica e incollala nelle deploy key del tuo provider Git o nel file `~/.ssh/authorized_keys` dei tuoi nodi di destinazione.

#### Recupero delle chiavi pubbliche in un secondo momento (Cassetto chiave pubblica) {#extracting-public-keys-later}

Se chiudi la finestra di dialogo o hai bisogno di recuperare la chiave pubblica in seguito, non è necessario rigenerare la coppia di chiavi. Quando modifichi una chiave creata con il generatore, Semaphore mette a disposizione un cassetto espandibile **Chiave pubblica**:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Fai clic su **Mostra** / **Nascondi** per visualizzare la chiave pubblica.
* Fai clic sull'icona degli appunti per copiare immediatamente la chiave pubblica.

#### Collegamento delle deploy key ai principali provider Git

Per i repository Git che richiedono l'autenticazione SSH, aggiungi la chiave pubblica generata come deploy key in sola lettura:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Accesso con password {#2-login-with-password}

Il tipo di credenziale **Accesso con password** supporta sia l'autenticazione tradizionale con nome utente e password sia stringhe di segreti isolate:

* **Autenticazione host e sudo**: Fornisce l'accesso SSH basato su password e l'elevazione dei privilegi `sudo` sugli host di destinazione.
* **Autenticazione Git HTTPS**: Autentica sui repository remoti tramite HTTPS utilizzando nome utente e token di accesso personale (PAT).
* **Password Ansible Vault**: Sblocca file e variabili crittografati di Ansible Vault in fase di esecuzione.

:::tip Stringhe segrete e token di accesso personale (PAT)
Per archiviare una stringa segreta pura, come un token bearer per API o il segreto di un webhook, usa il tipo **Stringa** descritto sotto. Il tipo **Accesso con password** con il nome utente vuoto resta necessario per le password di Ansible Vault e i token Git HTTPS, perché quei consumatori accettano solo questo tipo.
:::

#### Mascheramento dei segreti e protezione dalla sovrascrittura {#secret-masking-and-override-protection}

Per proteggere le credenziali da accessi non autorizzati e modifiche accidentali:
* I campi di immissione di password e passphrase sono mascherati con controlli di visibilità opzionali.
* Durante la modifica di una credenziale esistente, i campi sensibili sono disabilitati per impostazione predefinita.
* Per aggiornare o sostituire un segreto esistente, è necessario selezionare esplicitamente la casella **Sovrascrivi** in calce al modulo. Questa protezione previene sovrascritture involontarie durante modifiche ordinarie.

---

### 3. Nessuno {#3-none}

La credenziale **Nessuno** funge da segnaposto per l'assenza di autenticazione. Viene utilizzata per repository Git open-source pubblici (come su GitHub o GitLab) ed esecuzioni locali di playbook che non richiedono chiavi SSH né password.

---

### 4. Stringa {#4-string}

La credenziale **Stringa** contiene un singolo valore segreto senza nome utente: un token API, il segreto di un webhook, una password da sola. Viene archiviata cifrata come ogni altra credenziale, non viene mai restituita dall'API né mostrata di nuovo nel modulo e può essere sostituita solo spuntando **Override**.

Dove si usa:
* **Integrazioni**: come *Auth secret* dei metodi di autenticazione Token, HMAC, GitHub e Bitbucket, vedi [Integrazioni](/user-guide/integrations#hmac-authentication).

Dove non è adatta, i selettori delle credenziali semplicemente non la propongono: la chiave SSH di un repository o di un inventario, le credenziali sudo e la password di Ansible Vault richiedono una chiave SSH o un nome utente/password.

Tramite l'API la stessa credenziale si crea con `"type": "string"`:

```bash
curl -X POST "https://semaphore.example.com/api/project/1/keys" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "name": "webhook-secret", "type": "string", "string": "s3cr3t"}'
```

---

## Archivi di segreti {#secret-storages}

Semaphore supporta architetture disaccoppiate di archiviazione dei segreti. Durante la creazione o la modifica, puoi scegliere dove risiede il materiale tramite le schede:

| Scheda archivio | Disponibilità | Descrizione |
| :--- | :--- | :--- |
| **Locale** | Open Source & Pro | Il segreto è archiviato nel database di Semaphore protetto da crittografia a busta. |
| **Storage** | Pro | Il segreto fa riferimento a un motore esterno (ad es. HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | Il segreto viene risolto dinamicamente all'esecuzione da una variabile d'ambiente del server. |
| **File** | Open Source & Pro | Il segreto viene letto da un file protetto memorizzato nella directory dei segreti configurata. |

![Archivi di segreti](/assets/key-store-storages.webp)

### Archiviazione nel database (Locale) {#database}

Per impostazione predefinita, i segreti vengono archiviati nel database applicativo in formato cifrato mediante crittografia simmetrica AES. La chiave principale è configurata tramite l'impostazione del server:
* Chiave di configurazione: `access_key_encryption`
* Variabile d'ambiente: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Generazione della chiave crittografica principale
Genera una chiave crittografica sicura da 32 byte in base64 prima di avviare istanze di produzione:
```bash
head -c32 /dev/urandom | base64
```
Assicurati di conservare un backup sicuro di questa chiave. Se viene smarrita, i segreti archiviati nel database non potranno più essere recuperati.
:::

### Origini da variabili d'ambiente e file (Sola lettura) {#environment-variable-or-file}

Quando selezioni la scheda **Env** o **File**, Semaphore considera l'archivio come un'origine esterna in sola lettura. L'interfaccia mostra un avviso informativo:

> **Read-only secret storage chosen.**

![Archiviazione in sola lettura](/assets/key-store-env-readonly-storage.webp)

* **Origine Env**: Specifica il nome esatto della variabile d'ambiente esportata sul server (ad esempio `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **Origine File**: Specifica il percorso relativo alla directory dei segreti configurata (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, predefinito `/tmp/semaphore`).

Per le chiavi strutturate, il contenuto di file e variabili deve essere formattato come oggetto JSON valido. Per i dettagli, consulta [Origini da variabili d'ambiente e file](/user-guide/key-store/env-and-file-sources).

### Motori di segreti aziendali esterni (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro ed Enterprise ampliano il Key Store con connettori nativi per i principali gestori di segreti aziendali:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: Connessione tramite autenticazione AppRole o Token per leggere e scrivere segreti KV v1/v2.
* **[OpenBao](/user-guide/key-store/openbao)**: Fork open-source compatibile con l'API di HashiCorp Vault.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: Integrazione con ruoli IAM AWS o credenziali statiche.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: Integrazione per la gestione centralizzata degli accessi privilegiati.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: Lettura e scrittura di segreti tramite l'API REST PVWA di CyberArk.

---

## Sincronizzazione dei segreti da archivi remoti {#syncing-secrets-from-remote-storages}

Anziché registrare manualmente le credenziali una per una, Semaphore supporta la sincronizzazione automatizzata da vault esterni.

Quando un segreto viene gestito tramite sincronizzazione:
* Viene contrassegnato con un badge **synchronized** attivo nella tabella del Key Store.
* La modifica manuale del segreto nell'interfaccia viene disabilitata per mantenere il vault esterno come unica fonte di verità.
* Qualsiasi aggiornamento o rotazione nel motore esterno si propaga automaticamente in Semaphore in base all'intervallo configurato.

Per le istruzioni di configurazione complete, consulta [Sincronizzazione dei segreti](/user-guide/key-store/secret-sync).
