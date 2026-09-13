# Invites

Les invites sont des indicateurs et des options prédéfinis, propres à chaque type de modèle, que vous pouvez activer pour permettre une personnalisation au moment de l'exécution. Contrairement aux [Variables de questionnaire](/user-guide/task-templates/survey-vars), qui sont des champs personnalisés que vous créez, les invites sont des options intégrées qui correspondent à des indicateurs CLI spécifiques d'Ansible, Terraform et d'autres outils.

Cette fonctionnalité vous permet de :
- Remplacer les valeurs par défaut du modèle au moment de l'exécution
- Cibler des hôtes ou des ressources spécifiques
- Contrôler le comportement de l'exécution avec des indicateurs CLI
- Transmettre des options d'exécution via des appels API ou des planifications

## Invites et variables de questionnaire {#prompts-vs-survey-variables}

| Caractéristique | Invites | Variables de questionnaire |
|---------|---------|-----------------|
| **Définition** | Options prédéfinies propres au modèle | Champs personnalisés que vous créez |
| **Exemples** | Ansible : `--limit`, `--tags`<br/>Terraform : espaces de travail, `-destroy` | Nom d'environnement, numéro de version, paramètres personnalisés |
| **Configuration** | Activer via des cases à cocher dans le modèle | Ajouter dans les paramètres du modèle avec un nom et un type |
| **Transmis comme** | Indicateurs CLI intégrés | Ansible : `--extra-vars`<br/>Terraform : `-var` |

Les **invites** sont des options standardisées intégrées à Semaphore pour des outils spécifiques, alors que les **variables de questionnaire** sont des champs personnalisés flexibles que vous définissez vous-même.

## Invites Ansible {#ansible-prompts}

Pour les modèles de playbook Ansible, vous pouvez activer des invites pour les options CLI suivantes :

### Limit {#limit}

Activez l'invite `--limit` pour indiquer quels hôtes cibler lors de l'exécution du playbook.

**Équivalent CLI** : `ansible-playbook playbook.yml --limit webservers`

**Cas d'usage** :
- Exécuter le playbook sur un sous-ensemble des hôtes de l'inventaire
- Cibler des serveurs spécifiques pour un déploiement
- Tester des modifications sur un seul hôte avant un déploiement général

**Exemple** :
- Votre inventaire contient 50 serveurs web
- Activez l'invite Limit
- Lors de l'exécution de la tâche, indiquez `web-01.example.com` pour ne cibler que ce serveur
- Ou indiquez `webservers:&production` pour cibler les serveurs web de production

### Tags {#tags}

Activez l'invite `--tags` pour n'exécuter que les tâches portant des tags spécifiques.

**Équivalent CLI** : `ansible-playbook playbook.yml --tags deploy,restart`

**Cas d'usage** :
- Exécuter uniquement certaines parties d'un playbook
- Lancer les étapes de déploiement sans les tâches de configuration
- Redémarrer rapidement des services sans exécuter tout le playbook

**Exemple** :
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Activez l'invite Tags et saisissez `deploy,restart` pour ignorer l'étape d'installation.

### Skip Tags {#skip-tags}

Activez l'invite `--skip-tags` pour ignorer les tâches portant des tags spécifiques.

**Équivalent CLI** : `ansible-playbook playbook.yml --skip-tags testing,debug`

**Cas d'usage** :
- Ignorer les tâches facultatives en production
- Exclure les tâches de débogage ou de test
- Contourner les tâches longues lorsqu'elles ne sont pas nécessaires

**Exemple** : en reprenant le playbook ci-dessus, activez Skip Tags et saisissez `install` pour ignorer l'installation des paquets et n'exécuter que les tâches de déploiement et de redémarrage.

### Skip Galaxy install {#skip-galaxy-install}

Activez l'invite pour permettre à l'utilisateur d'ignorer l'étape `ansible-galaxy install` des rôles et des collections lors de l'exécution de la tâche.

**Cas d'usage** :
- Les prérequis sont déjà installés dans l'image du runner
- Gagner du temps sur des exécutions répétées lorsque rien n'a changé dans `requirements.yml`

