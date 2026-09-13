# Configurazione Snap

Le configurazioni Snap vanno usate quando Semaphore è stato installato tramite Snap.

Per vedere l'elenco delle opzioni disponibili, usare il seguente comando:

```bash
sudo snap get semaphore
```

È possibile modificare ciascuna di queste configurazioni. Ad esempio, per cambiare la porta di Semaphore, usare il seguente comando:

```bash
sudo snap set semaphore port=4444
```

Non dimenticare di riavviare Semaphore dopo aver modificato una configurazione:

```bash
sudo snap restart semaphore
```
