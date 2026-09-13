---
title: Modèle de sécurité
description: Ce que protège Semaphore, les frontières de confiance d'un déploiement, qui peut déclencher l'exécution de code, et les décisions qui vous reviennent.
---

# Modèle de sécurité

Semaphore détient les identifiants de votre infrastructure et exécute du code contre elle. Deux
propriétés en découlent, et toutes deux orientent chaque autre décision de cette page :
**les secrets ne doivent jamais revenir vers un navigateur**, et **quiconque peut démarrer une tâche
peut exécuter du code sur les machines que cette tâche atteint**.

Cette page explique le modèle. Pour les paramètres qui le mettent en œuvre, voir
[Sécurité](/admin-guide/security).

## Frontières de confiance {#trust-boundaries}

| Frontière | Traversée par | Protégée par |
|---|---|---|
| Navigateur ↔ serveur | Sessions, jetons d'API | TLS, cookies sécurisés, [reverse proxy](/admin-guide/reverse-proxy) |
| Serveur ↔ base de données | Tout l'état persistant | Restriction réseau ; secrets chiffrés avant écriture |
| Serveur ↔ runner | Charges utiles des travaux, secrets compris | HTTPS et un jeton bearer propre à chaque runner |
| Tâche ↔ hôtes administrés | Votre automatisation | Les clés que vous avez confiées au modèle |

Une tâche se trouve de l'autre côté de chacune de ces frontières. Elle reçoit dans son environnement
les secrets dont elle a besoin, et à partir de cet instant le code de votre dépôt décide
de ce qu'il en advient.

## Identité {#identity}

Les utilisateurs s'authentifient de trois manières, et toutes trois aboutissent à la même session :

- **Comptes locaux.** Les mots de passe sont hachés avec Argon2id (bcrypt avant 2.20, mis à niveau
  à la première connexion). L'authentification à deux facteurs TOTP peut être exigée.
- **[LDAP ou Active Directory](/admin-guide/authentication/ldap).** L'annuaire vérifie le mot de passe ;
  Semaphore ne conserve que le compte.
- **[OpenID Connect](/admin-guide/authentication/openid).** Le fournisseur authentifie et Semaphore
  fait correspondre les claims aux utilisateurs.

L'accès non interactif utilise des **jetons d'API** créés par un utilisateur, qui portent les
permissions de cet utilisateur. Les runners n'utilisent pas du tout d'identité utilisateur : ils
s'authentifient avec leur propre jeton délivré à l'enregistrement.

Les tâches peuvent elles aussi porter une identité. Avec les [JWT de tâche](/user-guide/task-templates/jwt), une exécution
reçoit un jeton signé de courte durée nommant le projet, le modèle et l'utilisateur, qu'un
magasin de secrets externe peut vérifier au lieu que vous stockiez un identifiant à longue durée de vie.

## Autorisation {#authorization}

Il existe deux niveaux, et ils sont indépendants.

**Niveau serveur.** Un administrateur gère les utilisateurs, les runners globaux et les paramètres du serveur.
Être administrateur du serveur ne confère pas en soi l'appartenance à un projet.

**Niveau projet.** Chaque membre détient un rôle dans chaque projet :

| Rôle | Peut |
|---|---|
| **Owner** | Tout faire dans le projet, y compris gérer les membres et le supprimer. |
| **Manager** | Exécuter des tâches et gérer les ressources et les modèles. |
| **Task Runner** | Exécuter des tâches. Rien d'autre. |
| **Guest** | Lire. |

Enterprise ajoute des [rôles personnalisés](/user-guide/team) <FeatureState feature="extended-rbac" />
lorsque ces quatre rôles sont trop grossiers.

La ligne qui compte pour la sécurité passe entre **Task Runner** et **Manager**.
Un Manager peut changer ce qu'un modèle exécute, et peut donc exécuter du code arbitraire
avec les identifiants de ce projet. Un Task Runner ne peut démarrer que ce qui existe déjà —
sauf si le modèle expose des invites ou des variables de questionnaire qui atteignent la ligne de commande,
auquel cas l'auteur du modèle a délibérément élargi cette frontière.

## Secrets {#secrets}

Les valeurs secrètes — clés privées SSH, mots de passe, jetons, variables secrètes — sont chiffrées
avec la clé définie dans `access_key_encryption` avant d'être stockées : un simple dump de base de données
ne les divulgue donc pas. L'API ne renvoie jamais une valeur secrète ; l'interface indique qu'un
secret est défini, pas ce qu'il contient.

Les secrets parviennent à une tâche via son environnement au moment où elle démarre. C'est pourquoi
la sortie des tâches mérite d'être traitée comme sensible : un playbook qui affiche une variable l'écrit
dans un journal que les autres membres du projet peuvent lire.

Si vous préférez ne pas détenir les secrets du tout,
les [stockages de secrets externes](/user-guide/key-store) conservent les valeurs dans HashiCorp Vault,
OpenBao, AWS Secrets Manager ou Devolutions Server et les récupèrent à chaque exécution.

## Exécuter du code non fiable {#executing-untrusted-code}

Avec la configuration par défaut, une tâche est un processus sur le serveur Semaphore, avec le
système de fichiers et l'accès réseau du serveur. C'est acceptable lorsque toutes les personnes pouvant modifier un
modèle ont déjà la confiance nécessaire sur le serveur.

Dans le cas contraire, éloignez l'exécution du serveur :

- Un [runner](/admin-guide/runners) place les tâches sur une autre machine : compromettre une
  tâche ne compromet donc ni le service web ni la base de données.
- L'exécuteur **Docker** ou **Kubernetes** donne à chaque travail un conteneur ou un Pod neuf,
  de sorte qu'une exécution ne peut pas lire les fichiers d'une autre exécution ni ceux de l'hôte.
- Des projets séparés avec des clés séparées font qu'une tâche ne peut atteindre que ce que les
  identifiants de son propre projet autorisent.

:::warning
Un dépôt qu'un membre du projet peut modifier est du code qui sera exécuté avec les identifiants de
ce projet. Protégez la branche depuis laquelle un modèle est construit, ou faites pointer les modèles
vers une branche où seuls les relecteurs peuvent écrire.
:::

## Ce qui vous revient {#what-is-left-to-you}

Semaphore est auto-hébergé : certaines parties du modèle vous incombent donc :

- TLS devant le service, qu'il soit intégré ou fourni par un [reverse proxy](/admin-guide/reverse-proxy).
- La restriction réseau de la base de données et de la surface d'administration du serveur.
- Les sauvegardes de la base de données et de `access_key_encryption` — la seconde est inutile
  sans la première, et la première est illisible sans la seconde.
- Le maintien à jour de la version. Signalez les vulnérabilités à `security@semaphoreui.com`.

## Et ensuite {#whats-next}

- [Sécurité](/admin-guide/security) — les paramètres concrets, les paramètres de hachage et les étapes de durcissement.
- [Architecture](/introduction/architecture) — les composants que ces frontières séparent.
- [Équipes](/user-guide/team) — attribuer des rôles dans un projet.
