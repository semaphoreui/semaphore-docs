---
title: Qu'est-ce que Semaphore
description: Ce que fait Semaphore UI, les problèmes qu'il résout, à qui il s'adresse, et les cas où un autre outil est le meilleur choix.
---

# Qu'est-ce que Semaphore

Semaphore UI est une interface web auto-hébergée et une API REST permettant d'exécuter
l'automatisation dont vous disposez déjà. Vous le faites pointer vers un dépôt Git contenant vos
playbooks Ansible, vos configurations Terraform ou vos scripts shell, vous lui indiquez quels
identifiants et quels hôtes utiliser, et il devient l'endroit unique où votre équipe exécute cette
automatisation, stocke les secrets dont elle a besoin, et conserve une trace de chaque exécution.

Semaphore ne remplace pas Ansible, Terraform ou vos scripts. Il les exécute, sur un
serveur plutôt que sur le portable de quelqu'un.

## Le problème qu'il résout {#the-problem-it-solves}

L'automatisation commence généralement sur un poste de travail. Un ingénieur possède le playbook,
l'inventaire, la clé SSH et la bonne version d'Ansible installée. Cela fonctionne jusqu'à ce
qu'une deuxième personne ait besoin d'exécuter la même chose, ou jusqu'à ce que quelqu'un demande ce
qui a changé sur un hôte mardi dernier.

Semaphore déplace l'exécution sur un serveur partagé et ajoute les éléments qui manquaient :

| Élément manquant | Ce que fournit Semaphore |
|---|---|
| Chacun doit installer l'outillage | Un serveur (ou un runner) le possède ; les utilisateurs n'ont besoin que d'un navigateur. |
| Les identifiants sont copiés d'un portable à l'autre | Un [magasin de clés](/user-guide/key-store) chiffré qui transmet les secrets à l'exécution, jamais à l'utilisateur. |
| Aucune trace de qui a exécuté quoi | Chaque [tâche](/user-guide/tasks) conserve sa sortie, son code de sortie, son utilisateur et son heure. |
| Personne ne devrait être root pour lancer un seul playbook | Les [rôles](/user-guide/team) déterminent qui peut exécuter, modifier ou seulement observer. |
| Les exécutions ont lieu quand quelqu'un y pense | Les [plannings](/user-guide/schedules), les [webhooks](/user-guide/integrations) et les appels API les déclenchent. |

## À qui il s'adresse {#who-it-is-for}

- **Les équipes infrastructure et plateforme** qui utilisent déjà Ansible ou Terraform et souhaitent
  que leurs collègues les exécutent sans distribuer les identifiants de production.
- **Les petites équipes sans plateforme CI/CD**, qui ont besoin de travaux d'exploitation planifiés
  ou à la demande, mais pas d'un pipeline de build.
- **Les équipes disposant d'une plateforme CI/CD** qui souhaitent garder les exécutions
  d'exploitation — redémarrages, déploiements, renouvellements de certificats — hors du système de
  build et visibles par des personnes qui ne lisent pas le YAML des pipelines.

Semaphore est auto-hébergé. Il n'existe pas de version SaaS : vous exécutez le binaire ou le
conteneur sur votre propre infrastructure, et vos secrets n'en sortent jamais.

## Ce qu'il exécute {#what-it-runs}

Chaque [modèle de tâche](/user-guide/task-templates) choisit une application :

- [Ansible](/user-guide/apps/ansible) — des playbooks avec inventaires, mots de passe de vault et
  l'ensemble complet des options d'`ansible-playbook`.
- [Terraform, OpenTofu et Terragrunt](/user-guide/apps/terraform) — plan et apply avec
  des workspaces et un état conservé par votre backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) et
  [Python](/user-guide/apps/python) — tout ce qui n'est pas couvert par ce qui précède.

Les tâches s'exécutent sur le serveur lui-même ou sur des [runners](/admin-guide/runners) placés au
plus près des systèmes qu'ils administrent.

## Quand ne pas l'utiliser {#when-not-to-use-it}

Connaître les limites fait gagner du temps par la suite.

- **Compiler et tester du code source.** Semaphore n'a pas d'artefacts de build, pas de builds
  matriciels, pas de vérifications de pull request et pas de registre de conteneurs. Utilisez GitHub
  Actions, GitLab CI ou Jenkins pour cela, et [démarrez les tâches Semaphore depuis ces
  outils](/admin-guide/cicd) lorsqu'un pipeline doit toucher à l'infrastructure.
- **Remplacer Ansible ou Terraform.** Semaphore ne dispose pas de son propre moteur d'exécution. Si
  votre playbook ne fonctionne pas depuis un shell, il ne fonctionnera pas depuis Semaphore.
- **Servir de CMDB.** Les [inventaires](/user-guide/inventory) sont les inventaires dont vos
  exécutions ont besoin, pas une source de vérité sur votre parc. Générez-les depuis votre véritable
  source avec un inventaire dynamique.
- **Être le gestionnaire de secrets de votre organisation.** Les secrets sont chiffrés au repos et
  sont conçus pour être utilisés par les tâches, pas pour être relus par des personnes. Si vous
  utilisez déjà HashiCorp Vault ou un autre magasin, [connectez-le](/user-guide/key-store) plutôt que d'y recopier les secrets.
- **Faire tourner un service mono-nœud où aucune indisponibilité n'est acceptable.** Plusieurs nœuds
  actifs nécessitent la [haute disponibilité](/admin-guide/ha), qui est une fonctionnalité Enterprise et
  exige PostgreSQL ou MySQL ainsi que Redis.

## Et ensuite {#whats-next}

- [Architecture](/introduction/architecture) — les processus, la base de données, et où les tâches s'exécutent.
- [Concepts clés](/introduction/concepts) — les dix mots que l'interface s'attend à ce que vous connaissiez.
- [Premiers pas](/getting-started) — installez-le et exécutez quelque chose.
