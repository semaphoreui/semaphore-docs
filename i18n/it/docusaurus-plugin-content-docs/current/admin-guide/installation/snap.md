# Snap (deprecato)

Per installare Semaphore tramite snap, eseguire il seguente comando nel terminale:

```bash
sudo snap install semaphore
```

Semaphore sarà disponibile all'URL [https://localhost:3000](https://localhost:3000).&#x20;

Tuttavia, per accedere è necessario creare un utente amministratore. Utilizzare i seguenti comandi:

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

È possibile verificare lo stato del servizio Semaphore con il seguente comando:

```bash
sudo snap services semaphore
```

Dovrebbe stampare la seguente tabella:

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

Dopo l'installazione, è possibile configurare Semaphore tramite la [configurazione di Snap](https://snapcraft.io/docs/configuration-in-snaps). Utilizzare il seguente comando per visualizzare la configurazione di Semaphore:

```bash
sudo snap get semaphore
```

&#x20;L'elenco delle opzioni disponibili è riportato nel [riferimento delle opzioni di configurazione](../configuration#configuration-options).

----
