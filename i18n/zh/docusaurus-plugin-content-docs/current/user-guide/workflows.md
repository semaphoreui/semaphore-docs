---
title: "工作流"
sidebar_custom_props:
  edition: pro
---

# 工作流 <Pro />

工作流（Workflow）可以将多个任务模板（Task Templates）串联成一个有向图（DAG），
支持分支、审批和定时暂停。工作流运行会在每个步骤完成后自动推进——你只需在
可视化编辑器中设计一次图，然后从 Workflows 页面启动运行。

:::info
工作流是 **Semaphore Pro** 功能。只有当你的订阅包含工作流时，Workflows
菜单项才会显示。
:::

## 概述 {#overview}

一个工作流由以下部分组成：

- **节点（Nodes）**——图中的步骤（运行模板、等待审批、延迟暂停，或用备注进行
  标注）。
- **边（Edges）**——节点之间的连接，每条边都带有一个**条件**，用于控制下游节点
  何时启动。

启动工作流时，Semaphore 会创建一个**工作流运行（workflow run）**。服务器驱动
整个推进过程：当任务（Task）完成、审批被处理或延迟到期时，下游节点会根据边的
条件被启动。

## 创建工作流 {#creating-a-workflow}

1. 打开项目（Project），进入 **Workflows**。
2. 点击 **New Workflow**。
3. 在图形化编辑器中：
   - 将节点从面板拖到画布上。
   - 从一个节点的输出手柄拖到另一个节点，以连接节点。
   - 点击节点或边，在侧面板中编辑其属性。
4. 设置**名称**（以及可选的**起始版本**，用于运行版本控制）。
5. 修复 **Problems** 面板中列出的所有问题，然后点击 **Save**。

![工作流编辑器](/assets/workflow-editor.webp)

编辑器会在保存前验证图。有效的工作流必须至少包含一个节点、恰好一个起始节点
（没有入边）、没有环，并且每个可执行节点的配置都完整。

## 节点类型 {#node-kinds}

| 类型 | 用途 |
|------|---------|
| **Task** | 运行一个任务模板。你可以通过**任务参数（task params）**为每个节点覆盖模板参数（清单、环境、Ansible limit、额外的 CLI 参数）。 |
| **Approval** | 暂停运行，直到有权限的用户批准或拒绝。可选设置超时时间（秒）和审批消息。 |
| **Delay** | 等待配置的秒数后再继续执行下游节点。适用于冷却期、维护窗口或拉开依赖步骤之间的间隔。 |
| **Note** | 画布上的自由格式标注。Note 节点不会执行，也不通过边连接——仅用于文档说明。 |

### 汇聚 {#convergence}

有多条入边的节点可以要求**所有**上游节点完成（默认），或**任意**一个上游节点完成。
在节点属性面板中设置 **Convergence**。

### 延迟节点 {#delay-nodes}

延迟节点会将工作流运行暂停配置的时长（最少 1 秒）。等待期间：

- 运行保持 **running** 状态。
- 运行视图在延迟节点上显示实时倒计时。
- 通过边连接的下游节点在延迟结束前不会启动。

如果在延迟进行期间工作流运行被**停止**，则延迟被取消，运行以 **stopped**
状态结束。

### 审批节点 {#approval-nodes}

当运行到达审批节点时，状态变为 **approval**，直到有人批准或拒绝。运行视图上
会显示 Approve/Reject 控件。被拒绝的审批会根据所连接边的条件使运行失败。

## 边条件 {#edge-conditions}

每条边都有一个条件，决定下游节点何时就绪：

| 条件 | 下游节点启动时机：当上游节点…… |
|-----------|-------------------------------------------|
| **On success** | 成功完成（默认）。 |
| **On failure** | 以错误结束。 |
| **Always** | 以任意终止状态结束（成功或失败）。 |

使用 **On failure** 分支执行补偿操作或发送通知。当下一步无论结果如何都应运行时，
使用 **Always**。

## 运行与监控 {#running-and-monitoring}

- **Run workflow**——从 Workflows 列表启动一次新的运行。
- **运行视图**——全屏图，每个节点都显示实时状态（running、success、failed、
  approval、延迟倒计时）。
- **Stop**——当运行处于 `running` 或 `approval` 状态时，拥有
  `run_project_tasks` 权限的用户可以停止它。所有活动任务会被停止，待处理的
  审批会被拒绝，运行被标记为 **stopped**。

运行状态：`running`、`approval`、`success`、`failed`、`stopped`。

## 运行版本控制 {#run-versioning}

在工作流上设置 **Start version**（例如 `1.0.0`），即可为每次运行启用版本标签。
Semaphore 会在后续运行中递增版本号，与构建模板类似。

## 输出与输入 {#outputs-and-inputs}

任务节点可以将结构化数据交给其后的节点。任务会**产生输出（outputs）**：一个由具名值
组成的 JSON 对象，在任务成功时随任务一起存储。指向下一个任务节点的连接会
**传递输入（inputs）**：它用前一个节点的输出填充该节点模板的调查变量。传递的不是文件，
只有值。

### 产生输出 {#producing-outputs}

由工作流运行启动的每个任务都会收到环境变量 `SEMAPHORE_OUTPUTS_FILE`：一个专为该任务
创建的空文件的路径。任务以 JSON 对象形式写入该文件的内容即成为它的输出。

