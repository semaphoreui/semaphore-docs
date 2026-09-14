---
title: Utiliser le configurateur en ligne
description: Générez des commandes de configuration binaire ou un fichier Docker Compose avec le configurateur en ligne de Semaphore.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Utiliser le configurateur en ligne

Remplissez le formulaire pour générer les commandes de configuration d’un nouveau serveur Semaphore. L’aperçu se met à jour pendant la saisie ; appliquez le résultat sur votre serveur pour terminer la configuration.

## Avant de commencer {#before-you-begin}

- Choisissez une installation binaire ou Docker et la version de Semaphore. Les liens et vidéos utilisent **2.19** ; sélectionnez votre version sur le site.
- Pour MySQL ou Postgres, préparez les informations de connexion. Pour SQLite, choisissez un emplacement du fichier de base de données accessible en écriture à l’utilisateur du service Semaphore.
- Utilisez votre propre mot de passe administrateur. Les vidéos contiennent des valeurs de démonstration.

## Étapes {#steps}

Suivez la section correspondant à votre méthode d’installation.

### Installation binaire {#binary-installation}

1. Ouvrez la [page d’installation binaire](https://semaphoreui.com/install/binary/2_19/install). Repérez votre plateforme, architecture et type de paquet. Cliquez sur la ligne pour afficher les commandes ; copiez-les et exécutez-les sur votre serveur, ou utilisez **Download** pour télécharger le paquet.
2. Ouvrez [Server setup](https://semaphoreui.com/install/binary/2_19/config). Dans **Database settings**, choisissez **SQLite**, **MySQL** ou **Postgres** et renseignez le chemin ou les informations de connexion. Dans **Admin user**, saisissez l’identifiant, le mot de passe, le nom et l’adresse e-mail.
3. Revenez à **Config file** et cliquez sur l’icône de copie. Vérifiez les commandes avant de les exécuter dans un répertoire accessible en écriture sur votre serveur. Elles créent `config.json`, ajoutent l’administrateur et démarrent Semaphore. Conservez la configuration et les clés de chiffrement générées pour les prochains démarrages.

![Ligne Linux amd64 deb dépliée avec les commandes d’installation](/img/admin-guide/configuration/online/binary-install.png)

![Champs de base de données et d’administrateur remplis avec des valeurs de démonstration](/img/admin-guide/configuration/online/binary-settings.png)

La vidéo montre le choix du paquet, les paramètres du serveur et la copie des commandes.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="La vidéo montre le choix du paquet, les paramètres du serveur et la copie des commandes.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Installation Docker {#docker-installation}

1. Ouvrez le [configurateur Docker](https://semaphoreui.com/install/docker/2_19). Dans **Container settings**, définissez le nom et le port de l’hôte. Dans **Docker volumes**, activez les volumes de données et de configuration pour les conserver lors du remplacement du conteneur.
2. Choisissez la base de données et remplissez **Admin user**, avec votre propre mot de passe. Pour une base de données externe, utilisez un hôte accessible depuis le conteneur.
3. Sélectionnez **Docker Compose** et cliquez sur l’icône de téléchargement. Enregistrez le résultat sous `docker-compose.yml` dans votre répertoire de déploiement, vérifiez-le et exécutez-y `docker compose up -d`. Vous pouvez aussi sélectionner **Docker command** et copier la commande `docker run` générée.

![Paramètres du conteneur Docker avec volumes persistants de données et de configuration activés](/img/admin-guide/configuration/online/docker-settings.png)

La vidéo montre les paramètres du conteneur, les volumes persistants et le téléchargement de Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="La vidéo montre les paramètres du conteneur, les volumes persistants et le téléchargement de Docker Compose.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Et ensuite {#whats-next}

Ouvrez votre serveur dans un navigateur, par exemple `http://localhost:3000` pour une exécution locale, puis connectez-vous avec les identifiants administrateur saisis.

- [Exécuter le binaire comme service](/admin-guide/installation/binary-file#run-as-a-service).
- [Détails du déploiement Docker](/admin-guide/installation/docker).
- [Toutes les options de configuration](/reference/configuration).
