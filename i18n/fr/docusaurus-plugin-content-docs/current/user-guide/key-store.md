---
title: Key Store
description: Guide complet des identifiants dans le Key Store Semaphore, génération de paires de clés SSH, mots de passe de connexion, secrets de jeton et stockages externes.
---

# Key Store

Le **Key Store** sert de référentiel centralisé d'identifiants pour Semaphore. Il gère les éléments d'authentification nécessaires au clonage de dépôts Git distants, aux connexions vers les hôtes cibles, à l'élévation de privilèges (`sudo`/`become`) et au déchiffrement des secrets Ansible Vault.

![Key Store](/assets/key-store-keys.webp)

Le Key Store est divisé en deux vues principales :
* **Onglet Keys** : Liste tous les identifiants approvisionnés pour le projet actuel, avec leur nom, backend de stockage, type et état de synchronisation.
* **Onglet Storages (Pro)** : Configure les backends de secrets externes (tels que HashiCorp Vault, OpenBao, AWS Secrets Manager ou CyberArk) pour la résolution dynamique et la synchronisation automatisée.

---

## Types d'identifiants {#types}

Semaphore classe les identifiants stockés selon quatre types fondamentaux :

### 1. Clés SSH {#1-ssh}
Les clés SSH fournissent une authentification asymétrique pour se connecter aux nœuds Linux/UNIX et cloner des dépôts Git via SSH (`git@github.com:...`).

Lors de la configuration d'un identifiant de clé SSH, vous pouvez définir :
* **Nom de clé** : Un libellé descriptif pour l'identifiant dans vos inventaires et modèles de projet.
* **Nom d'utilisateur (Optionnel)** : Le compte utilisateur distant par défaut utilisé lors de la connexion SSH (par exemple `ansible` ou `ubuntu`).
* **Phrase secrète (Optionnel)** : La phrase secrète requise pour déchiffrer les clés privées chiffrées. Les champs de phrase secrète incluent une icône de visibilité (`œil`) et sont masqués par défaut.
* **Clé privée** : Le texte brut de la clé privée PEM/OpenSSH.

#### Générateur de clés SSH intégré {#built-in-ssh-key-generator}

Plutôt que d'exécuter manuellement `ssh-keygen` sur des machines externes, Semaphore intègre un **générateur de paires de clés SSH en un clic** directement dans la modale :

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Sélectionnez **Clé SSH** dans le menu déroulant **Type**.
2. Cochez la case **Générer une clé SSH**.
3. La zone de texte pour la **clé privée** manuelle est automatiquement désactivée et verrouillée.
4. Cliquez sur **Créer**. Semaphore génère automatiquement une paire de clés sécurisée (ED25519/RSA), chiffre la clé privée dans la base de données et affiche la clé publique dans un dialogue dédié :

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Utilisez le bouton **Copier dans le presse-papiers** pour copier la clé publique et collez-la dans les clés de déploiement de votre forge Git ou dans le fichier `~/.ssh/authorized_keys` de vos nœuds cibles.

#### Extraction ultérieure des clés publiques (Tiroir de clé publique) {#extracting-public-keys-later}

Si vous fermez le dialogue ou avez besoin de récupérer la clé publique ultérieurement, il n'est pas nécessaire de régénérer la paire de clés. Lors de l'édition d'une clé créée avec le générateur, Semaphore propose un volet déroulant **Clé publique** :

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Cliquez sur **Afficher** / **Masquer** pour visualiser la clé publique brute.
* Cliquez sur l'icône de presse-papiers pour copier instantanément la clé publique.

#### Association de clés de déploiement aux forges Git courantes

