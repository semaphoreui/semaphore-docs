---
title: Che cos'è Semaphore
description: Che cosa fa Semaphore UI, i problemi che risolve, a chi è rivolto e i casi in cui uno strumento diverso è la scelta migliore.
---

# Che cos'è Semaphore

Semaphore UI è un'interfaccia web self-hosted, con API REST, per eseguire l'automazione
che già possiedi. La colleghi a un repository Git che contiene i tuoi playbook Ansible,
le configurazioni Terraform o i tuoi script, indichi quali credenziali e host usare, e
Semaphore diventa il luogo unico in cui il tuo team esegue quell'automazione, conserva
i segreti che le servono e tiene traccia di ogni esecuzione.

Puoi eseguire i task singolarmente o combinarli in un'unica pipeline con
[Workflows](/user-guide/workflows) (Pro), collegando build, test, deployment
e automazione dell'infrastruttura.

Semaphore non sostituisce Ansible, Terraform o i tuoi script. Li esegue, su un server
anziché sul portatile di qualcuno.

## Il problema che risolve {#the-problem-it-solves}

L'automazione di solito nasce su una workstation. Un solo ingegnere ha il playbook,
l'inventory, la chiave SSH e la versione giusta di Ansible installata. Funziona finché
una seconda persona non deve eseguire la stessa cosa, oppure finché qualcuno non chiede
che cosa è cambiato su un host martedì scorso.

Semaphore sposta l'esecuzione su un server condiviso e aggiunge le parti che mancavano:

| Pezzo mancante | Che cosa fornisce Semaphore |
|---|---|
| Tutti devono avere gli strumenti installati | Li ha un solo server (o un runner); agli utenti serve solo un browser. |
| Le credenziali vengono copiate da un portatile all'altro | Un [Key Store](/user-guide/key-store) cifrato che consegna i segreti all'esecuzione, mai all'utente. |
| Nessuna traccia di chi ha eseguito che cosa | Ogni [task](/user-guide/tasks) conserva il proprio output, lo stato di uscita, l'utente e l'orario. |
| Nessuno dovrebbe avere i privilegi di root per eseguire un playbook | I [ruoli](/user-guide/team) decidono chi può eseguire, modificare o solo osservare. |
| Le esecuzioni avvengono quando qualcuno se ne ricorda | Le avviano [pianificazioni](/user-guide/schedules), [webhook](/user-guide/integrations) e chiamate API. |

## A chi è rivolto {#who-it-is-for}

- **Team di infrastruttura e di piattaforma** che usano già Ansible o Terraform e vogliono
  che i colleghi possano eseguirlo senza distribuire credenziali di produzione.
- **Team che creano pipeline CI/CD** e vogliono collegare task di build, test e
  deployment tramite workflow, insieme a job operativi pianificati e on demand.
- **Team con una piattaforma CI/CD** che vogliono tenere le esecuzioni operative — riavvii,
  deployment, rinnovi di certificati — fuori dal sistema di build e visibili anche a chi non
  legge YAML di pipeline.

Semaphore è self-hosted. Non esiste una versione SaaS: esegui il binario o il container sulla
tua infrastruttura e i tuoi segreti non la lasciano mai.

## Che cosa esegue {#what-it-runs}

Ogni [task template](/user-guide/task-templates) sceglie un'applicazione:

- [Ansible](/user-guide/apps/ansible) — playbook con inventory, password di vault e
  l'intero insieme di opzioni di `ansible-playbook`.
- [Terraform, OpenTofu e Terragrunt](/user-guide/apps/terraform) — plan e apply con
  workspace e stato gestiti dal tuo backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) e
  [Python](/user-guide/apps/python) — tutto ciò che non rientra nei casi precedenti.

I task vengono eseguiti sul server stesso oppure su [runner](/admin-guide/runners) collocati
vicino ai sistemi che gestiscono.

[Workflows](/user-guide/workflows) (Pro) collega i task template in una pipeline
tramite un editor visuale. Ogni passaggio può eseguire un'applicazione diversa: ad esempio,
compilare e testare il codice sorgente con script shell, predisporre l'infrastruttura con
Terraform e poi eseguire il deployment con Ansible. Puoi aggiungere passaggi di approvazione,
pause temporizzate e diramazioni eseguite in caso di successo o errore. Semaphore avvia
automaticamente i task successivi quando le relative condizioni sono soddisfatte.

## Quando non usarlo {#when-not-to-use-it}

Conoscere i limiti fa risparmiare tempo in seguito.

- **Sostituire Ansible o Terraform.** Semaphore non ha un motore di esecuzione proprio. Se
  il tuo playbook non funziona da shell, non funzionerà da Semaphore.
- **Fare da CMDB.** Gli [inventory](/user-guide/inventory) sono gli inventory di cui le tue
  esecuzioni hanno bisogno, non una fonte di verità sul tuo parco macchine. Generali dalla
  tua fonte reale con un inventory dinamico.
- **Essere il gestore di segreti della tua organizzazione.** I segreti sono cifrati a riposo
  e sono pensati per essere usati dai task, non per essere riletti dalle persone. Se usi già
  HashiCorp Vault o un altro archivio, [collegalo](/user-guide/key-store) invece di copiarvi
  dentro i segreti.
- **Gestire un servizio a nodo singolo in cui nessun fermo è accettabile.** Più nodi attivi
  richiedono l'[alta disponibilità](/admin-guide/ha), che è una funzionalità Enterprise e
  richiede PostgreSQL o MySQL più Redis.

## Prossimi passi {#whats-next}

- [Architettura](/introduction/architecture) — i processi, il database e dove vengono eseguiti i task.
- [Concetti fondamentali](/introduction/concepts) — le dieci parole che l'interfaccia dà per scontate.
- [Primi passi](/getting-started) — installalo ed esegui qualcosa.
