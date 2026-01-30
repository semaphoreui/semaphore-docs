# Survey variables

Survey variables are custom input fields you can add to task templates to collect user input when running tasks. Instead of hard-coding values in your playbooks or scripts, you can define custom variables that prompt users for values at runtime.

This feature is useful for:
- Running the same template with different parameters (e.g., configuration values)
- Accepting dynamic input via API calls
- Passing custom parameters in scheduled tasks
- Triggering tasks from integrations with extracted webhook data

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Survey variables vs. Prompts

It's important to understand the difference between survey variables and prompts:

| Feature | Survey Variables | Prompts |
|---------|-----------------|---------|
| **Definition** | Custom fields you create | Predefined template-specific options |
| **Examples** | Environment name, version number, API endpoint | Ansible: `--limit`, `--tags`<br/>Terraform: workspaces |
| **Configuration** | Add in template settings with name and type | Enable via checkboxes in template |
| **Passed as** | Ansible: `--extra-vars`<br/>Terraform: `-var` | Built-in CLI flags |

**Survey variables** are flexible custom fields you define yourself, while **prompts** are built-in options specific to each template type (like Ansible's `--limit` or `--tags` flags).

## Adding survey variables to a template

Survey variables are configured in the template settings:

1. Go to **Task Templates** and select your template
2. Navigate to the **Survey Variables** section in template settings
3. Click **Add Survey Variable**
4. Configure the variable:
   - **Name**: Variable name (used in your code)
   - **Title**: Display label shown in the form
   - **Type**: Choose the field type
   - **Required**: Whether the field must be filled
5. Save the template

When users run a task from this template, they'll see a form with your custom survey variables.

## Variable types

Survey variables support four different types:

### String

Text input field for string values.

**Use cases**: Environment names, branch names, hostnames, file paths

**Example**: A variable named `environment` prompts users to enter "production", "staging", or "development"

### Integer

Numeric input field for integer values.

**Use cases**: Port numbers, retry counts, timeouts, resource limits

**Example**: A variable named `timeout_seconds` prompts users to enter "300" or "600"

### Enum (Dropdown)

Dropdown menu with predefined options.

**Use cases**: Multiple choice selections, environment types, deployment strategies

**Example**: A variable named `deployment_type` with options: "rolling", "blue-green", "canary"

When creating an enum variable, define the available options as a comma-separated list.

### Secret

Password input field where the value is hidden.

**Use cases**: API keys, passwords, tokens, sensitive configuration

**Example**: A variable named `api_token` where the entered value appears as dots for security

## How survey variables are passed to tasks

Survey variables are passed differently depending on the template type:

### Ansible templates

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

### Terraform/OpenTofu templates

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

### Shell/Bash templates

Survey variables are passed to the Bash script as command-line arguments:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

You can use following code inside the script to parse the arguments to array:

```bash
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  declare -A args
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

### PowerShell templates

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

### Python templates

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

## Using survey variables

### Manual task execution

When running a task from a template with survey variables:

1. Click **Run** on the template
2. A form appears with all defined survey variables
3. Fill in the values for each field
4. Click **Run Task**

The task executes with your provided values passed to the playbook or script.
<!-- 
### API calls

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

### Scheduled tasks

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

See the [Schedules](../schedules.md) documentation for more details.

### Integrations and webhooks

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

See the [Integrations](../integrations.md) documentation for more details.

## Best practices

### Use descriptive names

Choose clear, descriptive names for your survey variables that indicate their purpose:
- ✅ Good: `target_environment`, `app_version`, `backup_retention_days`
- ❌ Bad: `env`, `ver`, `days`

### Provide helpful titles

The title appears in the form, so make it user-friendly:
- Variable name: `db_host`
- Title: "Database hostname or IP address"

### Use enums for known options

When users should choose from a limited set of options, use enum type instead of string:
- ✅ Enum with options: "production, staging, development"
- ❌ String field with a note "enter production or staging"

### Mark required fields appropriately

Only mark fields as required if they're truly necessary. Consider providing sensible defaults in your playbooks for optional fields.

### Validate in your code

Don't assume survey variable values are always valid. Add validation logic in your playbooks or scripts:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Use secrets for sensitive data

Always use the secret type for sensitive values like API keys, passwords, or tokens. This ensures values are hidden in the UI and logs.

### Combine with Variable Groups

Survey variables work well with [Variable Groups](../environment.md):
- Use **Variable Groups** for static configuration shared across tasks
- Use **Survey variables** for values that change per task run

**Example**:
- Variable Group: Database connection details, API endpoints
- Survey variables: Deployment environment, version number, feature flags

## Common use cases

### Environment-specific deployments

Create survey variables for:
- `environment`: enum with options "production, staging, development"
- `app_version`: string for the version to deploy
- `enable_debug`: enum with options "true, false"

### Database operations

Create survey variables for:
- `db_name`: string for the database name
- `backup_retention_days`: integer for retention policy
- `maintenance_window`: string for the time window

### Infrastructure provisioning

Create survey variables for:
- `instance_count`: integer for number of instances
- `instance_type`: enum with options "t2.micro, t2.small, t2.medium"
- `region`: enum with AWS regions

### CI/CD pipelines

Create survey variables for:
- `git_branch`: string for the branch to build
- `build_type`: enum with options "debug, release"
- `run_tests`: enum with options "true, false"

## Differences from Variable Groups

| Feature | Survey Variables | Variable Groups |
|---------|-----------------|-----------------|
| **Purpose** | Runtime input per task | Reusable static configuration |
| **When defined** | At task execution time | Pre-configured in project |
| **Use case** | Values that change per run | Shared settings across tasks |
| **Format** | Individual typed fields | JSON format with nested objects |
| **Scope** | Single task run | Multiple templates/inventories |
| **Security** | Secret type hides sensitive values | Secrets tab for sensitive data |

Use survey variables when you need flexibility at runtime, and Variable Groups when you want consistent configuration across multiple task executions.
