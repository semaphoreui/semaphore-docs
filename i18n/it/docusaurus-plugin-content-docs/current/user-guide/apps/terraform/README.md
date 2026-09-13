
# Terraform/OpenTofu

Con Semaphore UI è possibile eseguire codice Terraform. Per farlo, è necessario creare un **Modello di codice Terraform**.

1. Andare nella sezione **Modelli di task** e fare clic sul pulsante **Nuovo modello**.
2. Selezionare **Terraform** come tipo di app.
3. Configurare il modello e fare clic sul pulsante **Crea**.
4. Fare clic su **Esegui** per eseguire il modello.

## Passaggio delle variabili {#passing-variables}

Le variabili dei **Gruppi di variabili** selezionati vengono iniettate come variabili d'ambiente. Aggiungere il prefisso `TF_VAR_` ai nomi affinché Terraform le riconosca come variabili di input:

| Chiave del gruppo di variabili | Variabile Terraform |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

Per i valori sensibili, utilizzare la scheda **Segreti** dei Gruppi di variabili: vengono cifrati a riposo.

## Workspace {#workspaces}

Semaphore supporta nativamente i workspace di Terraform/OpenTofu. Consultare [Workspace](./workspaces) per creare e cambiare workspace e per utilizzare chiavi SSH con i moduli privati.

## Override del backend e backend HTTP (Pro) {#backend-override-and-http-backend-pro}

È possibile sovrascrivere il backend in un modello per utilizzare il backend HTTP integrato senza modificare il codice Terraform. Consultare [Backend HTTP (Pro)](./states) per i dettagli.

## Flag destroy e migrazione dello stato {#destroy-flag-and-state-migration}

La finestra di avvio del task include gli interruttori `-destroy` e `-migrate-state`. Utilizzarli per smantellare l'infrastruttura o per migrare lo stato di Terraform.

## Note {#notes}

- Semaphore esegue automaticamente `terraform init` prima di ogni esecuzione.
- Lo stato è gestito dal backend configurato nel codice Terraform (locale, S3, GCS, ecc.), a meno che non si utilizzi il backend HTTP integrato (Pro).
