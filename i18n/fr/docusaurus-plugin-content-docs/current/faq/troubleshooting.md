# Dépannage

## Le runner affiche l'erreur 404 {#runner-prints-error-404}

### Comment corriger {#how-to-fix}

[Getting 401 error code from Runner](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## Problème de Gathering Facts pour localhost {#gathering-facts-issue-for-localhost}

Ce problème peut survenir sur une installation de Semaphore UI via [Snap](https://snapcraft.io/semaphore) ou [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Pourquoi cela se produit {#why-this-happens}

Pour plus d'informations sur l'utilisation de localhost dans Ansible, lisez cet article : [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible tente de collecter les facts localement, mais Ansible se trouve dans un conteneur isolé aux droits limités qui ne le permet pas.

### Comment corriger {#how-to-fix-this}

Il existe deux méthodes :

1. Désactiver la collecte des facts :

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Définir explicitement le type de connexion sur **ssh** :
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```
---
## panic: pq: SSL is not enabled on the server {#panic-pq-ssl-is-not-enabled-on-the-server}

Cela signifie que votre Postgres ne fonctionne pas en SSL.

### Comment corriger {#how-to-fix-this-1}

Ajoutez l'option `sslmode=disable` au fichier de configuration :

```json
	"postgres": {
		"host": "localhost",
		"user": "postgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```
---
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

Cela signifie que vous essayez d'accéder via HTTPS à un dépôt qui nécessite une authentification.

### Comment corriger {#how-to-fix-this-2}

* Allez sur l'écran **Coffre de clés**.
* Créez une nouvelle clé de type `Login with password`.
* Indiquez votre identifiant pour GitHub/BitBucket/etc.
* Indiquez le mot de passe. Vous ne pouvez pas utiliser le mot de passe de votre compte GitHub/BitBucket ; vous devez utiliser un Personal Access Token (PAT) à la place. En savoir plus [ici](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* Après avoir créé la clé, allez sur l'écran **Dépôts**, trouvez votre dépôt et indiquez la clé.

---

## Le clone ou le pull Git échoue de manière intermittente {#git-clone-or-pull-fails-intermittently}

Les journaux de tâche peuvent afficher des messages tels que `Git pull failed (...), retrying in 2s`, suivis soit d'un succès, soit d'un échec définitif après plusieurs tentatives.

### Pourquoi cela se produit {#why-this-happens-1}

Le serveur git (GitHub, GitLab, Bitbucket ou une instance auto-hébergée) était temporairement injoignable, a renvoyé une erreur HTTP transitoire, ou le réseau entre Semaphore et le serveur a subi une brève interruption. Semaphore réessaie automatiquement les opérations de clone et de pull avant de faire échouer la tâche.

### Comment corriger {#how-to-fix-this-3}

1. **Interruptions transitoires** : elles se résolvent généralement d'elles-mêmes. Semaphore réessaie jusqu'à `git_attempts` fois (4 par défaut) avec un délai exponentiel entre les tentatives.
2. **Échecs fréquents** : augmentez le nombre de tentatives dans votre configuration :

```json
{
  "git_attempts": 8
}
```

Ou avec une variable d'environnement :

```bash
export SEMAPHORE_GIT_ATTEMPTS=8
```

3. **Échecs immédiats et systématiques** : les nouvelles tentatives n'aideront pas. Vérifiez l'URL du dépôt, le nom de la branche, les clés d'accès et la connectivité réseau depuis le serveur Semaphore ou l'hôte du runner.

Voir [Opérations Git](/admin-guide/configuration/config-file#git-operations) pour plus de détails sur `git_client` et `git_attempts`.

---

## La sortie d'un script Bash est absente ou incomplète {#bash-script-output-is-missing-or-incomplete}

Une tâche Bash se termine avec succès, mais le journal affiche peu ou pas de sortie provenant de `echo`, `printf` ou d'autres commandes — en particulier lorsque le script se termine rapidement.

### Pourquoi cela se produit {#why-this-happens-2}

Semaphore capture stdout et stderr des commandes shell pendant leur exécution. Les scripts très courts peuvent se terminer avant que toute la sortie mise en tampon ne soit lue, de sorte que les dernières lignes peuvent être absentes du journal de la tâche.

### Comment corriger {#how-to-fix-this-4}

1. **Mettre à niveau** : les versions récentes de Semaphore vident la sortie du processus avant de marquer une tâche comme terminée. Mettez à jour le serveur et les runners si vous utilisez une version plus ancienne.
2. **Vider la sortie dans le script** lorsque vous avez besoin d'une remise garantie :

```bash
#!/bin/bash
echo "Starting deploy"
echo "Done" >&2
```

Pour les diagnostics critiques, écrivez dans un fichier à l'intérieur de l'espace de travail du dépôt et faites un `cat` de celui-ci à la fin du script.
3. **Éviter les sorties prématurées silencieuses** : utilisez `set -euo pipefail` et des messages d'erreur explicites afin que les échecs restent visibles même lorsque la sortie est brève.

---

## unable to read LDAP response packet: unexpected EOF {#unable-to-read-ldap-response-packet-unexpected-eof}

Vous essayez très probablement de vous connecter au serveur LDAP avec une méthode non sécurisée, alors qu'il attend une connexion sécurisée (via TLS).

### Comment corriger {#how-to-fix-this-5}

Activez TLS dans votre fichier `config.json` :

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials" {#ldap-result-code-49-invalid-credentials}

Votre mot de passe ou votre `binddn` est incorrect.

### Comment corriger {#how-to-fix-this-6}

Utilisez l'outil `ldapwhoami` et vérifiez que votre binddn fonctionne :

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

Il vous demandera le mot de passe de manière interactive et devrait renvoyer le code **0** et afficher le **DN** tel que spécifié.

Vous pouvez également lire les articles suivants : 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## LDAP Result Code 32 "No Such Object" {#ldap-result-code-32-no-such-object}

Bientôt disponible.
