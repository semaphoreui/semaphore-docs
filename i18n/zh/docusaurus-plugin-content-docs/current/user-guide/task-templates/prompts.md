# 提示

提示（Prompts）是每种模板类型特有的预定义标志和选项，启用后可以在运行时进行自定义。与由你自行创建的自定义字段[调查变量](/user-guide/task-templates/survey-vars)不同，提示是内置选项，对应 Ansible、Terraform 及其他工具的特定 CLI 标志。

此功能允许你：
- 在运行时覆盖模板默认值
- 针对特定主机或资源执行
- 通过 CLI 标志控制执行行为
- 通过 API 调用或计划任务（Schedule）传递运行时选项

## 提示与调查变量的对比 {#prompts-vs-survey-variables}

| 特性 | 提示 | 调查变量 |
|---------|---------|-----------------|
| **定义** | 预定义的、特定于模板类型的选项 | 由你创建的自定义字段 |
| **示例** | Ansible：`--limit`、`--tags`<br/>Terraform：工作区、`-destroy` | 环境名称、版本号、自定义参数 |
| **配置方式** | 在模板中通过复选框启用 | 在模板设置中添加，指定名称和类型 |
| **传递方式** | 内置 CLI 标志 | Ansible：`--extra-vars`<br/>Terraform：`-var` |

**提示**是 Semaphore 为特定工具内置的标准化选项，而**调查变量**是你自行定义的灵活自定义字段。

## Ansible 提示 {#ansible-prompts}

对于 Ansible playbook 模板，你可以为以下 CLI 选项启用提示：

### Limit {#limit}

启用 `--limit` 提示，以指定运行 playbook 时要针对的主机。

**CLI 等价命令**：`ansible-playbook playbook.yml --limit webservers`

**使用场景**：
- 只在清单（Inventory）中的部分主机上运行 playbook
- 针对特定服务器进行部署
- 在全面推广之前先在单台主机上测试变更

**示例**：
- 你的清单包含 50 台 Web 服务器
- 启用 Limit 提示
- 运行任务时，指定 `web-01.example.com` 以只针对该服务器
- 或者指定 `webservers:&production` 以针对生产环境的 Web 服务器

### Tags {#tags}

启用 `--tags` 提示，以只运行带有特定标签的任务。

**CLI 等价命令**：`ansible-playbook playbook.yml --tags deploy,restart`

**使用场景**：
- 只执行 playbook 的特定部分
- 运行部署步骤而不执行配置任务
- 快速重启服务而无需完整执行 playbook

**示例**：
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

启用 Tags 提示并输入 `deploy,restart`，即可跳过安装步骤。

### Skip Tags {#skip-tags}

启用 `--skip-tags` 提示，以跳过带有特定标签的任务。

**CLI 等价命令**：`ansible-playbook playbook.yml --skip-tags testing,debug`

**使用场景**：
- 在生产环境中跳过可选任务
- 排除调试或测试任务
- 在不需要时绕过耗时任务

**示例**：使用上面的 playbook，启用 Skip Tags 并输入 `install`，即可跳过软件包安装，只运行部署和重启任务。

### Skip Galaxy install {#skip-galaxy-install}

启用此提示后，用户在运行任务时可以跳过角色和集合的 `ansible-galaxy install` 步骤。

**使用场景**：
- 依赖项已经安装在运行器（Runner）镜像中
- 当 `requirements.yml` 没有变化时，节省重复运行的时间

### Force Galaxy install {#force-galaxy-install}

启用此提示后，用户可以对每个依赖文件强制执行 `ansible-galaxy install --force`，忽略 Semaphore 在多次运行之间保存的依赖校验和。

**CLI 等价命令**：`ansible-galaxy role install -r requirements.yml --force`

**使用场景**：
- 依赖文件引用的是分支而非固定版本，而你需要最新的提交
- 上一次安装使角色或集合处于损坏状态
- 验证 playbook 在一组全新的依赖下能够正常工作

