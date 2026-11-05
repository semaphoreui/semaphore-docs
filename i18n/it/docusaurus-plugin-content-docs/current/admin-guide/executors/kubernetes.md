---
title: Executor Kubernetes
description: Eseguire ogni attività di un runner nel proprio Pod Kubernetes, con i manifest dei service account e RBAC, le impostazioni del runner, il riferimento della configurazione e la risoluzione dei problemi.
sidebar_custom_props:
  edition: enterprise
---

# Executor Kubernetes <FeatureState feature="k8s-executor" />

Con l'executor Kubernetes un runner crea un Pod per attività in un namespace, ne trasmette
il log a Semaphore ed elimina il Pod al termine dell'attività. Il runner può essere eseguito
nel cluster (consigliato) oppure al di fuori con un kubeconfig.

Come viene eseguita un'attività in container, cosa contiene il container e cosa non è
supportato è descritto in [Executor](./#how-a-container-task-runs). Questa pagina tratta
la configurazione Kubernetes.

## Prima di iniziare {#before-you-begin}

- Un server Semaphore con licenza Enterprise.
- Un runner distribuito nel cluster, vedere [Installare un runner su Kubernetes](/admin-guide/installation/k8s#runner).
  I passi seguenti usano il suo namespace `semaphore` e il Deployment `semaphore-runner`. Per un
  runner fuori dal cluster, vedere [Runner al di fuori del cluster](#runner-outside-the-cluster).
- `kubectl` con i diritti per creare service account e oggetti RBAC in quel namespace.
- Il cluster può scaricare `semaphoreui/job` e `semaphoreui/helper` (o le proprie immagini).

## Cosa crea il runner {#what-the-runner-creates}

Per un'attività con ID `42` il runner crea, nel suo namespace:

| Oggetto | Nome | Contenuto |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Init container `git-clone` (immagine helper) e container `build` (immagine di build), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | Uno per chiave SSH, montato in `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Password del vault Ansible. |
| Secret | `<pod>-extra-vars` | `values.json` con le variabili extra. |
| Secret | `<pod>-env` | Segreti del Variable Group di tipo *Environment variable* e `SEMAPHORE_JWT`, iniettati con `envFrom`. |
| ConfigMap | `<pod>-inventory` | Un inventario statico. |

Vengono creati solo gli oggetti di cui l'attività ha bisogno. Tutti portano l'etichetta
`semaphoreui.com/runner=semaphore`; il Pod ha anche `semaphoreui.com/task-id=42`. Il
runner li elimina tutti al termine dell'attività, anche dopo un errore o uno **Stop**.

## Configurazione {#set-up}

### Passo 1. Creare i service account {#step-1-create-the-service-accounts}

Il runner ha bisogno di un service account per creare i Pod delle attività. I Pod delle
attività ne ricevono un secondo, senza permessi e senza token API, così un playbook non può
usare i diritti del runner.

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

### Passo 2. Concedere i permessi al runner {#step-2-grant-the-runner-its-permissions}

Questo è l'elenco completo delle chiamate API effettuate dall'executor:

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

Un `Role`, non un `ClusterRole`: il runner può agire solo nel proprio namespace.

### Passo 3. Passare il runner all'executor Kubernetes {#step-3-switch-the-runner-to-the-kubernetes-executor}

I Pod delle attività non impostano un `securityContext`, quindi un namespace che impone il livello
Pod Security `restricted` li rifiuta. Consentire `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Assegnare al Pod del runner il suo service account e le impostazioni dell'executor. Nel Deployment
del runner, aggiungere a `spec.template.spec`:

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

Senza `kubeconfig` impostato, il runner usa le credenziali in-cluster di
`semaphore-runner`. Le attività non vengono più eseguite nel Pod del runner, quindi è possibile ridurne le
`resources` (ad esempio `100m` di CPU e `256Mi` di memoria).

### Passo 4. Eseguire un'attività {#step-4-run-a-task}

Indirizzare un template al runner e avviare un'attività. Osservare il suo Pod comparire e scomparire:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

Il log dell'attività mostra:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Esempi {#examples}

### Runner al di fuori del cluster {#runner-outside-the-cluster}

Il runner viene eseguito su una VM o in Docker e raggiunge l'API server con un kubeconfig.
Assegnare al kubeconfig il [Role del Passo 2](#step-2-grant-the-runner-its-permissions)
e nient'altro:

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

Viene usato il contesto corrente del kubeconfig.

### Immagini da un registry privato {#images-from-a-private-registry}

Creare un pull secret nel namespace e indicarlo in `pull_secrets`; più nomi si separano
con virgole:

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

I secret vengono associati a ogni Pod di attività, sia per l'immagine di build, sia per
l'immagine helper, sia per l'**Executor image** di un template.

### CPU e memoria dei Pod delle attività {#cpu-and-memory-of-task-pods}

L'executor non imposta requests né limits sui Pod delle attività. Impostare dei valori
predefiniti per il namespace con un `LimitRange`; si applica ai container `git-clone` e `build`:

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

Aggiungere una `ResourceQuota` per limitare quanto possono usare tutte le attività parallele del namespace.

### Limitare la rete dei Pod delle attività {#restrict-the-network-of-task-pods}

I Pod delle attività portano l'etichetta `semaphoreui.com/runner=semaphore`, quindi una
`NetworkPolicy` può selezionarli. Questa consente solo DNS, il server Git e SSH verso gli host gestiti:

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

## Riferimento della configurazione {#configuration-reference}

Tutte le opzioni si trovano sotto `runner.executor.k8s` nella configurazione del runner.

| Opzione | Variabile d'ambiente | Predefinito | Descrizione |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Percorso di un file kubeconfig. Vuoto: il service account del Pod del runner. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace dei Pod, Secret e ConfigMap delle attività. Deve esistere. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Immagine del container `build`. Il campo **Executor image** di un template la sovrascrive. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Immagine dell'init container `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Service account dei Pod delle attività. Usarne uno senza permessi, vedere [Passo 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | `imagePullSecrets` separati da virgole per i Pod delle attività. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Ogni quanto il runner legge lo stato del Pod. Valori più bassi avviano prima la trasmissione del log e costano più chiamate API. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Periodo di tolleranza dell'eliminazione del Pod dopo la fine o l'interruzione dell'attività. |

La pull policy delle immagini segue il default di Kubernetes: `Always` per `:latest`, altrimenti
`IfNotPresent`.

## Sicurezza {#security}

- **Privilegio minimo per il runner.** Il [Role](#step-2-grant-the-runner-its-permissions)
  è limitato al namespace ed elenca solo ciò che l'executor chiama. Non associare `cluster-admin`.
- **Nessun accesso API per le attività.** Con il valore predefinito `service_account: default` il
  Pod dell'attività riceve il token dell'account predefinito del namespace. Usare un account dedicato con
  `automountServiceAccountToken: false`.
- **Un namespace solo per Semaphore.** Il runner non può leggere nulla, ma può creare ed
  eliminare Pod e Secret al suo interno; non condividere il namespace con altri carichi di lavoro.
- **I segreti** sono Secret Kubernetes separati per attività, montati in sola lettura (i
  segreti d'ambiente tramite `envFrom`, così i loro valori non compaiono nella spec del Pod) ed
  eliminati insieme al Pod. Chi può leggere i Secret nel namespace può leggerli mentre l'attività è
  in esecuzione; abilitare la [crittografia a riposo](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  per i Secret.
- **Rete.** Limitare ciò che le attività raggiungono con una [NetworkPolicy](#restrict-the-network-of-task-pods).

## Arresto e pulizia {#stop-and-clean-up}

**Stop** nell'interfaccia termina la trasmissione del log ed elimina il Pod con
`cleanup_grace_seconds`, poi i suoi Secret e ConfigMap.

Se il runner viene terminato durante un'attività, gli oggetti dell'attività restano nel
namespace; il runner non li raccoglie all'avvio successivo. Rimuoverli quando nessuna attività è in esecuzione:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Risoluzione dei problemi {#troubleshooting}

| Sintomo | Causa e soluzione |
|---|---|
| Log del runner: `k8s executor is only available in the proprietary build` | Il runner è una build Community. Usare `semaphoreui/runner` o il binario ufficiale. |
| Log del runner: `failed to initialise executor provider` con `unable to load in-cluster configuration` | Il runner è fuori da un cluster e `kubeconfig` è vuoto, oppure il percorso del kubeconfig è errato. |
| Attività: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | L'RBAC manca o è associato in un altro namespace. Verificare con `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Attività: `create pod ...: namespaces "semaphore" not found` | Creare il namespace; il runner non lo crea. |
| Attività: `create pod ...: violates PodSecurity "restricted"` | Aggiungere al namespace l'etichetta `pod-security.kubernetes.io/enforce: baseline`. |
| L'attività resta **Running** senza output | Il Pod è bloccato in `Pending`: nessun nodo è adatto, l'immagine non può essere scaricata (`ImagePullBackOff`) o una quota lo blocca. Il runner attende che il Pod termini. Verificare con `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` e interrompere l'attività. |
| Attività: `pod ... finished with status Failed` | La clonazione o l'applicazione è fallita. Il log sopra mostra l'output di `git-clone` e `build`. |
| `interpreter python3 not found in image` | L'immagine di build non contiene il binario dell'applicazione; impostare un'altra immagine o il campo **Executor image** del template. |
| `No user exists for uid ...` (OpenShift) | Il `/etc/passwd` dell'immagine non è scrivibile dal gruppo. Vedere [Creare un'immagine personalizzata](./#build-a-custom-image). |

## Pagine correlate {#related-pages}

- [Executor](/admin-guide/executors): come vengono eseguite le attività in container, immagini, limitazioni.
- [Executor Docker](./docker): lo stesso modello su un host Docker.
- [Installazione su Kubernetes](/admin-guide/installation/k8s): il server e il Deployment del runner.
- [Immagine dell'executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): un'immagine diversa per un template.
