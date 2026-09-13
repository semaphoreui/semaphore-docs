# Snap (obsolète)

Pour installer Semaphore via snap, exécutez la commande suivante dans un terminal :

```bash
sudo snap install semaphore
```

Semaphore sera accessible à l'URL [https://localhost:3000](https://localhost:3000).&#x20;

Mais pour vous connecter, vous devez créer un utilisateur administrateur. Utilisez les commandes suivantes :

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

Vous pouvez vérifier l'état du service Semaphore à l'aide de la commande suivante :

```bash
sudo snap services semaphore
```

Elle doit afficher le tableau suivant :

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

Après l'installation, vous pouvez configurer Semaphore via la [configuration Snap](https://snapcraft.io/docs/configuration-in-snaps). Utilisez la commande suivante pour afficher votre configuration Semaphore :

```bash
sudo snap get semaphore
```

&#x20;Vous trouverez la liste des options disponibles dans la [référence des options de configuration](../configuration#configuration-options).

----
