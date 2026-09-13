# Snap-Konfiguration

Snap-Konfigurationen sind zu verwenden, wenn Semaphore über Snap installiert wurde.

Eine Liste der verfügbaren Optionen erhalten Sie mit folgendem Befehl:

```bash
sudo snap get semaphore
```

Sie können jede dieser Konfigurationen ändern. Wenn Sie zum Beispiel den Port von Semaphore ändern möchten, verwenden Sie folgenden Befehl:

```bash
sudo snap set semaphore port=4444
```

Vergessen Sie nicht, Semaphore nach einer Konfigurationsänderung neu zu starten:

```bash
sudo snap restart semaphore
```
