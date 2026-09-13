---
title: "Stockage de secrets HashiCorp Vault"
---

# Stockage de secrets HashiCorp Vault <Pro />

Semaphore UI prend en charge HashiCorp Vault comme stockage pour les secrets.

![](/assets/vault1.webp)

Vous pouvez renseigner les options suivantes :
- **URL de HashiCorp Vault** — adresse de votre serveur Vault.
- **Mount** — chemin de montage du moteur de secrets.
- **Token** — token d'authentification. Le token peut être :
    - Stocké dans la base de données.
    - Fourni via une variable d'environnement.
    - Fourni via un fichier (utile avec Vault Agent).
      :::warning
      Lorsque le token provient d'un **fichier**, ce fichier doit se trouver **dans** le répertoire des secrets utilisé par Semaphore. Configurez ce répertoire avec `dirs.secrets` ou la variable d'environnement `SEMAPHORE_SECRETS_PATH`. L'ancienne option de premier niveau `secrets_path` reste acceptée pour les configurations plus anciennes. Si aucune n'est définie, la valeur par défaut est `/tmp/semaphore`. Consultez [Répertoire des secrets](/admin-guide/configuration/config-file#secrets-directory) pour les détails sur l'ordre de priorité.

      Exemple de fragment de `config.json` :

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

Le stockage peut fonctionner en mode lecture seule.

## Utilisation {#how-to-use}

1. Configurez la connexion à HashiCorp Vault dans les paramètres de Semaphore (URL, chemin de montage et token).
2. Lors de la création ou de la modification d'une clé dans le magasin de clés, sélectionnez **HashiCorp Vault** comme type de stockage.
3. Indiquez le chemin du secret dans Vault où l'identifiant doit être stocké.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Au lieu de stocker directement le token Vault, vous pouvez utiliser [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) pour gérer automatiquement la récupération et le renouvellement du token.

Vault Agent s'exécute en tant que processus sidecar aux côtés de Semaphore et écrit un token valide dans un fichier sur le disque. Semaphore lit ensuite le token depuis ce fichier.

Pour le mettre en place :

1. Configurez et lancez Vault Agent avec une [méthode auto-auth](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) appropriée (par exemple AppRole, Kubernetes, AWS IAM).
2. Configurez Vault Agent pour écrire le token dans un fichier à l'aide d'un bloc `sink`, par exemple :

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. Dans Semaphore, lors de la configuration de la connexion à HashiCorp Vault, sélectionnez **Fichier** comme source du token et indiquez le chemin du fichier de token (par exemple `/etc/vault/token`).

Cette approche évite les tokens statiques de longue durée et laisse Vault Agent gérer automatiquement l'authentification et le renouvellement du token.


## Groupes de variables {#variable-groups}

HashiCorp Vault peut également servir de stockage pour les [groupes de variables](/user-guide/environment). Lors de la modification d'un groupe de variables, sélectionnez **HashiCorp Vault** comme type de stockage et indiquez le chemin du dossier dans lequel les secrets seront stockés.

![](/assets/vault3.webp)
