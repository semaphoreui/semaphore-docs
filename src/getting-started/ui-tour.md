# UI Tour

Learn to navigate the Semaphore UI like a pro. This tour walks through every major section and feature.

## Dashboard Overview

When you first log in, you see the main dashboard:

```
┌─────────────────────────────────────────────────────────┐
│  Semaphore UI              [Search] 👤 Admin ▼          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Projects                              [+ New]       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Production   │ │ Development  │ │ Infrastructure│   │
│  │ 12 tasks     │ │ 5 tasks      │ │ 8 tasks      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                          │
│  📝 Recent Activity                                     │
│  • Deploy completed - Production - 2 min ago            │
│  • Backup running - Infrastructure - 5 min ago          │
│  • Update failed - Development - 10 min ago             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Top Navigation Bar

- **Logo/Home**: Click to return to dashboard
- **Search**: Quick access to projects, templates, and tasks
- **User Menu**: Profile, settings, logout
- **Admin Panel**: (Admin only) User management, global settings

---

## Project View

After selecting a project, you enter its workspace:

### Left Sidebar Navigation

The sidebar provides access to all project resources:

```
┌─────────────────────┐
│ 📁 My Project       │
├─────────────────────┤
│ 🏠 Dashboard        │ ← Overview and recent activity
│ 📋 Task Templates   │ ← Define automation tasks
│ 📅 Schedules        │ ← Automated task runs
│ 📦 History          │ ← Past task executions
│ 📊 Activity         │ ← Audit log
│                     │
│ Resources           │
│ 📚 Repositories     │ ← Git repos with code
│ 🗂️  Inventory        │ ← Target hosts
│ 🔑 Key Store        │ ← Credentials & secrets
│ 🌍 Variable Groups  │ ← Reusable variables
│                     │
│ Management          │
│ 👥 Team             │ ← User access control
│ 🔌 Integrations     │ ← External services
│ 🏃 Runners (Pro)    │ ← Remote execution agents
│ ⚙️  Settings         │ ← Project configuration
└─────────────────────┘
```

---

## Key Screens in Detail

### 1. Dashboard

**Purpose**: Quick overview of project status and activity

**What You See**:
- Active running tasks (real-time)
- Recently completed tasks
- Quick access to frequently used templates
- Task statistics and success rates
- Upcoming scheduled tasks

**Quick Actions**:
- Run any template directly
- Jump to task details
- View execution history

---

### 2. Task Templates

**Purpose**: Create and manage automation task definitions

**Template List View**:
```
┌─────────────────────────────────────────────────────┐
│ Task Templates                          [+ New]     │
├─────────────────────────────────────────────────────┤
│ Name              Type       Last Run    Actions    │
│ Deploy Web App    Ansible    2 min ago   ▶️ 📝 🗑️  │
│ Backup Database   Shell      1 hour ago  ▶️ 📝 🗑️  │
│ Apply Terraform   Terraform  1 day ago   ▶️ 📝 🗑️  │
└─────────────────────────────────────────────────────┘
```

**Actions**:
- **▶️ Run**: Execute the template now
- **📝 Edit**: Modify template configuration
- **🗑️ Delete**: Remove template (requires confirmation)
- **📅**: Create a schedule for this template
- **📋**: View task history for this template

**Template Details View**:

When creating/editing a template:

**Basic Settings**:
- Name and description
- Task type (Ansible, Terraform, Shell, etc.)
- Build/Deploy/Task designation

**Configuration**:
- Repository: Select source code
- Playbook/script filename
- Inventory: Select target hosts
- Variable Groups: Add environment variables
- Start version: For versioned builds

**Advanced Options**:
- Allow parallel execution
- Suppress log output (for sensitive data)
- Override CLI arguments
- Survey variables (interactive prompts)
- Git branch/tag override

**Notification Settings**:
- Send notifications on success/failure
- Select notification channels

---

### 3. Running a Task

**Run Dialog**:
```
┌──────────────────────────────────────┐
│ Run: Deploy Web App                  │
├──────────────────────────────────────┤
│ Message (optional):                  │
│ ┌──────────────────────────────────┐ │
│ │ Deploy version 2.1.0             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Survey Variables:                    │
│ Version: [2.1.0____________]         │
│ Environment: [▼ Production ]         │
│                                      │
│           [Cancel]  [Run]            │
└──────────────────────────────────────┘
```

**Task Execution View**:
```
┌─────────────────────────────────────────────────────┐
│ Task #145: Deploy Web App                    [Stop] │
├─────────────────────────────────────────────────────┤
│ Status: Running ⏳                                  │
│ Started: 2 minutes ago by John Doe                  │
│ Repository: main branch (abc1234)                   │
│                                                     │
│ 📟 Live Output:                          [Raw Log] │
│ ┌─────────────────────────────────────────────────┐ │
│ │ PLAY [webservers] ****************************** │ │
│ │                                                  │ │
│ │ TASK [Gathering Facts] ************************* │ │
│ │ ok: [web1.example.com]                          │ │
│ │ ok: [web2.example.com]                          │ │
│ │                                                  │ │
│ │ TASK [Deploy application] ********************* │ │
│ │ changed: [web1.example.com]                     │ │
│ │ ▋ Running...                                    │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Real-time log streaming
- Auto-scroll (toggle on/off)
- Copy output
- Download full log
- Stop running task
- Link to raw log view

