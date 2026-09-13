# Primi passi

Questa pagina guida da un'installazione nuova alla prima attività eseguita con successo. Ogni passaggio rimanda alla pagina con i dettagli.

## Da zero alla prima attività {#from-zero-to-first-task}

1. **Installare Semaphore** con il metodo preferito: [Installazione](/admin-guide/installation).
2. **Accedere** con l'utente amministratore creato durante la configurazione, oppure tramite le variabili `SEMAPHORE_ADMIN_*` in Docker.
3. **Creare un progetto.** Un progetto isola tra loro team, infrastrutture o applicazioni: [Progetti](/user-guide/projects).
4. **Collegare ciò di cui l'automazione ha bisogno:**
   - Codice sorgente con playbook, moduli o script: [Repository](/user-guide/repositories).
   - Chiavi SSH, token e password: [Key Store](/user-guide/key-store).
   - Host di destinazione e impostazioni di connessione: [Inventory](/user-guide/inventory).
   - Variabili riutilizzabili: [Gruppi di variabili](/user-guide/environment).
5. **Creare un template di attività ed eseguirlo.** Scegliere la guida per il proprio strumento: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) o [Python](/user-guide/apps/python). Quindi eseguirlo e seguirne l'andamento: [Attività](/user-guide/tasks).
6. **Automatizzare e rendere operativo:**
   - Eseguire in base a una pianificazione: [Pianificazioni](/user-guide/schedules).
   - Controllare chi può fare cosa: [Team e ruoli personalizzati](/user-guide/team).
   - Ricevere avvisi sui risultati: [Notifiche](/admin-guide/notifications).

## Concetti chiave {#key-concepts}

Questi termini compaiono ovunque nell'interfaccia.

| Termine | Significato |
|------|---------|
| **Progetto** | L'unità principale di separazione. Ogni progetto ha i propri repository, chiavi, inventory, template e team. [Progetti](/user-guide/projects) |
| **Repository** | Un repository Git o un percorso locale in cui risiedono playbook, moduli o script. [Repository](/user-guide/repositories) |
| **Inventory** | Host, gruppi e impostazioni di connessione per le esecuzioni in stile Ansible. [Inventory](/user-guide/inventory) |
| **Gruppo di variabili** | Variabili riutilizzabili e configurazione dell'ambiente, chiamato anche Environment. [Gruppi di variabili](/user-guide/environment) |
| **Key Store** | Credenziali cifrate come chiavi SSH, token e password. [Key Store](/user-guide/key-store) |
| **Template di attività** | La definizione di un'esecuzione: app, repository, inventory, variabili e opzioni. [Template di attività](/user-guide/task-templates) |
| **Attività** | Una singola esecuzione di un template, con il relativo log e stato. [Attività](/user-guide/tasks) |
| **Workflow** | Un grafo di template con diramazioni, approvazioni e ritardi. Funzionalità Pro. [Workflow](/user-guide/workflows) |
| **Runner** | Dove vengono eseguite le attività: il server stesso o un runner remoto. [Runner](/admin-guide/runners) |

## Passaggi successivi {#next-steps}

- Mettere Semaphore dietro TLS con un [reverse proxy](/admin-guide/reverse-proxy).
- Collegare il proprio identity provider: [LDAP](/admin-guide/authentication/ldap) o [OpenID Connect](/admin-guide/authentication/openid).
- Pilotare Semaphore da CI o script con l'[API](/reference/api) e la [CLI](/reference/cli).
