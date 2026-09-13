
# Datenbanksicherheit

## Datenverschlüsselung {#data-encryption}

Sensible Daten werden in verschlüsselter Form in der Datenbank gespeichert. Sie sollten die Konfigurationsoption `access_key_encryption` in der Konfigurationsdatei setzen, um die Verschlüsselung der Access Keys zu aktivieren. Der Schlüssel muss mit folgendem Befehl generiert werden:

```bash
head -c32 /dev/urandom | base64