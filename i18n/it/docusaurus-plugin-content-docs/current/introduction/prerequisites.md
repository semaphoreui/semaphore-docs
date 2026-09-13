---
title: Prerequisiti
description: Che cosa ti serve prima di installare Semaphore - un host, un database, l'accesso di rete, le credenziali e gli strumenti di automazione richiamati dai tuoi task.
---

# Prerequisiti

Semaphore ha pochi requisiti propri e rigidi. Gran parte di ciò che devi preparare
riguarda l'automazione che eseguirà e l'ambiente che la circonda. Affronta questa pagina
prima dell'[Installazione](/admin-guide/installation) e l'installazione vera e propria
richiederà pochi minuti.

## Un host {#a-host}

Semaphore viene distribuito come singolo binario e come immagine container, e gira su Linux,
macOS e Windows. Linux è la piattaforma a cui puntano i pacchetti, le immagini Docker e la
chart Helm, ed è quella usata dalla maggior parte dei deployment.

Il servizio è leggero: è un processo Go che serve un'interfaccia web. Ciò che consuma
davvero memoria e CPU sono Ansible, Terraform e i tuoi script, eseguiti in parallelo sulla
stessa macchina. Dimensiona l'host per il lavoro, non per Semaphore, e limita la
concorrenza con l'impostazione di progetto **Max number of parallel tasks** — oppure sposta
l'esecuzione sui [runner](/admin-guide/runners) e dimensiona quelli.

Prevedi storage persistente in due punti: il database e la directory indicata da
`tmp_path`, dove vengono clonati i repository. In Docker questo significa un volume; un
container che ne è privo perde i propri dati alla ricreazione.

## Un database {#a-database}

Sceglilo prima di installare, perché cambiarlo in seguito significa migrare i dati.

| Motore | Usalo quando |
|---|---|
| **SQLite** | Un server, un team. Incluso, nulla da configurare, è la scelta predefinita. |
| **PostgreSQL** o **MySQL/MariaDB** | Il servizio è importante per più di poche persone, vuoi backup e monitoraggio dalla tua piattaforma database esistente, oppure prevedi di eseguire più di un nodo. |

L'[alta disponibilità](/admin-guide/ha) richiede PostgreSQL o MySQL più Redis, e non può
usare SQLite. Se l'HA è nella tua roadmap, parti da PostgreSQL.

Crea il database e un utente con i diritti su di esso prima di installare; Semaphore crea
le proprie tabelle al primo avvio e a ogni aggiornamento.

## Accesso di rete {#network-access}

| Semaphore deve raggiungere | Per |
|---|---|
| I tuoi remote Git | Clonare i repository a cui puntano i template. |
| Gli host e le API cloud che automatizzi | Svolgere effettivamente il lavoro. |
| Il tuo identity provider, se ne usi uno | L'accesso con [LDAP](/admin-guide/authentication/ldap) o [OpenID Connect](/admin-guide/authentication/openid). |
| I tuoi canali di notifica | E-mail, Telegram, Slack e gli altri. |

Gli utenti raggiungono l'interfaccia web sulla porta `3000`, se non la cambi. Metti il
[TLS](/admin-guide/reverse-proxy) davanti a essa prima che qualcuno acceda: sessioni e
token API viaggiano su quel canale.

Se saranno i runner a eseguire i task, allora è *a loro* che serve l'accesso ai remote Git
e agli host di destinazione, e serve loro l'accesso in uscita verso il server Semaphore. Il
server non si connette mai a un runner.

## Strumenti di automazione {#automation-tooling}

Qualunque cosa un task esegua deve essere installata là dove viene eseguita — sul server,
sul runner o nell'immagine container usata dall'executor.

- Le immagini Docker includono Ansible, Terraform, OpenTofu e le dipendenze consuete.
  I pacchetti Python aggiuntivi vanno in un `requirements.txt` montato; vedi
  [Installare dipendenze Python aggiuntive](/admin-guide/installation/docker#installing-additional-python-dependencies).
- Un'installazione da pacchetto o da binario ti dà solo Semaphore. Installa da te Git,
  Python, Ansible ed eventuali collection o provider; vedi
  [Installazione manuale](/admin-guide/installation_manually).

Verifica che il tuo playbook o la tua configurazione funzioni da una shell su quella
macchina, con l'utente con cui gira Semaphore, prima di crearne un template. Quasi ogni
segnalazione del tipo "in locale funziona" si risolve in una collection, un provider o un
pacchetto Python mancante.

## Credenziali da avere pronte {#credentials-to-have-ready}

Raccoglile prima del primo template, perché altrimenti ciascuna diventa una sosta a sé:

- Una **deploy key o un token** per ogni repository che Semaphore clonerà.
- Le **chiavi SSH o le credenziali** usate per raggiungere gli host che gestisci.
- Eventuali **credenziali cloud** richieste dal tuo Terraform o dai tuoi moduli.
- Una **password di Ansible Vault**, se i tuoi playbook sono cifrati.

Tutte vanno nel [Key Store](/user-guide/key-store), non nel repository.

## Decisioni da prendere subito {#decisions-to-make-first}

Tre scelte costano poco adesso e molto in seguito:

1. **Il motore del database**, come sopra.
2. **L'URL che useranno gli utenti.** Impostalo come `web_host`. Da esso derivano i reverse
   proxy, gli URI di redirect OIDC, le destinazioni dei webhook e i link nelle notifiche.
3. **`access_key_encryption`.** Generala al momento dell'installazione, fanne un backup
   separato e non ruotarla con leggerezza: ogni segreto memorizzato è cifrato con essa.

```bash
head -c32 /dev/urandom | base64
```

## Prossimi passi {#whats-next}

- [Installazione](/admin-guide/installation) — scegli un metodo e installa.
- [Configurazione](/admin-guide/configuration) — come si forniscono le opzioni e che cosa significano.
- [Primi passi](/getting-started) — da un server installato al primo task.
