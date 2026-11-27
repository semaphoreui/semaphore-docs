---
title: Comptes locaux
description: Connexion par mot de passe à la base de données Semaphore - comment les mots de passe sont stockés, la gestion des comptes, la durée de session et la désactivation des mots de passe.
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

Un compte local peut demander un deuxième facteur après le mot de passe : un code TOTP à six
chiffres issu d'une application d'authentification. Il est désactivé par défaut, activé pour le
serveur avec `mfa.totp.enabled` et configuré par chaque utilisateur pour son propre compte. Son
fonctionnement, son activation, la connexion avec un code et la récupération après la perte du
téléphone sont décrits dans
[Authentification à deux facteurs](/admin-guide/authentication/two-factor).

## Durée de session {#session-lifetime}

Deux limites indépendantes mettent fin à une session ; la première atteinte déconnecte
l'utilisateur.

Le **délai d'inactivité** est compté à partir de la dernière requête. Chaque requête
authentifiée, y compris l'interrogation en arrière-plan d'un onglet de navigateur ouvert, le
réinitialise. La valeur par défaut est de 168 heures (sept jours) :

```json
{
  "auth": {
    "session_inactivity_hours": 8
  }
}
```

La **limite absolue** est mesurée à partir du moment de la connexion plutôt qu'à partir de la
dernière requête : une session activement utilisée prend donc fin elle aussi :

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

La valeur par défaut, `0`, signifie qu'il n'y a pas de limite absolue. Définissez-la lorsqu'un
poste de travail partagé ou une règle de conformité impose aux personnes de se réauthentifier
périodiquement. Un navigateur laissé ouvert sur une page qui interroge l'API maintient la
session active : seule la limite absolue met donc fin de manière fiable à une telle session.

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
- [Authentification à deux facteurs](/admin-guide/authentication/two-factor) — demander un code TOTP après le mot de passe.
- [Sécurité](/admin-guide/security) — paramètres de hachage, chiffrement et durcissement.
