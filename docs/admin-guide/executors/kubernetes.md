---
title: Kubernetes executor
description: Run every task of a runner in its own Kubernetes Pod, with service account and RBAC manifests, runner settings, a configuration reference and troubleshooting.
sidebar_custom_props:
  edition: enterprise
---

# Kubernetes executor <FeatureState feature="k8s-executor" />

With the Kubernetes executor a runner creates one Pod per task in a namespace, streams
its log into Semaphore and deletes the Pod when the task ends. The runner can run in
the cluster (recommended) or outside it with a kubeconfig.

How a container task runs, what is inside the container and what is not supported is
described in [Executors](./#how-a-container-task-runs). This page covers the Kubernetes
setup.

## Before you begin {#before-you-begin}

- A Semaphore server with an Enterprise license.
- A runner deployed in the cluster, see [Install a runner on Kubernetes](/admin-guide/installation/k8s#runner).
  The steps below use its namespace `semaphore` and Deployment `semaphore-runner`. For a
  runner outside the cluster, see [Runner outside the cluster](#runner-outside-the-cluster).
- `kubectl` with rights to create service accounts and RBAC objects in that namespace.
- The cluster can pull `semaphoreui/job` and `semaphoreui/helper` (or your own images).

## What the runner creates {#what-the-runner-creates}

For a task with ID `42` the runner creates, in its namespace:

| Object | Name | Content |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Init container `git-clone` (helper image) and container `build` (build image), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | One per SSH key, mounted at `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Ansible vault passwords. |
| Secret | `<pod>-extra-vars` | `values.json` with the extra variables. |
| Secret | `<pod>-env` | Variable Group secrets of type *Environment variable* and `SEMAPHORE_JWT`, injected with `envFrom`. |
| ConfigMap | `<pod>-inventory` | A static inventory. |

Only the objects the task needs are created. All of them carry the label
`semaphoreui.com/runner=semaphore`; the Pod also has `semaphoreui.com/task-id=42`. The
runner deletes them all when the task ends, also after a failure or **Stop**.

## Set up {#set-up}

### Step 1. Create the service accounts {#step-1-create-the-service-accounts}

The runner needs one service account to create task Pods. The task Pods get a second
one, with no permissions and no API token, so a playbook cannot use the runner's rights.

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

### Step 2. Grant the runner its permissions {#step-2-grant-the-runner-its-permissions}

This is the complete list of API calls the executor makes:

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

A `Role`, not a `ClusterRole`: the runner can touch only its own namespace.

### Step 3. Switch the runner to the Kubernetes executor {#step-3-switch-the-runner-to-the-kubernetes-executor}

Task Pods do not set a `securityContext`, so a namespace that enforces the `restricted`
Pod Security level rejects them. Allow `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Give the runner Pod its service account and the executor settings. In the runner
Deployment, add to `spec.template.spec`:

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

With no `kubeconfig` set, the runner uses the in-cluster credentials of
`semaphore-runner`. Tasks no longer run in the runner Pod, so you can lower its
`resources` (for example `100m` CPU and `256Mi` memory).

### Step 4. Run a task {#step-4-run-a-task}

Route a template to the runner and start a task. Watch its Pod appear and go away:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

The task log shows:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Examples {#examples}

### Runner outside the cluster {#runner-outside-the-cluster}

The runner runs on a VM or in Docker and reaches the API server with a kubeconfig.
Give the kubeconfig the [Role from Step 2](#step-2-grant-the-runner-its-permissions)
and nothing more:

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

The kubeconfig's current context is used.

### Images from a private registry {#images-from-a-private-registry}

Create a pull secret in the namespace and list it in `pull_secrets`; several names are
separated by commas:

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

The secrets are attached to every task Pod, for the build image, the helper image and
a template's **Executor image** alike.

### CPU and memory of task Pods {#cpu-and-memory-of-task-pods}

The executor sets no requests or limits on task Pods. Set defaults for the namespace
with a `LimitRange`; it applies to the `git-clone` and `build` containers:

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

Add a `ResourceQuota` to cap how much all parallel tasks of the namespace may use.

### Restrict the network of task Pods {#restrict-the-network-of-task-pods}

Task Pods carry the `semaphoreui.com/runner=semaphore` label, so a `NetworkPolicy` can
select them. This one allows DNS, the Git server and SSH to the managed hosts only:

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

## Configuration reference {#configuration-reference}

All options live under `runner.executor.k8s` in the runner configuration.

| Option | Environment variable | Default | Description |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Path to a kubeconfig file. Empty: the service account of the runner Pod. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace of task Pods, Secrets and ConfigMaps. Must exist. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Image of the `build` container. A template's **Executor image** overrides it. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image of the `git-clone` init container. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Service account of task Pods. Use one without permissions, see [Step 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | Comma-separated `imagePullSecrets` for task Pods. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | How often the runner reads the Pod status. Lower values start log streaming sooner and cost more API calls. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Grace period of the Pod deletion after the task ends or is stopped. |

Image pull policy follows the Kubernetes default: `Always` for `:latest`, otherwise
`IfNotPresent`.

## Security {#security}

- **Least privilege for the runner.** The [Role](#step-2-grant-the-runner-its-permissions)
  is namespaced and lists only what the executor calls. Do not bind `cluster-admin`.
- **No API access for tasks.** With the default `service_account: default` the task
  Pod gets the token of the namespace's default account. Use a dedicated account with
  `automountServiceAccountToken: false`.
- **A namespace for Semaphore only.** The runner can read nothing, but it can create
  and delete Pods and Secrets there; do not share the namespace with other workloads.
- **Secrets** are separate Kubernetes Secrets per task, mounted read-only (environment
  secrets through `envFrom`, so their values are not in the Pod spec) and deleted with
  the Pod. Whoever can read Secrets in the namespace can read them while the task runs;
  enable [encryption at rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  for Secrets.
- **Network.** Limit what tasks reach with a [NetworkPolicy](#restrict-the-network-of-task-pods).

## Stop and clean up {#stop-and-clean-up}

**Stop** in the UI ends log streaming and deletes the Pod with
`cleanup_grace_seconds`, then its Secrets and ConfigMaps.

If the runner is killed during a task, the task's objects stay in the namespace; the
runner does not collect them on the next start. Remove them when no task is running:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Troubleshooting {#troubleshooting}

| Symptom | Cause and fix |
|---|---|
| Runner log: `k8s executor is only available in the proprietary build` | The runner is a Community build. Use `semaphoreui/runner` or the official binary. |
| Runner log: `failed to initialise executor provider` with `unable to load in-cluster configuration` | The runner is outside a cluster and `kubeconfig` is empty, or the kubeconfig path is wrong. |
| Task: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | RBAC is missing or bound in another namespace. Check `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Task: `create pod ...: namespaces "semaphore" not found` | Create the namespace; the runner does not. |
| Task: `create pod ...: violates PodSecurity "restricted"` | Label the namespace `pod-security.kubernetes.io/enforce: baseline`. |
| Task stays **Running** with no output | The Pod is stuck in `Pending`: no node fits, the image cannot be pulled (`ImagePullBackOff`), or a quota blocks it. The runner waits until the Pod finishes. Check `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` and stop the task. |
| Task: `pod ... finished with status Failed` | The clone or the app failed. The log above shows the output of `git-clone` and `build`. |
| `interpreter python3 not found in image` | The build image lacks the app binary; set another image or the template's **Executor image**. |
| `No user exists for uid ...` (OpenShift) | The image's `/etc/passwd` is not group-writable. See [Build a custom image](./#build-a-custom-image). |

## Related pages {#related-pages}

- [Executors](/admin-guide/executors): how container tasks run, images, limitations.
- [Docker executor](./docker): the same model on a Docker host.
- [Kubernetes installation](/admin-guide/installation/k8s): the server and the runner Deployment.
- [Executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): a different image for one template.
