---
title: Survey variables
description: The six survey variable types, default values, extra-variable or environment delivery, and how values reach each application.
---

# Survey variables

Survey variables are custom input fields you can add to task templates to collect user input when running tasks. Instead of hard-coding values in your playbooks or scripts, you can define custom variables that prompt users for values at runtime.

This feature is useful for:
- Running the same template with different parameters (e.g., configuration values)
- Accepting dynamic input via API calls
- Passing custom parameters in scheduled tasks
- Triggering tasks from integrations with extracted webhook data

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Survey variables vs. Prompts {#survey-variables-vs-prompts}

It's important to understand the difference between survey variables and prompts:

| Feature | Survey Variables | Prompts |
|---------|-----------------|---------|
| **Definition** | Custom fields you create | Predefined template-specific options |
| **Examples** | Environment name, version number, API endpoint | Ansible: `--limit`, `--tags`<br/>Terraform: workspaces |
| **Configuration** | Add in template settings with name and type | Enable via checkboxes in template |
| **Passed as** | Ansible: `--extra-vars`<br/>Terraform: `-var` | Built-in CLI flags |

**Survey variables** are flexible custom fields you define yourself, while **prompts** are built-in options specific to each template type (like Ansible's `--limit` or `--tags` flags).

## Adding survey variables to a template {#adding-survey-variables-to-a-template}

Survey variables are configured in the template settings:

1. Go to **Task Templates** and select your template
2. Navigate to the **Survey Variables** section in template settings
3. Click **Add Survey Variable**
4. Configure the variable:
   - **Name**: Variable name (used in your code)
   - **Title**: Display label shown in the form
   - **Type**: Choose the field type
   - **Pass variable as**: Extra variable (default) or environment variable
   - **Default value**: Optional pre-filled value shown when the task form opens
   - **Required**: Whether the field must be filled
5. Save the template

When users run a task from this template, they'll see a form with your custom survey variables.

## Variable types {#variable-types}

Survey variables support six types:

### String {#string}

Text input field for string values.

**Use cases**: Environment names, branch names, hostnames, file paths

**Example**: A variable named `environment` prompts users to enter "production", "staging", or "development"

### Integer {#integer}

Numeric input field for integer values.

**Use cases**: Port numbers, retry counts, timeouts, resource limits

**Example**: A variable named `timeout_seconds` prompts users to enter "300" or "600"

### Text {#text}

Multiline textarea for longer string values.

**Use cases**: Commit messages, JSON snippets, free-form notes, multi-line configuration

**Example**: A variable named `changelog` where users paste release notes before deployment

### Enum (single-select) {#enum-single-select}

Dropdown menu where the user picks exactly one option from a predefined list.

**Use cases**: Environment type, deployment strategy, boolean-like choices

**Example**: A variable named `deployment_type` with options: "rolling", "blue-green", "canary"

When creating an enum variable, add each option with a display label and value in the variable editor.

### Select (multi-select) {#select-multi-select}

Dropdown where the user can pick one or more options from a predefined list. Selected values are passed as a JSON array (for example `["staging","production"]`), not as a single string.

**Use cases**: Target regions, feature flags, multiple host groups, tag lists

**Example**: A variable named `target_regions` with options `us-east-1`, `eu-west-1`, `ap-southeast-1`

**Constraints**:
- Default values must be chosen from the option list and can include multiple selections
- In Bash, PowerShell, and Python templates, parse the JSON array from the argument or environment value (see examples below)

### Secret {#secret}

Password input field where the value is hidden.

**Use cases**: API keys, passwords, tokens, sensitive configuration

**Example**: A variable named `api_token` where the entered value appears as dots for security

## Default values {#default-values}

You can set an optional default for most variable types. When a user opens the task run dialog, fields are pre-filled with these defaults.

- **String, integer, text, secret**: a single default value
- **Enum**: one option from the list
- **Select**: one or more options from the list

Defaults are useful for schedules and integrations where the same template runs repeatedly with predictable parameters. Users can still change the values before starting a task.

## Pass variable as (target) {#pass-variable-as-target}

Each survey variable can be delivered in one of two ways:

| Setting | Behavior |
|---------|----------|
| **Extra variable** (default) | Passed the app-specific way: Ansible `--extra-vars`, Terraform `-var`, or `name=value` CLI arguments for shell apps |
| **Environment variable** | Set as a process environment variable whose name matches the survey variable name |

Use **Environment variable** when your script or tool reads from the environment instead of CLI flags. For Terraform variables that must follow the `TF_VAR_` convention, name the survey variable `TF_VAR_instance_type` and set the target to environment variable.

Variables with the environment target are **not** duplicated in extra-vars, `-var`, or CLI arguments. Each value is delivered exactly once.

## How survey variables are passed to tasks {#how-survey-variables-are-passed-to-tasks}

Survey variables are passed differently depending on the template type and the **Pass variable as** setting.

**Multi-select (`select` type) values** are JSON-encoded arrays in every delivery path (extra-vars JSON, `-var`, CLI arguments, and environment variables). A selection of options `1` and `2` becomes `["1","2"]`, not a space-separated string.

### Ansible templates {#ansible-templates}

Survey variables are passed as Ansible extra variables using the `--extra-vars` flag.

**Example**: If you define a survey variable named `app_version`:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

When running the task, the user enters "2.5.0" in the survey form, and Ansible receives it as:

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Terraform/OpenTofu templates {#terraformopentofu-templates}

Survey variables are passed as Terraform variables using the `-var` flag.

**Example**: If you define a survey variable named `instance_count`:

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

When running the task, the user enters "3" in the survey form, and Terraform receives it as:

```bash
terraform apply -var="instance_count=3"
```

### Shell/Bash templates {#shellbash-templates}

Survey variables are passed to the Bash script as command-line arguments:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

You can use following code inside the script to parse the arguments to array:

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

For **multi-select** variables, the value is a JSON array string. Parse it with `jq` (ensure `jq` is available in your executor image):

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### PowerShell templates {#powershell-templates}

Survey variables are passed to the running PowerShell script as command-line arguments:

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


To parse the arguments, use the following code in the running script:

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

For **multi-select** variables, parse the JSON array from the argument value:

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Python templates {#python-templates}

Survey variables are passed to the running Python script as command-line arguments:

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

To parse the argument use following code in the running script:

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

For **multi-select** variables, parse the JSON array:

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## Using survey variables {#using-survey-variables}

### Manual task execution {#manual-task-execution}

When running a task from a template with survey variables:

1. Click **Run** on the template
2. A form appears with all defined survey variables
3. Fill in the values for each field
4. Click **Run Task**

The task executes with your provided values passed to the playbook or script.
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

### Scheduled tasks {#scheduled-tasks}

Schedules can include survey variable values to run the same template with different parameters on different schedules.

**Setup:**

1. Add survey variables to your template
2. Create a schedule for that template
3. In the schedule configuration, define values for your survey variables
4. Each scheduled run uses those predefined values

**Example use case**: Run a backup playbook with different retention policies:
- Daily schedule with `retention_days=7`
- Weekly schedule with `retention_days=30`
- Monthly schedule with `retention_days=365`

See the [Schedules](../schedules) documentation for more details.

### Integrations and webhooks {#integrations-and-webhooks}

Integrations can extract values from incoming webhooks and map them to survey variables.

**Setup:**

1. Add survey variables to your template
2. Create an integration that triggers this template
3. Configure value extractors to pull data from the webhook payload
4. Map the extracted values to your survey variables

**Example**: Trigger a deployment when a GitHub release is created:
- Extract the release tag from the webhook payload
- Map it to a survey variable named `release_version`
- The deployment playbook receives the version number

See the [Integrations](../integrations) documentation for more details.

## Best practices {#best-practices}

### Use descriptive names {#use-descriptive-names}

Choose clear, descriptive names for your survey variables that indicate their purpose:
- ✅ Good: `target_environment`, `app_version`, `backup_retention_days`
- ❌ Bad: `env`, `ver`, `days`

### Provide helpful titles {#provide-helpful-titles}

The title appears in the form, so make it user-friendly:
- Variable name: `db_host`
- Title: "Database hostname or IP address"

### Use enum or select for known options {#use-enum-or-select-for-known-options}

When users should choose from a limited set of options, use enum or select instead of string:
- ✅ **Enum** for exactly one choice: production, staging, or development
- ✅ **Select** when multiple choices are valid: several regions or feature flags
- ❌ String field with a note "enter production or staging"

### Use environment variable target deliberately {#use-environment-variable-target-deliberately}

Prefer the default extra-variable delivery unless your playbook, script, or tool explicitly reads from the process environment. Name environment-target variables exactly as the downstream tool expects (for example `TF_VAR_region`).

### Mark required fields appropriately {#mark-required-fields-appropriately}

Only mark fields as required if they're truly necessary. Consider providing sensible defaults in your playbooks for optional fields.

### Validate in your code {#validate-in-your-code}

Don't assume survey variable values are always valid. Add validation logic in your playbooks or scripts:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Use secrets for sensitive data {#use-secrets-for-sensitive-data}

Always use the secret type for sensitive values like API keys, passwords, or tokens. This ensures values are hidden in the UI and logs.

### Combine with Variable Groups {#combine-with-variable-groups}

Survey variables work well with [Variable Groups](../environment):
- Use **Variable Groups** for static configuration shared across tasks
- Use **Survey variables** for values that change per task run

**Example**:
- Variable Group: Database connection details, API endpoints
- Survey variables: Deployment environment, version number, feature flags

## Common use cases {#common-use-cases}

### Environment-specific deployments {#environment-specific-deployments}

Create survey variables for:
- `environment`: enum with options "production, staging, development"
- `app_version`: string for the version to deploy
- `enable_debug`: enum with options "true, false"

### Database operations {#database-operations}

Create survey variables for:
- `db_name`: string for the database name
- `backup_retention_days`: integer for retention policy
- `maintenance_window`: string for the time window

### Infrastructure provisioning {#infrastructure-provisioning}

Create survey variables for:
- `instance_count`: integer for number of instances
- `instance_type`: enum with options "t2.micro, t2.small, t2.medium"
- `region`: enum with AWS regions

### CI/CD pipelines {#cicd-pipelines}

Create survey variables for:
- `git_branch`: string for the branch to build
- `build_type`: enum with options "debug, release"
- `run_tests`: enum with options "true, false"

## Differences from Variable Groups {#differences-from-variable-groups}

| Feature | Survey Variables | Variable Groups |
|---------|-----------------|-----------------|
| **Purpose** | Runtime input per task | Reusable static configuration |
| **When defined** | At task execution time | Pre-configured in project |
| **Use case** | Values that change per run | Shared settings across tasks |
| **Format** | Individual typed fields | JSON format with nested objects |
| **Scope** | Single task run | Multiple templates/inventories |
| **Security** | Secret type hides sensitive values | Secrets tab for sensitive data |

Use survey variables when you need flexibility at runtime, and Variable Groups when you want consistent configuration across multiple task executions.
