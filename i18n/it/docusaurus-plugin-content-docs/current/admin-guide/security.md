# 🔐 Sicurezza

## Introduzione {#introduction}

La sicurezza è una priorità assoluta in Semaphore UI. Sia che si automatizzino attività critiche sull'infrastruttura, sia che si gestisca l'accesso del Team a sistemi sensibili, Semaphore UI è progettato per garantire operazioni solide e sicure già dalla configurazione iniziale. Questa sezione descrive come Semaphore gestisce la sicurezza e cosa considerare quando viene messo in produzione.

## Autenticazione e autorizzazione {#authentication--authorization}

Semaphore supporta un'autenticazione sicura e meccanismi di autorizzazione flessibili:

- **Metodi di accesso:**
  - **Nome utente/password**<br />Metodo predefinito che utilizza le credenziali memorizzate nel database di Semaphore. Le password non vengono mai memorizzate in chiaro: ne viene calcolato l'hash con Argon2id (vedere [Hashing delle password](#password-hashing)).

  - **LDAP**<br />Consente l'integrazione con i servizi di directory aziendali. Supporta il filtraggio di utenti e gruppi e le connessioni sicure tramite LDAPS.

  - **OpenID Connect (OIDC)**<br />Abilita il single sign-on con provider di identità come Google, Azure AD o Keycloak. Supporta claim personalizzati e mappature dei gruppi.

- **Autenticazione a due fattori (2FA)**<br />È disponibile la 2FA basata su TOTP, consigliata per tutti gli utenti. Può essere abilitata per singolo utente e supporta codici di recupero opzionali. Vedere le opzioni di configurazione `auth.totp.enabled` e `auth.totp.allow_recovery`.

- **Controllo degli accessi basato sui ruoli**<br />È possibile assegnare ruoli diversi agli utenti, come Admin, Maintainer o Viewer, limitando l'accesso in base alle responsabilità.

- **Gestione delle sessioni**<br />Le sessioni sono protette con cookie HTTP sicuri. I meccanismi di scadenza della sessione e di disconnessione garantiscono un'esposizione minima.
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### Hashing delle password {#password-hashing}

:::info Dalla v2.20
L'hashing delle password con Argon2id è disponibile da **Semaphore 2.20**. Le versioni precedenti utilizzano bcrypt.
:::

Le password degli utenti locali vengono sottoposte ad hashing con **Argon2id**, l'algoritmo consigliato da [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) per la memorizzazione delle password. Semaphore utilizza i parametri di robustezza minima indicati da OWASP:

| Parametro | Valore |
|-----------|-------|
| Memoria | 19 MiB (`m=19456`) |
| Iterazioni | 2 (`t=2`) |
| Parallelismo | 1 (`p=1`) |
| Salt | 16 byte casuali per ogni password |
| Lunghezza dell'hash | 32 byte |

Gli hash sono memorizzati nel [formato stringa PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md) standard, ad esempio `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`, in modo che i parametri utilizzati per ciascun hash siano registrati insieme ad esso.

Questo vale per ogni modalità con cui è possibile impostare una password: l'interfaccia web, l'API e i comandi CLI `semaphore user add`, `semaphore user change-by-login` e `semaphore setup`.

**Aggiornamento da versioni precedenti alla 2.20.** Le release precedenti alla 2.20 calcolavano l'hash delle password con bcrypt. Non è necessario alcun passaggio di migrazione:

- Gli hash bcrypt esistenti vengono ancora accettati all'accesso, quindi tutti gli utenti continuano a operare dopo l'aggiornamento.
- Al primo accesso riuscito, l'hash della password viene ricalcolato in modo trasparente con Argon2id e l'hash bcrypt viene sostituito.
- Se i parametri Argon2id di Semaphore vengono rafforzati in una release futura, gli hash creati con i parametri precedenti vengono aggiornati nello stesso modo al successivo accesso.

Poiché il ricalcolo dell'hash avviene soltanto all'accesso, gli utenti che non accedono più mantengono il proprio hash bcrypt. Per forzare l'aggiornamento di questi account, reimpostare la loro password con `semaphore user change-by-login --password ...` oppure tramite l'interfaccia di amministrazione.

:::note
I codici di recupero per l'autenticazione a due fattori non sono password utente e continuano a utilizzare bcrypt.
:::

## Segreti e credenziali {#secrets--credentials}