模板级默认值的工作方式请参阅 [Galaxy 依赖](../apps/ansible.md#galaxy-requirements)。

### 启用 Ansible 提示 {#enabling-ansible-prompts}

要启用 Ansible 提示：

1. 进入**任务模板（Task Templates）**，选择你的 Ansible 模板
2. 在模板设置中找到 **Ansible Prompts** 部分
3. 勾选你需要的提示：
   - ☐ **Limit** - 启用 `--limit` 标志
   - ☐ **Tags** - 启用 `--tags` 标志
   - ☐ **Skip Tags** - 启用 `--skip-tags` 标志
   - ☐ **Debug** - 启用详细程度（`-v`）选择
   - ☐ **Skip Galaxy install** - 允许跳过 `ansible-galaxy install`
   - ☐ **Force Galaxy install** - 允许强制执行 `ansible-galaxy install --force`
4. 保存模板

![](/assets/ansible_2.png)

启用后，这些字段会出现在任务运行表单、API 请求和计划任务配置中。

## Terraform/OpenTofu 提示 {#terraformopentofu-prompts}

对于 Terraform 和 OpenTofu 模板，Semaphore 提供了若干内置提示：

### 工作区选择 {#workspace-selection}

选择任务执行时使用的 Terraform 工作区。

**CLI 等价命令**：`terraform workspace select staging`

**使用场景**：
- 管理多个环境（dev、staging、production）
- 为不同配置分离状态文件
- 隔离地测试基础设施变更

**设置**：
1. 在模板的 **Workspaces** 选项卡中创建工作区
2. 工作区选择器会自动出现在任务表单中
3. 用户在运行任务时选择目标工作区

详细设置请参阅 [Terraform 工作区](/user-guide/apps/terraform/workspaces)。

### Destroy 标志 {#destroy-flag}

启用 `-destroy` 标志以销毁基础设施。

**CLI 等价命令**：`terraform apply -destroy`

**使用场景**：
- 清理临时测试环境
- 下线基础设施
- 删除特定资源

**重要**：这是一个破坏性操作。请谨慎使用，并考虑在工作流（Workflow）中要求确认。

### Migrate State 标志 {#migrate-state-flag}

在更改后端配置时启用 `-migrate-state` 标志。

**CLI 等价命令**：`terraform init -migrate-state`

**使用场景**：
- 将状态迁移到另一个后端
- 在不同存储位置之间迁移
- 更新后端配置

### 启用 Terraform 提示 {#enabling-terraform-prompts}

Terraform 提示可在模板设置中配置：

1. 进入**任务模板**，选择你的 Terraform 模板
2. 在模板设置中配置可用的提示：
   - 工作区选择（配置了工作区时自动启用）
   - Destroy 标志选项
   - Migrate state 选项
3. 保存模板

运行 Terraform 任务时，任务表单会显示这些选项。

## Bash、PowerShell 和 Python 提示 {#bash-powershell-and-python-prompts}

对于 Bash、PowerShell 和 Python 模板，提示非常少，因为大部分自定义都通过[调查变量](/user-guide/task-templates/survey-vars)完成。

可用的提示有：

- CLI args
- Branch

这些模板类型更适合使用自定义调查变量向脚本传递参数。

## 使用提示 {#using-prompts}

### 手动执行任务 {#manual-task-execution}

从启用了提示的模板运行任务（Task）时：

1. 点击模板上的 **Run**
2. 弹出包含已启用提示字段的表单
3. 填写你要使用的提示的值（可选字段可以留空）
4. 点击 **Run Task**

任务执行时，你指定的提示值会作为 CLI 标志传递。

### API 调用 {#api-calls}

要通过 API 传递提示值，请将其包含在请求载荷中：

**Ansible 示例：**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**重要**：必须在模板中启用相应的提示，其值才会被接受。如果在未启用提示的情况下通过 API 传递提示值，这些值将被忽略。

### 计划任务 {#scheduled-tasks}

计划任务可以包含提示值，以自定义自动执行的任务：

**示例**：带 Ansible 提示的计划任务
- 每日部署计划，使用 `limit: "production"` 和 `tags: "deploy"`
- 每周维护计划，使用 `tags: "updates,cleanup"`

在计划任务设置中配置提示值，这样每次计划运行都会使用指定的选项。

### 集成与 Webhook {#integrations-and-webhooks}

集成（Integration）可以从 webhook 中提取值并映射到提示：

**示例**：GitHub webhook 触发部署
- 从 webhook 中提取分支名称
- 映射到 Limit 提示以针对特定环境
- 只部署到与该分支环境匹配的服务器

webhook 配置请参阅[集成](../integrations)。

## 最佳实践 {#best-practices}

### 只启用必要的提示 {#enable-only-necessary-prompts}

每个启用的提示都会在任务表单中增加一个字段。只启用用户确实需要自定义的提示。

✅ **好的做法**：为需要针对特定主机的运维团队启用 Limit
❌ **不好的做法**：“以防万一”启用所有提示

### 与调查变量结合使用 {#combine-with-survey-variables}

用提示处理工具特定的 CLI 选项，用调查变量处理自定义参数：

**Ansible 模板示例：**
- **提示**：Limit（哪些主机）、Tags（哪些任务）
- **调查变量**：`app_version`（哪个版本）、`enable_rollback`（自定义逻辑）

### 为 API 用法编写文档 {#document-api-usage}

如果模板通过 API 触发，请记录哪些提示可用及其预期格式：

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### 使用 Limit 进行安全测试 {#use-limit-for-safe-testing}

对可能具有破坏性的 playbook，务必先使用 Limit 提示进行测试：

1. 在模板中启用 Limit 提示
2. 第一次运行：指定 `limit: "test-server-01"`，在一台主机上测试
3. 验证成功
4. 第二次运行：指定 `limit: "production"`，推广到所有主机

### 验证提示组合 {#validate-prompt-combinations}

某些提示组合可能没有意义。请补充文档或验证：

- 同时使用 `--tags deploy` 和 `--skip-tags deploy` 会产生冲突
- 同时指定工作区和 destroy 标志需要格外小心

## 常见使用场景 {#common-use-cases}

### 使用 Limit 渐进式发布 {#gradual-rollout-with-limit}

使用 Ansible Limit 逐步部署到生产环境：

1. 第 1 次运行：`limit: "web-01.example.com"` - 部署到一台服务器
2. 监控是否有问题
3. 第 2 次运行：`limit: "webservers:&canary"` - 部署到金丝雀服务器
4. 验证指标
5. 第 3 次运行：`limit: "webservers:&production"` - 全面发布

### 使用 Tags 选择性执行 {#selective-execution-with-tags}

使用 Tags 只运行 playbook 的特定部分：

**上午**：`tags: "deploy"` - 部署新版本
**下午**：`tags: "config"` - 更新配置
**晚上**：`tags: "restart"` - 使用新配置重启服务

### 使用工作区管理环境 {#environment-management-with-workspaces}

使用 Terraform 工作区选择来管理环境：

- **开发**：选择 `dev` 工作区 - 更廉价的资源，更快的迭代
- **预发布**：选择 `staging` 工作区 - 用于测试的类生产环境
- **生产**：选择 `prod` 工作区 - 完整的生产基础设施

### 使用 Destroy 清理 {#cleanup-with-destroy}

使用 Terraform destroy 清理临时基础设施：

1. 创建测试环境：使用工作区 `test-branch-123` 运行
2. 运行集成测试
3. 清理：启用 destroy 标志并使用工作区 `test-branch-123` 运行

## 故障排查 {#troubleshooting}

### 提示值被忽略 {#prompt-values-ignored}

**问题**：传递了提示值，但没有生效

**解决方法**：确认模板设置中已启用相应的提示。提示必须显式启用。

### 无法指定 limit {#cannot-specify-limit}

**问题**：任务表单中没有出现 Limit 字段

**解决方法**：
1. 编辑模板
2. 找到 “Ansible Prompts” 部分
3. 勾选 “Limit” 复选框
4. 保存模板

### 带提示值的 API 调用失败 {#api-calls-fail-with-prompt-values}

**问题**：带提示值的 API 请求返回错误

**解决方法**：
1. 确保模板中已启用提示
2. 检查请求体中的 JSON 格式
3. 确认字段名称完全匹配（是 `limit`，不是 `host_limit`）

### Tags 没有过滤任务 {#tags-not-filtering-tasks}

**问题**：指定了标签，但所有任务仍然运行

**解决方法**：
1. 确认 playbook 中的任务定义了正确的标签
2. 检查标签名称是否有拼写错误
3. 确保标签以逗号分隔且不含空格：应为 `deploy,restart` 而不是 `deploy, restart`

## 相关文档 {#related-documentation}

- [调查变量](/user-guide/task-templates/survey-vars) - 模板的自定义字段
- [Ansible 模板](/user-guide/apps/ansible) - Ansible 特定配置
- [Terraform 模板](/user-guide/apps/terraform) - Terraform 特定配置
- [计划任务](../schedules) - 自动执行任务
- [集成](../integrations) - 由 webhook 触发的任务
- [API 文档](../../reference/api) - API 参考
