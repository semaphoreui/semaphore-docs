---
title: Premiers pas
description: Installez Semaphore UI, exécutez votre première tâche Ansible, vérifiez le résultat et configurez une planification.
sidebar_label: Premiers pas
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Premiers pas

Semaphore UI est une interface web et une API pour exécuter des automatisations reproductibles avec Ansible, Terraform/OpenTofu, Bash, PowerShell et Python. Il réunit l’automatisation stockée dans Git, les identifiants, les variables, les planifications, les workflows et les environnements d’exécution, puis conserve l’état et le journal de chaque exécution.

Ce guide utilise Ansible pour le premier exemple pratique. Utilisez un playbook de votre propre dépôt ou reproduisez l’exemple des captures d’écran avec le dépôt public [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo).

<div className="VideoEmbed">
  <iframe
    src="https://www.youtube-nocookie.com/embed/LVKwud2Wno4"
    title="Démarrage rapide de Semaphore UI : installer, exécuter et planifier Ansible"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  ></iframe>
</div>

## 1. Installer Semaphore

Choisissez la méthode d’installation adaptée à l’environnement où Semaphore sera exécuté. Le paquet natif est sélectionné par défaut.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Paquet natif" default className="InstallationMethod">

Pour Debian ou Ubuntu sur `amd64` :

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

Pour RHEL, Fedora, Rocky Linux, AlmaLinux ou CentOS Stream sur `amd64` :

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Configurez la base de données et le premier administrateur, puis démarrez Semaphore avec la configuration générée :

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

Pour une évaluation locale, choisissez SQLite, acceptez ou définissez les chemins de la base de données et des playbooks, indiquez l’URL publique et créez le premier administrateur à l’invite.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Créez `compose.yaml` :

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

Générez une clé de chiffrement, puis placez-la avec un mot de passe administrateur robuste dans un fichier `.env` à côté de `compose.yaml` :

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Excluez `.env` du contrôle de version et démarrez le conteneur :

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Archive binaire" className="InstallationMethod">

