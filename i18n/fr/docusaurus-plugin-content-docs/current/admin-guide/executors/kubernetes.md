---
title: Exécuteur Kubernetes
description: Exécutez chaque tâche d'un runner dans son propre Pod Kubernetes, avec les manifestes des comptes de service et de RBAC, les réglages du runner, la référence de configuration et un guide de dépannage.
sidebar_custom_props:
  edition: enterprise
---

# Exécuteur Kubernetes <FeatureState feature="k8s-executor" />

Avec l'exécuteur Kubernetes, un runner crée un Pod par tâche dans un namespace, diffuse
son journal dans Semaphore et supprime le Pod à la fin de la tâche. Le runner peut
s'exécuter dans le cluster (recommandé) ou en dehors avec un kubeconfig.

Le déroulement d'une tâche en conteneur, le contenu du conteneur et ce qui n'est pas pris
en charge sont décrits dans [Exécuteurs](./#how-a-container-task-runs). Cette page couvre
la configuration Kubernetes.

## Avant de commencer {#before-you-begin}

- Un serveur Semaphore avec une licence Enterprise.
- Un runner déployé dans le cluster, voir [Installer un runner sur Kubernetes](/admin-guide/installation/k8s#runner).
  Les étapes ci-dessous utilisent son namespace `semaphore` et son Deployment `semaphore-runner`. Pour un
  runner hors du cluster, voir [Runner en dehors du cluster](#runner-outside-the-cluster).
- `kubectl` avec les droits de créer des comptes de service et des objets RBAC dans ce namespace.
- Le cluster peut récupérer `semaphoreui/job` et `semaphoreui/helper` (ou vos propres images).

## Ce que crée le runner {#what-the-runner-creates}

Pour une tâche d'ID `42`, le runner crée dans son namespace :

| Objet | Nom | Contenu |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Conteneur d'initialisation `git-clone` (image helper) et conteneur `build` (image de build), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | Un par clé SSH, monté dans `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Mots de passe Ansible vault. |
| Secret | `<pod>-extra-vars` | `values.json` avec les variables supplémentaires. |
| Secret | `<pod>-env` | Secrets de groupe de variables de type *Variable d'environnement* et `SEMAPHORE_JWT`, injectés avec `envFrom`. |
| ConfigMap | `<pod>-inventory` | Un inventaire statique. |

Seuls les objets dont la tâche a besoin sont créés. Tous portent le label
`semaphoreui.com/runner=semaphore` ; le Pod porte aussi `semaphoreui.com/task-id=42`. Le
runner les supprime tous à la fin de la tâche, y compris après un échec ou un **Stop**.

## Mise en place {#set-up}

### Étape 1. Créer les comptes de service {#step-1-create-the-service-accounts}

Le runner a besoin d'un compte de service pour créer les Pods des tâches. Les Pods des tâches
en reçoivent un second, sans permissions ni token d'API, afin qu'un playbook ne puisse pas
utiliser les droits du runner.

```yaml title="semaphore-serviceaccounts.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-runner
  namespace: semaphore
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-job
  namespace: semaphore
automountServiceAccountToken: false
```

### Étape 2. Accorder ses permissions au runner {#step-2-grant-the-runner-its-permissions}

Voici la liste complète des appels d'API effectués par l'exécuteur :

```yaml title="semaphore-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: semaphore-runner
  namespace: semaphore
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["create", "get", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: semaphore-runner
  namespace: semaphore
subjects:
  - kind: ServiceAccount
    name: semaphore-runner
    namespace: semaphore
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: semaphore-runner
```

Un `Role`, pas un `ClusterRole` : le runner ne peut agir que dans son propre namespace.

### Étape 3. Passer le runner à l'exécuteur Kubernetes {#step-3-switch-the-runner-to-the-kubernetes-executor}

Les Pods des tâches ne définissent pas de `securityContext`, donc un namespace qui impose le niveau
Pod Security `restricted` les rejette. Autorisez `baseline` :

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Donnez au Pod du runner son compte de service et les réglages de l'exécuteur. Dans le Deployment du
runner, ajoutez à `spec.template.spec` :

```yaml title="semaphore-runner.yaml (fragment)"
    spec:
      serviceAccountName: semaphore-runner
      containers:
        - name: runner
          env:
            # ...SEMAPHORE_WEB_ROOT and SEMAPHORE_RUNNER_TOKEN as before
            - name: SEMAPHORE_RUNNER_EXECUTOR_TYPE
              value: k8s
            - name: SEMAPHORE_RUNNER_K8S_NAMESPACE
              value: semaphore
            - name: SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT
              value: semaphore-job
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: semaphoreui/job:latest
```

```bash
kubectl apply -f semaphore-serviceaccounts.yaml -f semaphore-rbac.yaml -f semaphore-runner.yaml
kubectl -n semaphore rollout status deploy/semaphore-runner
```

Sans `kubeconfig` défini, le runner utilise les identifiants in-cluster de
`semaphore-runner`. Les tâches ne s'exécutent plus dans le Pod du runner, vous pouvez donc réduire ses
`resources` (par exemple `100m` de CPU et `256Mi` de mémoire).

### Étape 4. Exécuter une tâche {#step-4-run-a-task}

Dirigez un modèle vers le runner et lancez une tâche. Observez son Pod apparaître puis disparaître :

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

Le journal de la tâche affiche :

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Exemples {#examples}

### Runner en dehors du cluster {#runner-outside-the-cluster}

Le runner s'exécute sur une VM ou dans Docker et atteint le serveur d'API avec un kubeconfig.
Donnez au kubeconfig le [Role de l'étape 2](#step-2-grant-the-runner-its-permissions)
et rien de plus :

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "k8s",
      "k8s": {
        "kubeconfig": "/etc/semaphore/kubeconfig",
        "namespace": "semaphore",
        "service_account": "semaphore-job"
      }
    }
  }
}
```

Le contexte courant du kubeconfig est utilisé.

### Images d'un registre privé {#images-from-a-private-registry}

Créez un secret de pull dans le namespace et indiquez-le dans `pull_secrets` ; plusieurs noms
sont séparés par des virgules :

```bash
kubectl -n semaphore create secret docker-registry registry-example \
  --docker-server=registry.example.com \
  --docker-username=<user> --docker-password=<password>
```

```yaml
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: registry.example.com/semaphore/job-aws:1.0
            - name: SEMAPHORE_RUNNER_K8S_PULL_SECRETS
              value: registry-example
```

Les secrets sont attachés à chaque Pod de tâche, aussi bien pour l'image de build, l'image
helper que pour l'**Image de l'exécuteur** d'un modèle.

### CPU et mémoire des Pods de tâche {#cpu-and-memory-of-task-pods}

L'exécuteur ne définit ni requests ni limits sur les Pods des tâches. Définissez des valeurs
par défaut pour le namespace avec un `LimitRange` ; il s'applique aux conteneurs `git-clone` et `build` :

```yaml title="semaphore-limits.yaml"
apiVersion: v1
kind: LimitRange
metadata:
  name: semaphore-task-defaults
  namespace: semaphore
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 250m
        memory: 256Mi
      default:
        cpu: "2"
        memory: 2Gi
```

Ajoutez un `ResourceQuota` pour plafonner ce que toutes les tâches parallèles du namespace peuvent utiliser.

### Restreindre le réseau des Pods de tâche {#restrict-the-network-of-task-pods}

Les Pods des tâches portent le label `semaphoreui.com/runner=semaphore`, qu'une `NetworkPolicy`
peut donc sélectionner. Celle-ci n'autorise que le DNS, le serveur Git et SSH vers les hôtes gérés :

```yaml title="semaphore-netpol.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: semaphore-tasks
  namespace: semaphore
spec:
  podSelector:
    matchLabels:
      semaphoreui.com/runner: semaphore
  policyTypes: ["Ingress", "Egress"]
  egress:
    - ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
    - to:
        - ipBlock: { cidr: 10.20.0.0/16 }   # Git server and managed hosts
      ports:
        - { protocol: TCP, port: 22 }
        - { protocol: TCP, port: 443 }
```

## Référence de configuration {#configuration-reference}

Toutes les options se trouvent sous `runner.executor.k8s` dans la configuration du runner.

| Option | Variable d'environnement | Par défaut | Description |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Chemin vers un fichier kubeconfig. Vide : le compte de service du Pod du runner. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace des Pods, Secrets et ConfigMaps des tâches. Doit exister. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Image du conteneur `build`. Le champ **Image de l'exécuteur** d'un modèle la remplace. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image du conteneur d'initialisation `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Compte de service des Pods des tâches. Utilisez-en un sans permissions, voir [Étape 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | `imagePullSecrets` séparés par des virgules pour les Pods des tâches. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Fréquence à laquelle le runner lit le statut du Pod. Des valeurs plus basses démarrent la diffusion du journal plus tôt et coûtent plus d'appels d'API. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Délai de grâce de la suppression du Pod après la fin ou l'arrêt de la tâche. |

La politique de pull des images suit la valeur par défaut de Kubernetes : `Always` pour `:latest`, sinon
`IfNotPresent`.

## Sécurité {#security}

- **Moindre privilège pour le runner.** Le [Role](#step-2-grant-the-runner-its-permissions)
  est limité au namespace et ne liste que ce que l'exécuteur appelle. Ne liez pas `cluster-admin`.
- **Pas d'accès à l'API pour les tâches.** Avec la valeur par défaut `service_account: default`, le
  Pod de la tâche reçoit le token du compte par défaut du namespace. Utilisez un compte dédié avec
  `automountServiceAccountToken: false`.
- **Un namespace réservé à Semaphore.** Le runner ne peut rien lire, mais il peut y créer
  et supprimer des Pods et des Secrets ; ne partagez pas le namespace avec d'autres charges de travail.
- **Les secrets** sont des Secrets Kubernetes distincts par tâche, montés en lecture seule (les
  secrets d'environnement via `envFrom`, de sorte que leurs valeurs ne figurent pas dans la spec du Pod)
  et supprimés avec le Pod. Quiconque peut lire les Secrets du namespace peut les lire pendant
  l'exécution de la tâche ; activez le [chiffrement au repos](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  des Secrets.
- **Réseau.** Limitez ce que les tâches atteignent avec une [NetworkPolicy](#restrict-the-network-of-task-pods).

## Arrêt et nettoyage {#stop-and-clean-up}

**Stop** dans l'interface met fin à la diffusion du journal et supprime le Pod avec
`cleanup_grace_seconds`, puis ses Secrets et ConfigMaps.

Si le runner est tué pendant une tâche, les objets de la tâche restent dans le namespace ; le
runner ne les récupère pas au démarrage suivant. Supprimez-les lorsqu'aucune tâche ne s'exécute :

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Dépannage {#troubleshooting}

| Symptôme | Cause et solution |
|---|---|
| Journal du runner : `k8s executor is only available in the proprietary build` | Le runner est une version Community. Utilisez `semaphoreui/runner` ou le binaire officiel. |
| Journal du runner : `failed to initialise executor provider` avec `unable to load in-cluster configuration` | Le runner est hors d'un cluster et `kubeconfig` est vide, ou le chemin du kubeconfig est incorrect. |
| Tâche : `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | Le RBAC manque ou est lié dans un autre namespace. Vérifiez avec `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Tâche : `create pod ...: namespaces "semaphore" not found` | Créez le namespace ; le runner ne le fait pas. |
| Tâche : `create pod ...: violates PodSecurity "restricted"` | Ajoutez au namespace le label `pod-security.kubernetes.io/enforce: baseline`. |
| La tâche reste **Running** sans sortie | Le Pod est bloqué en `Pending` : aucun nœud ne convient, l'image ne peut pas être récupérée (`ImagePullBackOff`), ou un quota le bloque. Le runner attend la fin du Pod. Vérifiez avec `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` et arrêtez la tâche. |
| Tâche : `pod ... finished with status Failed` | Le clonage ou l'application a échoué. Le journal au-dessus montre la sortie de `git-clone` et `build`. |
| `interpreter python3 not found in image` | L'image de build ne contient pas le binaire de l'application ; définissez une autre image ou le champ **Image de l'exécuteur** du modèle. |
| `No user exists for uid ...` (OpenShift) | Le `/etc/passwd` de l'image n'est pas modifiable par le groupe. Voir [Construire une image personnalisée](./#build-a-custom-image). |

## Pages associées {#related-pages}

- [Exécuteurs](/admin-guide/executors) : déroulement des tâches en conteneur, images, limitations.
- [Exécuteur Docker](./docker) : le même modèle sur un hôte Docker.
- [Installation sur Kubernetes](/admin-guide/installation/k8s) : le serveur et le Deployment du runner.
- [Image de l'exécuteur](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) : une image différente pour un modèle.
