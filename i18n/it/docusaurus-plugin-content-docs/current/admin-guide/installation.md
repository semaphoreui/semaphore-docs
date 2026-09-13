# Installazione

È possibile installare Semaphore in diversi modi, a seconda del sistema operativo, dell'ambiente e delle preferenze:

* **Gestore di pacchetti**<br />
  Installare Semaphore utilizzando un pacchetto nativo per la propria distribuzione (ad es. apt per Debian/Ubuntu o dnf per i sistemi basati su RHEL). È il modo più semplice per iniziare sui server Linux e si integra bene con i servizi di sistema.<br />
  [Scopri di più »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Eseguire Semaphore come container utilizzando Docker o Docker Compose. Ideale per una configurazione rapida, ambienti isolati e pipeline CI/CD. Consigliato per chi preferisce l'approccio infrastructure as code.<br />
  [Scopri di più »](/admin-guide/installation/docker)

* **Cloud**<br />
  Indicazioni per distribuire Semaphore su piattaforme cloud utilizzando VM, container o Kubernetes con servizi gestiti.<br />
  [Scopri di più »](/admin-guide/installation/cloud)

* **File binario**<br />
  Scaricare un binario precompilato dalla pagina delle release. Ottimo per l'installazione manuale o l'integrazione in workflow personalizzati. Funziona su Linux, macOS e Windows (tramite WSL).<br />
  [Scopri di più »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm chart)**<br />
  Distribuire Semaphore in un cluster Kubernetes utilizzando Helm. La soluzione più adatta per infrastrutture scalabili di livello produttivo. Supporta configurazione e aggiornamenti semplici tramite i valori di Helm.<br />
  [Scopri di più »](/admin-guide/installation/k8s)

Vedere anche:
* [Esecuzione come servizio](/admin-guide/installation/binary-file#run-as-a-service)
* [Installazione manuale](/admin-guide/installation_manually)

----


### Installazione di pacchetti Python aggiuntivi {#installing-additional-python-packages}

Alcuni moduli e ruoli Ansible richiedono pacchetti Python aggiuntivi per funzionare. Per installare pacchetti Python aggiuntivi, creare un file `requirements.txt` e montarlo nella directory `/etc/semaphore` del container. Ad esempio, è possibile aggiungere le seguenti righe al file `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

I pacchetti specificati nel file requirements verranno installati nell'ambiente virtuale Ansible incluso ogni volta che il container viene avviato. Lo stesso mount funziona per l'immagine `semaphoreui/runner`. Consultare [Installazione di dipendenze Python aggiuntive](/admin-guide/installation/docker#installing-additional-python-dependencies) per i dettagli e per l'alternativa con immagine personalizzata.

Per ulteriori informazioni sui file requirements di Python, consultare il [riferimento sul formato dei file requirements di pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
