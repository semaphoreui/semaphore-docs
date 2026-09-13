# Key Store

Il Key Store di Semaphore viene utilizzato per memorizzare le credenziali di accesso ai Repository remoti, agli host remoti, le credenziali sudo e le password dei vault di Ansible.

![Key Store](/assets/key-store-keys.webp)

La scheda **Keys** elenca le credenziali del Project con il relativo tipo. La scheda **Storages** (Pro) elenca gli archivi di segreti esterni configurati per il Project, vedere [Archivi di segreti](#secret-storages).

## Tipi {#types}

### 1. SSH {#1-ssh}
Le chiavi SSH vengono utilizzate per accedere ai server remoti e ai Repository remoti.

Se è necessario generare rapidamente una chiave e installarla sul proprio host, [qui è disponibile una guida rapida.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

Per i Repository Git che utilizzano l'autenticazione SSH, il Repository Git da cui si intende clonare deve avere la propria chiave pubblica associata alla chiave privata.

Di seguito i collegamenti alla documentazione di alcuni Repository Git comuni:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Login With Password {#2-login-with-password}
Login With Password è una combinazione di nome utente e password/token di accesso che può essere utilizzata per:
* Autenticarsi su host remoti (sebbene sia meno sicuro rispetto all'uso delle chiavi SSH)
* Fornire le credenziali sudo sugli host remoti
* Autenticarsi su Repository Git remoti tramite HTTPS (sebbene SSH sia più sicuro)
* Sbloccare i vault di Ansible

:::tip
    Questo tipo di segreto può essere utilizzato come Personal Access Token (PAT) o come stringa segreta. È sufficiente lasciare vuoto il campo Login.
:::

### 3. None {#3-none}
Viene utilizzato come segnaposto per i Repository che non richiedono autenticazione, come un Repository open source su GitLab.


## Archivi di segreti {#secret-storages}

Semaphore UI supporta diversi archivi per i segreti. È possibile scegliere l'archivio per ogni singolo segreto durante la creazione o la modifica.

Gli archivi esterni vengono creati nella scheda **Storages** del Key Store (Pro). Ogni archivio ha un nome e un tipo; le chiavi fanno poi riferimento all'archivio e al percorso del segreto al suo interno.

![Archivi di segreti](/assets/key-store-storages.webp)

### Database {#database}

Per impostazione predefinita i segreti vengono memorizzati nel database in forma cifrata. La chiave di cifratura si configura tramite l'opzione di configurazione
`access_key_encryption` oppure `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (deve essere generata con `head -c32 /dev/urandom | base64`).

### Variabile d'ambiente o file {#environment-variable-or-file}

Una chiave può leggere il proprio valore da una variabile d'ambiente del server Semaphore oppure da un file sul server
(ad esempio una chiave SSH montata nel container). Le schede **Env** e **File** del modulo della chiave consentono di selezionare questa modalità.

I file devono trovarsi all'interno della directory dei segreti configurata (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, predefinita `/tmp/semaphore`),
e le chiavi SSH e Login With Password devono essere incapsulate in un piccolo documento JSON.

[Ulteriori informazioni...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

I segreti possono essere memorizzati in un'istanza esterna di HashiCorp Vault invece che nel database.

[Ulteriori informazioni...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

I segreti possono essere memorizzati in un'istanza esterna di [OpenBao](https://openbao.org) (un fork open source e API-compatibile di HashiCorp Vault).

[Ulteriori informazioni...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![Static Badge](https://img.shields.io/badge/enterprise-yellow)

I segreti possono essere memorizzati in AWS Secrets Manager. L'autenticazione avviene tramite un ruolo IAM / instance profile oppure con access key statiche.

[Ulteriori informazioni...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

I segreti possono essere memorizzati in un'istanza esterna di Devolutions Server invece che nel database.

[Ulteriori informazioni...](/user-guide/key-store/devolutions-server)

## Sincronizzazione dei segreti dagli archivi remoti {#syncing-secrets-from-remote-storages}

Semaphore può importare automaticamente i segreti da un gestore di segreti esterno (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault o Devolutions Server) e mantenerli sincronizzati. I percorsi di sincronizzazione consentono di scegliere quali segreti importare e come denominarli.

[Ulteriori informazioni...](/user-guide/key-store/secret-sync)
