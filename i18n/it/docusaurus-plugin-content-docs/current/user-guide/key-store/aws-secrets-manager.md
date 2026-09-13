# Archivio di segreti AWS Secrets Manager

<Enterprise />

Semaphore UI Enterprise può utilizzare **AWS Secrets Manager** come archivio esterno per i segreti del Key Store anziché il database.

## Opzioni di configurazione {#configuration-options}

Quando si crea un archivio **AWS Secrets Manager** in **Key Store → Archivi**, configurare:

| Campo | Descrizione |
|-------|-------------|
| **Regione** | Regione AWS in cui risiedono i segreti (ad esempio `us-east-1`). Obbligatoria. |
| **URL endpoint** | Endpoint personalizzato facoltativo. Lasciare vuoto per l'endpoint API AWS standard. Utile per LocalStack o per gli endpoint VPC. |
| **Usa ruolo IAM / profilo dell'istanza** | Se abilitato, Semaphore utilizza la catena di credenziali AWS dell'ambiente (profilo dell'istanza EC2, ruolo del task ECS, IRSA di EKS, ecc.) e non richiede chiavi di accesso statiche. |
| **Access Key ID** | Obbligatorio quando la modalità ruolo IAM è disattivata. |
| **Secret Access Key** | Obbligatoria quando la modalità ruolo IAM è disattivata. Può essere archiviata nel database, letta da una variabile d'ambiente o caricata da un file. |

### Ruolo IAM vs chiavi di accesso {#iam-role-vs-access-keys}

- **Ruolo IAM / profilo dell'istanza** (consigliato su AWS): abilitare **Usa ruolo IAM / profilo dell'istanza** e concedere all'host del server o del runner Semaphore l'autorizzazione a leggere i segreti a cui si fa riferimento. In Semaphore non viene archiviata alcuna chiave a lunga durata.
- **Chiavi di accesso**: lasciare la casella deselezionata e fornire una coppia di chiavi di accesso di un utente o ruolo IAM con `secretsmanager:GetSecretValue` (e le relative autorizzazioni list/describe per la sincronizzazione).

Durante la modifica di un archivio esistente, Semaphore deduce la modalità ruolo IAM se non è stato salvato alcun Access Key ID.

## Come utilizzarlo {#how-to-use}

1. Nel progetto, aprire **Key Store → Archivi** e creare un archivio **AWS Secrets Manager**.
2. Durante la creazione o la modifica di una chiave, selezionare tale archivio e fornire il nome o l'ARN del segreto in AWS Secrets Manager.
3. Facoltativamente, configurare i [percorsi di sincronizzazione](/user-guide/key-store/secret-sync) per importare automaticamente i segreti secondo una pianificazione.

L'archivio può funzionare in modalità di sola lettura.

## Sincronizzazione dei segreti {#syncing-secrets}

I segreti in AWS Secrets Manager possono essere importati nel Key Store e mantenuti sincronizzati come per gli altri archivi esterni. Il separatore di percorso predefinito è `/`. Consultare [Sincronizzazione dei segreti da archivi remoti](/user-guide/key-store/secret-sync).

