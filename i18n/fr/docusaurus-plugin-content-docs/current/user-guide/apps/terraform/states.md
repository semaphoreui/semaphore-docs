---
title: "Backend HTTP"
sidebar_custom_props:
  edition: pro
---

# Backend HTTP <Pro />

Le backend HTTP de Semaphore UI pour Terraform stocke et gère de manière sécurisée les fichiers d'état Terraform directement dans Semaphore. Disponible dans l'offre Pro, il offre plusieurs avantages clés.

## Fonctionnalités {#features}

- **Stockage sécurisé de l'état** : les fichiers d'état sont <!-- encrypted and--> stockés de manière sécurisée dans Semaphore.
- **Verrouillage de l'état** : empêche les modifications simultanées d'un même fichier d'état.
- **Historique des versions** : suivez l'évolution de l'état de votre infrastructure dans le temps.
- **Intégration à l'interface** : gérez les fichiers d'état directement depuis l'interface de Semaphore.

## Configuration {#configuration}

Pour commencer à utiliser le backend HTTP intégré, vous devez d'abord créer un workspace pour votre modèle de tâche Terraform.

Pour ajouter un workspace, allez dans l'onglet **Workspaces** de votre modèle Terraform/OpenTofu.

Lors de la création d'un workspace, il vous sera demandé de sélectionner une clé SSH pour cloner les modules privés utilisés dans votre code Terraform. Si vous n'utilisez aucun module privé, sélectionnez simplement l'option `None`.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### Utilisation du backend HTTP dans les tâches {#using-the-http-backend-in-tasks}

Pour utiliser le backend HTTP intégré afin de stocker l'état de vos tâches Terraform, vous n'avez pas besoin de configurer manuellement le backend dans votre code Terraform. Semaphore peut créer automatiquement le fichier de configuration lors de l'exécution. Pour l'activer, cochez simplement l'option **Remplacer les paramètres du backend** dans les paramètres de votre modèle de tâche, comme illustré sur la capture d'écran ci-dessous.


Vous pouvez éventuellement indiquer le nom du fichier de configuration qui sera créé dynamiquement lors de l'exécution. C'est utile si votre code contient déjà un fichier de configuration de backend et que vous devez le remplacer dynamiquement pour fonctionner avec le backend intégré de Semaphore.

### Utilisation du backend HTTP en dehors de Semaphore {#using-the-http-backend-outside-semaphore}

Vous pouvez utiliser le backend HTTP intégré non seulement lors de l'exécution de tâches dans Semaphore, mais aussi lorsque vous exécutez du code Terraform en dehors de Semaphore, par exemple depuis votre terminal local.

Pour cela, Semaphore vous permet de créer des alias (points de terminaison HTTP uniques) pour votre stockage d'état. Ces alias facilitent le référencement de vos fichiers d'état depuis des environnements externes.

Pour le configurer, allez dans l'onglet **Workspaces**, sélectionnez le workspace souhaité et ajoutez un alias. Vous devrez également choisir une clé comportant un nom d'utilisateur et un mot de passe, qui servira à authentifier l'accès au backend.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

Ensuite, vous devez ajouter les paramètres du backend à votre code Terraform :

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

Terraform utilisera désormais le backend HTTP intégré de Semaphore, même lorsqu'il est exécuté depuis votre terminal :

```
terraform apply
```