Téléchargez l’archive correspondant à votre système d’exploitation et à l’architecture du processeur depuis [GitHub Releases](https://github.com/semaphoreui/semaphore/releases). Exemple pour Linux `amd64` :

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

Pour une évaluation locale, choisissez SQLite, acceptez ou définissez les chemins de la base de données et des playbooks, indiquez l’URL publique et créez le premier administrateur à l’invite.

Choisissez une archive `darwin` pour macOS ou un fichier `.zip` pour Windows. La procédure Ansible présentée plus loin nécessite toujours un environnement Linux, macOS, WSL, un conteneur ou un runner Linux avec Ansible installé.

  </TabItem>
  <TabItem value="helm" label="Kubernetes avec Helm" className="InstallationMethod">

Ajoutez le chart officiel et examinez ses valeurs par défaut avant l’installation :

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

Le champ `appVersion` du chart indique la version de Semaphore. Avant la mise en production, configurez dans `values.yaml` le stockage persistant, la base de données, les identifiants administrateur, la clé de chiffrement des clés d’accès et ingress/TLS.

  </TabItem>
</Tabs>

Pour une configuration guidée, utilisez la [page officielle d’installation de Semaphore](https://semaphoreui.com/install) afin de sélectionner la version, générer la configuration et obtenir les commandes de téléchargement ou d’exécution correspondantes.

<details>
<summary>Vous hésitez sur la méthode d’installation ?</summary>

| Méthode d’installation | À choisir pour | Guide détaillé |
| --- | --- | --- |
| **Paquet natif** | Un serveur Linux pris en charge | [Installation par gestionnaire de paquets](/admin-guide/installation/package-manager) |
| **Docker Compose** | Une installation isolée rapide ou un hôte de conteneurs | [Installation Docker](/admin-guide/installation/docker) |
| **Archive binaire** | macOS, Windows, FreeBSD ou Linux sans paquet adapté | [Installation du binaire](/admin-guide/installation/binary-file) |
| **Kubernetes avec Helm** | Un cluster Kubernetes existant | [Installation Kubernetes](/admin-guide/installation/k8s) |

Les guides détaillés couvrent les bases de données de production, les services, les secrets, le stockage, ingress et les mises à niveau.

</details>

Pour cette procédure Ansible, `git --version` et `ansible-playbook --version` doivent fonctionner sur le serveur Semaphore ou le runner. Si l’une de ces commandes est absente, installez [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) et [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) avant de continuer.

:::tip Installation en production
Avant d’utiliser Semaphore en production, consultez [Configuration](/admin-guide/configuration), [Sécurité](/admin-guide/security), [Runners](/admin-guide/runners), [Haute disponibilité](/admin-guide/ha) et [Mise à niveau](/admin-guide/upgrading).
:::

## 2. Se connecter

1. Ouvrez Semaphore dans un navigateur. Une installation locale utilise généralement [http://localhost:3000](http://localhost:3000).
2. Saisissez l’identifiant et le mot de passe administrateur définis par `semaphore setup` ou par les variables administrateur de Docker.
3. Sélectionnez **Sign In**.

![Écran de connexion de Semaphore](/assets/getting-started/sign-in.jpg)

Utilisez le compte administrateur pour la configuration initiale, car il peut créer des projets et des utilisateurs. Les utilisateurs ordinaires se connectent sur la même page après qu’un administrateur a créé leur compte et accordé l’accès au projet. Consultez [Gestion des utilisateurs](/user-guide/admin/users).

## 3. Créer un projet

Après connexion à une instance Semaphore vide, la page **New Project** s’ouvre automatiquement. Si des projets existent déjà, ouvrez le sélecteur de projets et choisissez **New Project...**. Remplissez le formulaire :

| Champ | Valeur à saisir |
| --- | --- |
| **Project Name** | Un nom d’espace de travail reconnaissable, par exemple `Production infrastructure` ou le nom de votre application. |
| **Max number of parallel tasks** | Facultatif. Limite les tâches simultanées de ce projet ; laissez vide pour utiliser la limite du serveur. |
| **Telegram Chat ID** | Facultatif. Utilisé lorsque les notifications Telegram sont configurées pour le projet. |
| **Allow alerts for this project** | Facultatif. Active les notifications configurées du projet. |
Sélectionnez **Create**.

Ne sélectionnez pas **Create Demo Project** : cette option ajoute des ressources d’exemple, alors que ce guide crée un projet vide. Lors de la création ultérieure d’un autre projet, la même option apparaît sous forme de commutateur **Demo** dans la boîte de dialogue New Project.

![Formulaire New Project vide avec tous les champs disponibles](/assets/getting-started/new-project-empty.jpg)

Le nouveau projet comporte les sections **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store** et **Repositories**. Consultez [Projets](/user-guide/projects) pour les paramètres du projet, l’accès de l’équipe, l’activité et l’historique.

<details>
<summary>Voir cette étape</summary>

![Création du premier projet dans une instance Semaphore vide](/assets/getting-started/create-first-project.gif)

</details>

## 4. Comprendre les concepts fondamentaux

Le nouveau projet s’ouvre sur un Dashboard vide. La barre latérale constitue la navigation principale du projet :

![Interface d’un projet Semaphore vide avant l’ajout de ressources et de tâches](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** affiche l’historique des exécutions, les statistiques, l’activité et les paramètres du projet.
- **Task Templates**, **Workflows** et **Schedule** définissent ce qui s’exécute et à quel moment.
- **Repositories**, **Inventory**, **Variable Groups** et **Key Store** fournissent le code, les cibles, les variables et les identifiants.
- **Integrations**, **Team** et **Runners** relient les systèmes externes, les utilisateurs et les hôtes d’exécution.

Le schéma montre comment ces ressources produisent une exécution :

<div class="BlockSchema">
  ![Comment les ressources et déclencheurs Semaphore produisent une exécution de tâche](/assets/getting-started/core-concepts.svg)
</div>

Une action dans l’interface, une requête API ou une planification peut démarrer directement un **Task Template** ou un **Workflow** utilisant des modèles de tâches. Semaphore crée une exécution, affichée comme **Task** dans l’interface, et l’envoie au serveur Semaphore ou à un runner distant admissible. Pour Ansible, cet hôte exécute `ansible-playbook` ; l’Inventory répertorie les systèmes gérés par Ansible.

| Concept | Fonction |
| --- | --- |
| [**Project**](/user-guide/projects) | Un espace de travail isolé contenant les ressources d’automatisation, les autorisations et l’historique des exécutions. |
| [**Repository**](/user-guide/repositories) | Désigne la branche ou le tag Git contenant les fichiers d’automatisation utilisés par une tâche. |
| [**Key Store**](/user-guide/key-store) | Stocke les clés SSH, identifiants, jetons et mots de passe Ansible Vault réutilisables hors de Git et des entrées de tâches. |
| [**Inventory**](/user-guide/inventory) | Indique à Ansible les hôtes et groupes à gérer ainsi que les identifiants à utiliser. |
| [**Variable Group**](/user-guide/environment) | Stocke les variables Ansible, variables d’environnement et secrets réutilisables pour un ou plusieurs modèles. |
| [**Task Template**](/user-guide/task-templates/) | Enregistre les éléments à exécuter : type d’automatisation, fichier, dépôt, inventaire, variables, paramètres demandés et options d’exécution. |
| [**Task (task run)**](/user-guide/tasks) | Une exécution avec ses propres entrées, état, horodatages, journal, détails et résultat. |
| **Workflow** | Relie les modèles de tâches dans un parcours à plusieurs étapes avec des branches de réussite, d’échec, d’approbation et de notes. |
| [**Schedule**](/user-guide/schedules) | Démarre un modèle de tâche ou un workflow une fois ou régulièrement selon une expression cron. |
| [**Runner**](/admin-guide/runners) | Exécute les tâches en attente hors du serveur principal Semaphore, par exemple dans un autre réseau ou périmètre de sécurité. |

## 5. Connecter le dépôt

Un Repository relie Semaphore à l’automatisation stockée dans Git ; Semaphore ne stocke pas le playbook lui-même. Connectez votre dépôt ou utilisez les valeurs de démonstration publique ci-dessous pour reproduire exactement l’exemple. Les [Intégrations](/user-guide/integrations) sont une fonction distincte permettant de lancer l’automatisation depuis GitHub, GitLab ou d’autres sources de webhooks.

1. Ouvrez **Repositories** et sélectionnez **New Repository**.
2. Saisissez le nom, l’URL, la branche et les identifiants du dépôt. Pour la démonstration publique, utilisez :

   | Champ | Valeur |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`, car ce dépôt est public |

3. Sélectionnez **Create**.

![Formulaire de dépôt renseigné avec le dépôt public de démonstration Semaphore](/assets/getting-started/repository-settings.jpg)

Votre dépôt doit maintenant apparaître dans la liste. Semaphore le clone ou le met à jour sur l’hôte d’exécution au démarrage d’une tâche, et non lors de la création de l’entrée Repository. La capture présente les valeurs de démonstration de ce guide.

![Dépôt Demo connecté dans la liste des dépôts du projet](/assets/getting-started/connected-repository.jpg)

Pour un dépôt privé, sélectionnez des identifiants adaptés dans le Key Store au lieu de `None`. Consultez [Dépôts](/user-guide/repositories) pour les chemins locaux, HTTPS, SSH, branches, identifiants et fichiers de dépendances.

## 6. Ajouter une clé SSH pour un hôte distant géré

Ces identifiants SSH permettent à Ansible de se connecter depuis le serveur Semaphore ou le runner à un hôte distant de l’Inventory. Pour la démonstration `localhost`, aucune clé SSH n’est nécessaire ; passez à l’étape 7.

La démonstration utilise `localhost` avec `ansible_connection=local` et n’ouvre donc aucune connexion SSH. Si votre playbook gère un hôte distant, ajoutez sa clé :

1. Ajoutez la partie publique de la clé à `~/.ssh/authorized_keys` sur l’hôte géré.
2. Ouvrez **Key Store** et sélectionnez **New Key**.
3. Saisissez un nom reconnaissable, par exemple `Production hosts`, conservez **Local** sélectionné et choisissez **SSH Key**.
4. Saisissez le compte qu’Ansible doit utiliser sur l’hôte, par exemple `ubuntu` ou `ec2-user`.
5. Collez la clé privée complète, y compris ses lignes `BEGIN` et `END`, et ajoutez la phrase secrète si nécessaire.
6. Sélectionnez **Create**. À l’étape suivante, choisissez cette clé sous **Inventory → User Credentials**.

![Formulaire New SSH Key pour le compte utilisé sur les hôtes gérés](/assets/getting-started/add-managed-host-ssh-key.jpg)

La capture contient une valeur fictive, pas un secret valide. Ne publiez jamais une clé privée dans la documentation, les captures, les arguments de tâches ou le contrôle de version.

Semaphore peut stocker les secrets localement ou intégrer des gestionnaires externes tels que [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) et [Devolutions Server](/user-guide/key-store/devolutions-server). Consultez [Magasin de clés](/user-guide/key-store) pour tous les types d’identifiants et options de stockage pris en charge.

## 7. Créer l’inventaire Ansible

Chaque tâche Ansible nécessite un inventaire. Pour une première exécution locale, ajoutez un fichier tel que `inventory.ini` à votre dépôt :

```ini
[local]
localhost ansible_connection=local
```

Ici, `localhost` désigne l’hôte d’exécution, soit le serveur Semaphore, le conteneur ou le runner, pas nécessairement l’ordinateur où le navigateur est ouvert. `ansible_connection=local` indique à Ansible de ne pas utiliser SSH. Le dépôt de démonstration utilise le fichier équivalent `invs/prod/hosts` avec un groupe nommé `site`.

Si vous avez créé `inventory.ini` dans votre dépôt, effectuez un commit et un push vers la branche connectée à Semaphore avant de continuer.

1. Ouvrez **Inventory** et sélectionnez **New Inventory → Ansible Inventory**.
2. Saisissez les valeurs correspondant à votre inventaire. Par exemple :

   | Champ | Valeur |
   | --- | --- |
   | **Name** | `Local` (`Prod` dans la démonstration) |
   | **User Credentials** | `None` pour `localhost` ; utilisez les identifiants SSH de l’hôte pour un inventaire distant |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` dans la démonstration) |

3. Laissez **Runner tag**, **Sudo Credentials** et **Repository** vides, puis sélectionnez **Create**.

![Inventaire Ansible de type fichier configuré avec les valeurs du dépôt de démonstration](/assets/getting-started/ansible-inventory-settings.jpg)

Si **Repository** reste vide, Semaphore résout ce chemin relatif d’inventaire depuis le dépôt sélectionné dans le modèle de tâche. Choisissez un dépôt ici uniquement si l’inventaire se trouve ailleurs. Pour un hôte distant, utilisez la clé SSH de l’étape 6 comme **User Credentials**.

Consultez [Inventaire](/user-guide/inventory) pour les inventaires statiques, basés sur des fichiers et dynamiques.

## 8. Ajouter un groupe de variables (facultatif)

Un **Variable Group** est un ensemble de valeurs réutilisables à associer à un ou plusieurs modèles de tâches. Utilisez **Extra variables** pour les variables Ansible, **Environment variables** pour les valeurs exportées vers le processus et **Secrets** pour les valeurs sensibles à chiffrer et masquer. La configuration propre à chaque environnement reste ainsi hors du playbook et n’a pas à être ressaisie dans chaque modèle.

La première tâche fonctionne sans groupe de variables. À titre d’exemple, créez-en un définissant `ansible_python_interpreter=auto_silent` ; Ansible détectera toujours Python automatiquement, mais n’affichera pas son avertissement informatif de détection.

1. Ouvrez **Variable Groups** et sélectionnez **New Group**.
2. Donnez à **Group Name** un nom descriptif, par exemple `Ansible defaults`.
3. Sous **Variables → Extra variables**, conservez **Table** sélectionné et choisissez **+**.
4. Saisissez :

   | Nom | Type | Valeur |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Sélectionnez **Save**.

![Groupe de variables configuré dans l’éditeur de tableau](/assets/getting-started/variable-group-table.jpg)

Consultez [Groupes de variables](/user-guide/environment) pour les règles de priorité et les options de stockage des secrets.

## 9. Créer le modèle de tâche Ansible

### Examiner le playbook dans Git

Si le dépôt connecté contient déjà un playbook Ansible, utilisez-le. Sinon, ajoutez un petit exemple tel que `get-started.yml` :

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

Si vous suivez la démonstration, utilisez plutôt son [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml). Il cible le groupe `site` de l’inventaire de démonstration et exécute le rôle `ping` inclus.

La démonstration télécharge ce rôle depuis un sous-module Git et envoie une requête ICMP à `semaphoreui.com`. L’hôte d’exécution doit donc accéder à GitHub et autoriser l’ICMP sortant. Si l’ICMP est bloqué, utilisez l’exemple local `get-started.yml`.

![ping.yml dans le dépôt GitHub connecté](/assets/getting-started/demo-playbook-github.jpg)

La capture présente le playbook du dépôt public de démonstration. Stocker l’automatisation dans Git permet de réviser les changements et à Semaphore d’enregistrer le commit exact utilisé pour chaque exécution.

Si vous avez créé `get-started.yml` dans votre dépôt, effectuez un commit et un push vers la branche connectée à Semaphore avant de continuer.

### Configurer le modèle

1. Ouvrez **Task Templates** et sélectionnez **New template → Applications**.
2. Activez **Ansible Playbook**, puis revenez à **Task Templates**.
3. Sélectionnez **New template → Ansible Playbook**.
4. Conservez l’onglet **Task** sélectionné. **Build** et **Deploy** sont des types de modèles CI/CD versionnés, inutiles pour cette exécution indépendante.
5. Configurez le modèle avec les valeurs correspondant à vos fichiers. Par exemple :

   | Champ | Valeur | Rôle |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Identifie le modèle réutilisable et son historique de tâches. |
   | **Repository** | Votre dépôt (`Demo` dans l’exemple) | Fournit le playbook et les fichiers associés. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` dans la démonstration) | Chemin résolu depuis la racine du dépôt. |
   | **Inventory** | `Local` (`Prod` dans la démonstration) | Fournit la cible locale de cette première exécution. |
   | **Variable Groups** | `Ansible defaults`, si créé | Ajoute le paramètre Ansible réutilisable facultatif. |
   | **Runner tag** | Laisser vide | Utilise l’exécution locale ou le runner par défaut selon la configuration du serveur. |

6. Sous **Ansible options**, activez **Skip Galaxy install** pour le petit playbook ci-dessus ou la démonstration publique : aucun n’a besoin de dépendances Galaxy pour cette tâche. Laissez cette option désactivée si votre dépôt nécessite des rôles ou collections provenant d’un fichier `requirements.yml`.
7. Sélectionnez **Create**.

![Modèle de tâche Ansible avec dépôt, inventaire et groupe de variables](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Voir cette étape</summary>

![Activation d’Ansible et création du premier modèle de tâche Ansible](/assets/getting-started/create-ansible-template.gif)

</details>

Autres champs utiles :

- **Vaults** sélectionne les mots de passe du Key Store pour le contenu Ansible chiffré.
- **Limit**, **Tags** et **Skip tags** limitent ce que le playbook exécute.
- **Prompts** permettent à un utilisateur, une planification ou une requête API de remplacer les valeurs autorisées pour une exécution donnée.
- **Runner tag** détermine où la tâche s’exécute ; il ne sélectionne pas une cible Ansible.

Consultez [Modèles Ansible](/user-guide/apps/ansible) et [Modèles de tâches](/user-guide/task-templates/) pour tous les champs et options d’exécution.

## 10. Exécuter le modèle et examiner la tâche

1. Ouvrez le modèle de tâche créé et sélectionnez **Run**.
2. Ajoutez éventuellement un message tel que `First Semaphore run`.
3. Laissez **Dry Run** et **Diff** désactivés, puis sélectionnez **Run**.

![Boîte de dialogue New Task sans options supplémentaires pour le playbook Ansible](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore met la tâche en file d’attente, prépare le dépôt, applique l’inventaire et le groupe de variables facultatif, puis exécute le playbook choisi. L’état passe par **Waiting** et **Running** avant de se terminer par **Success** ou **Failed**.

### Journal

**Log** contient la sortie réelle des commandes. Lisez le `PLAY RECAP` final, pas seulement l’indicateur d’état vert.

![Journal d’une tâche Ansible réussie avec sortie ping et PLAY RECAP](/assets/getting-started/ansible-task-log-variable-group.jpg)

Les compteurs exacts dépendent du playbook. Une première exécution réussie doit se terminer avec `unreachable=0` et `failed=0` pour `localhost`. Si le journal de démonstration indique `changed=1`, son étape ping via shell s’est exécutée et a signalé un changement ; ce n’est pas une erreur.

### Détails et résumé

| Onglet | Points à vérifier |
| --- | --- |
| **Log** | Phases d’exécution en direct, sortie des modules, erreurs et `PLAY RECAP` final. |
| **Details** | Type de modèle, commit Git, message d’exécution, auteur, horodatages et durée. |
| **Summary** | Résultats et erreurs Ansible par hôte après la fin, lorsque le résumé des tâches est disponible. |

![Détails de la tâche avec modèle, commit et informations temporelles](/assets/getting-started/ansible-task-details.jpg)

![Résumé de la tâche avec le nombre d’hôtes OK et Not OK](/assets/getting-started/ansible-task-summary.jpg)

Si **Summary** n’est pas disponible, vérifiez l’exécution dans **Log** ; `PLAY RECAP` reste le résultat Ansible de référence.

<details>
<summary>Voir l’exécution et le résultat</summary>

![Exécution de la tâche Ansible et examen du journal et des détails](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Retrouver les exécutions précédentes

Fermez la fenêtre de tâche pour revenir à l’onglet **Tasks** du modèle. Chaque exécution possède son numéro de tâche, son état, son utilisateur, son heure de début, sa durée et son journal conservé. **Dashboard → History** affiche les exécutions de tous les modèles du projet. Consultez [Tâches](/user-guide/tasks) et [Historique du projet](/user-guide/projects/history) pour en savoir plus.

![Historique d’un modèle Ansible avec des exécutions réussies](/assets/getting-started/ansible-template-history.jpg)

Si la tâche échoue, utilisez la dernière ligne significative du journal pour choisir la vérification suivante :

- Une erreur de clonage indique un problème d’URL du dépôt, de branche, d’Access Key ou d’accès réseau depuis l’hôte d’exécution.
- `ansible-playbook: command not found` signifie qu’Ansible est absent du serveur Semaphore ou du runner sélectionné.
- `UNREACHABLE` indique un problème d’adressage de l’inventaire, d’identifiants d’hôte, d’accès SSH ou de vérification de clé d’hôte.
- Une étape Ansible en échec indique généralement le nom de la tâche, l’hôte et l’erreur du module juste au-dessus de `PLAY RECAP`.

## 11. Planifier l’exécution de la tâche

Après une exécution réussie depuis l’interface, vous pouvez automatiser le lancement. Par exemple, l’expression cron `0 3 * * *` lance la tâche chaque jour à 03:00 dans le fuseau horaire affiché par Semaphore.

1. Ouvrez **Schedule** et sélectionnez **New Schedule → Cron**.
2. Saisissez un nom descriptif, par exemple `Nightly playbook`.
3. Sélectionnez le modèle de tâche à exécuter.
4. Conservez **Show cron format** activé et saisissez une expression cron, par exemple `0 3 * * *`.
5. Conservez **Enabled** sélectionné et choisissez **Save**.

![Planification cron pour exécuter la tâche d’exemple chaque jour à 03:00](/assets/getting-started/create-cron-schedule.jpg)

Semaphore affiche le fuseau horaire configuré et calcule la prochaine exécution avant l’enregistrement. Une exécution planifiée utilise les mêmes dépôt, inventaire, groupes de variables et paramètres d’exécution que le modèle. Si le modèle expose des paramètres à renseigner, la planification peut fournir leurs valeurs. Consultez [Planifications](/user-guide/schedules) pour la syntaxe cron, les fuseaux horaires, les exécutions uniques et les paramètres planifiés.

Après l’enregistrement, vérifiez que la planification est **Enabled** et que **Next run** affiche l’heure attendue. Les tâches planifiées apparaissent dans l’onglet **Tasks** du modèle et dans **Dashboard → History**.

## Pour aller plus loin

Une fois la première tâche Ansible réussie :

- Ajoutez les identifiants privés adaptés dans le [Magasin de clés](/user-guide/key-store) si votre dépôt exige une authentification.
- Créez un **Workflow** lorsque plusieurs modèles nécessitent des parcours ordonnés de réussite, d’échec, d’approbation ou de notes.
- Utilisez les [Intégrations](/user-guide/integrations) pour les déclencheurs webhook authentifiés depuis GitHub, GitLab ou d’autres systèmes.
- Utilisez l’[API](/reference/api) pour gérer les ressources et démarrer les modèles par programmation.
- Ajoutez un [runner distant](/admin-guide/runners) si l’exécution doit se faire dans un autre réseau, système d’exploitation ou périmètre de sécurité.

Pour la production, exposez Semaphore via HTTPS, sauvegardez ensemble la base de données et le secret de chiffrement des clés d’accès, configurez une authentification centralisée et consultez [Sécurité](/admin-guide/security), [Journaux](/admin-guide/logs) et [Mise à niveau](/admin-guide/upgrading).