**Task Status Indicators**:
- ⏳ **Running**: Currently executing
- ✅ **Success**: Completed successfully
- ❌ **Failed**: Error occurred
- ⏹️ **Stopped**: Manually canceled
- 🔔 **Waiting**: Queued or awaiting approval

---

### 4. History

**Purpose**: Review all past task executions

**View Options**:
- All tasks across all templates
- Filter by template
- Filter by status (success, failed, stopped)
- Filter by date range
- Filter by user who ran the task

**History Table**:
```
┌──────────────────────────────────────────────────────┐
│ Task History                    [Filters ▼]          │
├──────────────────────────────────────────────────────┤
│ #  Template      Status  Started    Duration  User   │
│ 145 Deploy App   ✅ OK   2 min ago  1m 23s   John   │
│ 144 Backup DB    ✅ OK   1 hr ago   45s      Auto   │
│ 143 Deploy App   ❌ FAIL 2 hrs ago  12s      Jane   │
│ 142 Terraform    ✅ OK   1 day ago  3m 11s   John   │
└──────────────────────────────────────────────────────┘
```

**Click any task** to view detailed logs and execution information.

---

### 5. Schedules

**Purpose**: Automate task execution

**Schedule List**:
```
┌─────────────────────────────────────────────────────┐
│ Schedules                              [+ New]      │
├─────────────────────────────────────────────────────┤
│ Name         Template      Cron        Status       │
│ Daily Backup Backup DB     0 2 * * *   🟢 Active   │
│ Deploy Prod  Deploy App    0 9 * * 1   🔴 Inactive │
│ Health Check Ping Servers  */15 * * *  🟢 Active   │
└─────────────────────────────────────────────────────┘
```

**Creating a Schedule**:
1. Click **+ New Schedule**
2. Select a task template
3. Enter cron expression (or use presets)
4. Enable/disable immediately
5. Save

**Cron Expression Helper**:
- Common presets: Daily, Weekly, Monthly
- Interactive cron builder
- Human-readable description
- Next execution preview

---

### 6. Repositories

**Purpose**: Manage Git repositories containing your code

**Repository List**:
```
┌───────────────────────────────────────────────────────┐
│ Repositories                            [+ New]       │
├───────────────────────────────────────────────────────┤
│ Name        URL                     Branch   Status   │
│ Playbooks   github.com/org/ansible  main     ✅ OK   │
│ Terraform   gitlab.com/org/infra    master   ✅ OK   │
│ Scripts     bitbucket.org/org/ops   develop  ⚠️ Error│
└───────────────────────────────────────────────────────┘
```

