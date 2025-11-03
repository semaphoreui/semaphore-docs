# Core Concepts

Understanding these key concepts will help you use Semaphore UI effectively.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Semaphore UI                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web UI     │  │   REST API   │  │   Database   │  │
│  │   (React)    │◄─┤     (Go)     │◄─┤  MySQL/Pg/   │  │
│  │              │  │              │  │   BoltDB     │  │
│  └──────────────┘  └──────┬───────┘  └──────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Task Execution   │
                    │     Engine        │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐           ┌────▼────┐          ┌────▼────┐
   │ Ansible │           │Terraform│          │ Scripts │
   │ Runner  │           │  Runner │          │ Runner  │
   └─────────┘           └─────────┘          └─────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Target Systems   │
                    │  (Servers, Cloud) │
                    └───────────────────┘
```

## Core Components

### 1. Projects

**What**: A project is a workspace that contains all resources for a specific automation scope.

**Why**: Projects help organize different teams, applications, or environments. Each project is independent with its own resources and team members.

**Example Uses**:
- Separate production and development infrastructure
- Isolate different application deployments
- Manage different customer environments
- Organize by team or department

**Key Features**:
- Independent resource management
- Per-project role-based access control
- Separate task history and logs
- Project-level settings and integrations

---

### 2. Repositories

**What**: Git repositories containing your automation code (playbooks, scripts, Terraform configs).

**Why**: Semaphore pulls code from Git repositories, ensuring version control, change tracking, and collaboration.

**Supported Providers**:
- GitHub
- GitLab
- Bitbucket
- Azure DevOps
- Gitea
- Any Git server

**Authentication Options**:
- SSH keys (recommended)
- HTTPS with personal access tokens
- Public repositories (no authentication)

**Key Features**:
- Automatic repository cloning
- Branch/tag selection
- Repository caching for performance
- Webhook support for automated triggers

---

### 3. Key Store

**What**: Secure storage for credentials and secrets used in your automation.

**Why**: Centralized, encrypted credential management prevents hardcoding secrets in your code.

**Types of Keys**:

#### SSH Keys
- Access remote servers
- Authenticate to Git repositories via SSH
- Most secure option for server access

#### Login with Password
- Username/password combinations
- Personal Access Tokens (PATs) for Git over HTTPS
- Sudo credentials for privilege escalation
- Ansible Vault passwords

#### None
- For public repositories or localhost connections
- When no authentication is needed

**Security Features**:
- All secrets encrypted in database
- Passwords never shown after creation
- Role-based access to keys
- Audit logging

---

### 4. Inventory

**What**: A list of target hosts and their variables for automation tasks.

**Why**: Defines where your automation code will run and how to connect to those systems.

**Types**:

#### Static Inventory
- Defined directly in Semaphore UI
- Simple host lists and groups
- Inline host variables
- Good for small, stable environments

#### File Inventory
- Stored in Git repository or on server
- YAML, JSON, or INI format
- Supports complex group structures
- Better for large or dynamic environments

#### Dynamic Inventory
- Generated at runtime from external sources
- NetBox integration available
- Cloud provider inventories (AWS, Azure, GCP)
- Custom scripts

**Example Static Inventory**:
```yaml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
          ansible_host: 192.168.1.10
        web2.example.com:
          ansible_host: 192.168.1.11
    databases:
      hosts:
        db1.example.com:
          ansible_host: 192.168.1.20
