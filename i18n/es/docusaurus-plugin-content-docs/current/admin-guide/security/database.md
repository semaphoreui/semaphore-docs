
# Seguridad de la base de datos

## Cifrado de datos {#data-encryption}

Los datos sensibles se almacenan en la base de datos de forma cifrada. Debe establecer la opción de configuración `access_key_encryption` en el archivo de configuración para habilitar el cifrado de las claves de acceso. Debe generarse con el comando:

```bash
head -c32 /dev/urandom | base64