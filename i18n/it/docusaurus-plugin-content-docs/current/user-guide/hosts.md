---
title: Hosts
description: Quali host raggiungono i Task Ansible, come si è concluso ciascuno e dove guardare quando un host fallisce o non viene mai raggiunto.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

La pagina **Hosts** di un Project elenca ogni host raggiunto dai Task Ansible del Project, con il
risultato dell'ultima esecuzione su quell'host. Aprirla per sapere quali host falliscono, quali non
sono raggiungibili e quali nessun Task tocca da tempo, senza aprire i log dei Task uno per uno.

## Come funziona {#how-it-works}

Gli host non si aggiungono a mano. Dopo ogni Task Ansible, Semaphore registra ogni host del play con
il suo risultato su quell'host: `ok`, `changed`, `failed` o `unreachable`. Contano i Task sul server,
sui runner e negli executor Docker o Kubernetes. I Task di altre applicazioni, come Terraform o Bash,
non aggiungono host.

Un host è identificato dal nome nell'inventario. `web-01` in due inventari è un solo host, e `Web-01`
è lo stesso host di `web-01`. Un host raggiunto dai Task di più Project è elencato in ciascun Project
con i numeri propri di quel Project. Un host resta nell'elenco dopo essere uscito dall'inventario,
insieme alla sua cronologia.

## Trovare un host {#find-a-host}

- **Search** trova gli host per nome.
- **Failing now** mostra gli host la cui ultima esecuzione è fallita. **Unreachable** mostra gli host
  a cui Ansible non è riuscito a connettersi. **Not seen 30 days** mostra gli host che nessun Task ha
  toccato per un mese.
- **Template** restringe l'elenco agli host di un solo Template.

Fare clic su un host per aprire la sua scheda: quando è stato visto per la prima volta, quante
esecuzioni ha avuto, quante delle ultime 10 esecuzioni sono fallite e i Task che lo hanno raggiunto
con il risultato su quell'host. Fare clic su un Task per aprirne il log.

La scheda **Summary** di un Task mostra lo stesso per una singola esecuzione: selezionare
**All servers** per vedere tutti gli host di quel Task con i loro contatori.

## Passi successivi {#whats-next}

- [Hosts per gli amministratori](/admin-guide/hosts) — tutti i Project, il conteggio della licenza e la dismissione.
- [Inventario](/user-guide/inventory) — definire gli host su cui vengono eseguiti i Task.
