
# PowerShell

Semaphore peut exécuter des scripts PowerShell sur des hôtes Windows (ou depuis un runner Windows). Pour cela, créez un modèle de tâche **PowerShell**.

## Créer un modèle PowerShell {#creating-a-powershell-template}

1. Allez dans la section **Modèles de tâches** et cliquez sur le bouton **Nouveau modèle**.
2. Sélectionnez **PowerShell** comme type d'application.
3. Configurez le modèle :

| Champ | Description |
|---|---|
| **Nom** | Un nom descriptif pour le modèle |
| **Dépôt** | Dépôt contenant votre script `.ps1` |
| **Playbook / Script** | Chemin relatif vers le script, par exemple `scripts/deploy.ps1` |
| **Groupes de variables** | Groupes de variables dont les valeurs sont injectées comme variables d'environnement |

4. Cliquez sur **Créer**.
5. Cliquez sur **Exécuter** pour lancer le modèle.

## Transmettre des variables aux scripts {#passing-variables-to-scripts}

Les variables des **Groupes de variables** sélectionnés sont injectées comme variables d'environnement avant l'exécution du script. Accédez-y dans PowerShell avec `$env:VARIABLE_NAME` :

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Exécution sur des hôtes Windows {#running-on-windows-hosts}

Les modèles PowerShell nécessitent l'un des éléments suivants :
- Un **runner Windows** — un runner Semaphore déployé sur un hôte Windows. Voir [Runners](/admin-guide/runners).
- Le serveur Semaphore lui-même fonctionnant sous Windows.

## Remarques {#notes}

- Les scripts s'exécutent de manière non interactive. Évitez les invites qui nécessitent une saisie de l'utilisateur.
- Le code de sortie `0` signifie succès ; tout code de sortie non nul marque la tâche comme échouée.
