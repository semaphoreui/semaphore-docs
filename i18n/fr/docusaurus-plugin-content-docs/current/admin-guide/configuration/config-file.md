
# Fichier de configuration

## Création du fichier de configuration {#creating-configuration-file}

Semaphore utilise un fichier `config.json` pour sa configuration principale. Vous pouvez générer ce fichier de manière interactive à l'aide des outils intégrés ou via un configurateur web.

### Générer via la CLI {#generate-via-cli}

Utilisez les commandes suivantes pour générer le fichier de configuration de manière interactive :

* Pour le serveur Semaphore :
  ```
  semaphore setup
  ```
* Pour le runner Semaphore :
  ```
  semaphore runner setup
  ```
  
  :::tip
    Pour plus de détails sur la configuration du runner, consultez la section <a href="./../runners">Runners</a>.
  :::

### Générer sur le site web {#generate-on-the-website}

Vous pouvez également utiliser le configurateur interactif en ligne :
* [Configurateur du serveur](https://semaphoreui.com/install/binary/2_13/config)
* [Configurateur du runner](https://semaphoreui.com/install/binary/2_13/runner)

## Exemple de fichier de configuration {#configuration-file-example}

Semaphore utilise un fichier de configuration `config.json` avec le contenu suivant :

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Utilisation du fichier de configuration {#configuration-file-usage}

* Pour le serveur Semaphore :

```bash
semaphore server --config ./config.json
```

* Pour le runner Semaphore :

```bash
semaphore runner start --config ./config.json
```

## Répertoire des secrets {#secrets-directory}

Semaphore lit les fichiers de secrets (par exemple les [entrées du magasin de clés basées sur des fichiers](/user-guide/key-store/env-and-file-sources) ou les tokens HashiCorp Vault et OpenBao lus depuis le disque) uniquement depuis un répertoire configurable.

| Option | Variable d'environnement | Description |
|--------|--------------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Répertoire des fichiers de secrets. Par défaut : `/tmp/semaphore`. |
| `secrets_path` (hérité) | `SEMAPHORE_SECRETS_PATH` | Paramètre de premier niveau conservé pour la rétrocompatibilité. Utilisé uniquement lorsque `dirs.secrets` n'est pas défini ou conserve encore le chemin par défaut. |

**Priorité** : une valeur de `dirs.secrets` autre que la valeur par défaut l'emporte sur l'ancien `secrets_path`. Lorsque vous définissez `SEMAPHORE_SECRETS_PATH`, Semaphore l'applique aux deux champs.

Exemple avec la structure actuelle :

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Les installations héritées peuvent encore utiliser :

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Les fichiers de clés sélectionnés dans l'onglet **File** du formulaire du magasin de clés, ainsi que les fichiers de token référencés par les stockages de secrets externes, doivent se trouver dans ce répertoire. Les chemins situés en dehors sont rejetés avec l'erreur `file path must be inside secrets path`. Consultez [Clés issues de variables d'environnement et de fichiers](/user-guide/key-store/env-and-file-sources).

## Opérations Git {#git-operations}

Semaphore clone et met à jour les dépôts des tâches avant chaque exécution. Deux options contrôlent ce comportement :

| Option | Variable d'environnement | Description |
|--------|--------------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Implémentation du client Git : `cmd_git` (par défaut, utilise le binaire `git` du système) ou `go_git` (client en pur Go). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Nombre de tentatives des opérations de clone et de pull avant que la tâche n'échoue. Par défaut : `4`. Définissez `1` pour une seule tentative sans nouvel essai. |

Lorsqu'un clone ou un pull échoue et qu'il reste des tentatives, Semaphore attend avec un délai exponentiel (à partir de 1 seconde, doublé à chaque tentative, plafonné à 60 secondes) et journalise un message tel que `Git pull failed (...), retrying in 2s`. Les nouvelles tentatives ne s'appliquent qu'aux opérations réseau ; un checkout échoué ou une erreur d'authentification fait toujours échouer la tâche une fois toutes les tentatives épuisées.

Si votre serveur Git est indisponible par intermittence, augmentez `git_attempts`. Si les échecs sont immédiats et persistants (identifiants incorrects, dépôt manquant), corrigez le problème sous-jacent — les nouvelles tentatives n'y changeront rien.

