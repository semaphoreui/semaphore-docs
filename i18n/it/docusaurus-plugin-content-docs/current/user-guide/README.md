---
title: Guida utente
description: "Per i tecnici che lavorano all'interno di un Project di Semaphore: risorse, Task Template, Task, pianificazioni e accessi del team."
---

# Guida utente

Questa sezione è rivolta a chi ha già accesso a un Project di Semaphore. Tutto quanto
descritto qui avviene nell'interfaccia web oppure tramite l'API del Project.
L'installazione del server, la sua configurazione e il collegamento di un identity
provider sono trattati nella [Guida all'amministrazione](/admin-guide).

Il lavoro in Semaphore segue un'unica catena. Un **Project** contiene tutto il resto.
Al suo interno si registrano le risorse necessarie a un'esecuzione: un **Repository**
con i propri playbook o script, le **chiavi** usate per raggiungerlo e per
raggiungere i propri host, un **Inventory** delle macchine di destinazione e i
**Variable Group** con valori e segreti. Un **Task Template** combina questi elementi
in una definizione di ciò che va eseguito, e ogni esecuzione di quel Task Template è
un **Task**. Le pianificazioni, i Workflow e i webhook in ingresso avviano i Task
Template al posto dell'utente.

## Configurare un Project {#set-up-a-project}

In questo ordine, perché ogni passaggio dipende dal precedente.

| Pagina | Contenuto |
|---|---|
| [Project](/user-guide/projects) | Creare un Project, le sezioni della barra laterale, backup e ripristino. |
| [Team](/user-guide/team) | I quattro ruoli integrati e i ruoli personalizzati su Enterprise. |
| [Key Store](/user-guide/key-store) | Chiavi SSH, credenziali di accesso e storage di segreti esterni. |
| [Repository](/user-guide/repositories) | Repository Git e percorsi locali che contengono la propria automazione. |
| [Inventory](/user-guide/inventory) | Host e impostazioni di connessione per Ansible, workspace per Terraform. |
| [Variable Group](/user-guide/environment) | Variabili e segreti riutilizzabili passati ai Task. |

## Definire ed eseguire il lavoro {#define-and-run-work}

| Pagina | Contenuto |
|---|---|
| [Task Template](/user-guide/task-templates) | Ogni campo del modulo del Task Template, oltre ai tipi di Task Template. |
| [Applicazioni](/user-guide/apps) | Che cosa esegue ciascuna applicazione: Ansible, Terraform, OpenTofu, Terragrunt e gli script. |
| [Task](/user-guide/tasks) | Avviare un Task, stati dei Task, log, arresto e riesecuzione. |
| [Pianificazioni](/user-guide/schedules) | Eseguire i Task Template secondo una pianificazione cron. |
| [Workflow](/user-guide/workflows) | Concatenare i Task Template con approvazioni e diramazioni. |
| [Integration](/user-guide/integrations) | Avviare i Task da webhook in ingresso. |
| [Runner del Project](/user-guide/projects/runners) | Inviare i Task di un Project ai propri runner. |
| [Il proprio account](/user-guide/account) | Impostazioni personali e token API. |

## Da dove iniziare {#where-to-start}

Se si è appena stati aggiunti a un Project, leggere [Project](/user-guide/projects)
per orientarsi, quindi [Task](/user-guide/tasks) per eseguirne uno e leggerne il log.
Se invece si sta configurando un Project da zero, seguire la tabella qui sopra
nell'ordine indicato.

Si è completamente nuovi a Semaphore? Iniziare da [Primi passi](/getting-started).
