---
title: Workflows (Pro)
description: Chaining templates into a DAG with task, approval, delay, and note nodes, edge conditions, run monitoring, and permissions.
---

# Workflows (Pro)

Workflows let you chain multiple task templates into a directed graph (DAG) with
branching, approvals, and timed pauses. A workflow run progresses automatically
as each step finishes — you design the graph once in the visual editor, then
launch runs from the Workflows page.

:::info
Workflows are a **Semaphore Pro** feature. The Workflows menu item appears only
when your subscription includes them.
:::

## Overview {#overview}

A workflow consists of:

- **Nodes** — steps in the graph (run a template, wait for approval, pause for a
  delay, or annotate with a note).
- **Edges** — connections between nodes, each labeled with a **condition** that
  controls when the downstream node starts.

When you start a workflow, Semaphore creates a **workflow run**. The server
drives progression: as tasks complete, approvals are resolved, or delays expire,
downstream nodes are launched according to the edge conditions.

## Creating a workflow {#creating-a-workflow}

1. Open your project and go to **Workflows**.
2. Click **New Workflow**.
3. In the graphical editor:
   - Drag nodes from the palette onto the canvas.
   - Connect nodes by dragging from one node's output handle to another.
   - Click a node or edge to edit its properties in the side panel.
4. Set a **name** (and optionally a **start version** for run versioning).
5. Fix any problems listed in the **Problems** panel, then click **Save**.

![Workflow editor](/assets/workflow-editor.webp)

The editor validates the graph before saving. A valid workflow must have at least
one node, exactly one starting node (no incoming edges), no cycles, and complete
configuration on every executable node.

## Node kinds {#node-kinds}

| Kind | Purpose |
|------|---------|
| **Task** | Runs a task template. You can override template parameters (inventory, environment, Ansible limit, extra CLI arguments) per node via **task params**. |
| **Approval** | Pauses the run until a user with permission approves or rejects. Optionally set a timeout (seconds) and an approval message. |
| **Delay** | Waits for a configured number of seconds before continuing to downstream nodes. Useful for cooling-off periods, maintenance windows, or spacing out dependent steps. |
| **Note** | Free-form annotation on the canvas. Note nodes do not execute and are not connected by edges — they are for documentation only. |

### Convergence {#convergence}

Nodes with multiple incoming edges can require **all** upstream nodes to finish
(default) or **any** one of them. Set **Convergence** in the node property panel.

### Delay nodes {#delay-nodes}

A delay node pauses the workflow run for the configured duration (minimum 1
second). While waiting:

- The run stays in **running** status.
- The run view shows a live countdown on the delay node.
- Downstream nodes connected via edges are not started until the delay completes.

If the workflow run is **stopped** while a delay is active, the delay is
cancelled and the run ends in **stopped** status.

### Approval nodes {#approval-nodes}

When the run reaches an approval node, status changes to **approval** until
someone approves or rejects. Approve/Reject controls appear on the run view.
Rejected approvals fail the run according to the connected edge conditions.

## Edge conditions {#edge-conditions}

Each edge has a condition that determines when the downstream node becomes ready:

| Condition | Downstream starts when the upstream node… |
|-----------|-------------------------------------------|
| **On success** | Finishes successfully (default). |
| **On failure** | Finishes with an error. |
| **Always** | Finishes in any terminal state (success or failure). |

Use **On failure** branches for compensating actions or notifications. Use
**Always** when the next step should run regardless of outcome.

## Running and monitoring {#running-and-monitoring}

- **Run workflow** — starts a new run from the Workflows list.
- **Run view** — full-screen graph with live status on each node (running, success,
  failed, approval, delay countdown).
- **Stop** — while a run is `running` or `approval`, users with
  `run_project_tasks` can stop it. All active tasks are stopped, pending
  approvals are rejected, and the run is marked **stopped**.

Run statuses: `running`, `approval`, `success`, `failed`, `stopped`.

## Run versioning {#run-versioning}

Set **Start version** on the workflow (for example `1.0.0`) to enable version
labels on each run. Semaphore increments the version on successive runs, similar
to build templates.

## Workflow artifacts (set_stats) {#workflow-artifacts-set_stats}

When an Ansible task in a workflow uses `set_stats`, the variables are stored as
**workflow artifacts** for that run. Downstream task nodes in the same run
receive them as extra variables automatically.

:::warning
If steps in the workflow run on **remote runners**, workflow artifacts do not yet
flow across remote-runner steps — they are only passed between tasks executed
locally on the Semaphore server. Plan artifact hand-offs accordingly or keep
artifact-producing and -consuming steps on the same execution path.
:::

## Permissions {#permissions}

- Managing workflows (create, edit, delete) requires project resource management
  permissions.
- Running workflows requires `run_project_tasks`.
- Resolving approvals requires appropriate project access (same users who can run
  tasks in the project).

## API {#api}

Workflow templates and runs are available under
`/api/project/{project_id}/workflows`. See the
[API documentation](/admin-guide/api) for request and response schemas, including
`delay` node fields (`delay_seconds`) and the stop endpoint
(`POST …/runs/{run_id}/stop`).
