# Next Steps

Now that you've completed the basics, let's build real automation workflows. This guide walks through practical scenarios step-by-step.

## Choose Your Path

Select the scenario that best matches your needs:

1. **[Deploy a Web Application with Ansible](#scenario-1-deploy-a-web-application-with-ansible)**
2. **[Manage Infrastructure with Terraform](#scenario-2-manage-infrastructure-with-terraform)**
3. **[Run Custom Shell Scripts](#scenario-3-run-custom-shell-scripts)**
4. **[Automate Database Backups](#scenario-4-automate-database-backups)**
5. **[Set Up a CI/CD Pipeline](#scenario-5-set-up-a-cicd-pipeline)**

---

## Scenario 1: Deploy a Web Application with Ansible

**Goal**: Deploy a Node.js application to web servers using Ansible

### Prerequisites
- Git repository with Ansible playbooks
- Target web servers accessible via SSH
- SSH keys for server access

### Step 1: Set Up the Project

1. Create a new project called **"Web Application"**
2. Add a description: "Production web app deployment"

### Step 2: Configure Access

**Add SSH Key**:
1. Go to **Key Store** → **+ New Key**
2. Name: `web-servers-ssh`
3. Type: **SSH**
4. Paste your private SSH key
5. Add passphrase if required
6. Click **Create**

**Add Sudo Credentials** (if needed):
1. **Key Store** → **+ New Key**
2. Name: `sudo-password`
3. Type: **Login with Password**
4. Username: Your sudo user
5. Password: Your sudo password
6. Click **Create**

### Step 3: Add Your Repository

1. Go to **Repositories** → **+ New Repository**
2. Name: `web-app-playbooks`
3. URL: `git@github.com:yourorg/ansible-web-app.git`
4. Branch: `main`
5. Access Key: Select `web-servers-ssh`
6. Click **Create**

Wait for sync to complete (✅ OK status).

### Step 4: Create Inventory

1. Go to **Inventory** → **+ New Inventory**
2. Name: `Production Web Servers`
3. User Credentials: Select `web-servers-ssh`
4. Sudo Credentials: Select `sudo-password`
5. Type: **Static**
6. Inventory content:
```yaml
all:
  children:
    webservers:
      hosts:
        web1.prod.example.com:
          ansible_host: 10.0.1.10
        web2.prod.example.com:
          ansible_host: 10.0.1.11
      vars:
        ansible_user: deploy
        ansible_become: yes
        ansible_become_method: sudo
```
7. Click **Create**

### Step 5: Create Variable Group

1. Go to **Variable Groups** → **+ New**
2. Name: `Production Config`
3. Variables:
```json
{
  "app_name": "myapp",
  "app_port": "3000",
  "nodejs_version": "18",
  "deploy_user": "deploy",
  "app_repo": "https://github.com/yourorg/myapp.git"
}
```
4. Click **Create**

### Step 6: Create Deployment Template

1. Go to **Task Templates** → **+ New Template**
2. Fill in:
   - **Name**: `Deploy Web App`
   - **Template Type**: Select **Deploy**
   - **Playbook**: Select **Ansible**
   - **Playbook Filename**: `deploy.yml`
   - **Repository**: Select `web-app-playbooks`
   - **Inventory**: Select `Production Web Servers`
   - **Environment**: Select `Production Config`
3. **Survey Variables** (optional):
   - Add variable: `version`
   - Label: "Application Version"
   - Type: Text
   - Required: Yes
   - Default: `main`
4. **Notification Settings**:
   - Alert on failure: ✅ Enabled
5. Click **Create**

### Step 7: Deploy!

1. Find your `Deploy Web App` template
2. Click **Run** (▶️)
3. Enter version: `v2.1.0`
4. Click **Run**
5. Watch the deployment in real-time

### Step 8: Automate with Schedule (Optional)

1. Go to **Schedules** → **+ New Schedule**
2. Name: `Nightly Deployment`
3. Template: Select `Deploy Web App`
4. Cron Expression: `0 2 * * *` (2 AM daily)
5. Enable: ✅ Active
6. Click **Create**

### Next: Add Rollback

Create a second template for rollback:
1. Duplicate the deploy template
2. Name: `Rollback Web App`
3. Playbook: `rollback.yml`
4. Survey variable: `version` (to rollback to)

---

## Scenario 2: Manage Infrastructure with Terraform

**Goal**: Provision and manage cloud infrastructure with Terraform

### Prerequisites
- Terraform configuration in Git
- Cloud provider credentials (AWS, Azure, GCP)
- Terraform backend configured (S3, Azure Storage, etc.)

### Step 1: Store Cloud Credentials

**For AWS**:
1. **Key Store** → **+ New Key**
2. Name: `aws-credentials`
3. Type: **Login with Password**
4. Login: (leave empty)
5. Password: Your AWS credentials as JSON:
```json
{
  "access_key_id": "AKIA...",
  "secret_access_key": "...",
  "region": "us-east-1"
}
```
6. Click **Create**

### Step 2: Add Terraform Repository

1. **Repositories** → **+ New Repository**
2. Name: `infrastructure`
3. URL: Your Terraform repo
4. Branch: `main`
5. Access Key: Your Git credentials
6. Click **Create**

### Step 3: Create Variable Group

1. **Variable Groups** → **+ New**
2. Name: `Terraform Variables`
3. Variables:
```json
{
  "TF_VAR_environment": "production",
  "TF_VAR_region": "us-east-1",
  "TF_VAR_instance_count": "3"
}
```
4. Mark sensitive variables as **Secret**
5. Click **Create**

### Step 4: Create Terraform Plan Template

1. **Task Templates** → **+ New Template**
2. Fill in:
   - **Name**: `Terraform Plan`
   - **Task Type**: Select **Task**
   - **Playbook**: Select **Terraform**
   - **Repository**: Select `infrastructure`
   - **Environment**: Select `Terraform Variables`
3. **Terraform Options**:
   - Command: `plan`
   - Working Directory: `/` (or subdirectory)
4. Click **Create**

### Step 5: Create Terraform Apply Template

1. **Task Templates** → **+ New Template**
2. Fill in:
   - **Name**: `Terraform Apply`
   - **Task Type**: Select **Build**
   - **Playbook**: Select **Terraform**
   - **Repository**: Select `infrastructure`
   - **Environment**: Select `Terraform Variables`
3. **Terraform Options**:
   - Command: `apply`
   - Auto-approve: ✅ (or add approval workflow)
4. **Survey Variables**:
   - Add: `confirm`
   - Label: "Type YES to confirm apply"
   - Type: Text
   - Required: Yes
5. Click **Create**

### Step 6: Workflow

**Safe Infrastructure Changes**:
1. Make changes in Git repository
2. Run **Terraform Plan** template
3. Review plan output in task logs
4. If approved, run **Terraform Apply** template
5. Confirm by typing "YES"
6. Monitor apply progress

### Advanced: Terraform Workspaces

For managing multiple environments:

1. Create separate templates per environment
2. Use workspace selection in template
3. Use different variable groups:
   - `Terraform - Dev`
   - `Terraform - Staging`
   - `Terraform - Production`

See [Terraform Workspaces](../user-guide/task-templates/apps/terraform/workspaces.md) guide.

---

## Scenario 3: Run Custom Shell Scripts

**Goal**: Execute maintenance scripts, health checks, or custom automation

### Step 1: Prepare Scripts Repository

Your Git repository should contain:
```
scripts/
├── backup.sh
├── health-check.sh
├── cleanup.sh
└── deploy-app.sh
```

### Step 2: Add Repository

1. **Repositories** → **+ New Repository**
2. Name: `ops-scripts`
3. URL: Your scripts repository
4. Click **Create**

### Step 3: Create Script Template

1. **Task Templates** → **+ New Template**
2. Fill in:
   - **Name**: `Health Check`
   - **Playbook**: Select **Bash**
   - **Repository**: Select `ops-scripts`
3. **Script Configuration**:
   - Script Path: `scripts/health-check.sh`
   - Arguments: (optional)
4. **Environment Variables**:
   - Add inline or use Variable Group
   ```json
   {
     "SERVICE_URL": "https://api.example.com",
     "TIMEOUT": "30",
     "ALERT_EMAIL": "ops@example.com"
   }
   ```
5. Click **Create**

### Step 4: Schedule Regular Execution

1. **Schedules** → **+ New Schedule**
2. Name: `Health Check - Every 15 min`
3. Template: `Health Check`
4. Cron: `*/15 * * * *`
5. Enable: ✅
6. Click **Create**

### Example Scripts

**health-check.sh**:
```bash
#!/bin/bash
set -e

echo "Checking service health..."
response=$(curl -s -o /dev/null -w "%{http_code}" $SERVICE_URL/health)

if [ "$response" -eq 200 ]; then
    echo "✅ Service is healthy"
    exit 0
else
    echo "❌ Service is unhealthy (HTTP $response)"
    exit 1
fi
```

**cleanup.sh**:
```bash
#!/bin/bash
set -e

echo "Cleaning up old logs..."
find /var/log/myapp -name "*.log" -mtime +30 -delete

echo "Cleaning up temp files..."
find /tmp -name "myapp-*" -mtime +7 -delete

echo "✅ Cleanup complete"
```

---

## Scenario 4: Automate Database Backups

**Goal**: Schedule automated PostgreSQL/MySQL backups

### Step 1: Create Backup Script

In your Git repository, create `backup-db.sh`:

```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Starting backup of ${DB_NAME}..."

# PostgreSQL
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# MySQL alternative:
# mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_FILE

echo "Backup created: $BACKUP_FILE"

# Upload to S3
if [ ! -z "$S3_BUCKET" ]; then
    aws s3 cp $BACKUP_FILE s3://${S3_BUCKET}/backups/
    echo "Uploaded to S3"
fi

# Keep only last 7 days locally
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup complete"
```

### Step 2: Configure Credentials

1. **Variable Groups** → **+ New**
2. Name: `Database Backup Config`
3. Variables:
```json
{
  "DB_HOST": "db.example.com",
  "DB_NAME": "production",
  "DB_USER": "backup_user",
  "DB_PASS": "**********",  # Mark as secret
  "BACKUP_DIR": "/backups",
  "S3_BUCKET": "my-backups",
  "AWS_ACCESS_KEY_ID": "**********",  # Mark as secret
  "AWS_SECRET_ACCESS_KEY": "**********"  # Mark as secret
}
```
4. Mark sensitive values as **Secret**
5. Click **Create**

### Step 3: Create Backup Template

1. **Task Templates** → **+ New Template**
2. Name: `Database Backup`
3. Playbook: **Bash**
4. Repository: Your scripts repo
5. Script Path: `backup-db.sh`
6. Environment: `Database Backup Config`
7. Click **Create**

### Step 4: Schedule Daily Backups

1. **Schedules** → **+ New Schedule**
2. Name: `Daily DB Backup`
3. Template: `Database Backup`
4. Cron: `0 2 * * *` (2 AM daily)
5. Enable: ✅
6. Click **Create**

### Step 5: Set Up Notifications

1. Edit the `Database Backup` template
2. Enable **Alert on failure**
3. Configure notification channel (email, Slack, etc.)
4. Save

Now you'll be alerted if backups fail!

### Bonus: Backup Verification Template

Create a second template to verify backups:

```bash
#!/bin/bash
set -e

echo "Verifying latest backup..."

LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/backup_*.sql.gz | head -1)

if [ -f "$LATEST_BACKUP" ]; then
    SIZE=$(stat -f%z "$LATEST_BACKUP")
    AGE=$(( ($(date +%s) - $(stat -f%m "$LATEST_BACKUP")) / 3600 ))
    
    echo "Latest backup: $LATEST_BACKUP"
    echo "Size: $(($SIZE / 1024 / 1024)) MB"
    echo "Age: $AGE hours"
    
    if [ $AGE -gt 25 ]; then
        echo "❌ Backup is too old!"
        exit 1
    fi
    
    if [ $SIZE -lt 1000 ]; then
        echo "❌ Backup file too small!"
        exit 1
    fi
    
    echo "✅ Backup verification passed"
else
    echo "❌ No backup found!"
    exit 1
fi
```

Schedule this to run after backups complete.

---

## Scenario 5: Set Up a CI/CD Pipeline

**Goal**: Automated build, test, and deploy pipeline

### Pipeline Overview

```
Git Push → Webhook → Semaphore
                        ↓
                    1. Build
                        ↓
                    2. Test
                        ↓
                    3. Deploy (on success)
```

### Step 1: Create Build Template

1. **Task Templates** → **+ New Template**
2. Name: `Build Application`
3. Type: **Build**
4. Playbook: **Bash** (or Ansible for complex builds)
5. Repository: Your app repo
6. Script: `build.sh`
7. Environment Variables:
```json
{
  "NODE_ENV": "production",
  "BUILD_NUMBER": "{{semaphore_vars.task_id}}"
}
```
8. Click **Create**

**build.sh**:
```bash
#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Running build..."
npm run build

echo "Creating artifact..."
tar -czf build-${BUILD_NUMBER}.tar.gz dist/

echo "✅ Build complete: build-${BUILD_NUMBER}.tar.gz"
```

### Step 2: Create Test Template

1. **Task Templates** → **+ New Template**
2. Name: `Run Tests`
3. Type: **Task**
4. Playbook: **Bash**
5. Script: `test.sh`
6. Click **Create**

**test.sh**:
```bash
#!/bin/bash
set -e

echo "Running tests..."
npm test

echo "Running linter..."
npm run lint

echo "✅ All tests passed"
```

### Step 3: Create Deploy Template

1. **Task Templates** → **+ New Template**
2. Name: `Deploy to Production`
3. Type: **Deploy**
4. Playbook: **Ansible** (or Bash)
5. Playbook Filename: `deploy.yml`
6. Repository: Your deployment playbooks
7. Inventory: Production servers
8. Survey Variable:
   - Name: `build_version`
   - Label: "Build version to deploy"
   - Type: Text
   - Required: Yes
9. Click **Create**

### Step 4: Configure Git Webhook

**For GitHub**:

1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Payload URL: `https://your-semaphore.com/api/project/{project_id}/tasks`
4. Content type: `application/json`
5. Secret: (generate and save)
6. Events: Select "Push events"
7. Save

**In Semaphore**:

1. **Integrations** → **Webhooks**
2. Add webhook configuration
3. Template: `Build Application`
4. Branch filter: `main` (only build on main branch)
5. Save

### Step 5: Manual Pipeline Execution

While webhooks automate the pipeline, you can run manually:

**Option A: Run Each Step**
1. Run `Build Application` template
2. Wait for completion
3. Note the build number
4. Run `Run Tests` template
5. If tests pass, run `Deploy to Production`
6. Enter build number from step 3

**Option B: Create Chained Template** (if supported)
1. Create a master template that runs:
   - Build → Test → Deploy
2. Use task dependencies

### Step 6: Monitor Pipeline

**View Dashboard**:
- See all running builds/deploys
- Check build history
- Monitor success rates

**Set Up Notifications**:
1. Configure Slack/email notifications
2. Alert on:
   - Build failures
   - Test failures  
   - Successful deployments
3. Include links to logs

### Advanced: Multi-Environment Pipeline

**Development**:
- Auto-deploy on push to `develop` branch
- Use `Development` inventory and variables

**Staging**:
- Auto-deploy on push to `staging` branch
- Use `Staging` inventory

**Production**:
- Manual approval required
- Deploy specific build versions
- Use `Production` inventory

Create separate templates for each environment with appropriate configurations.

---

## Best Practices

### 1. Organization

- **Use meaningful names**: "Deploy Web App v2" not "Template 1"
- **Add descriptions**: Help team members understand what templates do
- **Tag templates**: Use consistent naming for related templates
- **Group by purpose**: Build, Deploy, Maintenance, Backup, etc.

### 2. Security

- **Never hardcode secrets**: Use Key Store and Variable Groups
- **Mark secrets**: Flag sensitive variables as secret
- **Limit access**: Use role-based permissions appropriately
- **Rotate credentials**: Change passwords and keys regularly
- **Use SSH keys**: Prefer SSH over passwords for Git and servers

### 3. Reliability

- **Test in non-prod first**: Always test templates in dev/staging
- **Use idempotent operations**: Ensure tasks can run multiple times safely
- **Add error handling**: Check exit codes, validate inputs
- **Set timeouts**: Prevent hung tasks from running forever
- **Monitor logs**: Review task outputs regularly

### 4. Efficiency

- **Reuse variable groups**: Don't duplicate configuration
- **Cache repositories**: Enable caching for faster clones
- **Parallel execution**: Enable when tasks are independent
- **Use runners**: Distribute load with remote runners
- **Schedule wisely**: Run heavy tasks during off-hours

### 5. Maintenance

- **Document templates**: Add descriptions and comments
- **Version control**: Keep all scripts in Git
- **Review history**: Check task logs for failures
- **Clean up old logs**: Set retention policies
- **Archive unused templates**: Remove what you don't need

---

## Troubleshooting Common Issues

### Task Fails with "Permission Denied"

**Problem**: SSH key or credentials incorrect

**Solution**:
1. Verify SSH key in Key Store
2. Check key is added to target server's `authorized_keys`
3. Verify username in inventory
4. Test SSH manually: `ssh -i key user@host`

### Repository Won't Clone

**Problem**: Git authentication failing

**Solution**:
1. Check repository URL is correct
2. Verify access key in repository settings
3. For SSH: ensure key has repo access
4. For HTTPS: use Personal Access Token, not password
5. Check repository branch exists

### Task Hangs

**Problem**: Task running but no output

**Solution**:
1. Check if script is waiting for input
2. Verify inventory is reachable
3. Add timeout to template
4. Check for blocking operations
5. Review raw logs

### Variables Not Working

**Problem**: Template variables not passed to task

**Solution**:
1. Verify variable group is attached to template
2. Check variable names match (case-sensitive)
3. For Ansible: use `{{ variable_name }}`
4. For Shell: use `$VARIABLE_NAME`
5. Check survey variables are filled

---

## Getting Help

### Resources

- **[User Guide](../user-guide/README.md)**: Detailed feature documentation
- **[Administration Guide](../administration-guide/README.md)**: Setup and configuration
- **[FAQ](../faq/troubleshooting.md)**: Common problems and solutions
- **[API Documentation](../administration-guide/api.md)**: Programmatic access

### Community

- **Discord**: [Join our community](https://discord.gg/5R6k7hNGcH)
- **GitHub Issues**: [Report bugs](https://github.com/semaphoreui/semaphore/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/semaphoreui/semaphore/discussions)

### Support

- **Email**: [Contact support](mailto:denis@semaphoreui.com)
- **Documentation**: This guide and related docs
- **Blog**: [Semaphore UI Blog](https://semaphoreui.com/blog/)

---

## What's Next?

You're now ready to build sophisticated automation workflows! Continue exploring:

- **[Task Templates Guide](../user-guide/task-templates/README.md)**: Master all task types
- **[Ansible Guide](../user-guide/task-templates/apps/ansible.md)**: Deep dive into Ansible
- **[Terraform Guide](../user-guide/task-templates/apps/terraform.md)**: Advanced Terraform usage
- **[Pipelines](../administration-guide/cicd.md)**: Build/deploy workflows
- **[API](../administration-guide/api.md)**: Integrate with external systems

Happy automating! 🚀
