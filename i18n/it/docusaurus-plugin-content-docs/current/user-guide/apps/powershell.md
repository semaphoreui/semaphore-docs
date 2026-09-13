
# PowerShell

Semaphore può eseguire script PowerShell su host Windows (o da un runner Windows). Per farlo, creare un template di attività **PowerShell**.

## Creazione di un template PowerShell {#creating-a-powershell-template}

1. Andare nella sezione **Template di attività** e fare clic sul pulsante **Nuovo template**.
2. Selezionare **PowerShell** come tipo di app.
3. Configurare il template:

| Campo | Descrizione |
|---|---|
| **Nome** | Un nome descrittivo per il template |
| **Repository** | Repository contenente lo script `.ps1` |
| **Playbook / Script** | Percorso relativo dello script, ad es. `scripts/deploy.ps1` |
| **Gruppi di variabili** | Gruppi di variabili i cui valori vengono iniettati come variabili d'ambiente |

4. Fare clic su **Crea**.
5. Fare clic su **Esegui** per eseguire il template.

## Passaggio di variabili agli script {#passing-variables-to-scripts}

Le variabili dei **Gruppi di variabili** selezionati vengono iniettate come variabili d'ambiente prima dell'esecuzione dello script. È possibile accedervi in PowerShell con `$env:VARIABLE_NAME`:

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Esecuzione su host Windows {#running-on-windows-hosts}

I template PowerShell richiedono una delle seguenti condizioni:
- Un **runner Windows**: un runner Semaphore distribuito su un host Windows. Vedere [Runner](/admin-guide/runners).
- Il server Semaphore stesso in esecuzione su Windows.

## Note {#notes}

- Gli script vengono eseguiti in modo non interattivo. Evitare prompt che richiedono l'input dell'utente.
- Il codice di uscita `0` indica successo; qualsiasi codice di uscita diverso da zero contrassegna l'attività come fallita.
