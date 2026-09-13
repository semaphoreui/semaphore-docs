# Stockage de secrets AWS Secrets Manager

<Enterprise />

Semaphore UI Enterprise peut utiliser **AWS Secrets Manager** comme stockage externe pour les secrets du magasin de clés, à la place de la base de données.

## Options de configuration {#configuration-options}

Lorsque vous créez un stockage **AWS Secrets Manager** sous **Magasin de clés → Stockages**, configurez :

| Champ | Description |
|-------|-------------|
| **Région** | Région AWS où se trouvent les secrets (par exemple `us-east-1`). Obligatoire. |
| **URL du point de terminaison** | Point de terminaison personnalisé facultatif. Laissez vide pour utiliser le point de terminaison standard de l'API AWS. Utile pour LocalStack ou les points de terminaison VPC. |
| **Utiliser un rôle IAM / profil d'instance** | Lorsque cette option est activée, Semaphore utilise la chaîne d'identifiants AWS ambiante (profil d'instance EC2, rôle de tâche ECS, IRSA EKS, etc.) et ne nécessite pas de clés d'accès statiques. |
| **ID de clé d'accès** | Obligatoire lorsque le mode rôle IAM est désactivé. |
| **Clé d'accès secrète** | Obligatoire lorsque le mode rôle IAM est désactivé. Peut être stockée dans la base de données, lue depuis une variable d'environnement ou chargée depuis un fichier. |

### Rôle IAM ou clés d'accès {#iam-role-vs-access-keys}

- **Rôle IAM / profil d'instance** (recommandé sur AWS) : activez **Utiliser un rôle IAM / profil d'instance** et accordez à l'hôte du serveur ou du runner Semaphore l'autorisation de lire les secrets que vous référencez. Aucune clé de longue durée n'est stockée dans Semaphore.
- **Clés d'accès** : laissez la case décochée et fournissez une paire de clés d'accès d'utilisateur ou de rôle IAM disposant de `secretsmanager:GetSecretValue` (ainsi que des autorisations list/describe associées pour la synchronisation).

Lors de la modification d'un stockage existant, Semaphore déduit le mode rôle IAM si aucun ID de clé d'accès n'a été enregistré.

## Utilisation {#how-to-use}

1. Dans votre projet, ouvrez **Magasin de clés → Stockages** et créez un stockage **AWS Secrets Manager**.
2. Lors de la création ou de la modification d'une clé, sélectionnez ce stockage et indiquez le nom ou l'ARN du secret dans AWS Secrets Manager.
3. Vous pouvez éventuellement configurer des [chemins de synchronisation](/user-guide/key-store/secret-sync) pour importer automatiquement les secrets selon une planification.

Le stockage peut fonctionner en mode lecture seule.

## Synchronisation des secrets {#syncing-secrets}

Les secrets d'AWS Secrets Manager peuvent être importés dans le magasin de clés et maintenus synchronisés comme avec les autres stockages externes. Le séparateur de chemin par défaut est `/`. Consultez [Synchronisation des secrets depuis des stockages distants](/user-guide/key-store/secret-sync).
