
# Scripts Shell/Bash

Semaphore peut exécuter des scripts shell avec `/bin/bash`. Pour cela, créez un modèle de tâche **Bash Script**.

## Créer un modèle Bash {#creating-a-bash-template}

1. Rendez-vous dans la section **Modèles de tâches** et cliquez sur le bouton **Nouveau modèle**.
2. Sélectionnez **Bash** comme type d'application.
3. Configurez le modèle :

| Champ | Description |
|---|---|
| **Nom** | Un nom descriptif pour le modèle |
| **Dépôt** | Dépôt contenant votre script shell |
| **Playbook / Script** | Chemin relatif du script, par exemple `scripts/deploy.sh` |
| **Groupes de variables** | Groupes de variables dont les valeurs sont injectées en tant que variables d'environnement |

4. Cliquez sur **Créer**.
5. Cliquez sur **Exécuter** pour lancer le modèle. La boîte de dialogue Nouvelle tâche d'un modèle de script ne comporte que le message facultatif, ainsi que les variables de questionnaire et les invites si le modèle en définit.

<div class="DialogScreenshot">

![Boîte de dialogue Nouvelle tâche pour un modèle Bash](/assets/task-new-bash.webp)

</div>

## Transmettre des variables aux scripts {#passing-variables-to-scripts}

Les variables des **Groupes de variables** sélectionnés sont injectées en tant que variables d'environnement. Accédez-y dans le script avec `$VARIABLE_NAME` :

```bash
#!/bin/bash
echo "Deploying to $TARGET_HOST"
```

## Remarques {#notes}

- Rendez votre script exécutable (`chmod +x`) ou assurez-vous qu'il commence par un shebang valide (`#!/bin/bash`).
- Les scripts s'exécutent de façon non interactive. Évitez les invites qui attendent une saisie de l'utilisateur.
- Le code de sortie `0` signifie la réussite ; tout code de sortie non nul marque la tâche comme échouée.
- Si un script très court ne produit aucune sortie dans les journaux, consultez [La sortie du script Bash est absente ou incomplète](/faq/troubleshooting#bash-script-output-is-missing-or-incomplete) dans le guide de dépannage.
- Pour exécuter des commandes sur des hôtes distants, utilisez plutôt [Ansible](./ansible).
