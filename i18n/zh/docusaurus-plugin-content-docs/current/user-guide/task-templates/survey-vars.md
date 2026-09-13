# 调查变量

调查变量（Survey Variables）是可以添加到任务模板（Task Templates）中的自定义输入字段，用于在运行任务时收集用户输入。你无需在 playbook 或脚本中硬编码值，而是可以定义自定义变量，在运行时提示用户输入。

此功能适用于：
- 使用不同参数运行同一个模板（例如配置值）
- 通过 API 调用接受动态输入
- 在计划任务（Schedule）中传递自定义参数
- 使用从 webhook 中提取的数据，通过集成（Integration）触发任务

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## 调查变量与提示的对比 {#survey-variables-vs-prompts}

理解调查变量与提示（Prompts）之间的区别非常重要：

| 特性 | 调查变量 | 提示 |
|---------|-----------------|---------|
| **定义** | 由你创建的自定义字段 | 预定义的、特定于模板类型的选项 |
| **示例** | 环境名称、版本号、API 端点 | Ansible：`--limit`、`--tags`<br/>Terraform：工作区 |
| **配置方式** | 在模板设置中添加，指定名称和类型 | 在模板中通过复选框启用 |
| **传递方式** | Ansible：`--extra-vars`<br/>Terraform：`-var` | 内置 CLI 标志 |

**调查变量**是你自行定义的灵活自定义字段，而**提示**是每种模板类型特有的内置选项（例如 Ansible 的 `--limit` 或 `--tags` 标志）。

## 向模板添加调查变量 {#adding-survey-variables-to-a-template}

调查变量在模板设置中配置：

1. 进入**任务模板**，选择你的模板
2. 在模板设置中找到 **Survey Variables** 部分
3. 点击 **Add Survey Variable**
4. 配置变量：
   - **Name**：变量名称（在代码中使用）
   - **Title**：表单中显示的标签
   - **Type**：选择字段类型
   - **Pass variable as**：额外变量（默认）或环境变量
   - **Default value**：可选的预填值，在打开任务表单时显示
   - **Required**：该字段是否必填
5. 保存模板

当用户从此模板运行任务时，会看到包含你自定义调查变量的表单。

## 变量类型 {#variable-types}

调查变量支持六种类型：

### String {#string}

用于字符串值的文本输入字段。

**使用场景**：环境名称、分支名称、主机名、文件路径

**示例**：名为 `environment` 的变量提示用户输入 “production”、“staging” 或 “development”

### Integer {#integer}

用于整数值的数字输入字段。

**使用场景**：端口号、重试次数、超时时间、资源限制

**示例**：名为 `timeout_seconds` 的变量提示用户输入 “300” 或 “600”

### Text {#text}

用于较长字符串值的多行文本区域。

**使用场景**：提交信息、JSON 片段、自由格式的备注、多行配置

**示例**：名为 `changelog` 的变量，用户在部署前粘贴发行说明

### Enum（单选） {#enum-single-select}

下拉菜单，用户从预定义列表中恰好选择一个选项。

**使用场景**：环境类型、部署策略、类布尔值的选择

**示例**：名为 `deployment_type` 的变量，选项为 “rolling”、“blue-green”、“canary”

创建 enum 变量时，在变量编辑器中为每个选项添加显示标签和值。

### Select（多选） {#select-multi-select}

下拉菜单，用户可以从预定义列表中选择一个或多个选项。所选值以 JSON 数组形式传递（例如 `["staging","production"]`），而不是单个字符串。

**使用场景**：目标区域、功能开关、多个主机组、标签列表

**示例**：名为 `target_regions` 的变量，选项为 `us-east-1`、`eu-west-1`、`ap-southeast-1`

**限制**：
- 默认值必须从选项列表中选择，可以包含多个选项
- 在 Bash、PowerShell 和 Python 模板中，需要从参数或环境变量值中解析 JSON 数组（请参阅下面的示例）

### Secret {#secret}

密码输入字段，值会被隐藏。

**使用场景**：API 密钥、密码、令牌、敏感配置

**示例**：名为 `api_token` 的变量，出于安全考虑，输入的值显示为圆点

## 默认值 {#default-values}

大多数变量类型都可以设置可选的默认值。当用户打开任务运行对话框时，字段会用这些默认值预先填充。

