# 🔐 Sécurité

## Introduction {#introduction}

La sécurité est une priorité absolue dans Semaphore UI. Que vous automatisiez des tâches d'infrastructure critiques ou que vous gériez les accès de votre équipe à des systèmes sensibles, Semaphore UI est conçu pour offrir des opérations robustes et sécurisées dès l'installation. Cette section décrit la façon dont Semaphore gère la sécurité et ce que vous devez prendre en compte lors d'un déploiement en production.

## Authentification et autorisation {#authentication--authorization}

Semaphore prend en charge une authentification sécurisée et des mécanismes d'autorisation flexibles :

- **Méthodes de connexion :**
  - **Nom d'utilisateur / mot de passe**<br />Méthode par défaut utilisant des identifiants stockés dans la base de données Semaphore. Les mots de passe ne sont jamais stockés en clair ; ils sont hachés avec Argon2id (voir [Hachage des mots de passe](#password-hashing)).

  - **LDAP**<br />Permet l'intégration avec des annuaires d'entreprise. Prend en charge le filtrage des utilisateurs et des groupes ainsi que les connexions sécurisées via LDAPS.

  - **OpenID Connect (OIDC)**<br />Permet l'authentification unique avec des fournisseurs d'identité tels que Google, Azure AD ou Keycloak. Prend en charge les revendications personnalisées et les correspondances de groupes.

- **Authentification à deux facteurs (2FA)**<br />La 2FA basée sur TOTP est disponible et recommandée pour tous les utilisateurs. Elle peut être activée par utilisateur et prend en charge des codes de récupération facultatifs. Voir les options de configuration `mfa.totp.enabled` et `mfa.totp.allow_recovery`.

- **Contrôle d'accès basé sur les rôles**<br />Vous pouvez attribuer différents rôles aux utilisateurs, comme Admin, Maintainer ou Viewer, afin de limiter les accès selon les responsabilités.

- **Gestion des sessions**<br />Les sessions sont protégées par des cookies HTTP sécurisés. L'expiration des sessions et les mécanismes de déconnexion garantissent une exposition minimale.
<!-- - **Brute-Force Protection**: Login attempts are rate-limited to prevent brute-force attacks. -->

### Hachage des mots de passe {#password-hashing}

:::info Depuis la v2.20
Le hachage des mots de passe avec Argon2id est disponible depuis **Semaphore 2.20**. Les versions antérieures utilisent bcrypt.
:::

Les mots de passe des utilisateurs locaux sont hachés avec **Argon2id**, l'algorithme recommandé par l'[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) pour le stockage des mots de passe. Semaphore utilise les paramètres de robustesse minimale de l'OWASP :

| Paramètre | Valeur |
|-----------|-------|
| Mémoire | 19 Mio (`m=19456`) |
| Itérations | 2 (`t=2`) |
| Parallélisme | 1 (`p=1`) |
| Sel | 16 octets aléatoires par mot de passe |
| Longueur du hachage | 32 octets |

Les hachages sont stockés au [format de chaîne PHC](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md) standard, par exemple `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`, de sorte que les paramètres utilisés pour chaque hachage sont enregistrés à côté de celui-ci.

Cela s'applique à toutes les façons de définir un mot de passe : l'interface web, l'API et les commandes CLI `semaphore user add`, `semaphore user change-by-login` et `semaphore setup`.

**Mise à niveau depuis une version antérieure à la 2.20.** Les versions antérieures à la 2.20 hachaient les mots de passe avec bcrypt. Aucune étape de migration n'est nécessaire :

- Les hachages bcrypt existants sont toujours acceptés à la connexion, de sorte que tous les utilisateurs continuent de fonctionner après la mise à niveau.
- À la première connexion réussie, le mot de passe est réhaché de façon transparente avec Argon2id et le hachage bcrypt est remplacé.
- Si les paramètres Argon2id de Semaphore sont renforcés dans une version future, les hachages créés avec les anciens paramètres sont mis à niveau de la même manière lors de la connexion suivante.

Comme le réhachage n'a lieu qu'à la connexion, les utilisateurs qui ne se reconnectent jamais conservent leur hachage bcrypt. Pour forcer la mise à niveau de ces comptes, réinitialisez leur mot de passe avec `semaphore user change-by-login --password ...` ou depuis l'interface d'administration.

:::note
Les codes de récupération de l'authentification à deux facteurs ne sont pas des mots de passe utilisateur et continuent d'utiliser bcrypt.
:::

## Secrets et identifiants {#secrets--credentials}

La gestion sécurisée des secrets est une fonctionnalité essentielle :

- **Magasin de clés chiffré**<br />Les identifiants et les variables secrètes sont chiffrés au repos avec un chiffrement AES.

- **Isolation de l'environnement**<br />Les secrets ne sont transmis aux jobs qu'au moment de l'exécution et ne sont pas exposés directement à l'environnement du conteneur.

- **Clés SSH et jetons**<br />Il revient aux utilisateurs de téléverser des clés SSH et des jetons valides. Ceux-ci sont chiffrés et utilisés uniquement lors de l'exécution des tâches.
- **Intégration HashiCorp Vault (Pro)**<br />Les secrets peuvent être stockés dans une instance Vault externe. Choisissez le mode de stockage secret par secret lors de sa création ou de sa modification.

## Chiffrement des données {#data-encryption}

