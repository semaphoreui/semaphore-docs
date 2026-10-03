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
3. 添加第一个节点：在 **Palette** 中点击一种节点类型、将其拖到画布上，或使用画布
   右上角的 **+** 按钮。
4. 将鼠标悬停在节点上，点击其输出端口上的 **+** 手柄以添加下一步。新节点会放置在
   右侧，并通过 **On success** 边连接。你也可以从输出端口拖到输入端口来连接节点。
5. 点击节点，在右侧的**属性面板**中编辑它：节点类型、任务模板和任务参数、审批超时
   和消息、延迟时长、汇聚方式。
6. 点击边中间的**条件标签**以更改其条件，或将鼠标悬停在其上并点击 **×** 以删除该边。
7. 设置**名称**（以及可选的**起始版本**，用于运行版本控制）。
8. 修复工具栏中 **problems** 标记所列出的问题，然后点击 **Save**。

![工作流编辑器](/assets/workflow-editor.webp)

编辑器会在你操作的同时验证图。存在问题的节点会显示警告徽标，工具栏标记会列出每个
问题；点击其中一项即可选中对应节点。有效的工作流必须至少包含一个节点、恰好一个起始
节点（没有入边）、没有环，并且每个可执行节点的配置都完整。在图有效之前，**Save**
保持禁用状态。

![快速添加菜单](/assets/workflow-editor-quick-add.webp)

### 编辑器操作 {#editor-controls}

<div class="BlockSchema">
    <img src="/docs/assets/workflow-hotkeys.svg" alt="工作流编辑器的键盘快捷键" />
</div>

画布可以用鼠标、触控板、左下角的按钮或键盘来移动和缩放。键盘快捷键在画布获得
焦点时生效：先点击空白画布，或按 <kbd>Tab</kbd> 直到画布获得焦点。随后 <kbd>Tab</kbd>
在节点之间移动；在节点上按 <kbd>Enter</kbd> 会选中该节点并打开其属性面板（在运行视图
中则打开任务日志）。运行视图中的导航方式相同。

| 操作 | 鼠标 | 触控板 | 按钮 | 键盘 |
|------|------|--------|------|------|
| 平移（移动画布） | 拖动空白画布，或滚动滚轮（垂直）和 <kbd>Shift</kbd>+滚轮（水平） | 双指向任意方向滚动 | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>；按住 <kbd>Shift</kbd> 可加大步长 |
| 放大 / 缩小 | <kbd>Ctrl</kbd>+滚轮（macOS 上为 <kbd>Cmd</kbd>+滚轮）；以指针位置为中心缩放 | 双指捏合 | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| 将整个图适配到屏幕 | — | — | **fit view** | <kbd>0</kbd> |
| 将缩放重置为 100 % | — | — | — | <kbd>1</kbd> |
| 自动排列节点 | — | — | **tidy up** | — |

编辑器打开时会将图适配到屏幕。当前缩放级别显示在按钮下方。移动节点时会对齐到
20 px 网格。

| 编辑操作 | 方法 |
|----------|------|
| 添加节点 | 节点上的 **+** 手柄、在 Palette 中点击或拖动、右上角的 **+** 按钮，或右键点击空白画布。 |
| 连接节点 | 从一个节点的输出端口（右边缘）拖到另一个节点的输入端口（左边缘）。 |
| 更改边的条件 | 点击边上的条件标签并选择一个条件。 |
| 删除选中的节点或边 | <kbd>Delete</kbd>（macOS 上为 <kbd>Cmd</kbd>+<kbd>Backspace</kbd>）、属性面板中的删除按钮，或鼠标悬停在边的条件标签上时显示的 **×**。 |
| 撤销 / 重做 | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>（macOS 上为 <kbd>Cmd</kbd>），或工具栏中的箭头。最多 50 步。 |
| 取消选择 | <kbd>Esc</kbd> 关闭属性面板并清除选择。 |

带着未保存的更改离开编辑器时会要求确认。**Save** 按钮上的圆点表示图与已保存的版本
不同。

## 节点类型 {#node-kinds}

工作流由四种节点组成。每种节点都以卡片的形式绘制：左侧是图标块，然后是标题，
以及显示关键设置的副标题。任务、审批和延迟节点在左边缘有一个输入端口、在右边缘
有一个输出端口；备注没有端口。

### 任务节点 {#task-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![任务节点卡片](/assets/workflow-node-task.webp)
</div>

任务节点运行一个任务模板。图标块显示模板所用的应用（Ansible、Terraform、OpenTofu、
Bash、PowerShell、Python），标题是模板名称，副标题标明应用。你可以在属性面板中通过
**task params** 为每个节点覆盖模板参数（清单、环境、Ansible limit、额外的 CLI 参数）；
此时副标题显示为 **custom params**。没有模板的任务节点会显示警告徽标并阻止保存。