### Force Galaxy install {#force-galaxy-install}

Activez l'invite pour permettre à l'utilisateur de forcer `ansible-galaxy install --force` pour chaque fichier de prérequis, en ignorant la somme de contrôle des prérequis que Semaphore conserve entre les exécutions.

**Équivalent CLI** : `ansible-galaxy role install -r requirements.yml --force`

**Cas d'usage** :
- Un fichier de prérequis référence une branche plutôt qu'une version fixe et vous avez besoin du dernier commit
- Une installation précédente a laissé des rôles ou des collections dans un état corrompu
- Vérifier qu'un playbook fonctionne à partir d'un ensemble de dépendances propre

Voir [Prérequis Galaxy](../apps/ansible.md#galaxy-requirements) pour comprendre le fonctionnement des valeurs par défaut au niveau du modèle.

### Activer les invites Ansible {#enabling-ansible-prompts}

Pour activer les invites Ansible :

1. Allez dans **Modèles de tâches** et sélectionnez votre modèle Ansible
2. Repérez la section **Invites Ansible** dans les paramètres du modèle
3. Cochez les cases des invites souhaitées :
   - ☐ **Limit** - Activer l'indicateur `--limit`
   - ☐ **Tags** - Activer l'indicateur `--tags`
   - ☐ **Skip Tags** - Activer l'indicateur `--skip-tags`
   - ☐ **Debug** - Activer la sélection de la verbosité (`-v`)
   - ☐ **Skip Galaxy install** - Autoriser l'omission d'`ansible-galaxy install`
   - ☐ **Force Galaxy install** - Autoriser le forçage d'`ansible-galaxy install --force`
4. Enregistrez le modèle

![](/assets/ansible_2.png)

Lorsqu'elles sont activées, ces valeurs apparaissent dans le formulaire d'exécution de tâche, dans les requêtes API et dans les configurations de planification.

## Invites Terraform/OpenTofu {#terraformopentofu-prompts}

Pour les modèles Terraform et OpenTofu, Semaphore fournit plusieurs invites intégrées :

### Sélection de l'espace de travail {#workspace-selection}

Sélectionnez l'espace de travail Terraform à utiliser pour l'exécution de la tâche.

**Équivalent CLI** : `terraform workspace select staging`

**Cas d'usage** :
- Gérer plusieurs environnements (dev, staging, production)
- Séparer les fichiers d'état pour différentes configurations
- Tester des modifications d'infrastructure de façon isolée

**Mise en place** :
1. Créez des espaces de travail dans l'onglet **Espaces de travail** du modèle
2. Le sélecteur d'espace de travail apparaît automatiquement dans le formulaire de tâche
3. Les utilisateurs choisissent l'espace de travail cible lors de l'exécution des tâches

Voir [Espaces de travail Terraform](/user-guide/apps/terraform/workspaces) pour une mise en place détaillée.

### Indicateur Destroy {#destroy-flag}

Activez l'indicateur `-destroy` pour détruire l'infrastructure.

**Équivalent CLI** : `terraform apply -destroy`

**Cas d'usage** :
- Nettoyer des environnements de test temporaires
- Décommissionner une infrastructure
- Supprimer des ressources spécifiques

**Important** : il s'agit d'une opération destructrice. Utilisez-la avec prudence et envisagez d'exiger une confirmation dans vos processus.

### Indicateur Migrate State {#migrate-state-flag}

Activez l'indicateur `-migrate-state` lorsque vous modifiez la configuration du backend.

**Équivalent CLI** : `terraform init -migrate-state`

**Cas d'usage** :
- Déplacer l'état vers un autre backend
- Migrer entre des emplacements de stockage
- Mettre à jour la configuration du backend

### Activer les invites Terraform {#enabling-terraform-prompts}

Les invites Terraform sont disponibles dans les paramètres du modèle :

1. Allez dans **Modèles de tâches** et sélectionnez votre modèle Terraform
2. Configurez les invites disponibles dans les paramètres du modèle :
   - Sélection de l'espace de travail (activée automatiquement si des espaces de travail sont configurés)
   - Option de l'indicateur destroy
   - Option migrate state
3. Enregistrez le modèle

Le formulaire de tâche affiche ces options lors de l'exécution de tâches Terraform.

## Invites Bash, PowerShell et Python {#bash-powershell-and-python-prompts}

Pour les modèles Bash, PowerShell et Python, les invites sont minimales car l'essentiel de la personnalisation passe par les [Variables de questionnaire](/user-guide/task-templates/survey-vars).

Les invites disponibles sont :

- Arguments CLI
- Branche

Ces types de modèles tirent davantage parti de variables de questionnaire personnalisées pour transmettre des paramètres aux scripts.

## Utiliser les invites {#using-prompts}

### Exécution manuelle d'une tâche {#manual-task-execution}

Lors de l'exécution d'une tâche à partir d'un modèle dont des invites sont activées :

1. Cliquez sur **Run** sur le modèle
2. Un formulaire apparaît avec les champs d'invite activés
3. Renseignez les valeurs des invites que vous souhaitez utiliser (les champs facultatifs peuvent rester vides)
4. Cliquez sur **Run Task**

La tâche s'exécute avec les valeurs d'invite que vous avez indiquées, transmises sous forme d'indicateurs CLI.

### Appels API {#api-calls}

Pour transmettre des valeurs d'invite via l'API, incluez-les dans la charge utile de la requête :

**Exemple Ansible :**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**Important** : les invites doivent être activées dans le modèle pour que les valeurs soient acceptées. Si vous transmettez des valeurs d'invite via l'API sans les avoir activées, ces valeurs seront ignorées.

### Tâches planifiées {#scheduled-tasks}

Les planifications peuvent inclure des valeurs d'invite pour personnaliser l'exécution automatisée des tâches :

**Exemple** : planification avec des invites Ansible
- Planification de déploiement quotidien avec `limit: "production"` et `tags: "deploy"`
- Planification de maintenance hebdomadaire avec `tags: "updates,cleanup"`

Configurez les valeurs d'invite dans les paramètres de la planification afin que chaque exécution planifiée utilise les options indiquées.

### Intégrations et webhooks {#integrations-and-webhooks}

Les intégrations peuvent extraire des valeurs depuis les webhooks et les associer à des invites :

**Exemple** : un webhook GitHub déclenche un déploiement
- Extraire le nom de la branche depuis le webhook
- L'associer à l'invite Limit pour cibler un environnement spécifique
- Déployer uniquement sur les serveurs correspondant à l'environnement de la branche

Voir [Intégrations](../integrations) pour la configuration des webhooks.

## Bonnes pratiques {#best-practices}

### N'activez que les invites nécessaires {#enable-only-necessary-prompts}

Chaque invite activée ajoute un champ au formulaire de tâche. N'activez que les invites que les utilisateurs auront réellement besoin de personnaliser.

✅ **Bien** : activer Limit pour les équipes d'exploitation qui doivent cibler des hôtes spécifiques
❌ **Mal** : activer toutes les invites « au cas où »

### Combinez avec les variables de questionnaire {#combine-with-survey-variables}

Utilisez les invites pour les options CLI propres aux outils et les variables de questionnaire pour les paramètres personnalisés :

**Exemple de modèle Ansible :**
- **Invites** : Limit (quels hôtes), Tags (quelles tâches)
- **Variables de questionnaire** : `app_version` (quelle version), `enable_rollback` (logique personnalisée)

### Documentez l'utilisation de l'API {#document-api-usage}

Si les modèles sont déclenchés via l'API, documentez les invites disponibles et leur format attendu :

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### Utilisez Limit pour des tests sûrs {#use-limit-for-safe-testing}

Testez toujours d'abord les playbooks potentiellement destructeurs avec l'invite Limit :

1. Activez l'invite Limit dans le modèle
2. Première exécution : indiquez `limit: "test-server-01"` pour tester sur un seul hôte
3. Vérifiez le succès
4. Seconde exécution : indiquez `limit: "production"` pour déployer sur tous les hôtes

### Validez les combinaisons d'invites {#validate-prompt-combinations}

Certaines combinaisons d'invites peuvent ne pas avoir de sens. Ajoutez de la documentation ou de la validation :

- Utiliser `--tags deploy` avec `--skip-tags deploy` est contradictoire
- Indiquer à la fois un espace de travail et l'indicateur destroy demande une prudence accrue

## Cas d'usage courants {#common-use-cases}

### Déploiement progressif avec Limit {#gradual-rollout-with-limit}

Déployez progressivement en production à l'aide de l'invite Limit d'Ansible :

1. Exécution 1 : `limit: "web-01.example.com"` - Déployer sur un seul serveur
2. Surveillez les éventuels problèmes
3. Exécution 2 : `limit: "webservers:&canary"` - Déployer sur les serveurs canari
4. Validez les métriques
5. Exécution 3 : `limit: "webservers:&production"` - Déploiement complet

### Exécution sélective avec Tags {#selective-execution-with-tags}

Utilisez Tags pour n'exécuter que certaines parties d'un playbook :

**Matin** : `tags: "deploy"` - Déployer la nouvelle version
**Après-midi** : `tags: "config"` - Mettre à jour la configuration
**Soir** : `tags: "restart"` - Redémarrer les services avec la nouvelle configuration

### Gestion des environnements avec les espaces de travail {#environment-management-with-workspaces}

Utilisez la sélection d'espace de travail Terraform pour gérer les environnements :

- **Développement** : sélectionnez l'espace de travail `dev` - ressources moins coûteuses, itérations plus rapides
- **Staging** : sélectionnez l'espace de travail `staging` - proche de la production pour les tests
- **Production** : sélectionnez l'espace de travail `prod` - infrastructure de production complète

### Nettoyage avec Destroy {#cleanup-with-destroy}

Utilisez destroy de Terraform pour une infrastructure temporaire :

1. Créez l'environnement de test : exécutez avec l'espace de travail `test-branch-123`
2. Lancez les tests d'intégration
3. Nettoyez : exécutez avec l'indicateur destroy activé et l'espace de travail `test-branch-123`

## Dépannage {#troubleshooting}

### Valeurs d'invite ignorées {#prompt-values-ignored}

**Problème** : vous transmettez des valeurs d'invite mais elles n'ont aucun effet

**Solution** : vérifiez que l'invite correspondante est activée dans les paramètres du modèle. Les invites doivent être activées explicitement.

### Impossible d'indiquer limit {#cannot-specify-limit}

**Problème** : le champ Limit n'apparaît pas dans le formulaire de tâche

**Solution** :
1. Modifiez le modèle
2. Trouvez la section « Invites Ansible »
3. Cochez la case « Limit »
4. Enregistrez le modèle

### Les appels API échouent avec des valeurs d'invite {#api-calls-fail-with-prompt-values}

**Problème** : les requêtes API contenant des valeurs d'invite renvoient des erreurs

**Solution** :
1. Assurez-vous que les invites sont activées dans le modèle
2. Vérifiez le formatage JSON du corps de la requête
3. Vérifiez que les noms de champs correspondent exactement (`limit`, et non `host_limit`)

### Les tags ne filtrent pas les tâches {#tags-not-filtering-tasks}

**Problème** : vous indiquez des tags mais toutes les tâches s'exécutent quand même

**Solution** :
1. Vérifiez que les tâches du playbook ont bien des tags définis
2. Recherchez des fautes de frappe dans les noms de tags
3. Assurez-vous que les tags sont séparés par des virgules sans espaces : `deploy,restart` et non `deploy, restart`

## Documentation associée {#related-documentation}

- [Variables de questionnaire](/user-guide/task-templates/survey-vars) - Champs personnalisés pour les modèles
- [Modèles Ansible](/user-guide/apps/ansible) - Configuration propre à Ansible
- [Modèles Terraform](/user-guide/apps/terraform) - Configuration propre à Terraform
- [Planifications](../schedules) - Exécution automatisée des tâches
- [Intégrations](../integrations) - Tâches déclenchées par webhook
- [Documentation de l'API](../../reference/api) - Référence de l'API
