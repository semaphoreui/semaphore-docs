---
title: Authentification à deux facteurs
description: Comment fonctionne l'authentification à deux facteurs TOTP dans Semaphore, comment l'activer pour le serveur, la configurer pour un compte, se connecter avec un code et récupérer l'accès.
---

# Authentification à deux facteurs

L'authentification à deux facteurs (2FA) demande une seconde preuve après la première étape de
connexion : un code à six chiffres issu d'une application d'authentification sur le téléphone de
l'utilisateur. Un mot de passe volé ne suffit alors plus à lui seul pour entrer.

Semaphore met en œuvre le deuxième facteur avec TOTP — des mots de passe à usage unique basés
sur le temps, la norme sur laquelle reposent Google Authenticator, Microsoft Authenticator,
Aegis, 1Password, Bitwarden et des applications similaires. Il est disponible dans toutes les
éditions.

## Comment cela fonctionne {#how-it-works}

Deux interrupteurs déterminent si une connexion demande un code :

- **Le serveur** doit autoriser TOTP — l'option `mfa.totp.enabled`. Elle est désactivée par
  défaut.
- **Le compte** doit avoir TOTP configuré. Chaque utilisateur l'active pour son propre compte ;
  il n'est imposé à personne.

Lorsque les deux sont activés, une connexion se déroule en deux étapes :

1. L'utilisateur se connecte comme d'habitude — avec un mot de passe, via LDAP ou via un
   fournisseur OpenID Connect. Le deuxième facteur s'applique aux trois.
2. Semaphore ouvre une session, mais la marque comme non vérifiée et demande le code. Tant que
   le code n'est pas accepté, chaque appel d'API sur cette session est refusé avec `401` et
   `{"error":"TOTP_REQUIRED"}`.
3. L'utilisateur saisit le code affiché par l'application. Semaphore le vérifie par rapport au
   secret stocké pour le compte ; un code correct vérifie la session et l'utilisateur est
   connecté.

Le code change toutes les 30 secondes, et l'application le calcule à partir d'un secret qu'elle
a reçu une seule fois, lors de la configuration du compte. Semaphore et le téléphone ne
communiquent jamais entre eux : le téléphone n'a donc besoin d'aucune connexion réseau —
seulement d'une horloge à peu près exacte.

## L'activer pour le serveur {#turn-it-on-for-the-server}

Ajoutez la section `mfa.totp` au fichier de configuration et redémarrez Semaphore :

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

