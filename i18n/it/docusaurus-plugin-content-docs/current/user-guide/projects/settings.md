# Settings

La scheda **Settings** della dashboard del Project è disponibile per i **Owner** del Project. Contiene le opzioni generali del Project e le azioni distruttive.

![Impostazioni del Project](/assets/project-settings-general.webp)

## Generali {#general}

| Campo | Descrizione |
|---|---|
| **Project Name** | Nome visualizzato mostrato nel selettore dei Project e negli avvisi. |
| **Max number of parallel tasks** | Facoltativo. Numero massimo di Task di questo Project eseguibili contemporaneamente. Lasciare vuoto per non impostare alcun limite. I Task oltre il limite rimangono in coda con lo stato `waiting` fino alla liberazione di uno slot. |
| **Telegram Chat ID** | Facoltativo. Invia gli avvisi di questo Project a una chat Telegram diversa da quella configurata globalmente. Vedere [Notifiche Telegram](/admin-guide/notifications/telegram#per-project-chat-ids). |
| **Allow alerts for this project** | Interruttore principale delle notifiche. Quando è disattivato, nessun canale invia avvisi relativi ai Task di questo Project, anche se il canale è configurato sul server. |

**Test alerts** invia un messaggio di prova attraverso ogni [canale di notifica](/admin-guide/notifications) configurato, così da poter verificare la configurazione del server senza eseguire un Task. **Save** applica le modifiche.

## Danger Zone {#danger-zone}

| Azione | Effetto |
|---|---|
| **Backup project** | Scarica un file JSON con la definizione del Project: Task Template, Inventory, Variable Group, chiavi (senza i valori segreti), Repository, Schedule, viste e Integration. Per ripristinarlo utilizzare **New Project → Restore project** oppure [`semaphore projects import`](/reference/cli/projects). |
| **Clear cache** | Elimina dal server tutti i file in cache del Project, ad esempio i Repository clonati. Il Task successivo clona di nuovo i Repository. L'azione è irreversibile. |
| **Delete project** | Elimina il Project con tutte le sue risorse e la cronologia dei Task. Non è possibile annullare l'operazione. |

## Impostazioni correlate {#related-settings}

- Membri e ruoli: [Team](../team)
- Runner associati al Project e runner tag: [Runner del Project](./runners)
- I canali di notifica si configurano sul server: [Notifiche](/admin-guide/notifications)