```

---

### 5. Variable Groups (Environment)

**What**: Named sets of variables that can be reused across multiple task templates.

**Why**: Centralize configuration, avoid repetition, and manage environment-specific settings.

**Use Cases**:
- Environment-specific configurations (dev, staging, prod)
- API endpoints and credentials
- Feature flags
- Application configuration

**Features**:
- Key-value pairs
- Secret variables (encrypted)
- JSON support for complex values
- Inheritance and composition

**Example**:
```json
{
  "app_version": "1.2.3",
  "api_endpoint": "https://api.prod.example.com",
  "debug_mode": "false",
  "database_host": "db.prod.internal"
}
```

---

### 6. Task Templates

**What**: Definitions of how to execute automation tasks, combining repository, inventory, and variables.

**Why**: Templates allow you to run tasks repeatedly with consistent configuration while allowing parameter customization.

**Supported Task Types**:

#### Ansible
- Run playbooks
- Specify extra variables
- Set verbosity levels
- Limit execution to specific hosts

#### Terraform/OpenTofu
- Plan, apply, destroy
- Workspace management
- Backend configuration
- Variable files

#### Shell/Bash
- Custom scripts from repository
- Arbitrary commands
- Environment variable injection

#### PowerShell
- Windows automation
- Cross-platform support
- Script execution

#### Python
- Python scripts
- Virtual environment support
- Package management

**Task Types**:
- **Task**: Single execution
- **Build**: Creates a versioned artifact
- **Deploy**: Deploys a specific build version

**Template Features**:
- **Survey Variables**: Interactive forms for user input at runtime
- **Parallel Execution**: Allow concurrent runs
- **Scheduling**: Automated periodic execution
- **Environment Variables**: Pass dynamic values
- **Notification Triggers**: Alert on success/failure

---

### 7. Tasks

**What**: Individual execution instances of a task template.

**Why**: Track what was run, when, by whom, and with what results.

**Task Lifecycle**:
1. **Queued**: Waiting to start
2. **Running**: Currently executing
3. **Success**: Completed successfully
4. **Failed**: Encountered an error
5. **Stopped**: Manually canceled

**Task Features**:
- Real-time output streaming
- Full execution logs
- Raw log view
- Task chaining (run tasks in sequence)
- Manual approval steps
- Rollback capabilities

**Information Captured**:
- Start/end time
- Duration
- User who started the task
- Repository version (commit hash)
- All task parameters
- Console output
- Exit code

---

### 8. Schedules

**What**: Automated task execution based on cron expressions.

**Why**: Run routine maintenance, backups, deployments, or monitoring tasks automatically.

**Schedule Types**:
- Cron-based (flexible timing)
- One-time execution
- Recurring patterns

**Cron Expression Examples**:
```
0 2 * * *     # Daily at 2:00 AM
*/15 * * * *  # Every 15 minutes
0 9 * * 1-5   # Weekdays at 9:00 AM
0 0 1 * *     # First day of month at midnight
```

**Features**:
- Enable/disable schedules
- Execution history
- Failure notifications
- Overlapping execution prevention

---

### 9. Runners (Pro Feature)

**What**: Remote agents that execute tasks on behalf of the main Semaphore server.

**Why**: Distribute workload, improve security, access isolated networks, and scale horizontally.

**Use Cases**:
- Execute tasks in different network zones
- Reduce load on main server
- Access systems behind firewalls
- Parallel execution across multiple workers
- Dedicated runners per project or environment

**Architecture**:
```
Semaphore Server ──▶ Runner 1 (DMZ) ──▶ Web Servers
                 └─▶ Runner 2 (Internal) ──▶ Databases
                 └─▶ Runner 3 (Cloud) ──▶ AWS/Azure
```

---

### 10. Integrations

**What**: Connections to external services for enhanced functionality.

**Types**:
- **Authentication**: LDAP, OpenID (GitHub, GitLab, Google, etc.)
- **Notifications**: Email, Slack, Telegram, Microsoft Teams
- **Webhooks**: Trigger tasks from external events
- **API**: Programmatic access to all features

**Common Integration Patterns**:
- Git webhook → Trigger deployment
- Task completion → Slack notification
- API call → Start automation workflow
- LDAP → Centralized user management

---

## How It All Works Together

### Example Workflow: Deploy a Web Application

1. **Setup** (one-time):
   - Create a **Project** called "Web App"
   - Add a **Repository** with your Ansible playbooks
   - Create an **SSH Key** in **Key Store** for server access
   - Define an **Inventory** of web servers
   - Create a **Variable Group** with environment settings

2. **Create Template**:
   - Build a **Task Template** for deployment
   - Select Ansible as the task type
   - Choose the repository, inventory, and variables
   - Add **Survey Variables** for version number input

3. **Execute**:
   - User clicks **Run** on the template
   - Enters version number in survey form
   - Semaphore creates a **Task** instance
   - Task execution begins:
     - Clones repository
     - Connects to servers using SSH key
     - Runs Ansible playbook with variables
     - Streams output to UI
   - Task completes successfully
   - Notification sent to Slack

4. **Automate**:
   - Add a **Schedule** to check for updates nightly
   - Configure Git webhook to trigger on new commits
   - Set up approval workflow for production deployments

---

## Security Model

### Authentication
- Local users (username/password)
- LDAP integration
- OpenID Connect (SSO)
- API tokens

### Authorization
- Project-level roles: Owner, Manager, Task Runner, Guest
- Resource-level permissions
- Read/write/execute controls

### Encryption
- All credentials encrypted at rest
- TLS for communication
- Secure token generation

---

## Data Flow

```
User Action → Web UI → REST API → Database
                          ↓
                    Task Scheduler
                          ↓
                   Task Executor
                          ↓
                  Clone Repository
                          ↓
              Load Inventory & Keys
                          ↓
              Execute (Ansible/etc.)
                          ↓
              Stream Logs to UI
                          ↓
              Store Results in DB
                          ↓
              Send Notifications
```

---

## Best Practices

1. **Organization**:
   - Use projects to separate concerns
   - Group related templates
   - Consistent naming conventions

2. **Security**:
   - Rotate credentials regularly
   - Use SSH keys over passwords
   - Limit user permissions appropriately
   - Enable audit logging

3. **Efficiency**:
   - Reuse variable groups
   - Cache repositories when possible
   - Use runners for distributed execution
   - Set appropriate log retention

4. **Reliability**:
   - Test templates in non-production first
   - Use version control for all code
   - Monitor task execution logs
   - Set up failure notifications

---

## Next Steps

Now that you understand the core concepts:

- **[UI Tour](./ui-tour.md)** - Navigate the interface confidently
- **[Next Steps](./next-steps.md)** - Build your first real workflow
- **[User Guide](../user-guide/README.md)** - Detailed documentation for each component
- **[Administration Guide](../administration-guide/README.md)** - Advanced configuration and management
