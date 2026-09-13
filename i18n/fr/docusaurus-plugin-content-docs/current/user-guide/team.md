# Équipes

Dans Semaphore UI, chaque projet est associé à une **Équipe**. Seuls les membres de l'équipe et les administrateurs peuvent accéder au projet. Chaque membre de l'équipe se voit attribuer l'un des quatre rôles intégrés, qui déterminent son niveau d'accès et les actions qu'il peut effectuer.

Dans l'édition **Enterprise**, les rôles intégrés peuvent être étendus avec des [rôles personnalisés](#extended-rbac-enterprise) qui accordent des permissions supplémentaires et fines sur des modèles spécifiques.

:::tip
Pour éviter de perdre l'accès à un projet, il est recommandé d'avoir au moins deux membres d'équipe avec le rôle <b>Owner</b>.
:::

La section **Équipe** d'un projet comporte deux onglets : **Membres** avec les utilisateurs et leurs rôles, et **Rôles** avec les rôles personnalisés (Enterprise).

![Membres de l'équipe](/assets/team-members.webp)

## Rôles intégrés {#built-in-roles}

Chaque membre de l'équipe possède exactement l'un de ces quatre rôles :

- **Owner**
- **Manager**
- **Task Runner**
- **Guest**

Vous trouverez ci-dessous une description détaillée de chaque rôle et de ses permissions.

### Owner {#owner}

- **Permissions complètes**<br />
  Les Owners peuvent tout faire au sein du projet, y compris gérer les rôles, ajouter ou retirer des membres et configurer tous les paramètres du projet.

- **Plusieurs owners**<br />
  Un projet peut avoir plusieurs Owners, garantissant qu'il y a plus d'une personne disposant de tous les privilèges.

- **Restrictions sur l'auto-suppression**<br />
  Un Owner ne peut pas se retirer lui-même s'il est le seul Owner du projet. Cela empêche le projet de se retrouver sans Owner.

- **Gestion des autres owners**<br />
  Les Owners peuvent gérer (y compris retirer ou changer les rôles de) tous les membres de l'équipe, y compris les autres Owners.

### Manager {#manager}

- **Contrôle étendu du projet :** les Managers disposent presque des mêmes permissions que les Owners, ce qui leur permet de gérer la plupart des tâches quotidiennes et d'administrer l'environnement du projet.

- Les Managers **ne peuvent pas** :
  - Supprimer le projet.
  - Retirer les Owners ou changer leurs rôles.

- **Cas d'usage typique :** attribuez le rôle Manager aux membres expérimentés de l'équipe qui ont besoin d'un accès étendu mais qui n'ont pas besoin du pouvoir de supprimer le projet ou de gérer les Owners.

### Task Runner {#task-runner}

- **Exécuter des tâches :** les Task Runners peuvent exécuter n'importe quel modèle de tâche existant dans le projet.

- **Lecture seule pour les autres ressources :** même s'ils peuvent exécuter des tâches, ils n'ont qu'un accès en lecture seule aux autres ressources comme l'inventaire, les variables, les dépôts, etc.

- **Cas d'usage typique :** développeurs ou ingénieurs QA qui ont besoin de déclencher et de surveiller des tâches mais qui n'ont pas besoin de pouvoir modifier les paramètres du projet ou gérer les membres de l'équipe.

### Guest {#guest}

- **Accès en lecture seule :** les Guests disposent d'un accès en lecture seule à toutes les ressources du projet (par exemple consulter les journaux, les inventaires, les tableaux de bord).

- **Aucune permission d'écriture :** ils ne peuvent pas modifier les paramètres, exécuter des tâches ni changer les rôles.

- **Cas d'usage typique :** parties prenantes ou autres collaborateurs qui n'ont besoin que de consulter le statut et les détails du projet sans y apporter de modifications.

---

## RBAC étendu (Enterprise) {#extended-rbac-enterprise}

:::info
Le RBAC étendu est disponible dans l'édition **Semaphore Enterprise**, à partir de [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17).
:::

Le RBAC étendu superpose des permissions supplémentaires aux quatre rôles intégrés. Les rôles intégrés eux-mêmes restent inchangés. Si vous ne définissez pas de rôles personnalisés, chaque projet se comporte exactement comme dans l'édition communautaire.

Avec le RBAC étendu, les rôles personnalisés peuvent accorder des permissions individuelles à l'échelle du projet. Vous pouvez également accorder à un rôle des permissions sur des modèles de tâches sélectionnés. Cela vous permet de donner à un membre de l'équipe accès aux modèles dont il a besoin sans le promouvoir à un rôle intégré supérieur.

### Rôles personnalisés {#custom-roles}

Un rôle personnalisé est un ensemble nommé de permissions qui complète le rôle de projet intégré d'un membre. Chaque membre de l'équipe conserve son rôle intégré. Les rôles personnalisés y ajoutent des permissions.

Les rôles personnalisés sont disponibles à deux portées :

- Les **rôles globaux** sont définis au niveau de l'instance et peuvent être utilisés dans n'importe quel projet.
- Les **rôles de projet** sont définis à l'intérieur d'un seul projet et ne sont disponibles que dans ce projet.

### Niveaux de permission {#permission-levels}

Les rôles personnalisés accordent des permissions à deux niveaux :

- Les **permissions à l'échelle du projet** étendent l'accès d'un utilisateur dans tout un projet. Vous les choisissez lors de la création du rôle.
- Les **permissions de modèle** contrôlent les actions sur un modèle de tâche. Vous les choisissez dans l'onglet **Permissions** de ce modèle après y avoir ajouté le rôle.

### Créer un rôle personnalisé {#create-a-custom-role}

Choisissez la portée avant d'ouvrir le formulaire de rôle.

#### Rôle global {#global-role}

Les rôles globaux sont créés une seule fois et peuvent être attribués à des utilisateurs dans n'importe quel projet. Seul un administrateur d'instance peut créer un rôle global.

Ouvrez le menu d'administration en bas à gauche et sélectionnez **Rôles**.

Dans la liste des rôles à l'échelle de l'instance, sélectionnez **Nouveau rôle**.

![Ouvrez Rôles depuis le menu administrateur, puis sélectionnez Nouveau rôle](/assets/custom-roles-navigation-to-new-role-annotated-v4.png)

#### Rôle de projet {#project-role}

Les rôles de projet ne sont disponibles que dans le projet où ils sont créés. Les Owners et les Managers du projet peuvent les créer.

1. Ouvrez le projet et allez dans **Équipe** > **Rôles**.
2. Sélectionnez **Nouveau rôle**.

L'onglet **Rôles** est vide jusqu'à la création du premier rôle de projet. Il liste tous les rôles de projet et contient le bouton **Nouveau rôle**.

![](https://www.semaphoreui.com/uploads/v2.17/roles1.webp)

### Configurer un rôle personnalisé {#configure-a-custom-role}

Les deux chemins ouvrent le même formulaire de rôle. Configurez le rôle pour correspondre à l'accès dont votre membre d'équipe a besoin.

![Boîte de dialogue Nouveau rôle avec les champs et les cases à cocher de permissions](/assets/custom-roles-global-role-form.jpg)

| Champ | Description |
| --- | --- |
| **Nom** | Un libellé lisible pour le rôle. |
| **Slug** | Un identifiant technique unique utilisé pour référencer le rôle. Utilisez des lettres minuscules, des chiffres, des tirets bas ou des tirets, par exemple `release_operator`. |
| **Permissions** | Les permissions à l'échelle du projet accordées par le rôle. |

#### Permissions à l'échelle du projet {#project-wide-permissions}

Ne choisissez que les permissions à l'échelle du projet dont le rôle a besoin :

| Permission | Description |
| --- | --- |
| **Can run project tasks** | Exécuter les tâches du projet. |
| **Can update project** | Modifier les informations de base du projet dans **Tableau de bord** > **Paramètres**. |
| **Can manage project resources** | Gérer les ressources du projet, telles que les modèles de tâches, les dépôts, l'inventaire, les environnements, les entrées du Magasin de clés, les planifications, les intégrations et les runners. Il s'agit d'un accès à l'échelle du projet. Il ne peut pas être limité à des ressources individuelles autres que les modèles. |
| **Can manage project users** | Gérer les membres du projet et l'attribution des rôles. |

Les permissions à l'échelle du projet ne peuvent pas être limitées à un seul inventaire, dépôt, environnement ou entrée du Magasin de clés. Les modèles de tâches sont le seul type de ressource qui prend en charge les attributions de rôles granulaires.

:::tip Accès limité aux modèles
Pour créer un rôle granulaire qui ajoute uniquement l'accès à des modèles de tâches sélectionnés, laissez toutes les permissions à l'échelle du projet décochées. Le rôle n'ajoute alors aucune permission propre à l'échelle du projet. Ajoutez-le aux modèles requis et choisissez uniquement les actions dont ce rôle a besoin à cet endroit.
:::

Sélectionnez **Enregistrer** lorsque la configuration du rôle est prête.

### Configurer l'accès à des modèles de tâches spécifiques {#configure-access-to-specific-task-templates}

Les permissions de modèle ajoutent un accès sur des modèles de tâches sélectionnés. L'exemple ci-dessous utilise un rôle personnalisé sans aucune permission à l'échelle du projet. Cette configuration du moindre privilège est utile lorsqu'un membre de l'équipe n'a besoin que de certaines actions sur des modèles. Vous pouvez également ajouter des permissions de modèle à un rôle qui accorde déjà un accès à l'échelle du projet.

**Ouvrez le modèle requis**

1. Ouvrez **Modèles de tâches** et sélectionnez le modèle cible.
2. Ouvrez l'onglet **Permissions**.

L'onglet **Permissions** liste les rôles déjà ajoutés au modèle.

![](https://www.semaphoreui.com/uploads/v2.17/roles2.webp)

**Ajoutez le rôle et accordez les permissions de modèle**

1. Sélectionnez **Ajouter un rôle** et choisissez le rôle personnalisé à ajouter à ce modèle.
2. Sélectionnez uniquement les permissions de modèle dont le rôle a besoin, telles que **Can run tasks** ou **Can update the template**.

Cet exemple utilise un rôle créé précédemment sans permissions à l'échelle du projet. Vous pouvez choisir n'importe quel rôle personnalisé disponible dans le projet.

![Boîte de dialogue des permissions de modèle avec les contrôles requis mis en évidence](/assets/custom-roles-template-permissions-annotated.png)

Pour accorder au même rôle l'accès à d'autres modèles, répétez ces étapes pour chaque modèle.

:::note Accès existant au projet
Les permissions de modèle sont additives. Elles ajoutent un accès sans remplacer ni réduire l'accès issu du rôle intégré d'un utilisateur ou d'autres rôles personnalisés. Si un utilisateur peut déjà exécuter ou modifier tous les modèles de tâches, l'ajout d'un rôle spécifique à un modèle ne restreint pas cet accès.
:::

### Attribuer un rôle personnalisé dans un projet {#assign-a-custom-role-in-a-project}

Après avoir créé et configuré un rôle global ou de projet, attribuez-le au membre de l'équipe concerné :

1. Ouvrez le projet et allez dans **Équipe**.
2. Dépliez **Rôles** à côté de l'utilisateur concerné.
3. Sélectionnez le rôle personnalisé.

### Non pris en charge actuellement {#not-currently-supported}

- **Mappage de groupes LDAP / OIDC.** Les rôles personnalisés sont attribués par utilisateur. Le mappage de groupes d'annuaires externes vers des rôles personnalisés n'est pas pris en charge.
- **Permissions granulaires pour les ressources autres que les modèles.** Seuls les modèles peuvent aujourd'hui être régis par des rôles personnalisés au niveau de la ressource individuelle.

---

## Gérer les membres de l'équipe {#managing-team-members}

- **Inviter de nouveaux membres :** les **Owners** et les **Managers** peuvent inviter de nouveaux utilisateurs à rejoindre l'équipe et leur attribuer un rôle initial.

- **Changer les rôles :** les Owners peuvent toujours changer les rôles de n'importe quel membre de l'équipe. Les Managers peuvent changer les rôles des **Task Runners** et des **Guests**, mais **pas** ceux des autres Managers ou des Owners.

- **Retirer des membres :** les Owners et les Managers peuvent retirer des membres de l'équipe ayant des rôles inférieurs.
  - Un Owner peut retirer n'importe qui (y compris d'autres Owners), mais ne peut pas se retirer lui-même s'il est le seul Owner.
  - Un Manager peut retirer les **Task Runners** et les **Guests**, mais **pas** les autres Managers ou les Owners.

---

## Bonnes pratiques {#best-practices}

1. **Maintenez une redondance :** attribuez le rôle **Owner** à au moins deux personnes pour garantir un accès continu et éviter un point de défaillance unique.
2. **Appliquez le principe du moindre privilège :**
   - Donnez aux membres de l'équipe le rôle minimal nécessaire à leurs tâches.
   - Utilisez les rôles **Task Runner** ou **Guest** pour ceux qui n'ont besoin que de permissions limitées.
   - Sur Enterprise, préférez les [rôles personnalisés](#extended-rbac-enterprise) pour accorder l'accès à des modèles spécifiques plutôt que d'élever le rôle intégré d'un membre.
3. **Révisez régulièrement les membres :**
   - À mesure que la structure de l'équipe change, réévaluez les rôles.
   - Révoquez l'accès ou rétrogradez les rôles des utilisateurs qui n'ont plus besoin de privilèges élevés.
4. **Utilisez les managers pour l'administration quotidienne :**
   - Réservez le rôle Owner à un groupe restreint disposant de l'autorité ultime.
   - Déléguez les tâches de gestion courantes du projet aux Managers afin de réduire le risque de modifications majeures accidentelles ou de suppressions de projet.

---

## Questions fréquentes {#frequently-asked-questions}

### 1. Un Owner peut-il retirer un autre Owner ? {#1-can-an-owner-remove-another-owner}
Oui, un Owner peut retirer un autre Owner ou changer son rôle, sauf s'il est le dernier Owner restant dans le projet.

### 2. Qui peut supprimer le projet ? {#2-who-can-delete-the-project}
Seuls les **Owners** peuvent supprimer un projet.

### 3. Les Managers peuvent-ils ajouter ou retirer d'autres Managers ? {#3-can-managers-add-or-remove-other-managers}
Non. Les Managers ne peuvent ajouter ou retirer que des utilisateurs ayant les rôles **Task Runner** ou **Guest**. Pour gérer les Owners ou d'autres Managers, vous devez être Owner.

### 4. Que se passe-t-il si je retire tous les Owners par accident ? {#4-what-happens-if-i-remove-all-owners-by-accident}
Semaphore UI empêche le retrait d'un Owner si cela laisserait le projet sans aucun Owner. Il doit toujours y avoir au moins un Owner.

### 5. Les Guests peuvent-ils exécuter des tâches ? {#5-can-guests-run-tasks}
Non. Les Guests ont un accès en lecture seule et ne peuvent ni déclencher ni gérer de tâches. Dans l'édition Enterprise, vous pouvez accorder à un Guest la permission d'exécuter des modèles individuels via un [rôle personnalisé](#extended-rbac-enterprise).

### 6. Les rôles personnalisés remplacent-ils les rôles intégrés ? {#6-do-custom-roles-replace-the-built-in-roles}
Non. Les rôles personnalisés étendent les rôles intégrés avec des permissions supplémentaires au niveau du projet et des modèles. Chaque membre de l'équipe possède toujours exactement un rôle intégré.

### 7. Le RBAC étendu est-il disponible dans l'édition communautaire ? {#7-is-extended-rbac-available-in-the-community-edition}
Non. Le RBAC étendu nécessite un abonnement **Semaphore Enterprise**.
