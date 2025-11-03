# Projects

Projects are the organizational foundation of Semaphore UI. They provide isolated workspaces where you can manage automation tasks, resources, and team access.

## What is a Project?

A project is a **self-contained workspace** that groups all resources needed for a specific automation scope. Each project operates independently with its own:

- Task templates and execution history
- Git repositories
- Inventories (target hosts)
- Credentials (Key Store)
- Variable groups
- Team members and permissions
- Schedules and integrations

Think of projects as separate environments or domains that don't interfere with each other.

![](../.gitbook/assets/project\_new\_ipad.png)

## Why Use Projects?

Projects help you organize and secure your automation work by:

### 1. Separation of Concerns
- Keep production separate from development
- Isolate different applications or services
- Separate customer environments
- Organize by team or department

### 2. Security & Access Control
- Control who can access which resources
- Assign different roles to team members
- Isolate sensitive credentials
- Audit activity per project

### 3. Organization & Clarity
- Find resources quickly
- Avoid naming conflicts
- Maintain clean task histories
- Simplify troubleshooting

### 4. Team Collaboration
- Share automation within teams
- Delegate task execution safely
- Provide self-service capabilities
- Track who did what and when

## Common Project Structures

### By Environment

Separate projects for each environment stage:

**Projects**:
- `Production Infrastructure`
- `Staging Infrastructure`
- `Development Infrastructure`

**Benefits**:
- Clear separation of production from non-production
- Different team access per environment
- Reduced risk of accidental production changes
- Environment-specific schedules and notifications

### By Application

One project per application or service:

**Projects**:
- `Web Application`
- `API Gateway`
- `Database Cluster`
- `Monitoring Stack`

**Benefits**:
- Application-focused organization
- Team ownership per application
- Independent deployment cycles
- Clear audit trails

### By Team

Organize by organizational structure:

**Projects**:
- `Platform Engineering`
- `Security Team`
- `Database Administration`
- `Network Operations`

**Benefits**:
- Team autonomy
- Aligned with organizational structure
- Clear responsibility boundaries
- Team-specific resources

### By Customer (MSP/Multi-Tenant)

For managed service providers:

**Projects**:
- `Customer A - Production`
- `Customer A - Development`
- `Customer B - Production`
- `Customer B - Development`

**Benefits**:
- Complete customer isolation
- Separate credentials per customer
- Individual billing/reporting
- Customer-specific configurations

### Hybrid Approach

Combine strategies for complex organizations:

**Projects**:
- `Team A - Production - App X`
- `Team A - Development - App X`
- `Team B - Production - App Y`

Choose what makes sense for your organization!

## Creating a Project

### From the Dashboard

1. Click the **"+ New Project"** button
2. Fill in the project details:
   - **Name**: Clear, descriptive name (e.g., "Production Web Services")
   - **Description**: Purpose, scope, or notes (optional but recommended)
   - **Alert**: Enable/disable default notifications
3. Click **"Create"**

You'll be redirected to your new project's dashboard.

### Project Naming Best Practices

**Good Names**:
- `Production Infrastructure`
- `Dev - E-commerce App`
- `Customer XYZ - Production`
- `Security - Compliance Automation`

**Avoid**:
- `Project 1` (too generic)
- `Test` (unclear purpose)
- `Prod` (abbreviations can be ambiguous)
- `New Project` (meaningless)

**Tips**:
- Be specific and descriptive
- Include environment if relevant
- Use consistent naming conventions
- Consider sorting order (prefix with numbers if needed)

## Working Within a Project

Once inside a project, you have access to:

### Dashboard
- Overview of recent activity
- Currently running tasks
- Quick access to templates
- Task statistics

