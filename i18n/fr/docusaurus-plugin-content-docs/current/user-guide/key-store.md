# Magasin de clés

Le Magasin de clés de Semaphore sert à stocker les identifiants nécessaires pour accéder à des dépôts distants, accéder à des hôtes distants, élever les privilèges avec sudo et déverrouiller les vaults Ansible.

![Magasin de clés](/assets/key-store-keys.webp)

L'onglet **Clés** liste les identifiants du projet avec leur type. L'onglet **Stockages** (Pro) liste les stockages de secrets externes configurés pour le projet, voir [Stockages de secrets](#secret-storages).

## Types {#types}

### 1. SSH {#1-ssh}
Les clés SSH servent à accéder aux serveurs distants ainsi qu'aux dépôts distants.

Si vous avez besoin d'aide pour générer rapidement une clé et la déposer sur votre hôte, [voici un guide rapide.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

Pour les dépôts Git qui utilisent l'authentification SSH, le dépôt Git depuis lequel vous essayez de cloner doit avoir votre clé publique associée à la clé privée.

Voici des liens vers la documentation de quelques dépôts Git courants :
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Connexion avec mot de passe {#2-login-with-password}
La connexion avec mot de passe est une combinaison d'un nom d'utilisateur et d'un mot de passe ou jeton d'accès, qui peut servir à :
* S'authentifier auprès d'hôtes distants (bien que ce soit moins sûr que l'utilisation de clés SSH)
* Fournir les identifiants sudo sur les hôtes distants
* S'authentifier auprès de dépôts Git distants en HTTPS (bien que SSH soit plus sûr)
* Déverrouiller les vaults Ansible

:::tip
    Ce type de secret peut être utilisé comme jeton d'accès personnel (PAT) ou comme chaîne secrète. Laissez simplement le champ Login vide.
:::

### 3. Aucun {#3-none}
Ce type sert de valeur de remplissage pour les dépôts qui ne nécessitent pas d'authentification, comme un dépôt open source sur GitLab.


## Stockages de secrets {#secret-storages}

Semaphore UI prend en charge différents stockages pour les secrets. Vous pouvez choisir le stockage secret par secret lors de la création ou de la modification d'un secret.

Les stockages externes sont créés dans l'onglet **Stockages** du Magasin de clés (Pro). Chaque stockage possède un nom et un type ; les clés font ensuite référence au stockage et au chemin du secret à l'intérieur de celui-ci.

![Stockages de secrets](/assets/key-store-storages.webp)

### Base de données {#database}

Par défaut, les secrets sont stockés dans la base de données sous forme chiffrée. La clé de chiffrement est configurée via l'option de configuration
`access_key_encryption` ou `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (elle doit être générée avec `head -c32 /dev/urandom | base64`).

### Variable d'environnement ou fichier {#environment-variable-or-file}

Une clé peut lire sa valeur depuis une variable d'environnement du serveur Semaphore ou depuis un fichier présent sur le serveur
(par exemple une clé SSH montée dans le conteneur). Les onglets **Env** et **File** du formulaire de clé permettent de choisir ce mode.

Les fichiers doivent se trouver dans le répertoire de secrets configuré (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, par défaut `/tmp/semaphore`),
et les clés SSH et de connexion avec mot de passe doivent être encapsulées dans un petit document JSON.

[En savoir plus...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

Les secrets peuvent être stockés dans une instance HashiCorp Vault externe plutôt que dans la base de données.

[En savoir plus...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

Les secrets peuvent être stockés dans une instance [OpenBao](https://openbao.org) externe (un fork open source de HashiCorp Vault compatible avec son API).

[En savoir plus...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

<Enterprise />

Les secrets peuvent être stockés dans AWS Secrets Manager. Authentifiez-vous avec un rôle IAM / profil d'instance ou avec des clés d'accès statiques.

[En savoir plus...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

Les secrets peuvent être stockés dans une instance Devolutions Server externe plutôt que dans la base de données.

[En savoir plus...](/user-guide/key-store/devolutions-server)

## Synchroniser les secrets depuis des stockages distants {#syncing-secrets-from-remote-storages}

Semaphore peut importer automatiquement des secrets depuis un gestionnaire de secrets externe (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault ou Devolutions Server) et les maintenir synchronisés. Les chemins de synchronisation vous permettent de choisir quels secrets importer et comment les nommer.

[En savoir plus...](/user-guide/key-store/secret-sync)
