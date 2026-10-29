---
title: "Activation de la licence"
---

# Activation de la licence <Pro />

Les fonctionnalités Semaphore Pro et Enterprise sont activées à l'aide d'une clé de licence. Vous pouvez activer la licence depuis l'interface web, ou fournir la clé dans la configuration du serveur pour les déploiements automatisés.

## Avant de commencer {#before-you-start}

- Vous n'avez pas besoin de réinstaller Semaphore UI ni de passer à une autre version compilée pour activer Pro ou Enterprise. Votre version actuelle de Semaphore UI peut être activée avec une clé de licence. Mettez à jour vers la dernière version si vous souhaitez accéder aux fonctionnalités Pro ou Enterprise les plus récentes.
- Connectez-vous avec un compte administrateur.
- Ayez votre clé de licence à portée de main. Vous la trouverez dans l'e-mail d'achat ou sur le [portail Semaphore UI](https://portal.semaphoreui.com/auth/login).

## Activation depuis l'interface web {#activate-from-the-web-ui}

1. Connectez-vous à Semaphore UI en tant qu'administrateur.

![Écran de connexion de Semaphore UI](/assets/subscription-login-screen.png)

2. Ouvrez le menu Admin depuis la zone utilisateur dans le coin inférieur gauche.

![Déclencheur du menu Admin dans le coin inférieur gauche](/assets/subscription-admin-menu-trigger.png)

3. Sélectionnez **Passer à PRO ou EE**.

![Menu Admin avec l'élément Passer à PRO ou EE](/assets/subscription-upgrade-menu-item.png)

4. Collez votre clé de licence dans la boîte de dialogue d'activation et cliquez sur **ACTIVER LA NOUVELLE CLÉ**.

![Boîte de dialogue d'activation de Semaphore Pro](/assets/subscription-activation-dialog.png)

Après une activation réussie, Semaphore UI affiche les détails de votre licence actuelle dans la boîte de dialogue **Abonnement et facturation**.

![Boîte de dialogue Abonnement et facturation après une activation réussie](/assets/subscription-activation-success.png)

## Activation depuis la configuration {#activate-from-configuration}

Pour Docker, Kubernetes, systemd ou d'autres déploiements automatisés, fournissez la clé de licence dans la configuration du serveur au lieu de la saisir dans l'interface. Les noms des options de configuration utilisent `subscription.*`.

Dans `config.json` :

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Ou sous forme de variable d'environnement :

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

Vous pouvez également stocker la clé dans un fichier :

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

ou :

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Lorsque la clé de licence est gérée par la configuration, Semaphore UI désactive les contrôles de modification et d'activation dans la boîte de dialogue **Abonnement et facturation**. Cela s'applique aussi bien à `subscription.key` qu'à `subscription.key_file`, car le serveur lit le fichier de clé dans la clé de licence d'exécution au démarrage.

## Comment fonctionne la validation de la licence {#how-license-validation-works}

Semaphore UI valide la licence auprès du Portail Semaphore UI. L'adresse se trouve dans `subscription.server_url`, par défaut `https://portal.semaphoreui.com/billing`.

### À quoi Semaphore UI se connecte {#what-semaphore-ui-connects-to}

| Quand | Requête |
| --- | --- |
| Activation d'une clé | `POST {server_url}/subscriptions/{key}/activate` |
| Validation et renouvellement de la licence | `POST {server_url}/subscriptions/{key}/validate` |

Ce sont deux requêtes JSON simples, et une requête est abandonnée après 20 secondes. La requête d'activation envoie la clé de licence ; la requête de validation envoie le jeton de licence que le serveur détient à ce moment-là. Rien d'autre ne quitte l'installation : les comptes utilisateurs, les noms de projets, les inventaires, les noms d'hôtes et la sortie des tâches ne font pas partie de ces requêtes.

La réponse est dans les deux cas un **jeton de licence** — un JWT signé par le portail avec une clé RSA. Semaphore UI vérifie la signature avec la clé publique correspondante intégrée au binaire du serveur, de sorte qu'un jeton ne peut être ni falsifié ni modifié. Ses claims décrivent ce que la licence autorise : le plan, l'état de l'abonnement, le nom de l'entreprise, la date d'expiration et le nombre d'utilisateurs Pro, de nœuds et d'UIs. Le serveur conserve la clé et le jeton dans la base de données, dans les options `subscription_key` et `subscription_token`.

### Quand la vérification a lieu {#when-the-check-runs}

| Déclencheur | Ce qui se passe |
| --- | --- |
| Démarrage du serveur | Le jeton de licence est renouvelé une fois. |
| Chaque jour à 01:00, heure du serveur | Le jeton de licence est renouvelé. |
| Activation d'une clé dans l'interface web ou via `subscription.key` | La clé est activée et renvoie le premier jeton. |
| **Recharger** dans la boîte de dialogue **Abonnement et facturation** | Le jeton de licence est renouvelé à la demande. |

Entre ces appels, Semaphore UI ne contacte pas le portail. Chaque contrôle de licence — savoir si les fonctionnalités Pro sont activées, et si un utilisateur Pro, un runner ou un état de backend HTTP Terraform/OpenTofu supplémentaire entre dans la licence — lit le jeton stocké localement.

### Lorsque le portail est injoignable {#when-the-portal-cannot-be-reached}

Un renouvellement échoué est écrit dans le journal du serveur sous le contexte `subscription` et laisse le jeton stocké intact : une coupure réseau ou un portail indisponible ne désactive donc pas les fonctionnalités Pro. L'installation continue de fonctionner jusqu'à ce que la date d'expiration inscrite dans le jeton lui-même soit dépassée : un jeton expiré se charge encore, mais son état devient `expired` et les fonctionnalités Pro s'arrêtent.

### Clés en ligne et hors ligne {#online-and-offline-keys}

- Une **clé en ligne** est un UUID de la forme `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. Son activation appelle le portail, et le renouvellement quotidien la maintient à jour. Une valeur qui n'est pas un UUID est refusée avant toute requête.
- Une **clé hors ligne** est elle-même un jeton de licence — une longue chaîne signée délivrée pour une installation sans accès à internet. Semaphore UI la vérifie localement et n'appelle jamais le portail pour elle, le renouvellement quotidien n'émet donc aucune requête. Pour renouveler une licence hors ligne, remplacez la clé par une clé nouvellement délivrée.

### Haute disponibilité {#high-availability}

Chaque nœud du serveur renouvelle la licence à son propre démarrage et selon sa propre planification quotidienne, et écrit le résultat dans la base de données partagée : tous les nœuds du cluster lisent donc le même jeton de licence. Aucune configuration supplémentaire n'est nécessaire.

## Joindre le serveur de licences via un proxy {#reach-the-license-server-through-a-proxy}

:::info Depuis la v2.20
Le proxy est disponible depuis **Semaphore 2.20**.
:::

L'activation d'une clé, le rafraîchissement du jeton de licence et le rafraîchissement quotidien du jeton appellent tous le Portail Semaphore UI à l'adresse `subscription.server_url`. Dans un réseau où le serveur n'a pas d'accès direct à internet, faites passer ces appels par un proxy HTTP :

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

Ou comme variables d'environnement :

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

Remarques :

- Les schémas `http`, `https`, `socks5` et `socks5h` sont pris en charge. Une adresse de proxy invalide arrête le serveur au démarrage.
- `username` et `password` sont facultatifs et remplacent les identifiants indiqués dans `url`. Les garder à part évite que le mot de passe apparaisse dans l'adresse de proxy journalisée par Semaphore UI.
- Le proxy ne s'applique qu'aux requêtes vers le serveur de licences. Les tâches, les clones Git et les autres connexions sortantes ne sont pas concernés.
- Sans `subscription.proxy`, le serveur de licences est joint via les variables de proxy du processus serveur (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`), comme auparavant.
- Une installation coupée d'internet a besoin d'une clé de licence hors ligne plutôt que d'un proxy — le serveur n'appelle alors jamais le portail.

## Gérer ou remplacer une clé de licence {#manage-or-replace-a-license-key}

Pour renouveler, remplacer ou consulter votre licence, ouvrez le menu Admin et sélectionnez **Abonnement et facturation**.

![Menu Admin avec l'élément Abonnement et facturation](/assets/subscription-billing-menu-item.png)

Pour une clé de licence gérée depuis l'interface web, ouvrez le menu d'actions dans la boîte de dialogue **Abonnement et facturation** pour recharger, téléverser ou réinitialiser la clé.

![Boîte de dialogue Abonnement et facturation avec les actions sur la clé](/assets/subscription-key-actions-menu.png)

Si la clé est configurée sur le serveur :

1. Remplacez la valeur de `subscription.key`, ou mettez à jour le contenu du fichier référencé par `subscription.key_file`.
2. Redémarrez Semaphore UI afin que le serveur recharge la clé de licence.
3. Vérifiez que les options Pro ou Enterprise attendues sont disponibles dans Semaphore UI.
