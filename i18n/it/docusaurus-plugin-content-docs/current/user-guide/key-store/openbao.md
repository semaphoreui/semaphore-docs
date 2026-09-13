---
title: "Archivio di segreti OpenBao"
---

# Archivio di segreti OpenBao <Pro />

Semaphore UI supporta [OpenBao](https://openbao.org) come archivio per i segreti.

OpenBao è un fork open source di HashiCorp Vault ed è compatibile con esso a livello di API, quindi l'archivio funziona esattamente come l'[archivio HashiCorp Vault](/user-guide/key-store/hashicorp-vault).

È possibile specificare le seguenti opzioni:
- **URL del server** — indirizzo del server OpenBao.
- **Mount** — il percorso di mount del secrets engine KV v2 (`secret` per impostazione predefinita).
- **Namespace** — namespace OpenBao (v2.3+), facoltativo.
- **Token** — token di autenticazione. Il token può essere:
    - Archiviato nel database.
    - Fornito tramite una variabile d'ambiente.
    - Fornito tramite un file.
      :::warning
      Quando il token proviene da un **file**, tale file deve trovarsi **all'interno** della directory dei segreti utilizzata da Semaphore. Configurare questa directory tramite `dirs.secrets` o la variabile d'ambiente `SEMAPHORE_SECRETS_PATH`. L'opzione legacy di primo livello `secrets_path` è ancora accettata per le configurazioni meno recenti. Se nessuna di queste è impostata, il valore predefinito è `/tmp/semaphore`. Consultare [Directory dei segreti](/admin-guide/configuration/config-file#secrets-directory) per i dettagli sulla precedenza.
      :::

L'archivio può funzionare in modalità di sola lettura.

## Come utilizzarlo {#how-to-use}

1. Nel progetto, aprire **Key Store** → **Archivi** e creare un nuovo archivio **OpenBao** (URL, percorso di mount e token).
2. Durante la creazione o la modifica di una chiave nel Key Store, selezionare l'archivio OpenBao come tipo di archivio.
3. Fornire il percorso del segreto in OpenBao in cui la credenziale deve essere archiviata.

## Sincronizzazione dei segreti {#syncing-secrets}

I segreti archiviati in OpenBao possono essere importati automaticamente nel Key Store e mantenuti sincronizzati, come avviene con gli altri archivi esterni. Consultare [Sincronizzazione dei segreti da archivi remoti](/user-guide/key-store/secret-sync).

## Gruppi di variabili {#variable-groups}

OpenBao può essere utilizzato anche come archivio per i [Gruppi di variabili](/user-guide/environment). Durante la modifica di un gruppo di variabili, selezionare l'archivio OpenBao come tipo di archivio e specificare il percorso della cartella in cui verranno archiviati i segreti.

