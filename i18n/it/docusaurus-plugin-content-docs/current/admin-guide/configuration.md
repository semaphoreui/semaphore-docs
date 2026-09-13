# Configurazione

Semaphore può essere configurato con diversi metodi:

* [Configuratore online](https://semaphoreui.com/install) &mdash; interfaccia web per generare la configurazione online.
* [File di configurazione](/admin-guide/configuration/config-file) &mdash; il modo principale e più flessibile per configurare Semaphore.
* [Variabili d'ambiente](/admin-guide/configuration/env-vars) &mdash; utili per deployment containerizzati o cloud-native.


## Opzioni di configurazione {#configuration-options}

Ogni opzione, con la relativa variabile d'ambiente, il tipo e il valore predefinito, è
elencata nel [riferimento delle opzioni di configurazione](/reference/configuration).
Quella pagina è generata dal codice sorgente di Semaphore, quindi corrisponde sempre
alla versione in esecuzione.

I valori vengono risolti in un unico ordine: una variabile d'ambiente prevale sul file di
configurazione e il valore predefinito si applica solo quando nessuno dei due è impostato.

## Domande frequenti {#frequently-asked-questions}

### 1. Come configurare un URL pubblico per Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Se si utilizza nginx o un altro web server davanti a Semaphore, è necessario impostare l'opzione di configurazione `web_host`.

Ad esempio, si è configurato NGINX sul server in modo che inoltri le richieste a Semaphore.

L'indirizzo del server è `https://example.com` e tutte le richieste a `https://example.com/semaphore` vengono inoltrate a Semaphore.

Il valore di `web_host` sarà `https://example.com/semaphore`.
