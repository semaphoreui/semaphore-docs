# Clés issues de variables d'environnement et de fichiers

Au lieu de stocker un secret dans la base de données, une entrée du magasin de clés peut lire sa valeur au moment de la tâche
depuis un **fichier** sur le serveur Semaphore ou depuis une **variable d'environnement** du processus serveur Semaphore.
C'est utile lorsque l'identifiant est déjà provisionné en dehors de Semaphore, par exemple :

* une clé SSH montée dans le conteneur Semaphore sous forme de secret Docker ou Kubernetes ;
* un token écrit sur le disque par un agent (HashiCorp Vault Agent, cert-manager, etc.) et renouvelé régulièrement ;
* un mot de passe injecté dans l'environnement du conteneur par votre orchestrateur.

Semaphore ne copie pas la valeur dans sa base de données. Chaque fois qu'une tâche a besoin de la clé, le serveur
relit le fichier ou la variable ; la rotation de l'identifiant sur le disque prend donc effet à la tâche suivante.

:::info
Le fichier ou la variable est lu par le **serveur Semaphore**, pas par un runner. Si vous utilisez des runners distants,
montez le fichier sur l'hôte du serveur ; le serveur résout le secret et le transmet au runner.
:::

## Choisir la source {#choosing-the-source}

Lorsque vous créez ou modifiez une clé (**Magasin de clés → Nouvelle clé**), le haut du formulaire propose des onglets de source :

| Onglet | D'où provient la valeur | Quoi saisir |
|--------|-------------------------|-------------|
| **Local** | Base de données Semaphore (chiffrée) | Le login, le mot de passe ou la clé privée dans le formulaire |
| **Storage** <Pro /> | Un stockage de secrets externe tel que [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | Le stockage et le chemin du secret |
| **Env** | Une variable d'environnement du processus serveur Semaphore | Le nom de la variable, par exemple `PROD_SSH_KEY` |
| **File** | Un fichier sur le serveur Semaphore | Le chemin **absolu** du fichier, par exemple `/var/lib/semaphore/secrets/prod.json` |

Lorsque **Env** ou **File** est sélectionné, les champs login, mot de passe et clé privée disparaissent. L'identifiant
complet, y compris le login pour les clés SSH et Connexion par mot de passe, doit se trouver dans le fichier ou la variable.

## 1. Autoriser le répertoire {#allow-the-directory}

Pour des raisons de sécurité, Semaphore ne lit que les fichiers de clés situés dans son **répertoire des secrets**. Tout autre
chemin est rejeté au démarrage d'une tâche :

```
Failed to install inventory: file path must be inside secrets path
```

Le répertoire des secrets par défaut est `/tmp/semaphore`. Faites-le pointer vers le répertoire contenant vos fichiers de clés
avec `dirs.secrets` dans `config.json` ou la variable d'environnement `SEMAPHORE_SECRETS_PATH`.
Consultez [Répertoire des secrets](/admin-guide/configuration/config-file#secrets-directory) pour les règles de priorité.

Exemple Docker Compose qui monte un répertoire de l'hôte et l'autorise :

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

Fragment `config.json` équivalent :

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Règles pour le chemin saisi dans l'onglet **File** :

* il doit être absolu (`/var/lib/semaphore/secrets/prod.json`, et non `prod.json`) ;
* il ne doit pas contenir de segments `..` ;
* il doit se résoudre vers un emplacement situé dans le répertoire des secrets (les sous-répertoires sont acceptés) ;
* le fichier doit être lisible par l'utilisateur sous lequel Semaphore s'exécute (dans l'image Docker officielle, il s'agit de `semaphore`, UID 1001).

Les variables d'environnement n'ont pas cette restriction ; le serveur lit simplement la variable indiquée dans son propre environnement.

## 2. Formater la valeur {#format-the-value}

Le contenu du fichier (ou la valeur de la variable) dépend du type de clé. Un unique saut de ligne final
à la fin d'un fichier est ignoré ; tout le reste est utilisé tel quel.

### Clé SSH {#ssh-key}

Semaphore attend un **document JSON**, et non un fichier de clé privée PEM ou OpenSSH brut :

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — le nom d'utilisateur SSH, transmis à Ansible via `--user`. Laissez-le vide pour laisser l'inventaire décider (`ansible_user`). Pour les dépôts Git, un login vide vaut `git` par défaut.
* `passphrase` — la phrase secrète de la clé privée, ou une chaîne vide.
* `private_key` — la clé privée avec les sauts de ligne encodés en `\n`.

Générez l'enveloppe à partir d'une clé existante avec `jq`, qui se charge de l'échappement :

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

Créez ensuite une clé de type **SSH**, ouvrez l'onglet **File** et saisissez `/var/lib/semaphore/secrets/prod_ssh.json`
(le chemin tel qu'il est vu **à l'intérieur** du conteneur).

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
Faire pointer l'onglet **File** vers une clé privée brute telle que `~/.ssh/id_ed25519` ne fonctionne pas.
Le fichier est analysé comme du JSON et la tâche échoue au chargement de l'inventaire.
:::

### Connexion par mot de passe {#login-with-password}

Également un document JSON :

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

Laissez `login` vide pour utiliser la clé comme simple token ou mot de passe, par exemple comme mot de passe de vault Ansible.

## Exemple avec une variable d'environnement {#environment-variable-example}

Le même format JSON s'applique à l'onglet **Env**. Avec Docker Compose :

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

Créez une clé **SSH**, sélectionnez l'onglet **Env** et saisissez `PROD_SSH_KEY` comme nom de variable.

:::tip
Les variables d'environnement sont visibles par tous les processus du conteneur et finissent souvent dans
les métadonnées et les journaux de l'orchestrateur. Préférez l'onglet **File** avec un secret monté lorsque c'est possible.
:::

## Dépannage {#troubleshooting}

| Erreur | Cause | Solution |
|--------|-------|----------|
| `file path must be absolute` | Un chemin relatif a été saisi | Saisissez le chemin complet commençant par `/` |
| `file path must not contain traversal segments` | Le chemin contient `..` | Saisissez le chemin résolu |
| `file path must be inside secrets path` | Le fichier est en dehors de `dirs.secrets` | Définissez `SEMAPHORE_SECRETS_PATH` sur le répertoire du fichier, ou déplacez le fichier |
| `no such file or directory` | Le chemin est incorrect ou n'est pas monté dans le conteneur | Vérifiez le montage du volume et utilisez le chemin interne au conteneur |
| `permission denied` | Le processus Semaphore ne peut pas lire le fichier | Corrigez le propriétaire ou les permissions du fichier |
| `invalid character '-' looking for beginning of value` | Une clé privée brute a été fournie au lieu de l'enveloppe JSON | Enveloppez la clé comme indiqué ci-dessus |
