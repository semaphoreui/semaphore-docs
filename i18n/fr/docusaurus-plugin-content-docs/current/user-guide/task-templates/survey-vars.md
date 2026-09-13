# Variables de sondage

Les variables de sondage sont des champs de saisie personnalisés que vous pouvez ajouter aux modèles de tâches pour recueillir des données auprès de l'utilisateur lors de l'exécution des tâches. Au lieu de coder en dur des valeurs dans vos playbooks ou scripts, vous pouvez définir des variables personnalisées qui demandent des valeurs aux utilisateurs à l'exécution.

Cette fonctionnalité est utile pour :
- Exécuter le même modèle avec des paramètres différents (par exemple des valeurs de configuration)
- Accepter des données dynamiques via des appels API
- Transmettre des paramètres personnalisés dans les tâches planifiées
- Déclencher des tâches depuis des intégrations avec des données extraites de webhooks

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Variables de sondage et invites {#survey-variables-vs-prompts}

Il est important de comprendre la différence entre les variables de sondage et les invites (prompts) :

| Caractéristique | Variables de sondage | Invites |
|---------|-----------------|---------|
| **Définition** | Champs personnalisés que vous créez | Options prédéfinies propres au modèle |
| **Exemples** | Nom d'environnement, numéro de version, point de terminaison d'API | Ansible : `--limit`, `--tags`<br/>Terraform : workspaces |
| **Configuration** | Ajout dans les paramètres du modèle avec un nom et un type | Activation via des cases à cocher dans le modèle |
| **Transmises comme** | Ansible : `--extra-vars`<br/>Terraform : `-var` | Options de ligne de commande intégrées |

Les **variables de sondage** sont des champs personnalisés flexibles que vous définissez vous-même, tandis que les **invites** sont des options intégrées propres à chaque type de modèle (comme les options `--limit` ou `--tags` d'Ansible).

## Ajouter des variables de sondage à un modèle {#adding-survey-variables-to-a-template}

Les variables de sondage se configurent dans les paramètres du modèle :

1. Accédez à **Modèles de tâches** et sélectionnez votre modèle
2. Accédez à la section **Variables de sondage** dans les paramètres du modèle
3. Cliquez sur **Ajouter une variable de sondage**
4. Configurez la variable :
   - **Nom** : nom de la variable (utilisé dans votre code)
   - **Titre** : libellé affiché dans le formulaire
   - **Type** : choisissez le type de champ
   - **Transmettre la variable comme** : variable supplémentaire (par défaut) ou variable d'environnement
   - **Valeur par défaut** : valeur optionnelle pré-remplie affichée à l'ouverture du formulaire de tâche
   - **Obligatoire** : indique si le champ doit être renseigné
5. Enregistrez le modèle

Lorsque les utilisateurs exécutent une tâche à partir de ce modèle, un formulaire contenant vos variables de sondage personnalisées s'affiche.

## Types de variables {#variable-types}

Les variables de sondage prennent en charge six types :

### Chaîne (string) {#string}

Champ de saisie de texte pour les valeurs de type chaîne.

**Cas d'usage** : noms d'environnement, noms de branche, noms d'hôte, chemins de fichiers

**Exemple** : une variable nommée `environment` invite les utilisateurs à saisir « production », « staging » ou « development »

### Entier (integer) {#integer}

Champ de saisie numérique pour les valeurs entières.

**Cas d'usage** : numéros de port, nombres de tentatives, délais d'expiration, limites de ressources

**Exemple** : une variable nommée `timeout_seconds` invite les utilisateurs à saisir « 300 » ou « 600 »

### Texte (text) {#text}

Zone de texte multiligne pour les valeurs de type chaîne plus longues.

**Cas d'usage** : messages de commit, extraits JSON, notes libres, configuration multiligne

**Exemple** : une variable nommée `changelog` dans laquelle les utilisateurs collent les notes de version avant le déploiement

### Enum (sélection simple) {#enum-single-select}

Menu déroulant dans lequel l'utilisateur choisit exactement une option parmi une liste prédéfinie.

**Cas d'usage** : type d'environnement, stratégie de déploiement, choix de type booléen

**Exemple** : une variable nommée `deployment_type` avec les options : « rolling », « blue-green », « canary »

Lors de la création d'une variable enum, ajoutez chaque option avec un libellé d'affichage et une valeur dans l'éditeur de variable.

### Select (sélection multiple) {#select-multi-select}

Menu déroulant dans lequel l'utilisateur peut choisir une ou plusieurs options parmi une liste prédéfinie. Les valeurs sélectionnées sont transmises sous forme de tableau JSON (par exemple `["staging","production"]`), et non sous forme d'une chaîne unique.

**Cas d'usage** : régions cibles, indicateurs de fonctionnalités (feature flags), plusieurs groupes d'hôtes, listes de tags

**Exemple** : une variable nommée `target_regions` avec les options `us-east-1`, `eu-west-1`, `ap-southeast-1`

**Contraintes** :
- Les valeurs par défaut doivent être choisies dans la liste d'options et peuvent inclure plusieurs sélections
- Dans les modèles Bash, PowerShell et Python, analysez le tableau JSON à partir de l'argument ou de la valeur d'environnement (voir les exemples ci-dessous)

### Secret {#secret}

Champ de type mot de passe dont la valeur est masquée.

**Cas d'usage** : clés API, mots de passe, tokens, configuration sensible

**Exemple** : une variable nommée `api_token` dont la valeur saisie s'affiche sous forme de points pour des raisons de sécurité

## Valeurs par défaut {#default-values}

Vous pouvez définir une valeur par défaut optionnelle pour la plupart des types de variables. Lorsqu'un utilisateur ouvre la boîte de dialogue d'exécution de tâche, les champs sont pré-remplis avec ces valeurs par défaut.

- **String, integer, text, secret** : une seule valeur par défaut
- **Enum** : une option de la liste
- **Select** : une ou plusieurs options de la liste

Les valeurs par défaut sont utiles pour les planifications et les intégrations, où le même modèle s'exécute de manière répétée avec des paramètres prévisibles. Les utilisateurs peuvent toujours modifier les valeurs avant de lancer une tâche.

## Transmettre la variable comme (cible) {#pass-variable-as-target}

Chaque variable de sondage peut être transmise de l'une des deux manières suivantes :

| Paramètre | Comportement |
|---------|----------|
| **Variable supplémentaire** (par défaut) | Transmise selon le mécanisme propre à l'application : `--extra-vars` pour Ansible, `-var` pour Terraform, ou arguments CLI `name=value` pour les applications shell |
| **Variable d'environnement** | Définie comme variable d'environnement du processus, dont le nom correspond au nom de la variable de sondage |

Utilisez **Variable d'environnement** lorsque votre script ou outil lit l'environnement plutôt que des options de ligne de commande. Pour les variables Terraform qui doivent respecter la convention `TF_VAR_`, nommez la variable de sondage `TF_VAR_instance_type` et définissez la cible sur variable d'environnement.

Les variables ayant pour cible l'environnement ne sont **pas** dupliquées dans les extra-vars, `-var` ou les arguments CLI. Chaque valeur est transmise exactement une fois.

## Comment les variables de sondage sont transmises aux tâches {#how-survey-variables-are-passed-to-tasks}

Les variables de sondage sont transmises différemment selon le type de modèle et le paramètre **Transmettre la variable comme**.

Les **valeurs de sélection multiple (type `select`)** sont des tableaux encodés en JSON dans tous les modes de transmission (JSON extra-vars, `-var`, arguments CLI et variables d'environnement). Une sélection des options `1` et `2` devient `["1","2"]`, et non une chaîne séparée par des espaces.

### Modèles Ansible {#ansible-templates}

Les variables de sondage sont transmises comme variables supplémentaires Ansible via l'option `--extra-vars`.

**Exemple** : si vous définissez une variable de sondage nommée `app_version` :

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

Lors de l'exécution de la tâche, l'utilisateur saisit « 2.5.0 » dans le formulaire de sondage, et Ansible la reçoit ainsi :

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Modèles Terraform/OpenTofu {#terraformopentofu-templates}

Les variables de sondage sont transmises comme variables Terraform via l'option `-var`.

**Exemple** : si vous définissez une variable de sondage nommée `instance_count` :

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

Lors de l'exécution de la tâche, l'utilisateur saisit « 3 » dans le formulaire de sondage, et Terraform la reçoit ainsi :

```bash
terraform apply -var="instance_count=3"
```

### Modèles Shell/Bash {#shellbash-templates}

Les variables de sondage sont transmises au script Bash comme arguments de ligne de commande :

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

Vous pouvez utiliser le code suivant dans le script pour analyser les arguments et les placer dans un tableau :

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

Pour les variables de **sélection multiple**, la valeur est une chaîne représentant un tableau JSON. Analysez-la avec `jq` (assurez-vous que `jq` est disponible dans votre image d'exécuteur) :

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### Modèles PowerShell {#powershell-templates}

Les variables de sondage sont transmises au script PowerShell en cours d'exécution comme arguments de ligne de commande :

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


Pour analyser les arguments, utilisez le code suivant dans le script :

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

Pour les variables de **sélection multiple**, analysez le tableau JSON à partir de la valeur de l'argument :

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Modèles Python {#python-templates}

Les variables de sondage sont transmises au script Python en cours d'exécution comme arguments de ligne de commande :

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

Pour analyser les arguments, utilisez le code suivant dans le script :

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

Pour les variables de **sélection multiple**, analysez le tableau JSON :

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## Utiliser les variables de sondage {#using-survey-variables}

### Exécution manuelle d'une tâche {#manual-task-execution}

Lors de l'exécution d'une tâche à partir d'un modèle comportant des variables de sondage :

1. Cliquez sur **Exécuter** sur le modèle
2. Un formulaire apparaît avec toutes les variables de sondage définies
3. Renseignez les valeurs de chaque champ
4. Cliquez sur **Exécuter la tâche**

La tâche s'exécute avec les valeurs que vous avez fournies, transmises au playbook ou au script.
<!-- 
### API calls {#api-calls}

To pass survey variable values via API:

**Example API request:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Survey variable values are passed in the `environment` object of the request payload.

**Important**: The task runs unattended when triggered via API—no interactive prompt appears. -->

### Tâches planifiées {#scheduled-tasks}

Les planifications peuvent inclure des valeurs de variables de sondage afin d'exécuter le même modèle avec des paramètres différents selon la planification.

**Configuration :**

1. Ajoutez des variables de sondage à votre modèle
2. Créez une planification pour ce modèle
3. Dans la configuration de la planification, définissez les valeurs de vos variables de sondage
4. Chaque exécution planifiée utilise ces valeurs prédéfinies

**Exemple de cas d'usage** : exécuter un playbook de sauvegarde avec différentes politiques de rétention :
- Planification quotidienne avec `retention_days=7`
- Planification hebdomadaire avec `retention_days=30`
- Planification mensuelle avec `retention_days=365`

Consultez la documentation [Planifications](../schedules) pour plus de détails.

### Intégrations et webhooks {#integrations-and-webhooks}

Les intégrations peuvent extraire des valeurs des webhooks entrants et les associer à des variables de sondage.

**Configuration :**

1. Ajoutez des variables de sondage à votre modèle
2. Créez une intégration qui déclenche ce modèle
3. Configurez des extracteurs de valeurs pour récupérer les données du contenu du webhook
4. Associez les valeurs extraites à vos variables de sondage

**Exemple** : déclencher un déploiement lors de la création d'une release GitHub :
- Extraire le tag de la release du contenu du webhook
- L'associer à une variable de sondage nommée `release_version`
- Le playbook de déploiement reçoit le numéro de version

Consultez la documentation [Intégrations](../integrations) pour plus de détails.

## Bonnes pratiques {#best-practices}

### Utiliser des noms descriptifs {#use-descriptive-names}

Choisissez des noms clairs et descriptifs pour vos variables de sondage, qui indiquent leur rôle :
- ✅ Bien : `target_environment`, `app_version`, `backup_retention_days`
- ❌ Mal : `env`, `ver`, `days`

### Fournir des titres utiles {#provide-helpful-titles}

Le titre apparaît dans le formulaire ; rendez-le donc compréhensible pour l'utilisateur :
- Nom de la variable : `db_host`
- Titre : « Nom d'hôte ou adresse IP de la base de données »

### Utiliser enum ou select pour les options connues {#use-enum-or-select-for-known-options}

Lorsque les utilisateurs doivent choisir parmi un ensemble limité d'options, utilisez enum ou select plutôt que string :
- ✅ **Enum** pour un choix unique : production, staging ou development
- ✅ **Select** lorsque plusieurs choix sont valides : plusieurs régions ou indicateurs de fonctionnalités
- ❌ Champ string accompagné d'une note « saisissez production ou staging »

### Utiliser la cible variable d'environnement de manière délibérée {#use-environment-variable-target-deliberately}

Préférez la transmission par défaut en variable supplémentaire, sauf si votre playbook, script ou outil lit explicitement l'environnement du processus. Nommez les variables ciblant l'environnement exactement comme l'outil en aval l'attend (par exemple `TF_VAR_region`).

### Marquer les champs obligatoires à bon escient {#mark-required-fields-appropriately}

Ne marquez les champs comme obligatoires que s'ils sont réellement indispensables. Envisagez de fournir des valeurs par défaut raisonnables dans vos playbooks pour les champs optionnels.

### Valider dans votre code {#validate-in-your-code}

Ne partez pas du principe que les valeurs des variables de sondage sont toujours valides. Ajoutez une logique de validation dans vos playbooks ou scripts :

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Utiliser des secrets pour les données sensibles {#use-secrets-for-sensitive-data}

Utilisez toujours le type secret pour les valeurs sensibles telles que les clés API, les mots de passe ou les tokens. Cela garantit que les valeurs sont masquées dans l'interface et dans les journaux.

### Combiner avec les groupes de variables {#combine-with-variable-groups}

Les variables de sondage se combinent bien avec les [groupes de variables](../environment) :
- Utilisez les **groupes de variables** pour la configuration statique partagée entre les tâches
- Utilisez les **variables de sondage** pour les valeurs qui changent à chaque exécution de tâche

**Exemple** :
- Groupe de variables : informations de connexion à la base de données, points de terminaison d'API
- Variables de sondage : environnement de déploiement, numéro de version, indicateurs de fonctionnalités

## Cas d'usage courants {#common-use-cases}

### Déploiements spécifiques à un environnement {#environment-specific-deployments}

Créez des variables de sondage pour :
- `environment` : enum avec les options « production, staging, development »
- `app_version` : string pour la version à déployer
- `enable_debug` : enum avec les options « true, false »

### Opérations sur les bases de données {#database-operations}

Créez des variables de sondage pour :
- `db_name` : string pour le nom de la base de données
- `backup_retention_days` : integer pour la politique de rétention
- `maintenance_window` : string pour la fenêtre de maintenance

### Provisionnement d'infrastructure {#infrastructure-provisioning}

Créez des variables de sondage pour :
- `instance_count` : integer pour le nombre d'instances
- `instance_type` : enum avec les options « t2.micro, t2.small, t2.medium »
- `region` : enum avec les régions AWS

### Pipelines CI/CD {#cicd-pipelines}

Créez des variables de sondage pour :
- `git_branch` : string pour la branche à compiler
- `build_type` : enum avec les options « debug, release »
- `run_tests` : enum avec les options « true, false »

## Différences avec les groupes de variables {#differences-from-variable-groups}

| Caractéristique | Variables de sondage | Groupes de variables |
|---------|-----------------|-----------------|
| **Objectif** | Saisie à l'exécution pour chaque tâche | Configuration statique réutilisable |
| **Moment de définition** | Au moment de l'exécution de la tâche | Préconfigurés dans le projet |
| **Cas d'usage** | Valeurs qui changent à chaque exécution | Paramètres partagés entre les tâches |
| **Format** | Champs typés individuels | Format JSON avec objets imbriqués |
| **Portée** | Une seule exécution de tâche | Plusieurs modèles/inventaires |
| **Sécurité** | Le type secret masque les valeurs sensibles | Onglet Secrets pour les données sensibles |

Utilisez les variables de sondage lorsque vous avez besoin de flexibilité à l'exécution, et les groupes de variables lorsque vous souhaitez une configuration cohérente entre plusieurs exécutions de tâches.
