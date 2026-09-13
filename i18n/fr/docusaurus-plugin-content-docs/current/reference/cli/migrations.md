# Migrations de base de données

La commande `semaphore migrate` met à jour ou annule le schéma de la base de données Semaphore
pour qu'il corresponde à une version donnée de Semaphore. Utilisez-la pour les mises à niveau
et les rétrogradations.

```bash
semaphore migrate --help
```

:::info
Vous avez rarement besoin d'exécuter `migrate` manuellement. `semaphore server`, `semaphore setup`
et toutes les autres commandes CLI qui touchent à la base de données appliquent automatiquement
les migrations en attente avant de s'exécuter. `migrate` sert à appliquer des migrations sans
démarrer le serveur, ou à les annuler.
:::

:::warning
Sauvegardez toujours votre base de données avant d'appliquer ou d'annuler des migrations.
:::

## Application des migrations {#applying-migrations}

Appliquer toutes les migrations en attente et mettre la base de données à jour :

```bash
semaphore migrate --config /path/to/config.json
```

Appliquer les migrations uniquement jusqu'à une version spécifique :

```bash
semaphore migrate --apply-to 2.15.1
```

## Annulation des migrations {#rolling-back-migrations}

Annuler les migrations jusqu'à une version antérieure :

```bash
semaphore migrate --undo-to 2.13
```

Utilisez la version de Semaphore vers laquelle vous rétrogradez. Le binaire avec lequel vous
exécutez `migrate` doit connaître chaque migration à annuler ; exécutez-le donc avec le binaire
le **plus récent** avant d'installer l'ancien.

## Options {#options}

| Option | Description |
|--------|-------------|
| `--apply-to <version>` | Applique les migrations jusqu'à cette version incluse (p. ex. `2.15` ou `2.14.4`). |
| `--undo-to <version>` | Annule les migrations jusqu'à cette version. |

`--apply-to` et `--undo-to` sont mutuellement exclusifs ; passer les deux est une erreur.
Sans aucune de ces options, toutes les migrations en attente sont appliquées.

À la fin, la commande affiche la connexion à la base de données qu'elle a utilisée.

:::note
`semaphore migrate` accepte toujours `--err-log-size`, `--skip-task-output` et
`--merge-existing-users` pour la rétrocompatibilité, mais depuis la version 2.19 ils n'ont
aucun effet. Ils appartenaient à l'import BoltDB décrit ci-dessous.
:::

## Migration de BoltDB vers SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Disponible uniquement dans les versions 2.17 et 2.18*

BoltDB est obsolète depuis la version 2.16, et **sa prise en charge a été supprimée dans la
version 2.19**. L'option `--from-boltdb` et la variable d'environnement
`SEMAPHORE_MIGRATE_FROM_BOLTDB` n'existent plus à partir de la version 2.19, et `semaphore setup`
refuse de configurer une base de données BoltDB.

:::warning
Si vous utilisez encore BoltDB, migrez **avant** de passer à la version 2.19 ou ultérieure.
Installez Semaphore **2.17 ou 2.18**, effectuez la migration ci-dessous, et seulement ensuite
passez à une version plus récente.
:::

Pour migrer, installez d'abord Semaphore version 2.17 ou 2.18, puis configurez la base de
données cible (SQLite, MySQL ou PostgreSQL) dans votre `config.json`. Ensuite, exécutez la
commande suivante pour importer toutes les données de l'ancien fichier BoltDB dans la nouvelle
base de données :

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

La commande lit tous les projets, modèles, inventaires, dépôts, clés, utilisateurs et
l'historique des tâches depuis BoltDB et les écrit dans la base de données spécifiée dans la
configuration actuelle de Semaphore. Le fichier BoltDB d'origine n'est pas modifié.

Arguments supplémentaires (2.17 et 2.18 uniquement) :

| Option | Description |
|--------|-------------|
| `--err-log-size <n>` | Nombre maximal de lignes d'erreur affichées dans la sortie. |
| `--skip-task-output` | Ne pas importer les sorties des tâches. |
| `--merge-existing-users` | Réutiliser les utilisateurs existants correspondant par nom d'utilisateur au lieu d'échouer en cas de conflit. |

Si vous utilisez le conteneur Docker Semaphore UI, vous pouvez définir la variable
d'environnement `SEMAPHORE_MIGRATE_FROM_BOLTDB` pour importer automatiquement la base de
données BoltDB existante. L'import ne s'exécute qu'une seule fois, au premier démarrage du
conteneur. Exemple :

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## Dépannage {#troubleshooting}

- Si une migration échoue, consultez les journaux pour plus de détails et assurez-vous que le
  binaire CLI est de la même version que le serveur Semaphore.
- Assurez-vous que la CLI utilise le même fichier de configuration (et donc la même base de
  données) que le serveur. Consultez
  [Comment le fichier de configuration est trouvé](/reference/cli#how-the-configuration-file-is-found).