- **String、integer、text、secret**：单个默认值
- **Enum**：列表中的一个选项
- **Select**：列表中的一个或多个选项

默认值对于计划任务和集成很有用，因为同一个模板会以可预期的参数反复运行。用户在启动任务前仍然可以更改这些值。

## 变量传递方式（目标） {#pass-variable-as-target}

每个调查变量可以通过以下两种方式之一传递：

| 设置 | 行为 |
|---------|----------|
| **Extra variable**（默认） | 以应用特定的方式传递：Ansible 使用 `--extra-vars`，Terraform 使用 `-var`，shell 类应用使用 `name=value` 形式的 CLI 参数 |
| **Environment variable** | 设置为进程环境变量，其名称与调查变量名称相同 |

当你的脚本或工具从环境变量而不是 CLI 标志读取值时，请使用 **Environment variable**。对于必须遵循 `TF_VAR_` 约定的 Terraform 变量，将调查变量命名为 `TF_VAR_instance_type`，并将目标设置为环境变量。

目标为环境变量的变量**不会**重复出现在 extra-vars、`-var` 或 CLI 参数中。每个值只会传递一次。

## 调查变量如何传递给任务 {#how-survey-variables-are-passed-to-tasks}

调查变量的传递方式取决于模板类型和 **Pass variable as** 设置。

**多选（`select` 类型）值**在所有传递路径中（extra-vars JSON、`-var`、CLI 参数和环境变量）都是 JSON 编码的数组。选择选项 `1` 和 `2` 会得到 `["1","2"]`，而不是以空格分隔的字符串。

### Ansible 模板 {#ansible-templates}

调查变量通过 `--extra-vars` 标志作为 Ansible 额外变量传递。

**示例**：如果你定义了名为 `app_version` 的调查变量：

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

