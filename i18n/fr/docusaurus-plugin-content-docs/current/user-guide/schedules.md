# Planifications

La fonction de planification de Semaphore permet d'automatiser l'exécution de modèles (par exemple des exécutions de playbooks) à des intervalles prédéfinis. Cette fonctionnalité permet de mettre en place des tâches d'automatisation routinières, telles que des sauvegardes régulières, des contrôles de conformité, des mises à jour système, et bien plus encore.

Veillez à redémarrer le service Semaphore après toute modification pour qu'elle prenne effet.

[//]: # (## Setup and configuration)

## Configuration du fuseau horaire {#timezone-configuration}

Par défaut, la fonction de planification utilise le fuseau horaire UTC. Vous pouvez toutefois le personnaliser pour qu'il corresponde à votre fuseau horaire local ou à des besoins spécifiques.

Vous pouvez changer le fuseau horaire en mettant à jour le fichier de configuration ou en définissant une variable d'environnement :

1. **Via le fichier de configuration** :  
    Ajoutez ou mettez à jour le champ `timezone` dans votre fichier de configuration Semaphore :
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **Via une variable d'environnement** :  
    Définissez la variable d'environnement `SEMAPHORE_SCHEDULE_TIMEZONE` :
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

Pour la liste des valeurs de fuseau horaire valides, consultez la [base de données des fuseaux horaires IANA](https://www.iana.org/time-zones).

### Accéder à la fonction de planification {#accessing-the-schedule-feature}

1. Connectez-vous à l'interface web de Semaphore
2. Accédez à l'onglet « Planification » dans le menu de navigation principal
3. Cliquez sur le bouton « Nouvelle planification » en haut à droite pour créer une nouvelle planification

![](/assets/schedule01.png)

### Créer une nouvelle planification {#creating-a-new-schedule}

Lors de la création d'une nouvelle planification, vous devez configurer les options suivantes :

| Champ | Description |
|-------|-------------|
| Nom | Un nom descriptif pour la tâche planifiée |
| Modèle | Le modèle de tâche spécifique à exécuter |
| Horaire | Soit au format cron pour plus de flexibilité, soit à l'aide des options intégrées pour les intervalles courants |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Syntaxe du format cron {#cron-format-syntax}

La planification utilise la syntaxe cron standard à cinq champs :

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Exemples :
- `*/15 * * * *` - Exécution toutes les 15 minutes
- `0 2 * * *` - Exécution tous les jours à 2h00
- `0 0 * * 0` - Exécution le dimanche à minuit
- `0 9 1 * *` - Exécution à 9h00 le premier jour de chaque mois

Générateur d'expressions cron très pratique : [https://crontab.guru/](https://crontab.guru/)

## Cas d'usage {#use-cases}

### Maintenance système {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

Planifiez l'exécution hebdomadaire de ce playbook en dehors des heures de travail pour garantir que les systèmes restent à jour.

### Opérations de sauvegarde {#backup-operations}

Créez des planifications pour les sauvegardes de bases de données avec différentes fréquences :
- Sauvegardes quotidiennes conservées pendant une semaine
- Sauvegardes hebdomadaires conservées pendant un mois
- Sauvegardes mensuelles conservées pendant un an

### Contrôles de conformité {#compliance-checks}

Planifiez des analyses de conformité régulières pour vous assurer que les systèmes respectent les exigences de sécurité :

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### Provisionnement et nettoyage d'environnements {#environment-provisioning-and-cleanup}

Pour les environnements de développement ou de test. Planifiez la création des environnements cloud le matin et leur suppression le soir afin d'optimiser les coûts.

## Bonnes pratiques {#best-practices}

* Utilisez des noms descriptifs pour les planifications, indiquant à la fois la fonction et l'horaire (par exemple « Weekly-Backup-Sunday-2AM »)
* Évitez de planifier simultanément trop de tâches gourmandes en ressources
* Tenez compte de l'effet des tâches planifiées de longue durée sur les autres planifications
* Testez les planifications avec des intervalles courts avant de mettre en place des planifications de production avec des intervalles plus longs
* Documentez l'objectif et les résultats attendus des tâches planifiées

---

## Paramètres de tâche {#task-parameters}

Les planifications peuvent transmettre des paramètres aux tâches. Activez les invites (prompts) pour les champs requis dans le modèle, puis définissez les valeurs des paramètres dans la configuration de la planification afin que chaque exécution fournisse les surcharges souhaitées (par exemple la branche, les variables, les options).
