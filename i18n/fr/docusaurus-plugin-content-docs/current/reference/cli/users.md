# Utilisateurs

La commande `semaphore users` ajoute, modifie, supprime et consulte des utilisateurs, et gère
leurs tokens d'API et leur vérification TOTP (2FA).

```bash
semaphore users --help
```

> `user` est un alias de `users`.

| Commande | Rôle |
|----------|------|
| [`users add`](#add-a-user) | Créer un utilisateur. |
| [`users change-by-login`](#change-a-user) | Mettre à jour un utilisateur trouvé par login. |
| [`users change-by-email`](#change-a-user) | Mettre à jour un utilisateur trouvé par e-mail. |
| [`users get`](#show-a-user) | Afficher les détails d'un utilisateur. |
| [`users list`](#list-users) | Afficher les logins de tous les utilisateurs. |
| [`users delete`](#delete-a-user) | Supprimer un utilisateur. |
| [`users token create`](#create-a-token) | Créer un token d'API pour un utilisateur. |
| [`users token list`](#list-tokens) | Lister les tokens d'API d'un utilisateur. |
| [`users totp enable`](#totp-management) | Activer le TOTP pour un utilisateur. |
| [`users totp show`](#totp-management) | Afficher les détails TOTP d'un utilisateur. |
| [`users totp disable`](#totp-management) | Désactiver le TOTP pour un utilisateur. |

## Ajouter un utilisateur {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Option | Description |
|--------|-------------|
| `--login` | Login de l'utilisateur. **Obligatoire.** |
| `--name` | Nom d'affichage de l'utilisateur. **Obligatoire.** |
| `--email` | E-mail de l'utilisateur. **Obligatoire.** |
| `--password` | Mot de passe de l'utilisateur. Obligatoire pour les utilisateurs classiques ; non autorisé pour les utilisateurs externes. |
| `--admin` | Marque le nouvel utilisateur comme administrateur. |
| `--external` | Marque le nouvel utilisateur comme externe (LDAP ou OIDC). Les utilisateurs externes ne doivent pas recevoir de `--password`. |

En cas de succès, la commande affiche `User <login> <email> added!`.

## Modifier un utilisateur {#change-a-user}

Vous pouvez trouver l'utilisateur à modifier soit par login, soit par e-mail.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| Option | Description |
|--------|-------------|
| `--login` | Pour `change-by-login`, le login de l'utilisateur à trouver (**obligatoire**). Pour `change-by-email`, le nouveau login de l'utilisateur. |
| `--email` | Pour `change-by-email`, l'e-mail de l'utilisateur à trouver (**obligatoire**). Pour `change-by-login`, le nouvel e-mail de l'utilisateur. |
| `--name` | Nouveau nom de l'utilisateur. |
| `--password` | Nouveau mot de passe de l'utilisateur. |
| `--admin` | Accorde les droits d'administrateur. |

Seules les options que vous fournissez sont appliquées ; les champs omis restent inchangés.
`--admin` ne peut qu'accorder les droits d'administrateur. Il ne peut pas les révoquer ;
utilisez l'interface web pour cela.

## Afficher un utilisateur {#show-a-user}

Affiche les détails d'un seul utilisateur, recherché par login ou par e-mail.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

Au moins une des options `--login` ou `--email` est requise. La sortie inclut l'ID de
l'utilisateur, sa date de création, son login, son nom, son e-mail et son statut
d'administrateur. Si aucun utilisateur ne correspond, la commande affiche un message et se
termine avec un statut différent de zéro.

## Lister les utilisateurs {#list-users}

Affiche les logins de tous les utilisateurs, un par ligne.

```bash
semaphore user list
```

## Supprimer un utilisateur {#delete-a-user}

Supprime un utilisateur, recherché par login ou par e-mail.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

Au moins une des options `--login` ou `--email` est requise.

## Gestion des tokens d'API {#api-token-management}

Gérez les tokens d'API d'un utilisateur via la CLI :

```bash
semaphore user token --help
```

### Créer un token {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Option | Description |
|--------|-------------|
| `--login` | Login du propriétaire du token. **Obligatoire.** |
| `--name` | Nom du token. |
| `--ttl` | Durée de vie du token sous forme de durée Go (p. ex. `1h`, `30m`, `24h`). Le token n'expire jamais si omis. |

La commande affiche le nouveau token sur sa propre ligne et rien d'autre ; il est donc possible
de le capturer sans risque dans un script :

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

Une valeur `--ttl` invalide ou un login inconnu est signalé et la commande se termine avec un
statut différent de zéro.

### Lister les tokens {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` est obligatoire. Chaque ligne indique le nom du token, son statut (`active` ou
`expired`) et sa date d'expiration au format RFC 3339 (`never` s'il n'a pas d'expiration),
séparés par des tabulations. Les valeurs des tokens ne sont jamais affichées.

## Gestion du TOTP {#totp-management}

Gérez la vérification par mot de passe à usage unique basé sur le temps (2FA) via la CLI :

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

Toutes les sous-commandes TOTP nécessitent `--login`.

- `enable` affiche un code de récupération à usage unique, l'URL `otpauth://` et un QR code
  scannable. Conservez le code de récupération en lieu sûr. Elle échoue si le TOTP est déjà
  activé pour l'utilisateur.
- `show` affiche à nouveau l'URL `otpauth://` et le QR code, ou `TOTP disabled` si
  l'utilisateur n'a pas de TOTP configuré.
- `disable` supprime la vérification TOTP de l'utilisateur. Elle échoue si le TOTP n'est pas
  activé.

L'émetteur affiché dans les applications d'authentification provient de l'option de
configuration `mfa.totp.app_name` (`SEMAPHORE_TOTP_ISSUER`). Sa valeur par défaut est `Semaphore`.
