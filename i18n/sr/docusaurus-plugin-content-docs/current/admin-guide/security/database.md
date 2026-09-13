
# Bezbednost baze podataka

## Šifrovanje podataka {#data-encryption}

Osetljivi podaci se čuvaju u bazi podataka u šifrovanom obliku. Da biste uključili šifrovanje pristupnih ključeva (Access Keys), postavite konfiguracionu opciju `access_key_encryption` u konfiguracionoj datoteci. Njena vrednost mora biti generisana komandom:

```bash
head -c32 /dev/urandom | base64