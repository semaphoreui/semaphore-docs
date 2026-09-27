---
title: "Workflows"
description: Chaining templates into a DAG with task, approval, delay, and note nodes, edge conditions, run monitoring, and permissions.
sidebar_custom_props:
  edition: pro
---

# Workflows <Pro />

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
3. Add the first node: click a kind in the **Palette**, drag it onto the canvas,
   or use the **+** button in the top-right corner of the canvas.
4. Hover a node and click the **+** handle on its output port to add the next
   step. The new node is placed to the right and connected with an
   **On success** edge. You can also connect nodes by dragging from an output
   port to an input port.
5. Click a node to edit it in the **properties panel** on the right: node kind,
   task template and task params, approval timeout and message, delay duration,
   convergence.
6. Click the **condition pill** in the middle of an edge to change its
   condition, or hover it and click **×** to remove the edge.
7. Set a **name** (and optionally a **start version** for run versioning).
8. Fix the problems listed in the **problems** chip in the toolbar, then click
   **Save**.

![Workflow editor](/assets/workflow-editor.webp)

The editor validates the graph as you work. Nodes with a problem show a warning
badge, and the toolbar chip lists every problem; click one to select the node. A
valid workflow must have at least one node, exactly one starting node (no
incoming edges), no cycles, and complete configuration on every executable node.
**Save** stays disabled until the graph is valid.

Need more room for the canvas? Click the chevron on the right edge of the
palette to collapse both the palette and the main navigation to narrow icon
strips; click it again to expand them. The choice is remembered in your browser
and applies only to the workflow editor: other pages always show the full
navigation.

![Quick-add menu](/assets/workflow-editor-quick-add.webp)

### Editor controls {#editor-controls}

<div class="BlockSchema">
    <img src="/docs/assets/workflow-hotkeys.svg" alt="Keyboard shortcuts of the workflow editor" />
</div>

The canvas can be moved and zoomed with the mouse, a trackpad, the buttons in
the bottom-left corner, or the keyboard. Keyboard shortcuts work while the
canvas has focus: click empty canvas first, or press <kbd>Tab</kbd> until the
canvas is focused. <kbd>Tab</kbd> then moves through the nodes; <kbd>Enter</kbd>
on a node selects it and opens its properties (on the run view it opens the
task log). The same navigation works on the run view.

| Action | Mouse | Trackpad | Buttons | Keyboard |
|--------|-------|----------|---------|----------|
| Pan (move the canvas) | Drag empty canvas, or scroll the wheel (vertical) and <kbd>Shift</kbd>+wheel (horizontal) | Two-finger scroll in any direction | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; hold <kbd>Shift</kbd> for larger steps |
| Zoom in / out | <kbd>Ctrl</kbd>+wheel (<kbd>Cmd</kbd>+wheel on macOS); zooms towards the pointer | Pinch | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| Fit the whole graph on screen | — | — | **fit view** | <kbd>0</kbd> |
| Reset the zoom to 100 % | — | — | — | <kbd>1</kbd> |
| Arrange nodes automatically | — | — | **tidy up** | — |

The editor fits the graph on screen when it opens. The current zoom level is
shown under the buttons. Nodes snap to a 20 px grid when you move them.

| Editing action | How |
|----------------|-----|
| Add a node | **+** handle on a node, palette click or drag, the **+** button in the top-right corner, or right-click empty canvas. |
| Connect nodes | Drag from a node's output port (right edge) to another node's input port (left edge). |
| Change an edge condition | Click the condition pill on the edge and pick a condition. |
| Delete the selected node or edge | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> on macOS), the delete button in the properties panel, or **×** on a hovered edge pill. |
| Undo / redo | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> on macOS), or the arrows in the toolbar. Up to 50 steps. |
| Deselect | <kbd>Esc</kbd> closes the properties panel and clears the selection. |

Leaving the editor with unsaved changes asks for confirmation. The dot on the
**Save** button shows that the graph differs from the saved version.

## Node kinds {#node-kinds}

A workflow is built from four kinds of nodes. Every kind is drawn as a card:
an icon tile on the left, the title, and a subtitle with the key settings.
Task, approval and delay nodes have an input port on the left edge and an
output port on the right edge; notes have no ports.

### Task nodes {#task-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Task node card](/assets/workflow-node-task.webp)
</div>

A task node runs a task template. The tile shows the application of the
template (Ansible, Terraform, OpenTofu, Bash, PowerShell, Python), the title is
the template name and the subtitle names the application. You can override
template parameters (inventory, environment, Ansible limit, extra CLI arguments)
per node via **task params** in the properties panel; the subtitle then reads
**custom params**. A task node without a template shows a warning badge and
blocks saving.

### Approval nodes {#approval-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Approval node card](/assets/workflow-node-approval.webp)
</div>

An approval node pauses the run until a user with permission approves or
rejects. Optionally set a timeout (seconds) and an approval message; the
subtitle shows the timeout. When the run reaches an approval node, the run
status changes to **approval** until someone approves or rejects. The approval
card on the run view shows the approval message with **Approve** and **Reject**
buttons for users who may run tasks in the project. A rejected approval fails
the node, and the run continues along the **On failure** or **Always** edges.

### Delay nodes {#delay-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Delay node card](/assets/workflow-node-delay.webp)
</div>

A delay node waits for a configured number of seconds (minimum 1) before
continuing to downstream nodes. Useful for cooling-off periods, maintenance
windows, or spacing out dependent steps. While waiting:

- The run stays in **running** status.
- The run view shows a live countdown on the delay node.
- Downstream nodes connected via edges are not started until the delay completes.

If the workflow run is **stopped** while a delay is active, the delay is
cancelled and the run ends in **stopped** status.

### Note nodes {#note-nodes}

<div class="BlockSchema BlockSchema--xsmall">

![Note node card](/assets/workflow-node-note.webp)

</div>

A note is a free-form annotation on the canvas, drawn as a sticky. Notes do not
execute, have no ports and are never connected by edges; they are for
documentation only and are ignored by validation.

### Convergence {#convergence}

Nodes with multiple incoming edges can require **all** upstream nodes to finish
(default) or **any** one of them. Set **Convergence** in the node property panel;
the card subtitle shows **Any parent** when it is not the default.

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
- **Run view** — the same graph as in the editor, read-only, with live status
  on each node. A status icon in the corner of the card shows success, failure,
  running, waiting for approval, or a delay countdown; the subtitle shows the
  duration. Nodes that have not started yet are dimmed, and the edge leading to
  a running node is animated.
- **Task log** — click a task node that has started to open its task log.
- **Stop** — while a run is `running` or `approval`, users with
  `run_project_tasks` can stop it. All active tasks are stopped, pending
  approvals are rejected, and the run is marked **stopped**.

![Workflow run view](/assets/workflow-run.webp)

![Pending approval on the run view](/assets/workflow-run-approval.webp)

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
[API documentation](/reference/api) for request and response schemas, including
`delay` node fields (`delay_seconds`) and the stop endpoint
(`POST …/runs/{run_id}/stop`).
