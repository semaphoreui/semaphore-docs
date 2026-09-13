---
title: "Backend HTTP"
sidebar_custom_props:
  edition: pro
---

# Backend HTTP <Pro />

Il backend HTTP di Semaphore UI per Terraform archivia e gestisce in modo sicuro i file di stato di Terraform direttamente all'interno di Semaphore. Disponibile nel piano Pro, offre diversi vantaggi chiave.

## Funzionalità {#features}

- **Archiviazione sicura dello stato**: i file di stato vengono <!-- encrypted and--> archiviati in modo sicuro all'interno di Semaphore.
- **Blocco dello stato**: impedisce modifiche concorrenti allo stesso file di stato.
- **Cronologia delle versioni**: consente di tracciare nel tempo le modifiche allo stato dell'infrastruttura.
- **Integrazione con l'interfaccia**: gestione dei file di stato direttamente dall'interfaccia di Semaphore.

## Configurazione {#configuration}

Per iniziare a utilizzare il backend HTTP integrato, è necessario prima creare un workspace per il modello di task Terraform.

Per aggiungere un workspace, andare nella scheda **Workspace** del modello Terraform/OpenTofu.

Durante la creazione di un workspace, verrà chiesto di selezionare una chiave SSH per clonare i moduli privati utilizzati nel codice Terraform. Se non si utilizzano moduli privati, selezionare semplicemente l'opzione `None`.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### Utilizzo del backend HTTP nei task {#using-the-http-backend-in-tasks}

Per utilizzare il backend HTTP integrato per archiviare lo stato dei task Terraform, non è necessario configurare manualmente il backend nel codice Terraform. Semaphore può creare automaticamente il file di configurazione durante l'esecuzione. Per abilitare questa funzione, è sufficiente selezionare l'opzione **Sovrascrivi impostazioni del backend** nelle impostazioni del modello di task, come mostrato nello screenshot seguente.


Facoltativamente, è possibile specificare il nome del file di configurazione che verrà creato dinamicamente durante l'esecuzione. Questo è utile se il codice contiene già un file di configurazione del backend e occorre sovrascriverlo dinamicamente per funzionare con il backend integrato di Semaphore.

### Utilizzo del backend HTTP al di fuori di Semaphore {#using-the-http-backend-outside-semaphore}

È possibile utilizzare il backend HTTP integrato non solo durante l'esecuzione dei task all'interno di Semaphore, ma anche quando si esegue codice Terraform al di fuori di Semaphore, ad esempio dal terminale locale.

A tale scopo, Semaphore consente di creare alias (endpoint HTTP univoci) per l'archiviazione dello stato. Questi alias facilitano il riferimento ai file di stato da ambienti esterni.

Per configurarlo, andare nella scheda **Workspace**, selezionare il workspace desiderato e aggiungere un alias. Sarà inoltre necessario scegliere una chiave con nome utente e password, che verrà utilizzata per autenticare l'accesso al backend.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

Successivamente, è necessario aggiungere le impostazioni del backend al codice Terraform:

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

Ora Terraform utilizzerà il backend HTTP integrato di Semaphore anche quando viene eseguito dal terminale:

```
terraform apply
```