| 应用 | 如何产生输出 |
|-----|--------------------------|
| **Ansible** | 使用 `ansible.builtin.set_stats` 并设置 `per_host: false`（默认值）。内置的 `semaphore_outputs` 回调插件会将汇总的运行统计写入该文件；按主机划分的统计不属于输出。 |
| **Terraform、OpenTofu、Terragrunt** | 运行成功后自动从 `output -json` 中捕获。任务自己写入文件的值优先于同名的捕获输出。 |
| **Bash、Python、PowerShell、Pulumi** | 由脚本自行写入该文件。 |

```bash
# Bash：写入输出文件
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible：set_stats 会成为输出
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

规则：

- 只有在任务**成功**时才会读取输出。失败或被停止的任务没有输出，因此 **On failure**
  分支不会从失败的节点收到任何内容。
- 输出名称必须匹配 `^[A-Za-z_][A-Za-z0-9_-]*$`。值可以是任意 JSON 值：字符串、数字、
  布尔值、列表或对象。
- 限制：文件最大 256 KB，最多包含 100 个输出，每个输出最大 32 KB。
- 文件不存在或为空表示“没有输出”。如果文件不是 JSON 对象、使用了无效名称或超出限制，
  则会**导致任务失败**，原因会写入任务日志。
- 无法存储的 Terraform 输出——标记为 `sensitive`、过大、名称无效或超出限制——会被跳过，
  并在任务日志和任务的 **Outputs** 面板中列为 **Not captured**。它们绝不会导致任务失败。

### 传递输入 {#delivering-inputs}

点击一条终点为任务节点的连接：其侧面板中有一个 **Inputs** 部分。

- **按名称**（By name，默认）。源节点的每个输出，只要名称与目标模板的某个调查变量相同，
  就会填充该变量。没有匹配变量的输出会被忽略；带连字符的 Terraform 输出名永远不是有效的
  变量名，因此不会被传递。
- **Map inputs explicitly**。勾选此复选框后，只传递你列出的配对：目标模板的一个调查变量
  以及为其提供值的输出键。空列表不传递任何内容。工作流有了已完成的运行后，面板会建议该
  运行产生的键，并标记未被捕获的键。

没有任何连接填充的变量会回退到节点上设置的值，然后回退到变量的默认值。**必填**
（required）变量如果没有值，节点的任务会在启动前失败，并在日志中写入一行指明该变量，
因此运行会沿其 **On failure** 边继续。

值会按变量类型进行转换：`int` 变量接受数字或由数字组成的字符串，`enum` 或 `select`
变量只接受其自身的选项，`string` 或 `text` 变量接受任何值（对象或列表会以紧凑的 JSON
形式传入）。不符合类型的值会被忽略，原因会写入任务日志，并改用回退值。

**审批节点和延迟节点**会透传输出：`task → approval → task` 仍然可以传递数据，并采用
最后一条连接的模式。

**多条连接指向同一节点。** 每条源节点已成功的连接都会提供值。当其中两条连接填充同一个
变量时，显式映射优先于按名称传递；同类的两条连接之间，先创建的连接胜出，因此每次运行
的结果都相同。任务日志会写明胜出的连接。

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### 在哪里查看 {#where-to-see-outputs}

- **运行视图**会在每个产生了输出的节点上显示 *N outputs* 徽标。
- **任务对话框**中有一个 **Outputs** 表格，列出各个值以及 *Not captured* 列表。
- 由连接提供输入的任务，其日志开头会为每个变量写一行，例如
  `Input "image_tag" <- output "image_tag" of node 3 (task #41)`，因此每个值的来源
  就写在该值的上一行。

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### 限制 {#outputs-limitations}

- 输出以明文形式存储，并以明文显示给所有能查看该任务的人。**不要通过输出传递机密信息。**
  `secret` 类型的调查变量不能由连接填充。
- 输出是值，绝不是代码：Ansible 将它们作为字面字符串接收，值中的 Jinja2 表达式不会被
  求值。
- 远程运行器上的任务与服务器上的任务一样产生和接收输出。由运行器的 **Docker** 或
  **Kubernetes** 执行器运行的任务目前还不会产生输出；其日志会说明这一点。

## 环境变量 {#environment-variables}

由工作流启动的任务除了会收到[每个任务都能收到的变量](./tasks#environment-variables)，还会收到：

| 变量 | 值 |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | 工作流 ID |
| `SEMAPHORE_WORKFLOW_RUN_ID` | 当前运行的 ID |
| `SEMAPHORE_WORKFLOW_URL` | 运行页面的链接，例如 `https://semaphore.example.com/project/1/workflows/7/runs/42`（要求在服务器配置中设置 `web_host`） |
| `SEMAPHORE_OUTPUTS_FILE` | 任务写入其[输出](#producing-outputs)的文件路径 |

这些变量会为包括 Ansible 和 Terraform 在内的所有应用设置，也会传递给在远程运行器上执行的任务。

## 权限 {#permissions}

- 管理工作流（创建、编辑、删除）需要项目资源管理权限。
- 运行工作流需要 `run_project_tasks` 权限。
- 处理审批需要相应的项目访问权限（与能在项目中运行任务的用户相同）。

## API {#api}

工作流模板和运行可通过
`/api/project/{project_id}/workflows` 访问。请参阅
[API 文档](/reference/api)了解请求和响应结构，包括
`delay` 节点字段（`delay_seconds`）、边上的 `input_mode` 和 `input_mappings`、
运行详情（`GET …/runs/{run_id}`）中每个任务的 `artifacts` 文档，以及停止端点
（`POST …/runs/{run_id}/stop`）。