运行任务时，用户在调查表单中输入 “2.5.0”，Ansible 收到的形式为：

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Terraform/OpenTofu 模板 {#terraformopentofu-templates}

调查变量通过 `-var` 标志作为 Terraform 变量传递。

**示例**：如果你定义了名为 `instance_count` 的调查变量：

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

运行任务时，用户在调查表单中输入 “3”，Terraform 收到的形式为：

```bash
terraform apply -var="instance_count=3"
```

### Shell/Bash 模板 {#shellbash-templates}

调查变量作为命令行参数传递给 Bash 脚本：

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

你可以在脚本中使用以下代码将参数解析为数组：

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

对于**多选**变量，值是一个 JSON 数组字符串。使用 `jq` 解析它（请确保执行器镜像中有 `jq` 可用）：

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### PowerShell 模板 {#powershell-templates}

调查变量作为命令行参数传递给运行中的 PowerShell 脚本：

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


要解析参数，请在运行的脚本中使用以下代码：

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

对于**多选**变量，从参数值中解析 JSON 数组：

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Python 模板 {#python-templates}

调查变量作为命令行参数传递给运行中的 Python 脚本：

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

要解析参数，请在运行的脚本中使用以下代码：

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

对于**多选**变量，解析 JSON 数组：

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## 使用调查变量 {#using-survey-variables}

### 手动执行任务 {#manual-task-execution}

从带有调查变量的模板运行任务（Task）时：

1. 点击模板上的 **Run**
2. 弹出包含所有已定义调查变量的表单
3. 填写每个字段的值
4. 点击 **Run Task**

任务执行时，你提供的值会传递给 playbook 或脚本。
<!-- 
### API calls {#api-calls}

To pass survey variable values via API:

**Example API request:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Survey variable values are passed in the `environment` object of the request payload.

**Important**: The task runs unattended when triggered via API—no interactive prompt appears. -->

### 计划任务 {#scheduled-tasks}

计划任务可以包含调查变量的值，从而在不同的计划中使用不同的参数运行同一个模板。

**设置：**

1. 向模板添加调查变量
2. 为该模板创建计划任务
3. 在计划任务配置中，为调查变量定义值
4. 每次计划运行都会使用这些预定义的值

**示例场景**：使用不同的保留策略运行备份 playbook：
- 每日计划，使用 `retention_days=7`
- 每周计划，使用 `retention_days=30`
- 每月计划，使用 `retention_days=365`

更多详情请参阅[计划任务](../schedules)文档。

### 集成与 Webhook {#integrations-and-webhooks}

集成可以从传入的 webhook 中提取值并映射到调查变量。

**设置：**

1. 向模板添加调查变量
2. 创建触发此模板的集成
3. 配置值提取器，从 webhook 载荷中提取数据
4. 将提取的值映射到你的调查变量

**示例**：在创建 GitHub 发行版时触发部署：
- 从 webhook 载荷中提取发行版标签
- 将其映射到名为 `release_version` 的调查变量
- 部署 playbook 收到版本号

更多详情请参阅[集成](../integrations)文档。

## 最佳实践 {#best-practices}

### 使用描述性名称 {#use-descriptive-names}

为调查变量选择清晰、能表明用途的描述性名称：
- ✅ 好的做法：`target_environment`、`app_version`、`backup_retention_days`
- ❌ 不好的做法：`env`、`ver`、`days`

### 提供有帮助的标题 {#provide-helpful-titles}

标题会显示在表单中，因此要便于用户理解：
- 变量名称：`db_host`
- 标题：“Database hostname or IP address”

### 对已知选项使用 enum 或 select {#use-enum-or-select-for-known-options}

当用户应从有限的选项集合中选择时，使用 enum 或 select 而不是 string：
- ✅ **Enum** 用于恰好选择一项：production、staging 或 development
- ✅ **Select** 用于可以多选的情况：多个区域或功能开关
- ❌ 带有“请输入 production 或 staging”说明的 string 字段

### 有意识地使用环境变量目标 {#use-environment-variable-target-deliberately}

除非你的 playbook、脚本或工具明确从进程环境中读取值，否则优先使用默认的额外变量传递方式。以环境变量为目标的变量，其名称应与下游工具期望的完全一致（例如 `TF_VAR_region`）。

### 合理标记必填字段 {#mark-required-fields-appropriately}

只有在确实必要时才将字段标记为必填。对于可选字段，考虑在 playbook 中提供合理的默认值。

### 在代码中进行验证 {#validate-in-your-code}

不要假定调查变量的值总是有效的。在 playbook 或脚本中添加验证逻辑：

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### 对敏感数据使用 secret {#use-secrets-for-sensitive-data}

对于 API 密钥、密码或令牌等敏感值，务必使用 secret 类型。这可以确保值在 UI 和日志中被隐藏。

### 与变量组结合使用 {#combine-with-variable-groups}

调查变量可以与[变量组（Variable Groups）](../environment)很好地配合：
- 使用**变量组**存放在多个任务间共享的静态配置
- 使用**调查变量**存放每次任务运行时会变化的值

**示例**：
- 变量组：数据库连接信息、API 端点
- 调查变量：部署环境、版本号、功能开关

## 常见使用场景 {#common-use-cases}

### 特定环境的部署 {#environment-specific-deployments}

创建以下调查变量：
- `environment`：enum，选项为 “production, staging, development”
- `app_version`：string，要部署的版本
- `enable_debug`：enum，选项为 “true, false”

### 数据库操作 {#database-operations}

创建以下调查变量：
- `db_name`：string，数据库名称
- `backup_retention_days`：integer，保留策略
- `maintenance_window`：string，维护时间窗口

### 基础设施配置 {#infrastructure-provisioning}

创建以下调查变量：
- `instance_count`：integer，实例数量
- `instance_type`：enum，选项为 “t2.micro, t2.small, t2.medium”
- `region`：enum，AWS 区域

### CI/CD 流水线 {#cicd-pipelines}

创建以下调查变量：
- `git_branch`：string，要构建的分支
- `build_type`：enum，选项为 “debug, release”
- `run_tests`：enum，选项为 “true, false”

## 与变量组的区别 {#differences-from-variable-groups}

| 特性 | 调查变量 | 变量组 |
|---------|-----------------|-----------------|
| **用途** | 每个任务的运行时输入 | 可复用的静态配置 |
| **定义时机** | 任务执行时 | 在项目中预先配置 |
| **使用场景** | 每次运行都会变化的值 | 跨任务共享的设置 |
| **格式** | 独立的类型化字段 | 带嵌套对象的 JSON 格式 |
| **作用范围** | 单次任务运行 | 多个模板/清单 |
| **安全性** | secret 类型隐藏敏感值 | Secrets 选项卡存放敏感数据 |

当你需要运行时的灵活性时使用调查变量，当你希望在多次任务执行中保持一致配置时使用变量组。