Pour les dépôts Git nécessitant une authentification SSH, ajoutez la clé publique générée en tant que deploy key en lecture seule :
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Connexion avec mot de passe {#2-login-with-password}

Le type d'identifiant **Connexion avec mot de passe** prend en charge aussi bien les combinaisons classiques nom d'utilisateur/mot de passe que les chaînes secrètes isolées :

* **Authentification hôte et sudo** : Fournit l'accès SSH par mot de passe et l'élévation de privilèges `sudo` sur les hôtes cibles.
* **Authentification Git HTTPS** : Authentifie sur les dépôts distants en HTTPS à l'aide d'un nom d'utilisateur et de jetons d'accès personnel (PAT).
* **Mots de passe Ansible Vault** : Déverrouille les fichiers et variables chiffrés d'Ansible Vault lors de l'exécution.

:::tip Chaînes secrètes et jetons d'accès personnel (PAT)
Pour stocker une chaîne secrète pure, comme un jeton bearer d'API ou le secret d'un webhook, utilisez le type **Chaîne** ci-dessous. Le type **Connexion avec mot de passe** avec un identifiant vide reste nécessaire pour les mots de passe Ansible Vault et les jetons Git HTTPS, car ces consommateurs n'acceptent que ce type.
:::

#### Masquage des secrets et protection contre l'écrasement {#secret-masking-and-override-protection}

Pour protéger les identifiants contre toute exposition non autorisée et toute modification accidentelle :
* Les champs de mot de passe et de phrase secrète sont masqués avec des options d'affichage temporaire.
* Lors de l'édition d'un identifiant existant, les champs de secrets sensibles sont désactivés par défaut.
* Pour mettre à jour un secret existant, vous devez obligatoirement cocher la case **Écraser** en bas du formulaire. Ce verrou de sécurité empêche les écrasements involontaires lors des modifications d'administration courantes.

---

### 3. Aucun {#3-none}

L'identifiant **Aucun** sert d'espace réservé pour l'absence d'authentification. Il est utilisé pour les dépôts Git open-source publics (sur GitHub ou GitLab) et les exécutions locales de playbooks ne requérant ni clé SSH ni mot de passe.

---

### 4. Chaîne {#4-string}

L'identifiant **Chaîne** contient une seule valeur secrète sans nom d'utilisateur : un jeton d'API, le secret d'un webhook, un mot de passe seul. Il est stocké chiffré comme tout autre identifiant, n'est jamais renvoyé par l'API ni réaffiché dans le formulaire, et ne peut être remplacé qu'en cochant **Override**.

Où il est utilisé :
* **Intégrations** : comme *Auth secret* des méthodes d'authentification Token, HMAC, GitHub et Bitbucket, voir [Intégrations](/user-guide/integrations#hmac-authentication).

Là où ce type ne convient pas, les sélecteurs d'identifiants ne le proposent tout simplement pas : la clé SSH d'un dépôt ou d'un inventaire, les identifiants sudo et le mot de passe Ansible Vault exigent une clé SSH ou un identifiant/mot de passe.

Via l'API, le même identifiant se crée avec `"type": "string"` :

```bash
curl -X POST "https://semaphore.example.com/api/project/1/keys" \
  -H "Authorization: Bearer <api-token>" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "name": "webhook-secret", "type": "string", "string": "s3cr3t"}'
```

---

## Stockages de secrets {#secret-storages}

Semaphore prend en charge les architectures découplées de stockage de secrets. Lors de la création ou de l'édition, vous pouvez choisir l'emplacement du secret via les onglets :

| Onglet de stockage | Disponibilité | Description |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | Le secret est stocké directement dans la base de données Semaphore avec chiffrement d'enveloppe. |
| **Storage** | Pro | Le secret référence un moteur externe (par exemple HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | Le secret est résolu dynamiquement à l'exécution depuis une variable d'environnement du serveur. |
| **File** | Open Source & Pro | Le secret est lu depuis un fichier protégé situé dans le répertoire de secrets configuré. |

![Stockages de secrets](/assets/key-store-storages.webp)

### Stockage en base de données (Local) {#database}

Par défaut, les secrets sont stockés de manière chiffrée dans la base de données grâce au chiffrement symétrique AES. La clé principale est configurée via le paramètre serveur :
* Clé de configuration : `access_key_encryption`
* Variable d'environnement : `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Génération de la clé maîtresse de chiffrement
Générez une clé cryptographique base64 de 32 octets avant de démarrer vos instances de production :
```bash
head -c32 /dev/urandom | base64
```
Assurez-vous de sauvegarder cette clé. En cas de perte, les secrets existants en base de données ne pourront pas être récupérés.
:::

### Sources de variables d'environnement et fichiers (Lecture seule) {#environment-variable-or-file}

Lorsque vous sélectionnez l'onglet **Env** ou **File**, Semaphore traite le stockage comme une source externe en lecture seule. L'interface affiche une notification explicite :

> **Read-only secret storage chosen.**

![Stockage en lecture seule](/assets/key-store-env-readonly-storage.webp)

* **Source Env** : Fournissez le nom exact de la variable d'environnement exportée sur le serveur (par exemple `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **Source File** : Fournissez le chemin relatif au répertoire de secrets configuré (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, valeur par défaut `/tmp/semaphore`).

Pour les clés structurées, le contenu des fichiers ou variables doit respecter le format JSON. Pour plus de détails, consultez [Sources d'environnement et fichiers](/user-guide/key-store/env-and-file-sources).

### Moteurs de secrets d'entreprise externes (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro et Enterprise étendent le Key Store avec des connecteurs natifs vers les gestionnaires de secrets leaders du marché :

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)** : Connexion via authentification AppRole ou Token pour lire et écrire des secrets KV v1/v2.
* **[OpenBao](/user-guide/key-store/openbao)** : Fork open-source et compatible avec l'API de HashiCorp Vault.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise /> : Intégration avec les rôles IAM AWS ou identifiants statiques.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)** : Intégration pour la gestion centralisée des accès à privilèges.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise /> : Lecture et écriture de secrets via l'API REST PVWA de CyberArk.

---

## Synchronisation des secrets depuis des stockages distants {#syncing-secrets-from-remote-storages}

Plutôt que d'enregistrer les identifiants un par un, Semaphore prend en charge la synchronisation automatisée depuis des coffres de secrets externes.

Lorsqu'un secret est géré par synchronisation :
* Il porte un badge actif **synchronized** dans le tableau du Key Store.
* La modification manuelle du secret dans l'interface est désactivée afin de préserver le coffre externe comme source unique de vérité.
* Toute mise à jour ou rotation dans le moteur distant est automatiquement répercutée dans Semaphore selon l'intervalle configuré.

Pour découvrir toutes les étapes de configuration, consultez [Synchronisation des secrets](/user-guide/key-store/secret-sync).