See: [Project Dashboard](#project-dashboard)

### Resources

**Repositories**: Git repos with your code
- Ansible playbooks
- Terraform configurations
- Scripts and utilities

**Inventory**: Target systems
- Static host lists
- Dynamic inventories
- Connection credentials

**Key Store**: Credentials and secrets
- SSH keys
- Passwords and tokens
- Ansible Vault passwords

**Variable Groups**: Reusable configuration
- Environment variables
- Application config
- Feature flags

See: [User Guide](./README.md) for details on each resource.

### Automation

**Task Templates**: Define what to run
- Ansible playbook execution
- Terraform apply/plan
- Script execution

**Schedules**: Automate execution
- Cron-based scheduling
- Automated deployments
- Maintenance windows

**History**: Track everything
- Complete task logs
- Execution audit trail
- Success/failure tracking

### Management

**Team**: User access control
- Add/remove team members
- Assign roles
- Manage permissions

**Integrations**: External services
- Notifications (Slack, email, etc.)
- Webhooks
- API access

**Settings**: Project configuration
- Project details
- Alert preferences
- Task retention policies

**Runners** (Pro): Distributed execution
- Remote execution agents
- Workload distribution
- Network isolation

## Project Dashboard

The project dashboard provides an at-a-glance view:

### Key Information

**Active Tasks** (Top Section):
- Currently running tasks
- Real-time status updates
- Quick access to task logs
- Stop running tasks

**Recent Activity** (Middle Section):
- Last 10-20 completed tasks
- Success/failure indicators
- Quick re-run capability
- Jump to full history

**Quick Actions** (Throughout):
- Run any template
- Create new resources
- Access frequently used items

**Statistics** (If enabled):
- Task success rate
- Total executions
- Most used templates
- Recent failures

### Dashboard Tips

- **Pin Important Templates**: Keep frequently used templates at the top
- **Monitor Active Tasks**: Watch for long-running or stuck tasks
- **Review Failures**: Check recent failed tasks regularly
- **Use Filters**: Filter by template, user, or status

## Team Management

Control who can access your project and what they can do.

### Team Roles

#### Owner
**Permissions**: Everything
- Full administrative control
- Add/remove team members
- Delete the project
- Modify all resources
- Run any task

**Use For**: Project administrators, tech leads

#### Manager
**Permissions**: Most things
- Create/edit/delete resources (templates, repos, etc.)
- Run tasks
- Add/remove team members (except owners)
- View all activity

**Cannot**:
- Delete the project
- Remove owners
- Change ownership

**Use For**: Senior engineers, DevOps team leads

#### Task Runner
**Permissions**: Execute only
- Run existing task templates
- View task logs and history
- View resources (read-only)

**Cannot**:
- Create or modify templates
- Add/edit resources
- Manage team
- Change settings

**Use For**: Developers, junior ops, self-service users

#### Guest
**Permissions**: View only
- View task history
- Read resource configurations
- Access audit logs

**Cannot**:
- Run tasks
- Modify anything
- Execute any operations

**Use For**: Managers, auditors, read-only access

### Adding Team Members

1. Go to **Team** in the left sidebar
2. Click **"+ Add User"**
3. Select user from dropdown (users must exist in Semaphore)
4. Choose role
5. Click **"Add"**

### Changing Roles

1. Find the user in the team list
2. Click the pencil icon (📝)
3. Select new role
4. Save changes

### Removing Team Members

1. Find the user in the team list
2. Click the trash icon (🗑️)
3. Confirm removal

**Note**: Removing a user doesn't delete them from Semaphore, only from this project.

## Project Settings

Access via **Settings** in the left sidebar.

### General Settings

**Project Name**: Update project name
**Description**: Add or modify description
**Alert Settings**: Enable/disable notifications

### Task Settings

**Max Tasks Per Template**: Limit history retention
- Example: Keep last 100 task executions
- Older tasks automatically pruned
- Saves database space

**Task Timeout**: Default timeout for tasks
- Prevent runaway tasks
- Override per template if needed

**Parallel Tasks**: Allow concurrent execution
- Enable for independent tasks
- Disable to prevent conflicts

### Notification Settings

Configure project-level notifications:
- Default channels for alerts
- Success/failure notifications
- Who receives alerts
- Notification templates

See: [Notifications](../administration-guide/notifications.md)

## Project Activity & Audit

The **Activity** page shows a complete audit log:

### What's Logged

- Task executions (who, when, what)
- Resource changes (created, modified, deleted)
- Team member additions/removals
- Role changes
- Settings modifications
- Login attempts (if enabled)

### Using Activity Logs

**For Compliance**:
- Track who deployed to production
- Verify change approval processes
- Audit access to sensitive resources

**For Troubleshooting**:
- See what changed before an issue
- Track down configuration changes
- Identify who made changes

**For Reporting**:
- Generate deployment reports
- Track team activity
- Measure automation usage

### Filtering Activity

- By user
- By action type (created, modified, deleted, executed)
- By date range
- By resource type

## Best Practices

### Project Organization

1. **Start with a clear structure**
   - Plan your project hierarchy
   - Use consistent naming
   - Document project purposes

2. **Don't over-segment**
   - Too many projects = hard to manage
   - Find the right balance
   - Consider shared resources

3. **Use meaningful descriptions**
   - Explain project scope
   - Note any special considerations
   - Include contact information

### Security

1. **Principle of least privilege**
   - Give users minimum needed access
   - Use Guest role for read-only needs
   - Regular access reviews

2. **Separate sensitive environments**
   - Production in separate projects
   - Different credentials per environment
   - Strict production access control

3. **Regular audits**
   - Review team membership
   - Check activity logs
   - Verify permission assignments

### Maintenance

1. **Clean up regularly**
   - Remove unused templates
   - Archive old tasks
   - Delete obsolete resources

2. **Monitor usage**
   - Check task success rates
   - Review failure patterns
   - Optimize frequently run tasks

3. **Document everything**
   - Add template descriptions
   - Comment complex configurations
   - Maintain README in repositories

### Collaboration

1. **Clear responsibilities**
   - Define who owns what
   - Establish approval processes
   - Document runbooks

2. **Communication**
   - Set up notifications
   - Alert on failures
   - Regular team reviews

3. **Training**
   - Onboard new team members
   - Document common procedures
   - Share knowledge

## Project Limitations

Be aware of these considerations:

### Resources Don't Cross Projects
- Templates can't reference resources from other projects
- Each project needs its own repos, keys, inventories
- Consider shared repository pattern if needed

### No Project Templates
- Can't clone projects (yet)
- Manually recreate structure for new projects
- Export/import via API possible

### Team Management
- Users must exist in Semaphore first
- Can't create users from within a project
- Contact admin to create new users

## Troubleshooting

### Can't Create Project
- Check your admin permissions
- Verify Semaphore installation is healthy
- Check database connectivity

### Can't Add Team Members
- Ensure users exist in Semaphore
- Check your role (must be Owner or Manager)
- Verify user isn't already in project

### Resources Not Showing
- Confirm you're in the right project
- Check your role permissions
- Refresh the page

### Tasks Failing
- Verify resources exist in this project
- Check credentials in Key Store
- Review task logs for details
- See: [Troubleshooting](../faq/troubleshooting.md)

## Related Documentation

- **[History](./projects/history.md)** - Understanding task history
- **[Activity](./projects/activity.md)** - Audit logs and activity tracking
- **[Settings](./projects/settings.md)** - Project configuration details
- **[Runners (Pro)](./projects/runners.md)** - Remote execution agents
- **[Team Management](./team.md)** - Detailed team and permissions guide

## Next Steps

Now that you understand projects, dive deeper:

1. **[Task Templates](./task-templates/README.md)** - Define automation tasks
2. **[Repositories](./repositories.md)** - Connect your Git repos
3. **[Key Store](./key-store.md)** - Manage credentials securely
4. **[Inventory](./inventory.md)** - Define target systems

