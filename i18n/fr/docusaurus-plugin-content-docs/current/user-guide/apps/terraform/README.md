
# Terraform/OpenTofu

Semaphore UI vous permet d'exécuter du code Terraform. Pour cela, vous devez créer un **modèle de code Terraform**.

1. Allez dans la section **Modèles de tâches** et cliquez sur le bouton **Nouveau modèle**.
2. Sélectionnez **Terraform** comme type d'application.
3. Configurez le modèle et cliquez sur le bouton **Créer**.
4. Cliquez sur **Exécuter** pour lancer le modèle.

## Transmission de variables {#passing-variables}

Les variables des **groupes de variables** sélectionnés sont injectées en tant que variables d'environnement. Préfixez leurs noms par `TF_VAR_` afin que Terraform les reconnaisse comme variables d'entrée :

| Clé du groupe de variables | Variable Terraform |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

Pour les valeurs sensibles, utilisez l'onglet **Secrets** des groupes de variables : elles sont chiffrées au repos.

## Workspaces {#workspaces}

Semaphore prend en charge nativement les workspaces Terraform/OpenTofu. Consultez [Workspaces](./workspaces) pour créer et changer de workspace, et pour utiliser des clés SSH avec des modules privés.

## Remplacement du backend et backend HTTP (Pro) {#backend-override-and-http-backend-pro}

Vous pouvez remplacer le backend dans un modèle afin d'utiliser le backend HTTP intégré sans modifier votre code Terraform. Consultez [Backend HTTP (Pro)](./states) pour plus de détails.

## Option destroy et migration d'état {#destroy-flag-and-state-migration}

La boîte de dialogue d'exécution d'une tâche comporte des interrupteurs pour `-destroy` et `-migrate-state`. Utilisez-les pour démanteler une infrastructure ou migrer l'état Terraform.

## Remarques {#notes}

- Semaphore exécute automatiquement `terraform init` avant chaque exécution.
- L'état est géré par le backend configuré dans votre code Terraform (local, S3, GCS, etc.), sauf si vous utilisez le backend HTTP intégré (Pro).
