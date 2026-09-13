---
title: "Archivio di segreti HashiCorp Vault"
---

# Archivio di segreti HashiCorp Vault <Pro />

Semaphore UI supporta HashiCorp Vault come archivio per i segreti.

![](/assets/vault1.webp)

È possibile specificare le seguenti opzioni:
- **URL di HashiCorp Vault** — indirizzo del server Vault.
- **Mount** — il percorso di mount del secrets engine.
- **Token** — token di autenticazione. Il token può essere:
    - Archiviato nel database.
    - Fornito tramite una variabile d'ambiente.
    - Fornito tramite un file (utile per Vault Agent).
      :::warning
      Quando il token proviene da un **file**, tale file deve trovarsi **all'interno** della directory dei segreti utilizzata da Semaphore. Configurare questa directory tramite `dirs.secrets` o la variabile d'ambiente `SEMAPHORE_SECRETS_PATH`. L'opzione legacy di primo livello `secrets_path` è ancora accettata per le configurazioni meno recenti. Se nessuna di queste è impostata, il valore predefinito è `/tmp/semaphore`. Consultare [Directory dei segreti](/admin-guide/configuration/config-file#secrets-directory) per i dettagli sulla precedenza.

      Esempio di frammento di `config.json`:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

L'archivio può funzionare in modalità di sola lettura.

## Come utilizzarlo {#how-to-use}

1. Configurare la connessione a HashiCorp Vault nelle impostazioni di Semaphore (URL, percorso di mount e token).
2. Durante la creazione o la modifica di una chiave nel Key Store, selezionare **HashiCorp Vault** come tipo di archivio.
3. Fornire il percorso del segreto in Vault in cui la credenziale deve essere archiviata.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Invece di archiviare direttamente il token di Vault, è possibile utilizzare [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) per gestire automaticamente il recupero e il rinnovo del token.

Vault Agent viene eseguito come processo sidecar accanto a Semaphore e scrive un token valido in un file su disco. Semaphore legge quindi il token da tale file.

Per configurarlo:

1. Configurare ed eseguire Vault Agent con un [metodo di auto-auth](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) appropriato (ad es. AppRole, Kubernetes, AWS IAM).
2. Impostare Vault Agent in modo che scriva il token in un file tramite un blocco `sink`, ad esempio:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. In Semaphore, durante la configurazione della connessione a HashiCorp Vault, selezionare **File** come sorgente del token e fornire il percorso del file del token (ad es. `/etc/vault/token`).

Questo approccio evita token statici a lunga durata e consente a Vault Agent di gestire automaticamente l'autenticazione e il rinnovo del token.


## Gruppi di variabili {#variable-groups}

HashiCorp Vault può essere utilizzato anche come archivio per i [Gruppi di variabili](/user-guide/environment). Durante la modifica di un gruppo di variabili, selezionare **HashiCorp Vault** come tipo di archivio e specificare il percorso della cartella in cui verranno archiviati i segreti.

![](/assets/vault3.webp)

