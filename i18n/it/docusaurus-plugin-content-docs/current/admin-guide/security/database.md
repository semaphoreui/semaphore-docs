
# Sicurezza del database

## Cifratura dei dati {#data-encryption}

I dati sensibili sono memorizzati nel database in forma cifrata. È necessario impostare l'opzione di configurazione `access_key_encryption` nel file di configurazione per abilitare la cifratura delle Access Key. Deve essere generata con il comando:

```bash
head -c32 /dev/urandom | base64