Les mêmes paramètres peuvent être fournis sous forme de variables d'environnement :

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| Option | Variable d'environnement | Effet |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | Permet aux utilisateurs de configurer TOTP et fait demander le code à la connexion. Sans elle, le paramètre n'est affiché à personne. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | Remet à chaque utilisateur un [code de récupération](#recovery-code) à usage unique lorsqu'il configure TOTP, et lui permet de se connecter avec ce code en cas de perte du téléphone. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | Le nom d'émetteur qu'une application d'authentification affiche à côté du compte. Vaut `Semaphore` par défaut. Une modification ne s'applique qu'aux comptes configurés ensuite. |

Toutes les options figurent également dans la
[référence de configuration](/reference/configuration).

## Configurer TOTP pour votre compte {#set-up-totp-for-your-account}

Installez d'abord une application d'authentification sur votre téléphone. Ensuite :

1. Ouvrez un projet, cliquez sur votre nom en bas de la barre latérale et choisissez
   **Edit Account**.
2. Ouvrez l'onglet **Security**.
3. Sous **Two-factor authentication**, activez **Time-based one-time password**. Semaphore crée
   immédiatement le secret et l'affiche sous forme de code QR.
4. Dans l'application d'authentification, ajoutez un compte et scannez le code QR. L'application
   commence à afficher un code à six chiffres pour `Semaphore`, ou pour le nom défini dans
   `mfa.totp.app_name`.
5. Si un **Recovery code** s'affiche sous le code QR, copiez-le avec le bouton situé à côté et
   conservez-le en lieu sûr — dans un gestionnaire de mots de passe ou sur papier. Il n'est
   affiché qu'à ce moment-là.
6. Fermez la boîte de dialogue.

<div style={{maxWidth: 450}}>

![L'onglet Security de la boîte de dialogue Edit User avec l'authentification à deux facteurs activée : un code QR à scanner et, en dessous, un code de récupération](/assets/two-factor-enrol.webp)

</div>

L'interrupteur prend effet immédiatement ; il n'y a pas de **Save** sur lequel appuyer ni de
code de test à saisir. Assurez-vous que l'application affiche un code pour Semaphore avant de
vous déconnecter — la prochaine connexion le demandera.

Vous pouvez rouvrir l'onglet **Security** plus tard pour scanner le code QR sur un deuxième
appareil. Le code de récupération n'est plus affiché.

## Se connecter avec un code {#sign-in-with-a-code}

Après l'étape du mot de passe, de LDAP ou de l'authentification unique, Semaphore affiche
**Two-step verification** :

![L'écran Two-step verification demandant le code à six chiffres de l'application d'authentification](/assets/two-factor-verify.webp)

Saisissez les six chiffres affichés à cet instant par l'application. Le formulaire est envoyé
automatiquement après le sixième chiffre. Un code erroné ou périmé affiche une erreur et vous
laisse sur le même écran ; attendez le code suivant et réessayez.

**Return to login** abandonne cette connexion et recommence depuis le début.

## Utiliser le code de récupération {#recovery-code}

Lorsque le téléphone est perdu ou réinitialisé, le code de récupération permet à l'utilisateur
de revenir par lui-même :

1. Connectez-vous avec votre mot de passe comme d'habitude.
2. Sur **Two-step verification**, cliquez sur **Use recovery code**.
3. Saisissez le code de récupération et cliquez sur **Send**.

Semaphore vous connecte et **supprime TOTP de votre compte**. Le code de récupération est
consommé du même coup. Configurez à nouveau TOTP sans attendre, comme décrit
[plus haut](#set-up-totp-for-your-account), pour obtenir un nouveau secret et un nouveau code de
récupération.

**Use recovery code** n'apparaît que lorsque le serveur a activé `mfa.totp.allow_recovery`.
Les codes de récupération font 16 caractères et ne sont stockés que sous forme d'empreinte
bcrypt : personne — administrateurs compris — ne peut relire ultérieurement le code d'un
utilisateur.

## Supprimer le deuxième facteur {#remove-the-second-factor}

**Votre propre compte.** Désactivez **Time-based one-time password** dans l'onglet **Security**
d'**Edit Account**. TOTP est supprimé immédiatement et la prochaine connexion ne demande que la
première étape. Supprimez aussi l'entrée Semaphore de votre application d'authentification ;
elle ne correspond plus à rien.

**Le compte de quelqu'un d'autre.** Un utilisateur qui a perdu son téléphone et n'a pas de code
de récupération ne peut pas supprimer TOTP lui-même. Un administrateur, ou un utilisateur dont
le rôle global permet de gérer les utilisateurs, ouvre **Users**, modifie cet utilisateur et
désactive l'interrupteur dans l'onglet **Security**. L'utilisateur se connecte avec son seul mot
de passe et configure à nouveau TOTP.

### Gérer le deuxième facteur en ligne de commande {#manage-the-second-factor-from-the-command-line}

Sur le serveur, la même opération peut se faire sans l'interface web — utile lorsque le seul
administrateur a perdu son téléphone :

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` configure TOTP pour un utilisateur et affiche dans le
terminal l'URL `otpauth://`, un code QR et un code de récupération ; `show` affiche l'URL et le
code QR d'une configuration existante. Les deux affichent le secret lui-même : exécutez-les
uniquement là où personne d'autre ne peut voir le terminal, et remettez le code QR directement à
son propriétaire. La syntaxe complète se trouve dans
[`semaphore users`](/reference/cli/users#totp-management).

## La désactiver pour le serveur {#turn-it-off-for-the-server}

Définissez `mfa.totp.enabled` à `false`, ou supprimez la section, puis redémarrez. La connexion
cesse alors de demander des codes et le paramètre **Two-factor authentication** disparaît de
**Security**.

Aucune configuration n'est supprimée. Réactivez l'option et chaque compte qui avait TOTP
redemande son code, avec le même secret — inutile de scanner quoi que ce soit une seconde fois.

## À savoir {#things-to-know}

- **Les jetons d'API contournent le deuxième facteur.** Une requête munie d'un jeton
  `Authorization: Bearer` ne se voit jamais demander de code. Un jeton ne peut être créé que
  depuis une session entièrement connectée, mais les jetons qui existaient avant la
  configuration de TOTP continuent de fonctionner. Passez-les en revue sur la page
  **API Tokens** après avoir activé TOTP.
- **Semaphore ne limite pas les tentatives de saisie du code.** Six chiffres forment un petit
  espace : appliquez donc une limitation de débit sur `POST /api/auth/verify` et
  `POST /api/auth/recovery` dans votre [proxy inverse](/admin-guide/reverse-proxy).
- **Le secret est stocké tel quel dans la base de données.** Quiconque peut lire la table
  `user__totp`, ou une sauvegarde de la base de données, peut générer des codes valides pour
  tous les comptes. Protégez les sauvegardes comme vous protégez le fichier de configuration.
- **TOTP ne peut pas être exigé.** Semaphore n'a aucune option qui oblige les utilisateurs à le
  configurer. Si votre politique exige un deuxième facteur pour tous, imposez-le dans votre
  fournisseur d'identité et faites connecter les utilisateurs via
  [OpenID Connect](/admin-guide/authentication/openid).

La configuration, la suppression et l'utilisation du deuxième facteur sont consignées dans le
[journal d'audit](/admin-guide/audit-log) sous forme d'événements `iam.mfa` et `auth.mfa` ;
voir [Événements d'audit](/reference/audit-events) pour la liste.

## Et ensuite {#whats-next}

- [Comptes locaux](/admin-guide/authentication/local) — mots de passe, durée de session et
  désactivation de la connexion par mot de passe.
- [Sécurité](/admin-guide/security) — paramètres de hachage, chiffrement et durcissement.
- [`semaphore users`](/reference/cli/users#totp-management) — les commandes TOTP.
