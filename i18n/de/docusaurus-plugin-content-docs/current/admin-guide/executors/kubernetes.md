---
title: Kubernetes-Executor
description: Jeden Task eines Runners in einem eigenen Kubernetes-Pod ausführen, mit Manifesten für Service-Accounts und RBAC, Runner-Einstellungen, Konfigurationsreferenz und Fehlerbehebung.
sidebar_custom_props:
  edition: enterprise
---

# Kubernetes-Executor <FeatureState feature="k8s-executor" />

Mit dem Kubernetes-Executor erstellt ein Runner pro Task einen Pod in einem Namespace,
streamt dessen Log in Semaphore und löscht den Pod, wenn der Task endet. Der Runner kann
im Cluster laufen (empfohlen) oder außerhalb davon mit einer kubeconfig.

Wie ein Container-Task abläuft, was sich im Container befindet und was nicht unterstützt
wird, ist unter [Executoren](./#how-a-container-task-runs) beschrieben. Diese Seite
behandelt die Kubernetes-Einrichtung.

## Bevor Sie beginnen {#before-you-begin}

- Ein Semaphore-Server mit einer Enterprise-Lizenz.
- Ein im Cluster bereitgestellter Runner, siehe [Runner auf Kubernetes installieren](/admin-guide/installation/k8s#runner).
  Die folgenden Schritte verwenden seinen Namespace `semaphore` und das Deployment `semaphore-runner`. Für einen
  Runner außerhalb des Clusters siehe [Runner außerhalb des Clusters](#runner-outside-the-cluster).
- `kubectl` mit Rechten zum Erstellen von Service-Accounts und RBAC-Objekten in diesem Namespace.
- Der Cluster kann `semaphoreui/job` und `semaphoreui/helper` (oder Ihre eigenen Images) pullen.

## Was der Runner erstellt {#what-the-runner-creates}

Für einen Task mit der ID `42` erstellt der Runner in seinem Namespace:

| Objekt | Name | Inhalt |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Init-Container `git-clone` (Helper-Image) und Container `build` (Build-Image), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | Eines pro SSH-Schlüssel, eingebunden unter `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Ansible-Vault-Passwörter. |
| Secret | `<pod>-extra-vars` | `values.json` mit den Extra-Variablen. |
| Secret | `<pod>-env` | Secrets der Variable Group vom Typ *Umgebungsvariable* und `SEMAPHORE_JWT`, eingebunden mit `envFrom`. |
| ConfigMap | `<pod>-inventory` | Ein statisches Inventar. |

Es werden nur die Objekte erstellt, die der Task benötigt. Alle tragen das Label
`semaphoreui.com/runner=semaphore`; der Pod hat zusätzlich `semaphoreui.com/task-id=42`.
Der Runner löscht sie alle, wenn der Task endet, auch nach einem Fehler oder **Stop**.

## Einrichtung {#set-up}

### Schritt 1. Service-Accounts erstellen {#step-1-create-the-service-accounts}

Der Runner benötigt einen Service-Account, um Task-Pods zu erstellen. Die Task-Pods
erhalten einen zweiten, ohne Berechtigungen und ohne API-Token, sodass ein Playbook die
Rechte des Runners nicht nutzen kann.

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

### Schritt 2. Dem Runner seine Berechtigungen erteilen {#step-2-grant-the-runner-its-permissions}

Dies ist die vollständige Liste der API-Aufrufe, die der Executor ausführt:

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

Eine `Role`, keine `ClusterRole`: Der Runner kann nur seinen eigenen Namespace verändern.

### Schritt 3. Den Runner auf den Kubernetes-Executor umstellen {#step-3-switch-the-runner-to-the-kubernetes-executor}

Task-Pods setzen keinen `securityContext`, daher lehnt ein Namespace, der die Pod-Security-Stufe
`restricted` erzwingt, sie ab. Erlauben Sie `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Geben Sie dem Runner-Pod seinen Service-Account und die Executor-Einstellungen. Ergänzen Sie im
Runner-Deployment unter `spec.template.spec`:

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

Ohne gesetzte `kubeconfig` verwendet der Runner die In-Cluster-Zugangsdaten von
`semaphore-runner`. Tasks laufen nicht mehr im Runner-Pod, daher können Sie dessen
`resources` verringern (zum Beispiel `100m` CPU und `256Mi` Arbeitsspeicher).

### Schritt 4. Einen Task ausführen {#step-4-run-a-task}

Leiten Sie ein Template an den Runner und starten Sie einen Task. Beobachten Sie, wie
sein Pod erscheint und wieder verschwindet:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

Das Task-Log zeigt:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Beispiele {#examples}

### Runner außerhalb des Clusters {#runner-outside-the-cluster}

Der Runner läuft auf einer VM oder in Docker und erreicht den API-Server mit einer
kubeconfig. Geben Sie der kubeconfig die [Role aus Schritt 2](#step-2-grant-the-runner-its-permissions)
und nichts weiter:

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

Es wird der aktuelle Kontext der kubeconfig verwendet.

### Images aus einer privaten Registry {#images-from-a-private-registry}

Erstellen Sie im Namespace ein Pull-Secret und tragen Sie es in `pull_secrets` ein;
mehrere Namen werden durch Kommas getrennt:

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

Die Secrets werden an jeden Task-Pod angehängt, gleichermaßen für das Build-Image, das
Helper-Image und das **Executor image** eines Templates.

### CPU und Speicher der Task-Pods {#cpu-and-memory-of-task-pods}

Der Executor setzt keine Requests oder Limits für Task-Pods. Legen Sie Standardwerte für
den Namespace mit einer `LimitRange` fest; sie gilt für die Container `git-clone` und `build`:

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

Fügen Sie eine `ResourceQuota` hinzu, um zu begrenzen, wie viel alle parallelen Tasks des
Namespace verbrauchen dürfen.

### Netzwerk der Task-Pods einschränken {#restrict-the-network-of-task-pods}

Task-Pods tragen das Label `semaphoreui.com/runner=semaphore`, sodass eine
`NetworkPolicy` sie auswählen kann. Diese hier erlaubt nur DNS, den Git-Server und SSH zu
den verwalteten Hosts:

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

## Konfigurationsreferenz {#configuration-reference}

Alle Optionen befinden sich unter `runner.executor.k8s` in der Runner-Konfiguration.

| Option | Umgebungsvariable | Standard | Beschreibung |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Pfad zu einer kubeconfig-Datei. Leer: der Service-Account des Runner-Pods. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace der Task-Pods, Secrets und ConfigMaps. Muss existieren. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Image des Containers `build`. Das **Executor image** eines Templates überschreibt es. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image des Init-Containers `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Service-Account der Task-Pods. Verwenden Sie einen ohne Berechtigungen, siehe [Schritt 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | Kommagetrennte `imagePullSecrets` für Task-Pods. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Wie oft der Runner den Pod-Status liest. Niedrigere Werte starten das Log-Streaming früher und kosten mehr API-Aufrufe. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Kulanzzeit beim Löschen des Pods, nachdem der Task beendet oder gestoppt wurde. |

Die Image-Pull-Policy folgt dem Kubernetes-Standard: `Always` für `:latest`, sonst
`IfNotPresent`.

## Sicherheit {#security}

- **Minimale Rechte für den Runner.** Die [Role](#step-2-grant-the-runner-its-permissions)
  ist auf den Namespace beschränkt und listet nur, was der Executor aufruft. Binden Sie
  nicht `cluster-admin`.
- **Kein API-Zugriff für Tasks.** Mit dem Standard `service_account: default` erhält der
  Task-Pod das Token des Default-Accounts des Namespace. Verwenden Sie einen dedizierten
  Account mit `automountServiceAccountToken: false`.
- **Ein Namespace nur für Semaphore.** Der Runner kann nichts lesen, aber dort Pods und
  Secrets erstellen und löschen; teilen Sie den Namespace nicht mit anderen Workloads.
- **Secrets** sind separate Kubernetes-Secrets pro Task, schreibgeschützt eingebunden
  (Umgebungs-Secrets über `envFrom`, sodass ihre Werte nicht in der Pod-Spezifikation
  stehen) und werden mit dem Pod gelöscht. Wer Secrets im Namespace lesen kann, kann sie
  lesen, solange der Task läuft; aktivieren Sie die
  [Verschlüsselung im Ruhezustand](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  für Secrets.
- **Netzwerk.** Schränken Sie mit einer [NetworkPolicy](#restrict-the-network-of-task-pods) ein, was Tasks erreichen.

## Stoppen und aufräumen {#stop-and-clean-up}

**Stop** in der UI beendet das Log-Streaming und löscht den Pod mit
`cleanup_grace_seconds`, danach seine Secrets und ConfigMaps.

Wird der Runner während eines Tasks beendet, bleiben die Objekte des Tasks im Namespace;
der Runner räumt sie beim nächsten Start nicht auf. Entfernen Sie sie, wenn kein Task läuft:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Fehlerbehebung {#troubleshooting}

| Symptom | Ursache und Lösung |
|---|---|
| Runner-Log: `k8s executor is only available in the proprietary build` | Der Runner ist ein Community-Build. Verwenden Sie `semaphoreui/runner` oder die offizielle Binärdatei. |
| Runner-Log: `failed to initialise executor provider` mit `unable to load in-cluster configuration` | Der Runner läuft außerhalb eines Clusters und `kubeconfig` ist leer, oder der kubeconfig-Pfad ist falsch. |
| Task: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | RBAC fehlt oder ist in einem anderen Namespace gebunden. Prüfen Sie mit `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Task: `create pod ...: namespaces "semaphore" not found` | Erstellen Sie den Namespace; der Runner tut das nicht. |
| Task: `create pod ...: violates PodSecurity "restricted"` | Versehen Sie den Namespace mit dem Label `pod-security.kubernetes.io/enforce: baseline`. |
| Task bleibt ohne Ausgabe im Status **Running** | Der Pod hängt in `Pending`: Kein Node passt, das Image kann nicht gepullt werden (`ImagePullBackOff`), oder eine Quota blockiert ihn. Der Runner wartet, bis der Pod fertig ist. Prüfen Sie `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` und stoppen Sie den Task. |
| Task: `pod ... finished with status Failed` | Der Klon oder die App ist fehlgeschlagen. Das Log darüber zeigt die Ausgabe von `git-clone` und `build`. |
| `interpreter python3 not found in image` | Dem Build-Image fehlt die App-Binärdatei; setzen Sie ein anderes Image oder das **Executor image** des Templates. |
| `No user exists for uid ...` (OpenShift) | `/etc/passwd` des Images ist nicht für die Gruppe beschreibbar. Siehe [Eigenes Image bauen](./#build-a-custom-image). |

## Verwandte Seiten {#related-pages}

- [Executoren](/admin-guide/executors): wie Container-Tasks ablaufen, Images, Einschränkungen.
- [Docker-Executor](./docker): dasselbe Modell auf einem Docker-Host.
- [Kubernetes-Installation](/admin-guide/installation/k8s): der Server und das Runner-Deployment.
- [Executor-Image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): ein anderes Image für ein einzelnes Template.
