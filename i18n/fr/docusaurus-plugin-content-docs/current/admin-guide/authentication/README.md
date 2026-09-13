---
title: Authentification
description: Les trois façons dont les utilisateurs se connectent à Semaphore - comptes locaux, LDAP et OpenID Connect -, comment elles se combinent et comment les identités sont liées.
---

# Authentification

Semaphore dispose de trois façons d'établir l'identité d'une personne. Elles sont indépendantes
et peuvent toutes être activées en même temps : l'écran de connexion peut donc proposer un
formulaire de mot de passe, une connexion à l'annuaire et un bouton par fournisseur d'identité.

| Méthode | Qui vérifie le mot de passe | À utiliser quand |
|---|---|---|
| [Comptes locaux](/admin-guide/authentication/local) | Semaphore, à partir de sa propre base de données | Vous n'avez pas d'annuaire, ou vous avez besoin d'un administrateur de secours. |
| [LDAP et Active Directory](/admin-guide/authentication/ldap) | Votre serveur d'annuaire | Les personnes existent déjà dans LDAP ou AD et vous souhaitez un seul jeu d'identifiants. |
| [OpenID Connect](/admin-guide/authentication/openid) | Votre fournisseur d'identité | Vous disposez d'une authentification unique : Keycloak, Okta, Entra ID, Google, GitHub et d'autres. |

L'authentification répond uniquement à la question de savoir *qui* est l'utilisateur. Ce qu'il a
le droit de faire est décidé séparément, par son rôle serveur et par son rôle dans chaque
projet — voir [Équipes](/user-guide/team).

## Comment un enregistrement utilisateur est créé {#how-a-user-record-comes-to-exist}

Toute personne qui se connecte possède une ligne dans la base de données de Semaphore, quelle
que soit la méthode utilisée. Un compte local est créé par un administrateur ou par
`semaphore user add`. Un compte LDAP ou OIDC est créé à la première connexion réussie, et
Semaphore enregistre à côté une **identité externe** : l'identifiant du fournisseur, plus
l'identifiant utilisateur renvoyé par ce fournisseur.

C'est cette identité externe qui sert de correspondance lors des connexions suivantes, ce qui
signifie que renommer quelqu'un dans l'annuaire ne crée pas un deuxième compte. Ce qui demande
de l'attention, c'est la *première* connexion d'un utilisateur existant, lorsque aucune identité
externe n'existe encore. L'option `external_auth_email_matching` détermine ce qui se passe
alors :

| Valeur | Comportement |
|---|---|
| `auto` (par défaut) | Lier par e-mail, mais uniquement pour les utilisateurs externes qui n'ont pas encore d'identité. Cela reprend une seule fois les comptes créés avant la 2.20, et rien d'autre. |
| `always` | Lier par e-mail pour tout utilisateur externe. À utiliser lorsqu'une même personne se connecte via plusieurs fournisseurs. |
| `never` | Ne jamais lier par e-mail ; les identités sont mises en correspondance strictement par identifiant de fournisseur. |

Les comptes locaux avec mot de passe ne sont jamais mis en correspondance par e-mail, quel que
soit le mode. Sinon, un fournisseur OIDC qui laisse un utilisateur choisir sa propre adresse
e-mail pourrait servir à s'emparer du compte d'un administrateur.

:::warning
L'identifiant du fournisseur — la clé dans `oidc_providers` ou `ldap_providers` — fait partie de
chaque identité enregistrée. Le renommer rend orphelines les identités qui y font référence, et
ces utilisateurs obtiennent de nouveaux comptes vides à leur prochaine connexion. Choisissez-le
une bonne fois pour toutes.
:::

## Combiner les méthodes {#combining-methods}

Une configuration réaliste active l'authentification unique pour les utilisateurs et conserve un
administrateur local pour le jour où le fournisseur d'identité est injoignable :

1. Configurez le fournisseur et vérifiez qu'un utilisateur réel peut se connecter avec.
2. Attribuez à cet utilisateur les rôles dont il a besoin.
3. Conservez un compte d'administrateur local avec un mot de passe fort et
   [TOTP](/admin-guide/authentication/local#two-factor-authentication) activé.
4. Définissez `password_login_disable` pour empêcher tous les autres d'utiliser des mots de passe.

Respectez cet ordre. Définir `password_login_disable` avant l'étape 1 fonctionne exactement
comme annoncé et vous prive de l'accès à votre propre serveur.

## Dans cette section {#in-this-section}

| Page | Contenu |
|---|---|
| [Comptes locaux](/admin-guide/authentication/local) | Mots de passe, TOTP, codes à usage unique par e-mail, durée de session et désactivation de la connexion par mot de passe. |
| [LDAP et Active Directory](/admin-guide/authentication/ldap) | Liaison (bind) à un annuaire, filtres de recherche, correspondances d'attributs et TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | Configuration du fournisseur, expressions de claims, connexion initiée par l'IdP et douze exemples de fournisseurs détaillés. |

## Par où commencer {#where-to-start}

Une nouvelle installation dispose déjà de l'administrateur local créé pendant la configuration
initiale : commencez donc par les [Comptes locaux](/admin-guide/authentication/local) pour le
sécuriser, puis ajoutez [OpenID Connect](/admin-guide/authentication/openid) ou
[LDAP](/admin-guide/authentication/ldap) pour tous les autres.
