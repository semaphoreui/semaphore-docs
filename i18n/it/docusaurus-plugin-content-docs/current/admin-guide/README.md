---
title: Guida all'amministrazione
description: Per gli amministratori che installano, configurano, mettono in sicurezza e gestiscono un server Semaphore per i propri team.
---

# Guida all'amministrazione

Questa sezione è rivolta agli amministratori che installano e gestiscono Semaphore
per altre persone. Tutto quanto descritto qui richiede l'accesso al server stesso: il
file di configurazione, le variabili d'ambiente, la riga di comando oppure la
macchina su cui Semaphore viene eseguito. Il lavoro svolto all'interno di un Project
tramite l'interfaccia web è trattato nella
[Guida utente](/user-guide).

Semaphore è un singolo binario Go con un'interfaccia web e un'API REST. Memorizza i
propri dati in SQLite, MySQL o PostgreSQL, mantiene le credenziali cifrate ed esegue
i Task sul server stesso oppure su runner separati. Un'installazione funzionante si
riduce quindi a quattro decisioni: come installarlo, dove risiede il database, come
accedono gli utenti e dove vengono eseguiti i Task.

## Configurazione iniziale {#set-up}

Tutto ciò che si configura prima dell'avvio del server o intorno ad esso.

| Pagina | Contenuto |
|---|---|
| [Installazione](/admin-guide/installation) | Gestore di pacchetti, Docker, file binario, Kubernetes e installazione manuale. |
| [Configurazione](/admin-guide/configuration) | Il file `config.json`, le variabili d'ambiente e tutte le opzioni supportate. |
| [Aggiornamento](/admin-guide/upgrading) | Passare a una release più recente e che cosa verificare prima di farlo. |
| [Reverse proxy](/admin-guide/reverse-proxy) | Servire Semaphore dietro nginx, Apache o Caddy, con TLS. |
| [Sicurezza](/admin-guide/security) | Hashing delle password, cifratura dei segreti, hardening di rete e JWT dei Task. |
| [LDAP e AD](/admin-guide/ldap) | Accedere tramite un servizio di directory. |
| [OpenID Connect](/admin-guide/openid) | Single sign-on con GitHub, Google, Keycloak, Okta e altri nove provider. |
| [Runner](/admin-guide/runners) | Eseguire i Task su macchine diverse dal server. |
| [Alta disponibilità](/admin-guide/ha) | Far funzionare più nodi Semaphore su un unico database. |

## Gestione operativa {#operate}

Tutto ciò che si fa su un server già in esecuzione.

| Pagina | Contenuto |
|---|---|
| [CLI](/admin-guide/cli) | Gestire utenti, Project, vault, runner e migrazioni del database dalla shell. |
| [API](/admin-guide/api) | Autenticarsi con un token e pilotare Semaphore in modo programmatico. |
| [Integrazione CI/CD](/admin-guide/cicd) | Avviare Task di Semaphore da una pipeline esterna. |
| [Log](/admin-guide/logs) | Log del server, log dei Task e il loro inoltro verso altri sistemi. |
| [Metriche](/admin-guide/metrics) | L'endpoint Prometheus e le metriche che espone. |
| [Notifiche](/admin-guide/notifications) | Canali di recapito degli avvisi: email, Telegram, Slack e altri. |
| [Licenza](/admin-guide/license) | Attivare un abbonamento Pro o Enterprise. |

## Da dove iniziare {#where-to-start}

Se si installa Semaphore per la prima volta, leggere
[Installazione](/admin-guide/installation) e scegliere un metodo, quindi
[Configurazione](/admin-guide/configuration) per capire come vengono fornite le
opzioni. Collocare il server dietro un [reverse proxy](/admin-guide/reverse-proxy)
con TLS prima che venga utilizzato da altri.

Per scoprire che cosa aggiunge un abbonamento a pagamento, vedere
[Edizioni](/editions).
