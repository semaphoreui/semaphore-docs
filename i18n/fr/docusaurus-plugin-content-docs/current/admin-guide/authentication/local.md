---
title: Comptes locaux
description: Connexion par mot de passe à la base de données Semaphore - comment les mots de passe sont stockés, l'authentification à deux facteurs TOTP, la durée de session et la désactivation des mots de passe.
---

# Comptes locaux

Un compte local conserve son mot de passe dans la base de données de Semaphore. Chaque
installation en possède un dès le départ, créé par `semaphore setup` ou par les variables
`SEMAPHORE_ADMIN_*`, et c'est par ce compte que vous accédez au serveur avant qu'un fournisseur
d'identité n'existe.

Conservez au moins un administrateur local même une fois l'authentification unique
opérationnelle. C'est le seul moyen de revenir lorsque le fournisseur d'identité est injoignable.

## Comment les mots de passe sont stockés {#how-passwords-are-stored}

Les mots de passe sont hachés avec **Argon2id** en utilisant les paramètres de robustesse
minimale de l'OWASP, et ces paramètres sont enregistrés à côté de chaque empreinte au
[format de chaîne PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md).
Les versions antérieures à la 2.20 utilisaient bcrypt ; ces empreintes fonctionnent toujours et
chacune est remplacée par une empreinte Argon2id à la prochaine connexion réussie de son
propriétaire. Les comptes qui ne se reconnectent jamais conservent leur empreinte bcrypt :
réinitialisez ces mots de passe pour les mettre à niveau.

Le tableau complet des paramètres se trouve dans [Sécurité](/admin-guide/security#password-hashing).

Semaphore n'impose aucune politique de mots de passe — ni longueur minimale, ni complexité, ni
expiration. Si vous en avez besoin d'une, utilisez un annuaire ou un fournisseur d'identité,
car c'est là que ces politiques ont leur place.

## Gérer les comptes {#manage-accounts}

Les administrateurs gèrent les utilisateurs dans l'interface web, et les mêmes opérations
existent en ligne de commande, pour les scripts et pour la récupération lorsque plus personne ne
peut se connecter :

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

Consultez [`semaphore users`](/reference/cli/users) pour toutes les options, et
[Équipes](/user-guide/team) pour savoir ce qu'un rôle permet de faire une fois l'utilisateur
connecté.

:::warning
Un mot de passe saisi en ligne de commande se retrouve dans l'historique de votre interpréteur
de commandes et dans la liste des processus de la machine. Utilisez-le pour le premier
administrateur et pour la récupération, puis changez le mot de passe depuis l'interface web.
:::

## Authentification à deux facteurs {#two-factor-authentication}

Semaphore prend en charge TOTP : les codes à six chiffres produits par Google Authenticator,
Aegis, 1Password et des applications similaires. Il est désactivé par défaut et s'applique aux
comptes qui l'activent — il n'est imposé à personne.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| Option | Effet |
|---|---|
| `mfa.totp.enabled` | Permet aux utilisateurs d'ajouter TOTP à leur compte. Sans elle, personne ne peut s'enrôler. |
| `mfa.totp.allow_recovery` | Délivre un code de récupération lors de l'enrôlement, afin qu'un téléphone perdu ne signifie pas un compte perdu. Sa saisie **supprime l'enrôlement TOTP** et connecte l'utilisateur ; celui-ci s'enrôle ensuite à nouveau. Le code est stocké sous forme d'empreinte bcrypt. |
| `mfa.totp.app_name` | Le libellé d'émetteur affiché par l'application d'authentification. Définissez-le lorsque vous exploitez plusieurs Semaphore. |

Les utilisateurs s'enrôlent depuis leur propre page de compte. Un administrateur peut consulter
ou supprimer le deuxième facteur de quelqu'un qui a perdu son appareil :

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

Désactiver à nouveau `mfa.totp.enabled` ne supprime l'enrôlement de personne ; cela empêche
simplement de demander le deuxième facteur. Réactivez-la et les anciens enrôlements
s'appliquent de nouveau.

## Durée de session {#session-lifetime}

Une session expire après **sept jours sans activité**. Ce délai d'inactivité est intégré et
n'est pas configurable.

Une limite absolue l'est, en revanche, et elle est mesurée à partir du moment de la connexion
plutôt qu'à partir de la dernière requête : une session activement utilisée prend donc fin elle
aussi :

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

La valeur par défaut, `0`, signifie qu'il n'y a pas de limite absolue. Définissez-la lorsqu'un
poste de travail partagé ou une règle de conformité impose aux personnes de se réauthentifier
périodiquement.

## Désactiver la connexion par mot de passe {#turn-password-sign-in-off}

Une fois un fournisseur d'identité configuré et après avoir vérifié qu'un utilisateur réel peut
s'y connecter, `password_login_disable` rejette entièrement la méthode par mot de passe :

```json
{
  "password_login_disable": true
}
```

LDAP et OpenID Connect ne sont pas affectés. Les comptes locaux existants conservent leurs rôles
et leur historique ; ils n'ont simplement plus aucun moyen de s'authentifier.

:::danger
Cette option prend effet immédiatement et s'applique à tous les comptes locaux, y compris le
vôtre. Vérifiez que l'authentification unique fonctionne — en vous connectant avec, pas en
lisant le journal — avant de la définir. Réparer une erreur implique de modifier le fichier de
configuration sur le serveur et de redémarrer.
:::

## Et ensuite {#whats-next}

- [LDAP et Active Directory](/admin-guide/authentication/ldap) — s'authentifier auprès d'un annuaire.
- [OpenID Connect](/admin-guide/authentication/openid) — authentification unique avec un fournisseur d'identité.
- [Sécurité](/admin-guide/security) — paramètres de hachage, chiffrement et durcissement.