La gestione sicura dei segreti è una funzionalità fondamentale:

- **Key Store cifrato**<br />Le credenziali e le variabili segrete sono cifrate a riposo tramite cifratura AES.

- **Isolamento degli ambienti**<br />I segreti vengono passati ai job solo in fase di esecuzione e non sono esposti direttamente all'ambiente del container.

- **Chiavi SSH e token**<br />Gli utenti sono responsabili del caricamento di chiavi SSH e token validi. Questi vengono cifrati e utilizzati soltanto durante l'esecuzione dei Task.
- **Integrazione con HashiCorp Vault (Pro)**<br />I segreti possono essere memorizzati in un'istanza Vault esterna. La modalità di archiviazione si sceglie per singolo segreto durante la creazione o la modifica.

## Cifratura dei dati {#data-encryption}

I dati sensibili sono memorizzati nel database in forma cifrata. È necessario impostare l'opzione di configurazione `access_key_encryption` nel file di configurazione per abilitare la cifratura delle Access Key. Deve essere generata con il comando:

```bash
head -c32 /dev/urandom | base64
```

## Esecuzione di codice o playbook non affidabili {#running-untrusted-code--playbooks}

Semaphore esegue playbook e comandi definiti dall'utente, il che può comportare dei rischi:

- **Isolamento tramite container**<br />I Task vengono eseguiti in container Docker isolati. Questi container non hanno accesso al sistema host.

- **Privilegio minimo**<br />I container vengono eseguiti con permessi minimi e possono essere ulteriormente limitati tramite i flag di Docker.

- **Esecuzione in chroot**<br />Semaphore può eseguire i Task all'interno di una chroot jail per isolare ulteriormente l'ambiente di esecuzione dal sistema host.

- **Utente del processo del Task**<br />I Task possono essere eseguiti con un utente di sistema dedicato non root (ad esempio `semaphore`) per ridurre l'impatto di eventuali exploit. Questa opzione è facoltativa e può essere configurata in base alle policy di sistema.
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## Deployment sicuro {#secure-deployment}

Per garantire un deployment sicuro di Semaphore:

- **Utilizzare HTTPS**<br />
    Semaphore supporta HTTPS sia tramite il **supporto TLS integrato** sia tramite un **reverse proxy come Nginx**. Si raccomanda vivamente di abilitare HTTPS in produzione.

    Per abilitare il supporto HTTPS integrato, aggiungere il blocco seguente a **config.json**:
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **Eseguire dietro un firewall**<br />Limitare l'accesso a Semaphore UI e al database ai soli IP attendibili.

- **Sicurezza del database**<br />Utilizzare password complesse e consentire l'accesso al database solo a Semaphore.

## Aggiornamenti e gestione delle patch {#updates--patch-management}

Gli aggiornamenti di sicurezza vengono pubblicati regolarmente:

- **Mantenersi aggiornati**<br />Utilizzare sempre l'ultima release stabile.

- **Changelog**<br />Esaminare le modifiche su GitHub prima di aggiornare.

- **Aggiornamenti automatici**<br />Se si utilizza Docker, valutare l'uso di pipeline automatizzate per gli aggiornamenti periodici.

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## Segnalazione delle vulnerabilità {#reporting-vulnerabilities}

Hai individuato una vulnerabilità? Aiutaci a mantenere Semaphore sicuro:

- **Divulgazione responsabile**<br />Scrivere all'indirizzo `security@semaphoreui.com`.
 
### Obiettivi di risoluzione delle vulnerabilità {#vulnerability-resolution-targets}

L'obiettivo è risolvere le vulnerabilità segnalate entro i seguenti tempi:

- Critica: entro 30 giorni
- Alta: entro 60 giorni
- Media: entro 90 giorni
- Bassa: nella misura del possibile, in genere entro 180 giorni

Per i problemi attivamente sfruttati che interessano le ultime release stabili possono essere rilasciate patch fuori ciclo.

### Strumenti di sicurezza del codice {#code-security-tooling}

Vengono utilizzati CodeQL, Codacy, Snyk e Renovate per analizzare il codice e le dipendenze e per automatizzare gli aggiornamenti delle dipendenze.
- **Nessun exploit pubblico**<br />Non divulgare pubblicamente le vulnerabilità prima che siano state corrette.

- **Ringraziamenti**<br />I ricercatori di sicurezza possono essere citati nelle note di rilascio, se lo desiderano.
