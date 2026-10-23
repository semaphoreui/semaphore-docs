---
title: Archiviazione segreti CyberArk
description: Opzione Enterprise per leggere e archiviare segreti di Key Store in CyberArk Privileged Access Manager tramite l'API REST PVWA.
sidebar_custom_props:
  edition: pro
---

# Archiviazione segreti CyberArk <Enterprise />

Semaphore UI Enterprise può utilizzare **CyberArk Privileged Access Manager** (PAM Self-Hosted o Privilege Cloud) come archiviazione esterna per i segreti del Key Store al posto del database. Semaphore comunica con l'API REST di Password Vault Web Access (PVWA): ogni chiave Semaphore corrisponde a un **account** CyberArk all'interno di una **Safe**.

## Opzioni di configurazione {#configuration-options}

Quando crei un'archiviazione **CyberArk** in **Key Store → Storages**, configura:

| Campo | Descrizione |
|-------|-------------|
| **URL del server** | Indirizzo di base di PVWA, ad esempio `https://pvwa.example.com`. È accettato un `/PasswordVault` finale. Obbligatorio. |
| **Salta verifica certificato TLS** | Disabilita la convalida del certificato. Solo per ambienti di test. |
| **Metodo di autenticazione** | Metodo di accesso PVWA per l'utente Semaphore: `CyberArk` (predefinito), `LDAP`, `RADIUS` o `Windows`. |
| **Nome utente** | L'utente PVWA con cui Semaphore effettua l'accesso. Obbligatorio. |
| **Password** | Password di quell'utente. Può essere archiviata nel database, letta da una variabile d'ambiente o caricata da file. |
| **Safe predefinita** | Safe utilizzata quando una chiave fa riferimento a un account senza prefisso Safe e percorso di sincronizzazione predefinito. |
| **ID piattaforma per nuovi account** | Piattaforma assegnata agli account creati da Semaphore (ad esempio `UnixSSH`). Richiesto solo se l'archiviazione non è in sola lettura e crei chiavi da Semaphore. |
| **Indirizzo per nuovi account** | Proprietà indirizzo facoltativa per gli account creati da Semaphore. Alcune piattaforme la richiedono. |

L'archiviazione può operare in modalità di sola lettura. In questa modalità Semaphore legge e sincronizza solo gli account e non crea, aggiorna né elimina nulla nel Vault.

### Permessi PVWA richiesti {#required-pvwa-permissions}

Concedi all'utente Semaphore i seguenti permessi su ciascuna Safe utilizzata:

| Operazione | Permessi Safe |
|------------|---------------|
| Lettura chiave, sincronizzazione | **Elenca account**, **Recupera account** |
| Creazione chiave da Semaphore | **Aggiungi account** |
| Aggiornamento chiave da Semaphore | **Aggiorna valore password**, **Aggiorna proprietà account** |
| Eliminazione chiave da Semaphore | **Elimina account** |

Semaphore richiede sempre una sessione PVWA concorrente (`concurrentSession`), quindi più nodi Semaphore o un'attività in esecuzione e una sincronizzazione pianificata possono condividere lo stesso utente senza disconnettersi a vicenda. Ciò richiede PVWA 11.3 o successivo.

:::warning
Non abilitare "motivo obbligatorio" né l'integrazione con sistemi di ticketing per le Safe utilizzate da Semaphore. Semaphore invia un motivo predefinito ma non può fornire numeri di ticket.
:::

## Modalità d'uso {#how-to-use}

1. Nel tuo progetto, apri **Key Store → Storages** e crea un'archiviazione **CyberArk**.
2. Quando crei o modifichi una chiave, seleziona tale archiviazione e inserisci l'account come `Safe/AccountName`. Il nome dell'account è il nome oggetto visualizzato in PVWA. Se l'archiviazione ha una Safe predefinita, è sufficiente `AccountName`.
3. Facoltativamente configura [percorsi di sincronizzazione](/user-guide/key-store/secret-sync) per importare intere Safe automaticamente in base a una pianificazione.

### Mappatura tipi di chiave {#key-type-mapping}

| Tipo di chiave Semaphore | Account CyberArk |
|--------------------------|------------------|
| **Accesso con password** | Account password: `userName` diventa il login, il segreto dell'account diventa la password. |
| **SSH** | Account chiave (`secretType: key`): `userName` diventa il login, il segreto dell'account è la chiave privata. Le chiavi SSH con passphrase non possono essere archiviate in CyberArk. |
| **Segreto / stringa** | Account password senza nome utente. Il segreto dell'account viene usato così com'è. |

Quando Semaphore crea un account, la gestione automatica da parte del Central Policy Manager (CPM) viene disabilitata in modo che CyberArk non ruoti un segreto appena scritto da Semaphore. Se desideri che CyberArk ruoti la credenziale, gestisci l'account da PVWA e contrassegna l'archiviazione come sola lettura in Semaphore.

## Sincronizzazione dei segreti {#syncing-secrets}

Un percorso di sincronizzazione è il nome di una Safe. Semaphore importa ogni account della Safe come chiave denominata in base all'account (con il prefisso facoltativo). Il tipo di chiave viene rilevato dall'account: gli account chiave diventano chiavi SSH, gli account password con nome utente diventano chiavi di accesso con password e gli account senza nome utente diventano semplici segreti. Consulta [Sincronizzazione dei segreti da archiviazioni remote](/user-guide/key-store/secret-sync).