**Adding a Repository**:
1. Click **+ New Repository**
2. Enter name and Git URL
3. Select branch/tag
4. Choose access key (SSH key or login/password)
5. Save

Semaphore immediately clones the repository. You'll see status:
- ✅ **OK**: Successfully cloned
- ⚠️ **Error**: Could not clone (check credentials)
- 🔄 **Syncing**: Currently updating

**Actions**:
- **🔄 Sync**: Pull latest changes
- **📝 Edit**: Update configuration
- **🗑️ Delete**: Remove (if not used by templates)

---

### 7. Inventory

**Purpose**: Define target hosts for automation

**Inventory List**:
```
┌────────────────────────────────────────────────────┐
│ Inventory                             [+ New]      │
├────────────────────────────────────────────────────┤
│ Name          Type      Hosts     Credentials      │
│ Web Servers   Static    12        ssh-key-web      │
│ Databases     File      5         ssh-key-db       │
│ Cloud AWS     Dynamic   -         aws-credentials  │
└────────────────────────────────────────────────────┘
```

**Creating Inventory**:

**Step 1**: Select Type
- **Static**: Define hosts in UI
- **File**: Reference file in repository or server
- **Dynamic**: NetBox or custom script

**Step 2**: Configure
- Name and description
- Select user credentials from Key Store
- (Optional) Select sudo credentials
- Enter inventory data based on type

**Static Inventory Example**:
```yaml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
        web2.example.com:
```

**File Inventory**:
- Path: `inventory/hosts.yml` (in repository)
- Path: `/etc/ansible/hosts` (on server)

---

### 8. Key Store

**Purpose**: Securely store credentials and secrets

**Key List**:
```
┌────────────────────────────────────────────────────┐
│ Key Store                             [+ New]      │
├────────────────────────────────────────────────────┤
│ Name             Type           Used In            │
│ ssh-key-web      SSH           2 inventories       │
│ github-deploy    SSH           1 repository        │
│ sudo-password    Password      3 inventories       │
│ vault-password   Password      1 template          │
│ bitbucket-token  Password      1 repository        │
└────────────────────────────────────────────────────┘
```

**Key Types**:

**SSH Key**:
- Paste private key
- Optional passphrase
- Used for: server access, Git SSH

**Login with Password**:
- Username (optional for PATs)
- Password/token (hidden after save)
- Used for: Git HTTPS, sudo, Ansible Vault

**None**:
- No credentials required
- Used for: public repos, localhost

**Security Notes**:
- Passwords never displayed after creation
- All secrets encrypted in database
- Can only be deleted if not in use
- Audit log tracks access

---

### 9. Variable Groups (Environment)

**Purpose**: Store reusable configuration variables

**Variable Groups List**:
```
┌────────────────────────────────────────────────────┐
│ Variable Groups                       [+ New]      │
├────────────────────────────────────────────────────┤
│ Name            Variables    Used In               │
│ Production      12           5 templates           │
│ Development     8            3 templates           │
│ Global Config   5            8 templates           │
└────────────────────────────────────────────────────┘
```

**Creating Variable Group**:
1. Click **+ New**
2. Enter name
3. Add variables:
   - Key-value pairs
   - Mark as secret (encrypted)
   - JSON support for complex values

**Example Variables**:
```json
{
  "app_version": "2.1.0",
  "database_host": "db.prod.internal",
  "api_key": "***********",  # Secret (hidden)
  "feature_flags": {
    "new_ui": true,
    "beta_api": false
  }
}
```

**Usage**:
- Select in task template
- Variables become available as environment variables
- Secret variables masked in logs

---

### 10. Team

**Purpose**: Manage user access to the project

