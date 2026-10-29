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

## Joindre le serveur de licences via un proxy {#reach-the-license-server-through-a-proxy}

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
