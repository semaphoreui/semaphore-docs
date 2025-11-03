# Best Practices

A comprehensive guide to using Semaphore UI effectively, securely, and efficiently.

## Table of Contents

- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Operational Excellence](#operational-excellence)
- [Development Workflow](#development-workflow)
- [Team Collaboration](#team-collaboration)
- [Monitoring & Alerting](#monitoring--alerting)

---

## Security Best Practices

### Credential Management

#### Use Strong Encryption
```json
{
  "access_key_encryption": "use-a-strong-32-character-key-here"
}
```
- Generate using: `openssl rand -base64 32`
- Never reuse keys across installations
- Store encryption key securely (password manager, vault)
- Rotate regularly (requires database migration)

#### SSH Keys Over Passwords
**Do** ✅:
```yaml
# Use SSH key authentication
ansible_connection: ssh
ansible_ssh_private_key_file: /path/to/key
```

**Avoid** ❌:
```yaml
# Avoid password authentication
ansible_connection: ssh
ansible_ssh_pass: "password123"
```

#### Never Hardcode Secrets
**Do** ✅:
```yaml
# Use Variable Groups
api_key: "{{ api_key_from_variables }}"
```

**Avoid** ❌:
```yaml
# Never hardcode
api_key: "sk_live_abc123..."
```

#### Mark Sensitive Variables
- Always mark secrets as "Secret" in Variable Groups
- Secrets are masked in logs: `***HIDDEN***`
- Use environment variables for sensitive data
- Never log secrets in custom scripts

#### Credential Rotation

**Monthly**:
- Rotate Git repository access tokens
- Update SSH key passphrases
- Change Ansible Vault passwords

**Quarterly**:
- Rotate database passwords
- Update API keys
- Refresh cloud provider credentials

**Annually**:
- Replace SSH key pairs
- Update SSL certificates
- Regenerate encryption keys (with downtime)

### Authentication & Authorization

#### Enable LDAP or OpenID Connect
For production environments:
- Centralized user management
- Single Sign-On (SSO)
- Automated user provisioning/de-provisioning
- Group-based access control

See: [LDAP](../administration-guide/ldap.md) | [OpenID](../administration-guide/openid.md)

#### Implement Least Privilege
```
Production Project:
- Owners: 1-2 senior engineers
- Managers: 3-4 DevOps engineers
- Task Runners: 10-20 developers
- Guests: Managers, auditors
```

#### Regular Access Reviews
- Monthly: Review project team memberships
- Quarterly: Audit user permissions
- Annually: Full security review
- After departures: Immediate access removal

#### Secure API Access
- Generate separate API tokens per integration
- Use short-lived tokens when possible
- Rotate tokens regularly
- Log API access
- Restrict API access by IP if possible

### Network Security

#### Use Reverse Proxy with TLS
```nginx
server {
    listen 443 ssl http2;
    server_name semaphore.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

See: [NGINX Config](../administration-guide/security/nginx.md) | [Apache Config](../administration-guide/security/apache.md)

#### Firewall Rules
```bash
# Allow only necessary ports
ufw allow 443/tcp  # HTTPS
ufw allow 22/tcp   # SSH (restrict by IP)
ufw deny 3000/tcp  # Block direct Semaphore access
```

#### Database Security
- Use separate database user for Semaphore
- Grant minimum required permissions
- Enable SSL for database connections
- Restrict database access to localhost or specific IPs
- Regular backups with encryption

See: [Database Security](../administration-guide/security/database.md)

### Audit Logging

#### Enable Comprehensive Logging
```json
{
  "access_key_encryption": "...",
  "log_level": "info",
  "audit_log": true
}
```

#### Regular Log Reviews
- Daily: Check for failed login attempts
- Weekly: Review privilege escalations
- Monthly: Audit task execution patterns
- Quarterly: Compliance reporting

#### Log Retention
```bash
# Archive logs older than 90 days
find /var/log/semaphore -name "*.log" -mtime +90 -exec gzip {} \;

# Delete archives older than 1 year
find /var/log/semaphore -name "*.log.gz" -mtime +365 -delete
```

---

## Performance Optimization

### Database Optimization

#### Choose the Right Database

**BoltDB** (Embedded):
- ✅ Perfect for: Testing, small deployments (<5 users)
- ❌ Avoid for: Production, high concurrency

**PostgreSQL** (Recommended):
- ✅ Perfect for: Production, high performance
- ✅ Best: Concurrent access, large datasets

**MySQL**:
- ✅ Perfect for: Production, existing MySQL infrastructure
- ✅ Good: General use cases

#### Database Connection Pooling
```json
{
  "postgres": {
    "host": "localhost",
    "max_connections": 50,
    "max_idle_connections": 10,
    "connection_lifetime": "1h"
  }
}
```

#### Regular Maintenance
```bash
# PostgreSQL
# Vacuum and analyze
sudo -u postgres psql semaphore -c "VACUUM ANALYZE;"

# MySQL
# Optimize tables
mysqlcheck -o semaphore -u semaphore -p
```

#### Task Log Retention
```bash
# Keep last 100 tasks per template
SEMAPHORE_MAX_TASKS_PER_TEMPLATE=100
```
```json
{
  "max_tasks_per_template": 100
}
```

### Repository Management

#### Enable Git Caching
Repositories are cached by default. Ensure cache directory has enough space:
```bash
du -sh /tmp/semaphore  # Default cache location
```

#### Shallow Clones
For large repositories, use shallow clones:
- Reduces clone time
- Saves disk space
- Faster task startup

**Semaphore automatically uses shallow clones** (depth=1)

#### Repository Size
**Best Practices**:
- Keep repositories under 500MB
- Use Git LFS for large files
- Consider splitting large repos
- Clean up old branches/tags

### Task Execution

#### Parallel Task Execution
Enable for independent tasks:
```
Template Settings:
☑ Allow parallel tasks
```

**When to Enable**:
- Tasks don't conflict
- Sufficient system resources
- Different target hosts

**When to Disable**:
- Tasks modify same resources
- Database migrations
- Sequential deployments

#### Remote Runners (Pro)
Distribute workload across multiple machines:
```
Main Server: Task scheduling, UI, API
Runner 1: Web deployments
Runner 2: Database tasks
Runner 3: Cloud infrastructure
```

**Benefits**:
- Reduced main server load
- Faster task execution
- Network isolation
- Geographic distribution

See: [Runners](../administration-guide/runners.md)

#### Task Timeouts
Set appropriate timeouts to prevent hung tasks:
```
Template Settings:
Default timeout: 30 minutes
Override per template as needed
```

### System Resources

#### Resource Allocation

**Minimum (Testing)**:
- CPU: 1 core
- RAM: 512MB
- Disk: 1GB

**Recommended (Production)**:
- CPU: 2-4 cores
- RAM: 2-4GB
- Disk: 20GB+ (depends on logs)

**High-Traffic (Enterprise)**:
- CPU: 4-8 cores
- RAM: 8-16GB
- Disk: 100GB+ SSD
- Database: Separate server

#### Monitor Resource Usage
```bash
# CPU and Memory
htop

# Disk Usage
df -h
du -sh /var/lib/semaphore

# Database Size
# PostgreSQL
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('semaphore'));"

# MySQL
mysql -e "SELECT table_schema AS 'Database', 
ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
FROM information_schema.TABLES 
WHERE table_schema = 'semaphore';"
```

---

## Operational Excellence

### Backup Strategy

#### What to Backup

**Critical**:
- Database (contains everything!)
- Configuration file (`config.json`)
- Encryption key

**Optional**:
- Task logs (if not in database)
- Git cache (can be rebuilt)

#### Backup Frequency

**Database**:
- Production: Daily (minimum)
- High-change: Every 6 hours
- Critical: Continuous replication

**Configuration**:
- After every change
- Version control with Git

#### Backup Script Example
```bash
#!/bin/bash
# backup-semaphore.sh

BACKUP_DIR="/backups/semaphore"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h localhost -U semaphore semaphore | \
  gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"

# Config backup
cp /etc/semaphore/config.json "${BACKUP_DIR}/config_${TIMESTAMP}.json"

# Encryption key (if stored separately)
cp /etc/semaphore/.encryption_key "${BACKUP_DIR}/encryption_key_${TIMESTAMP}"

# Upload to S3
aws s3 sync "${BACKUP_DIR}" s3://my-backups/semaphore/

# Keep last 30 days locally
find "${BACKUP_DIR}" -name "*.gz" -mtime +30 -delete

echo "Backup completed: ${TIMESTAMP}"
```

Schedule daily:
```cron
0 2 * * * /usr/local/bin/backup-semaphore.sh
```

#### Test Restores
- Monthly: Test database restore
- Quarterly: Full disaster recovery test
- Document restore procedures

### Monitoring

#### Health Checks

**Application**:
```bash
# Check if Semaphore is running
curl -f http://localhost:3000/api/ping || alert

# Check API response time
time curl -s http://localhost:3000/api/ping
```

**Database**:
```bash
# PostgreSQL
pg_isready -h localhost -U semaphore

# MySQL
mysqladmin ping -h localhost -u semaphore -p
```

**System**:
```bash
# Disk space
df -h | grep -E 'Use%|semaphore'

# Memory usage
free -h

# CPU load
uptime
```

#### Metrics to Track
- Task success rate
- Task execution duration
- Failed login attempts
- API response times
- Database query performance
- System resource usage

#### Alerting Thresholds
```
Warning:
- Disk usage > 80%
- Memory usage > 85%
- Task failure rate > 10%

Critical:
- Disk usage > 90%
- Memory usage > 95%
- Semaphore unresponsive
- Database connection failed
```

### Upgrade Strategy

#### Before Upgrading

1. **Backup Everything**
   ```bash
   ./backup-semaphore.sh
   ```

2. **Review Changelog**
   - Breaking changes
   - New features
   - Deprecations

3. **Test in Non-Production**
   - Clone production setup
   - Upgrade test environment
   - Verify functionality

#### Upgrade Process

**Docker**:
```bash
# Pull new image
docker pull semaphoreui/semaphore:latest

# Stop container
docker stop semaphore

# Backup
docker exec semaphore-db pg_dump ...

# Start with new image
docker-compose up -d
```

**Package Manager**:
```bash
# Backup
sudo systemctl stop semaphore
./backup-semaphore.sh

# Upgrade
sudo apt update
sudo apt upgrade semaphore

# Restart
sudo systemctl start semaphore
```

#### Post-Upgrade

1. **Verify functionality**
   - Login works
   - Run a test task
   - Check logs

2. **Monitor for issues**
   - Watch logs: `tail -f /var/log/semaphore/*.log`
   - Check error rates
   - Test critical workflows

3. **Rollback plan**
   - Keep old version packages
   - Documented rollback steps
   - Database restore procedure

See: [Upgrading](../administration-guide/upgrading.md)

### Incident Response

#### Semaphore Won't Start

1. Check logs:
   ```bash
   journalctl -u semaphore -n 100
   ```

2. Verify database connectivity:
   ```bash
   pg_isready -h localhost
   ```

3. Check configuration:
   ```bash
   cat /etc/semaphore/config.json | jq .
   ```

4. Verify disk space:
   ```bash
   df -h
   ```

#### Tasks Failing

1. Check task logs in UI
2. Verify resource availability (repos, keys, inventory)
3. Test manually outside Semaphore
4. Check recent changes (Activity log)

#### Performance Degradation

1. Check system resources
   ```bash
   htop
   iotop
   ```

2. Review database performance
   ```sql
   -- PostgreSQL slow queries
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   ```

3. Check concurrent task count
4. Review recent configuration changes

---

## Development Workflow

### Template Development

#### Start Small
```
1. Create basic template
2. Test with single host
3. Add error handling
4. Expand to multiple hosts
5. Add survey variables
6. Enable notifications
```

#### Use Version Control
```
Git Repository Structure:
ansible/
├── playbooks/
│   ├── deploy.yml
│   ├── rollback.yml
│   └── backup.yml
├── roles/
├── inventory/
└── README.md
```

#### Test in Development First
```
Projects:
- Development (test here first)
- Staging (validate)
- Production (deploy with confidence)
```

### Template Naming Conventions

**Good**:
- `Deploy Web App - Production`
- `Backup Database - Daily`
- `Terraform Apply - AWS VPC`

**Structure**:
```
[Action] [Target] - [Environment/Details]
```

### Variable Management

#### Variable Group Hierarchy
```
Global Variables (Shared)
└── Base Configuration
    ├── Development Variables
    ├── Staging Variables
    └── Production Variables
```

#### Environment-Specific Values
```json
// Development
{
  "environment": "dev",
  "api_endpoint": "https://api.dev.example.com",
  "debug_mode": "true"
}

// Production
{
  "environment": "prod",
  "api_endpoint": "https://api.example.com",
  "debug_mode": "false"
}
```

### Testing Strategies

#### Pre-Deployment Testing
```yaml
# check.yml - Validation playbook
- hosts: all
  tasks:
    - name: Check connectivity
      ping:
      
    - name: Verify prerequisites
      command: which docker
      
    - name: Check disk space
      shell: df -h | grep -v 'tmpfs'
```

#### Dry Run Capabilities
```yaml
# Use check mode for Ansible
- hosts: webservers
  tasks:
    - name: Deploy application
      copy:
        src: app/
        dest: /var/www/
      check_mode: yes  # Simulate only
```

#### Rollback Procedures
Always create rollback templates:
```
Templates:
- Deploy v2.0
- Rollback to v1.9
```

---

## Team Collaboration

### Documentation

#### Template Documentation
```
Template: Deploy Web Application
Description: Deploys the main web app to production servers

Prerequisites:
- Valid SSH access to web servers
- Database migrations completed
- Build artifacts available

Variables:
- version: Application version to deploy
- skip_backup: Skip pre-deployment backup (default: false)

Rollback: Use "Rollback Web App" template
Contact: devops@example.com
```

#### Inventory Documentation
```yaml
# inventory/production.yml
all:
  children:
    webservers:
      hosts:
        web1.prod.example.com:
        web2.prod.example.com:
      vars:
        # HTTP port for web application
        app_port: 8080
        # Enable monitoring
        monitoring_enabled: true
```

### Communication

#### Notification Channels
```
Critical (Production):
- Slack: #production-alerts
- Email: ops-team@example.com
- PagerDuty: On-call rotation

Non-Critical (Development):
- Slack: #dev-deployments
```

#### Task Messages
When running tasks, include context:
```
Good:
"Deploying v2.1.0 for PROJ-123 - Fixes critical auth bug"

Bad:
"deploy"
```

### Change Management

#### Approval Workflows
```
Development:
- Self-service: Developers can deploy directly

Staging:
- Approval: Tech lead approval required

Production:
- Approval: Manager + Tech lead
- Scheduled: Maintenance windows only
- Documentation: Change ticket required
```

#### Maintenance Windows
```cron
# Production deployments: Tuesdays 10 PM
0 22 * * 2 /usr/local/bin/deploy-window.sh
```

### Knowledge Sharing

#### Runbook Templates
```markdown
# Runbook: Web Application Deployment

## Prerequisites
- [ ] Code reviewed and approved
- [ ] Tests passing in CI
- [ ] Database migrations ready
- [ ] Stakeholders notified

## Steps
1. Run "Deploy Web App" template
2. Enter version number
3. Monitor deployment logs
4. Verify health checks
5. Roll back if needed

## Verification
- [ ] Application responding
- [ ] No errors in logs
- [ ] Metrics normal

## Rollback
1. Run "Rollback Web App" template
2. Enter previous version
3. Verify restoration
```

---

## Monitoring & Alerting

### Task Monitoring

#### Success Rate Tracking
```sql
-- Query task success rate
SELECT 
  template_id,
  COUNT(*) as total_tasks,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM tasks
WHERE created >= NOW() - INTERVAL '7 days'
GROUP BY template_id;
```

#### Execution Duration Tracking
Monitor for performance degradation:
```
Normal: 5 minutes
Warning: > 10 minutes
Critical: > 30 minutes
```

### Alert Configuration

#### Critical Alerts
```
Failures:
- Production deployments
- Database operations
- Security-related tasks

Trigger: Immediately
Channel: Slack + Email + PagerDuty
```

#### Warning Alerts
```
Issues:
- Development failures
- Long-running tasks
- Resource warnings

Trigger: After 2 consecutive failures
Channel: Slack
```

#### Information Alerts
```
Events:
- Successful production deployments
- Scheduled task completions
- System updates

Trigger: Always
Channel: Slack (low priority)
```

### Log Analysis

#### Common Patterns
```bash
# Find failed tasks
grep "ERROR" /var/log/semaphore/*.log

# Check authentication issues
grep "authentication failed" /var/log/semaphore/*.log

# Monitor task duration
grep "Task completed" /var/log/semaphore/*.log | \
  awk '{print $NF}' | \
  sort -n
```

---

## Quick Reference

### Security Checklist
- [ ] Strong encryption key configured
- [ ] SSH keys used instead of passwords
- [ ] All secrets marked as secret in variables
- [ ] HTTPS enabled (reverse proxy)
- [ ] Firewall rules configured
- [ ] LDAP/OpenID configured for production
- [ ] Regular access reviews scheduled
- [ ] Audit logging enabled

### Performance Checklist
- [ ] PostgreSQL/MySQL used (not BoltDB) for production
- [ ] Task log retention configured
- [ ] Database maintenance scheduled
- [ ] Repository sizes optimized
- [ ] Remote runners configured (if needed)
- [ ] Parallel execution enabled where appropriate
- [ ] System resources monitored

### Operational Checklist
- [ ] Daily database backups configured
- [ ] Backup restore tested
- [ ] Health checks implemented
- [ ] Monitoring configured
- [ ] Alert thresholds defined
- [ ] Upgrade process documented
- [ ] Incident response procedures ready

### Development Checklist
- [ ] All code in version control
- [ ] Templates tested in development
- [ ] Rollback procedures created
- [ ] Documentation complete
- [ ] Variables properly organized
- [ ] Naming conventions followed

---

## Additional Resources

- [Administration Guide](../administration-guide/README.md)
- [Security Guide](../administration-guide/security.md)
- [Troubleshooting](../faq/troubleshooting.md)
- [API Documentation](../administration-guide/api.md)
