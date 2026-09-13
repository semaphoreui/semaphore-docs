---
title: "Stockage de secrets OpenBao"
---

# Stockage de secrets OpenBao <Pro />

Semaphore UI prend en charge [OpenBao](https://openbao.org) comme stockage pour les secrets.

OpenBao est un fork open source de HashiCorp Vault, compatible avec celui-ci au niveau de l'API ; le stockage fonctionne donc exactement comme le [stockage HashiCorp Vault](/user-guide/key-store/hashicorp-vault).

Vous pouvez renseigner les options suivantes :
- **URL du serveur** — adresse de votre serveur OpenBao.
- **Mount** — chemin de montage du moteur de secrets KV v2 (`secret` par défaut).
- **Namespace** — namespace OpenBao (v2.3+), facultatif.
- **Token** — token d'authentification. Le token peut être :
    - Stocké dans la base de données.
    - Fourni via une variable d'environnement.
    - Fourni via un fichier.
      :::warning
      Lorsque le token provient d'un **fichier**, ce fichier doit se trouver **dans** le répertoire des secrets utilisé par Semaphore. Configurez ce répertoire avec `dirs.secrets` ou la variable d'environnement `SEMAPHORE_SECRETS_PATH`. L'ancienne option de premier niveau `secrets_path` reste acceptée pour les configurations plus anciennes. Si aucune n'est définie, la valeur par défaut est `/tmp/semaphore`. Consultez [Répertoire des secrets](/admin-guide/configuration/config-file#secrets-directory) pour les détails sur l'ordre de priorité.
      :::

Le stockage peut fonctionner en mode lecture seule.

## Utilisation {#how-to-use}

1. Dans votre projet, ouvrez **Magasin de clés** → **Stockages** et créez un nouveau stockage **OpenBao** (URL, chemin de montage et token).
2. Lors de la création ou de la modification d'une clé dans le magasin de clés, sélectionnez votre stockage OpenBao comme type de stockage.
3. Indiquez le chemin du secret dans OpenBao où l'identifiant doit être stocké.

## Synchronisation des secrets {#syncing-secrets}

Les secrets stockés dans OpenBao peuvent être importés automatiquement dans le magasin de clés et maintenus synchronisés, de la même manière qu'avec les autres stockages externes. Consultez [Synchronisation des secrets depuis des stockages distants](/user-guide/key-store/secret-sync).

## Groupes de variables {#variable-groups}

OpenBao peut également servir de stockage pour les [groupes de variables](/user-guide/environment). Lors de la modification d'un groupe de variables, sélectionnez votre stockage OpenBao comme type de stockage et indiquez le chemin du dossier dans lequel les secrets seront stockés.