**Team Members List**:
```
┌────────────────────────────────────────────────────┐
│ Team                                  [+ Add User] │
├────────────────────────────────────────────────────┤
│ User        Email               Role        Actions │
│ John Doe    john@example.com   Owner       🗑️      │
│ Jane Smith  jane@example.com   Manager     📝 🗑️   │
│ Bob Jones   bob@example.com    Task Runner 📝 🗑️   │
│ Alice Lee   alice@example.com  Guest       📝 🗑️   │
└────────────────────────────────────────────────────┘
```

**Roles**:

**Owner**:
- Full project control
- Manage all resources
- Add/remove users
- Delete project

**Manager**:
- Manage resources (templates, repos, etc.)
- Run tasks
- Cannot delete project
- Cannot change owner

**Task Runner**:
- Run existing templates
- View resources
- Cannot create/edit templates
- Cannot manage team

**Guest**:
- View only access
- Can view task history
- Cannot run tasks
- Cannot modify anything

---

### 11. Settings

**Purpose**: Configure project-level options

**Settings Sections**:

**General**:
- Project name and description
- Alert preferences
- Task retention policies

**Notifications**:
- Enable/disable per template
- Configure channels (inherited from admin config)

**Advanced**:
- Maximum parallel tasks
- Task timeout defaults
- Log verbosity

---

## Admin Panel

**Available to administrators only**

Access via user menu → **Admin**

### Users

Manage all Semaphore users:
- Create new users
- Reset passwords
- Activate/deactivate accounts
- View user activity

### Global Settings

System-wide configuration:
- Authentication methods
- Notification providers (email, Slack, etc.)
- System runners
- License management (Pro)

### Active Tasks

Monitor all running tasks across all projects:
- System-wide task queue
- Resource usage
- Stop any running task

---

## Mobile Experience

Semaphore UI is responsive and works on tablets and phones:

**Mobile Features**:
- Touch-friendly navigation
- Responsive layouts
- Run tasks on-the-go
- Real-time log viewing
- Push notifications (via integrations)

**Best Mobile Use Cases**:
- Monitor running tasks
- Approve pending deployments
- Check task status
- View history
- Emergency task execution

---

## Keyboard Shortcuts

Speed up your workflow with these shortcuts:

- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + S`: Save (when editing)
- `Esc`: Close dialogs
- `Ctrl/Cmd + Enter`: Confirm actions (run task, save, etc.)

---

## Tips for Efficient Navigation

1. **Use Search**: Press `Ctrl/Cmd + K` to quickly find anything
2. **Bookmarks**: Bookmark frequently used project pages
3. **Filters**: Use filters in History to find specific tasks
4. **Breadcrumbs**: Click breadcrumbs at top to navigate up
5. **Browser Back/Forward**: Works as expected throughout UI
6. **Multiple Tabs**: Open tasks in new tabs for comparison

---

## Common UI Patterns

### Creating Resources

All resource creation follows similar patterns:
1. Click **+ New** button
2. Fill required fields (marked with *)
3. Fill optional fields
4. Click **Create** or **Save**

### Editing Resources

1. Click pencil icon (📝) or row
2. Modify fields
3. Click **Save**

### Deleting Resources

1. Click trash icon (🗑️)
2. Confirm deletion
3. May be blocked if resource is in use

### Running Tasks

1. Find template
2. Click **Run** button (▶️)
3. Fill survey variables (if any)
4. Click **Run**
5. View execution in real-time

---

## Troubleshooting UI Issues

**Page won't load**: 
- Check browser console for errors
- Verify network connectivity
- Try refreshing (Ctrl/Cmd + Shift + R)

**Task logs not streaming**: 
- Check WebSocket connection
- Disable ad blockers
- Try different browser

**Can't see certain features**:
- Check user role permissions
- Verify Pro features if using Community edition
- Contact project owner

---

## Next Steps

You're now familiar with the UI! Time to put it to use:

- **[Next Steps](./next-steps.md)** - Build practical workflows
- **[User Guide](../user-guide/README.md)** - Deep dive into each feature
- **[Task Templates](../user-guide/task-templates/README.md)** - Master automation