Les données sensibles sont stockées dans la base de données sous forme chiffrée. Vous devez définir l'option de configuration `access_key_encryption` dans le fichier de configuration pour activer le chiffrement des clés d'accès. Elle doit être générée par la commande :

```bash
head -c32 /dev/urandom | base64
```

## Exécuter du code ou des playbooks non fiables {#running-untrusted-code--playbooks}

Semaphore exécute des playbooks et des commandes définis par les utilisateurs, ce qui peut présenter des risques :

- **Isolation de l'exécution**<br />Par défaut, une tâche est un processus ordinaire sur le serveur Semaphore, avec son système de fichiers et son accès réseau. L'isolation est facultative : confiez la tâche à un [runner](/admin-guide/runners) configuré avec l'executor `docker` ou `k8s` et chaque tâche obtient un conteneur ou un Pod neuf, supprimé à la fin.

- **Moindre privilège**<br />Avec les executors Docker et Kubernetes, vous choisissez l'image, le réseau et le compte de service : la tâche ne reçoit que ce dont elle a besoin.

- **Exécution en chroot**<br />Semaphore peut exécuter les tâches dans une prison chroot afin d'isoler davantage l'environnement d'exécution du système hôte.

- **Utilisateur du processus de tâche**<br />Les tâches peuvent être exécutées sous un utilisateur système dédié non root (par exemple, `semaphore`) afin de réduire l'impact d'éventuelles failles exploitées. C'est facultatif et configurable selon les politiques du système.
<!-- - **Resource Limits**: To prevent abuse, CPU and memory limits can be applied. -->

## Déploiement sécurisé {#secure-deployment}

Pour garantir un déploiement sécurisé de Semaphore :

- **Utilisez HTTPS**<br />
    Semaphore prend en charge HTTPS à la fois via sa **prise en charge TLS intégrée** et au travers d'un **reverse proxy comme Nginx**. Il est fortement recommandé d'activer HTTPS en production.

    Pour activer la prise en charge HTTPS intégrée, ajoutez le bloc suivant à **config.json** :
    ```json
    {
        ...
        "tls": {
            "enabled": true,
            "cert_file": "/path/to/cert/example.com.cert",
            "key_file": "/path/to/key/example.com.key"
        }
        ...
    }
    ```

- **Exécutez derrière un pare-feu**<br />Limitez l'accès à l'interface Semaphore et à la base de données aux seules adresses IP de confiance.

- **Sécurité de la base de données**<br />Utilisez des mots de passe forts et restreignez l'accès à la base de données à Semaphore uniquement.

## Mises à jour et gestion des correctifs {#updates--patch-management}

Des mises à jour de sécurité sont publiées régulièrement :

- **Restez à jour**<br />Utilisez toujours la dernière version stable.

- **Journal des modifications**<br />Examinez les changements sur GitHub avant de mettre à jour.

- **Mises à jour automatiques**<br />Si vous utilisez Docker, envisagez des pipelines d'automatisation pour des mises à jour régulières.

<!-- ## Audit Logs & Monitoring

Semaphore provides basic audit logging:

- **User Activity**: Logins, failed attempts, and task executions are logged.
- **Configuration Changes**: Changes to settings, projects, and credentials are logged with timestamps.
- **Integration**: Logs can be forwarded to centralized logging systems like ELK or Prometheus exporters. -->

<!-- ## Backups & Disaster Recovery

To protect against data loss:

- **What to Back Up**: Semaphore database, configuration file, and secret storage.
- **How to Restore**: Follow the backup/restore guide in the admin docs.
- **Testing**: Periodically test restoring backups in a staging environment. -->

<!-- ## Common Vulnerabilities & Hardening Tips

- **Disable User Registration** if not needed to prevent unauthorized access.
- **Use Strong Passwords** and enforce complexity rules.
- **Limit Task Concurrency** to avoid resource exhaustion.
- **Restrict Access to Secrets** by managing team permissions carefully. -->

<!-- ## Compliance & Data Privacy

Semaphore collects minimal user data:

- **Data Handling**: Emails, IP logs, and session data are stored securely.
- **User Deletion**: Admins can delete user accounts and associated data upon request.
- **GDPR Compliance**: Self-hosted users are responsible for local compliance. -->

## Signaler des vulnérabilités {#reporting-vulnerabilities}

Vous avez découvert une vulnérabilité ? Aidez-nous à garder Semaphore sécurisé :

- **Divulgation responsable**<br />Écrivez-nous à l'adresse `security@semaphoreui.com`.
 
### Objectifs de résolution des vulnérabilités {#vulnerability-resolution-targets}

Nous visons à résoudre les vulnérabilités signalées dans les délais cibles suivants :

- Critique : sous 30 jours
- Élevée : sous 60 jours
- Moyenne : sous 90 jours
- Faible : au mieux, généralement sous 180 jours

Des correctifs hors cycle peuvent être publiés pour les problèmes activement exploités qui affectent les dernières versions stables.

### Outillage de sécurité du code {#code-security-tooling}

Nous utilisons CodeQL, Codacy, Snyk et Renovate pour analyser le code et les dépendances, et pour automatiser les mises à jour de dépendances.
- **Pas d'exploits publics**<br />Ne divulguez pas publiquement les vulnérabilités avant qu'elles ne soient corrigées.

- **Remerciements**<br />Les chercheurs en sécurité peuvent être mentionnés dans les notes de version s'ils le souhaitent.
