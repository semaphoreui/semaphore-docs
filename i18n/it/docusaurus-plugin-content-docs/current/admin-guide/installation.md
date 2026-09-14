# Installazione

È possibile installare Semaphore in diversi modi, a seconda del sistema operativo, dell'ambiente e delle preferenze.

## In questa sezione {#in-this-section}

| Metodo | Quando usarlo |
|---|---|
| [Gestore di pacchetti](/admin-guide/installation/package-manager) | Vuoi un pacchetto nativo per la tua distribuzione Linux. |
| [Docker](/admin-guide/installation/docker) | Vuoi eseguire Semaphore in un container con Docker o Docker Compose. |
| [Cloud](/admin-guide/installation/cloud) | Esegui il deployment su una piattaforma cloud e cerchi indicazioni su servizi gestiti e infrastruttura. |
| [File binario](/admin-guide/installation/binary-file) | Vuoi installare un binario precompilato e gestire il processo autonomamente. |
| [Kubernetes (Helm chart)](/admin-guide/installation/k8s) | Usi già Kubernetes e vuoi gestire il deployment con Helm. |

## Installazione di pacchetti Python aggiuntivi {#installing-additional-python-packages}

Alcuni moduli e ruoli Ansible richiedono pacchetti Python aggiuntivi per funzionare. Per installare pacchetti Python aggiuntivi, creare un file `requirements.txt` e montarlo nella directory `/etc/semaphore` del container. Ad esempio, è possibile aggiungere le seguenti righe al file `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

I pacchetti specificati nel file requirements verranno installati nell'ambiente virtuale Ansible incluso ogni volta che il container viene avviato. Lo stesso mount funziona per l'immagine `semaphoreui/runner`. Consultare [Installazione di dipendenze Python aggiuntive](/admin-guide/installation/docker#installing-additional-python-dependencies) per i dettagli e per l'alternativa con immagine personalizzata.

Per ulteriori informazioni sui file requirements di Python, consultare il [riferimento sul formato dei file requirements di pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

## Da dove iniziare {#where-to-start}

Inizia dalla guida per il tuo ambiente di deployment. Per un’installazione binaria, segui le istruzioni del servizio per mantenere Semaphore in esecuzione. Per configurare l’utente del servizio, le dipendenze Python e systemd, usa la guida all’installazione manuale.

* [Esecuzione come servizio](/admin-guide/installation/binary-file#run-as-a-service)
* [Installazione manuale](/admin-guide/installation_manually)
