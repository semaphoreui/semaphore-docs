# Vues

Les vues regroupent les modèles de tâches dans des onglets au-dessus de la liste des modèles. Un projet commence avec une seule vue **Tout** ; vous pouvez ajouter les vôtres, par exemple **Build**, **Deploy** et **Outils**, afin que chacun trouve rapidement le bon modèle dans les projets comportant de nombreux modèles.

![Liste des modèles avec les onglets de vues](/assets/templates-list.webp)

## Gérer les vues {#managing-views}

Les utilisateurs ayant le rôle **Manager** ou supérieur peuvent modifier les vues. Cliquez sur l'icône en forme de crayon à côté des onglets de vues pour ouvrir la boîte de dialogue **Modifier les vues**, puis utilisez **Ajouter une vue** pour créer un nouvel onglet. Chaque vue possède les paramètres suivants :

| Paramètre | Description |
|---|---|
| **Titre** | Le libellé de l'onglet. |
| **Type** | **Custom** n'affiche que les modèles affectés à cette vue. **All** affiche tous les modèles du projet. |
| **Trier par** et **Inverser** | Ordre de tri par défaut des modèles dans l'onglet. |
| **Masqué** | Conserver la vue mais masquer l'onglet. |
| **Show task counts** | Afficher sur l'onglet combien de ses modèles se trouvent dans chaque état, voir [Nombre de modèles sur les onglets](#template-counts). Désactivé par défaut. |

Faites glisser les vues dans la boîte de dialogue pour modifier l'ordre des onglets. Supprimer une vue ne supprime pas ses modèles : ils restent visibles dans la vue **Tout**.

## Affecter un modèle à une vue {#assigning-a-template-to-a-view}

Ouvrez le formulaire du modèle et choisissez l'onglet dans le champ **Vue**. Un modèle appartient à une seule vue personnalisée à la fois et figure toujours dans les vues de type **All**.

## Nombre de modèles sur les onglets {#template-counts}

Une vue dont **Show task counts** est activé indique à côté de son titre combien de ses modèles se trouvent dans chaque état, sous la forme d'une puce composée de segments colorés. L'état d'un modèle est le statut de sa dernière tâche. Un segment est masqué lorsque son nombre est nul, et les nombres suivent les tâches pendant leur exécution. Le réglage est désactivé pour une nouvelle vue, et les nombres ne sont calculés que pour les vues où il est activé.

| Couleur | Modèles comptés |
|---|---|
| Vert | La dernière tâche a réussi. |
| Rouge | La dernière tâche a échoué. |
| Gris | La dernière tâche a été arrêtée ou est en cours d'arrêt, ou le modèle n'a jamais été lancé. |
| Orange | La dernière tâche attend une confirmation. |
| Bleu | La dernière tâche est en file d'attente, en cours de démarrage ou en cours d'exécution. |

Les nombres ne portent que sur les modèles que vous êtes autorisé à voir.

## Colonnes {#columns}

L'icône d'engrenage en haut à droite de la liste des modèles ouvre le sélecteur de colonnes. Il s'applique à toutes les vues et est enregistré dans votre navigateur.

![Sélecteur de colonnes](/assets/templates-columns.webp)
