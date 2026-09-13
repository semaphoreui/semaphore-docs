
# Sécurité de la base de données

## Chiffrement des données {#data-encryption}

Les données sensibles sont stockées dans la base de données sous forme chiffrée. Vous devez définir l'option de configuration `access_key_encryption` dans le fichier de configuration pour activer le chiffrement des clés d'accès. Elle doit être générée avec la commande :

```bash
head -c32 /dev/urandom | base64