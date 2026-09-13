# History

La scheda **History** della dashboard del Project elenca tutti i Task del Project, dal più recente al più vecchio. È la vista predefinita quando si apre un Project.

![Cronologia del Project](/assets/project-dashboard-history.webp)

## Colonne {#columns}

| Colonna | Contenuto |
|---|---|
| **Task** | Numero del Task, il Task Template da cui è stato creato e il messaggio di commit della revisione del Repository utilizzata. L'icona a sinistra indica l'applicazione (Ansible, Terraform, Bash e così via). |
| **Version** | Per i [Task Template di build e deploy](../task-templates/build-deploy): la versione compilata o distribuita. Per gli altri Task Template solo un'icona di stato. |
| **Status** | Badge dello stato corrente, vedere [Stati dei Task](../tasks#task-statuses). |
| **User** | Chi ha avviato il Task. I Task avviati da uno Schedule o da un'Integration non hanno un utente. |
| **Start** | Data e ora di avvio nel fuso orario del browser. |
| **Duration** | Durata dell'esecuzione del Task. |

L'elenco è suddiviso in pagine. Fare clic sul numero del Task o sul nome del Task Template per aprire la [finestra del Task](../tasks#task-window) con il log, i dettagli e il riepilogo. Fare clic sul nome del Task Template nell'intestazione della finestra del Task per aprire la pagina del Task Template.

## Conservazione dei Task {#task-retention}

Per impostazione predefinita tutti i Task e i relativi log vengono conservati per sempre. Per limitare la cronologia per Task Template, impostare `max_tasks_per_template` in `config.json` oppure la variabile d'ambiente `SEMAPHORE_MAX_TASKS_PER_TEMPLATE`:

```json
{
  "max_tasks_per_template": 30
}
```

Al raggiungimento del limite, i Task più vecchi di quel Task Template vengono eliminati insieme ai loro log. Vedere [Configurazione](/admin-guide/configuration) per l'elenco completo delle opzioni.

## Vedere anche {#see-also}

- [Stats](./stats): risultati dei Task aggregati per giorno.
- [Activity](./activity): log di audit delle modifiche nel Project.
