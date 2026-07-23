# Kubernetes executor (Pro)

:::info Pro feature
This feature is available in Semaphore UI Pro.
:::

The Kubernetes executor runs every task in an ephemeral Kubernetes Pod. The runner calls the Kubernetes API and creates one Pod per task; when the task finishes, the Pod and all per-task resources are deleted.

Use the Kubernetes executor to:

- Offload task execution to a cluster instead of the runner host.
- Get cluster-level scheduling, isolation, and resource management for every task.
- Run the runner itself as a lightweight process — inside the cluster (as a Deployment) or outside it.

Prerequisites:

- A Kubernetes cluster the runner can reach.
- A namespace for task Pods (default `semaphore`).
- A service account with permission to manage Pods, Secrets, and ConfigMaps in that namespace (see [RBAC](#rbac-permissions)).

## How it works

For each task the executor performs the following steps:

1. **Prepare.** The runner computes the task's build plan and creates the per-task Kubernetes resources: one Secret per SSH key, a Secret with Ansible vault passwords, a Secret with the extra-variables JSON, a ConfigMap with the static inventory (each only when applicable), and finally the task Pod that references them.
2. **Clone.** A `git-clone` **init container** (the `helper_image`) clones the repository into `/workspace/repo` on a shared `emptyDir` volume. Private repositories are cloned using the repository's SSH key via `ssh-agent`. This step is skipped for local-path repositories.
3. **Build.** The `build` container (the `image`) starts once the clone succeeds, with the workspace volume at `/workspace` and secret volumes mounted under `/secrets`. It runs the task's command — `ansible-playbook`, the Terraform sequence, or your shell script — with the working directory set to `/workspace/repo`. Logs from all containers stream live into the task log; the Pod's terminal phase (`Succeeded`/`Failed`) decides the task result.
4. **Cleanup.** The Pod is deleted (with the configured grace period), then every Secret and ConfigMap the executor created — also when the task fails or is stopped.

The runner polls the Pod's status every `poll_interval_seconds` and streams each container's logs as soon as it starts, so long Ansible runs are visible in real time.

Every resource the executor creates is labeled (`semaphoreui.com/task-id`, `semaphoreui.com/runner`), so you can observe or garbage-collect task resources with label selectors.

### Secrets

Task secrets are delivered as native Kubernetes objects, created just before the Pod and deleted right after it:

| Mounted at | Backed by | Content |
|------------|-----------|---------|
| `/secrets/ssh/<key-id>/id_rsa` | Secret | SSH private key (plus optional `passphrase` file) |
| `/secrets/vault/<name>` | Secret | Ansible vault password file |
| `/secrets/extra-vars/values.json` | Secret | Extra variables passed to Ansible via `--extra-vars @file` |
| `/secrets/inventory/…` | ConfigMap | Static (database-stored) inventory file |

Environment-type secrets from Variable Groups are delivered to the build container through an `envFrom` Secret, so they never appear in the Pod spec's command or plain env. All secret mounts are read-only, per-task, and mounted only into that task's Pod.

## Configuration

Set the runner's executor type to `k8s` and configure the `k8s` subsection:

```json
{
  "runner": {
    "token_file": "/path/to/token",
    "executor": {
      "type": "k8s",
      "k8s": {
        "kubeconfig": "/home/semaphore/.kube/config",
        "namespace": "semaphore",
        "image": "semaphoreui/job:latest",
        "helper_image": "semaphoreui/helper:latest",
        "service_account": "semaphore-jobs",
        "pull_secrets": "regcred"
      }
    }
  }
}
```

### Options

| Option | Env variable | Default | Description |
|--------|--------------|---------|-------------|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | — | Path to a kubeconfig file. When empty, **in-cluster** configuration is used (the service-account token and CA certificate mounted by Kubernetes). |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace where task Pods are created. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Image for the `build` container. Must provide the tools your tasks need (`ansible-playbook`, `terraform`, `bash`, …). |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image for the `git-clone` init container. Must provide `git` and `ssh`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Service account the task Pods run under. |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | Comma-separated list of `imagePullSecrets` names attached to each Pod, for pulling images from private registries. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | How often the executor polls Pod status. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Grace period when deleting Pods (`TERM` → `KILL`). |

### Running the runner inside the cluster

Deploy the runner as a Deployment in the task namespace and leave `kubeconfig` empty — the executor authenticates with the Pod's own service-account credentials. Grant that service account the RBAC role below.

### Running the runner outside the cluster

Set `kubeconfig` to a kubeconfig file whose current context points at the cluster. This is also convenient for development and for managed clusters (EKS/GKE/AKS) where the kubeconfig handles authentication.

## RBAC permissions

The credentials the **runner** uses (its kubeconfig user or in-cluster service account) must be able to manage task resources in the configured namespace:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: semaphore-runner
  namespace: semaphore
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["create", "get", "list", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["create", "delete"]
```

Bind it to the runner's service account with a `RoleBinding`. The `service_account` option, by contrast, controls what the **task Pods themselves** can do; it needs no special permissions unless your playbooks talk to the Kubernetes API.

## Choosing images

The same image requirements apply as for the [Docker executor](/admin-guide/runners/docker-executor#choosing-images): `sh` must exist in the build image, and the task's interpreter or tool must be on `PATH`.

Two Kubernetes-specific notes:

- The executor sets `HOME=/workspace` in the containers, so images that run as an arbitrary non-root user (e.g. OpenShift's random UIDs) work without a writable home directory in the image.
- Secret files are mounted world-readable **inside the Pod** (mode `0444`), because the build container may run as any UID. This is scoped to the task's own ephemeral Pod — the Secret objects exist only for the task's duration and are never shared between tasks.

## Limitations

- Local-path repositories cannot be cloned into a Pod; the workspace starts empty for such repositories.
- Templates cannot yet override the container image per task — the image is fixed per runner. Register multiple runners with different images (and use runner tags) if you need multiple toolchains.