### 审批节点 {#approval-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![审批节点卡片](/assets/workflow-node-approval.webp)
</div>

审批节点会暂停运行，直到有权限的用户批准或拒绝。可选设置超时时间（秒）和审批消息；
副标题显示超时时间。当运行到达审批节点时，运行状态变为 **approval**，直到有人批准或
拒绝。运行视图上的审批卡片会显示审批消息以及 **Approve** 和 **Reject** 按钮，供可以在
项目中运行任务的用户使用。被拒绝的审批会使该节点失败，运行沿 **On failure** 或
**Always** 边继续。

### 延迟节点 {#delay-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![延迟节点卡片](/assets/workflow-node-delay.webp)
</div>

延迟节点会等待配置的秒数（最少 1 秒）后再继续执行下游节点。适用于冷却期、维护窗口
或拉开依赖步骤之间的间隔。等待期间：

- 运行保持 **running** 状态。
- 运行视图在延迟节点上显示实时倒计时。
- 通过边连接的下游节点在延迟结束前不会启动。

如果在延迟进行期间工作流运行被**停止**，则延迟被取消，运行以 **stopped**
状态结束。

### 备注节点 {#note-nodes}

<div class="BlockSchema BlockSchema--xsmall">

![备注节点卡片](/assets/workflow-node-note.webp)

</div>

备注是画布上的自由格式标注，以便签的形式绘制。备注不会执行、没有端口，也永远不会
通过边连接；它们仅用于文档说明，验证时会被忽略。

### 汇聚 {#convergence}

有多条入边的节点可以要求**所有**上游节点完成（默认），或**任意**一个上游节点完成。
在节点属性面板中设置 **Convergence**；当该值不是默认值时，卡片副标题会显示
**Any parent**。

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
- **运行视图**——与编辑器中相同的图，只读，每个节点都显示实时状态。卡片角上的状态
  图标显示成功、失败、运行中、等待审批或延迟倒计时；副标题显示持续时间。尚未启动的
  节点会显示为暗色，通向正在运行节点的边会以动画显示。
- **任务日志**——点击已启动的任务节点即可打开其任务日志。
- **Stop**——当运行处于 `running` 或 `approval` 状态时，拥有
  `run_project_tasks` 权限的用户可以停止它。所有活动任务会被停止，待处理的
  审批会被拒绝，运行被标记为 **stopped**。

![工作流运行视图](/assets/workflow-run.webp)

![运行视图上的待处理审批](/assets/workflow-run-approval.webp)

运行状态：`running`、`approval`、`success`、`failed`、`stopped`。

## 运行版本控制 {#run-versioning}

在工作流上设置 **Start version**（例如 `1.0.0`），即可为每次运行启用版本标签。
Semaphore 会在后续运行中递增版本号，与构建模板类似。

## 修订版本 {#revisions}

每次保存工作流都会创建其图的一个新**修订版本**；编辑器在工作流名称旁显示当前修订版本号。
运行会固定在启动时所用的修订版本：在运行进行中编辑工作流不会改变该运行，已完成的运行会
继续显示它们实际执行的图以及每个节点的状态。没有任何运行引用的修订版本会在保存更新的
版本时被删除。运行详情（`GET …/runs/{run_id}`）包含该运行修订版本的节点和边，
`GET …/workflows/{workflow_id}/revisions` 列出保留下来的修订版本。

## 工作流产物（set_stats） {#workflow-artifacts-set_stats}

当工作流中的 Ansible 任务使用 `set_stats` 时，这些变量会被存储为该次运行的
**工作流产物（workflow artifacts）**。同一运行中的下游任务节点会自动以额外变量
的形式接收它们。

:::warning
如果工作流中的步骤在**远程运行器（Runner）**上执行，工作流产物目前还无法跨远程
运行器步骤传递——它们只在 Semaphore 服务器本地执行的任务之间传递。请据此规划
产物的传递，或将产生和使用产物的步骤放在同一条执行路径上。
:::

## 权限 {#permissions}

- 管理工作流（创建、编辑、删除）需要项目资源管理权限。
- 运行工作流需要 `run_project_tasks` 权限。
- 处理审批需要相应的项目访问权限（与能在项目中运行任务的用户相同）。

## API {#api}

工作流模板和运行可通过
`/api/project/{project_id}/workflows` 访问。请参阅
[API 文档](/reference/api)了解请求和响应结构，包括
`delay` 节点字段（`delay_seconds`）以及停止端点
（`POST …/runs/{run_id}/stop`）。
