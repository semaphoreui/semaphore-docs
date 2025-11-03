# Migration Guide

Migrating from other automation platforms to Semaphore UI.

## Table of Contents

- [Migrating from Ansible Tower / AWX](#migrating-from-ansible-tower--awx)
- [Migrating from Jenkins](#migrating-from-jenkins)
- [Migrating from GitLab CI/CD](#migrating-from-gitlab-cicd)
- [Migrating from Rundeck](#migrating-from-rundeck)
- [General Migration Strategy](#general-migration-strategy)

---

## Migrating from Ansible Tower / AWX

Semaphore UI provides a lightweight alternative to Ansible Tower/AWX with similar functionality.

### Feature Comparison

| Feature | Ansible Tower/AWX | Semaphore UI | Notes |
|---------|-------------------|--------------|-------|
| Playbook Execution | ✅ | ✅ | Core functionality |
| Inventories | ✅ | ✅ | Static, dynamic, file-based |
| Credentials | ✅ | ✅ | Encrypted storage |
| Job Templates | ✅ | ✅ | Task Templates |
| Scheduling | ✅ | ✅ | Cron-based |
| RBAC | ✅ | ✅ | Project-level roles |
| Notifications | ✅ | ✅ | Multiple channels |
| API | ✅ | ✅ | REST API |
| Workflows | ✅ | ⚠️ | Limited (use task chaining) |
| Survey | ✅ | ✅ | Survey Variables |
| SCM Integration | ✅ | ✅ | Git repositories |

### Conceptual Mapping

#### Organizations → Projects
**Tower/AWX**:
```
Organization: "Engineering"
└── Projects, Inventories, Templates
```

**Semaphore**:
```
Project: "Engineering"
└── Repositories, Inventories, Templates
```

**Migration**: Create one Semaphore project per Tower organization.

#### Projects → Repositories
**Tower/AWX**:
```
Project: "Web App Playbooks"
- SCM URL: git@github.com:org/playbooks.git
- SCM Branch: main
```

**Semaphore**:
```
Repository: "Web App Playbooks"
- URL: git@github.com:org/playbooks.git
- Branch: main
```

**Migration**: Each Tower project becomes a Semaphore repository.

#### Job Templates → Task Templates
**Tower/AWX**:
```
Job Template: "Deploy Web App"
- Project: Web App Playbooks
- Playbook: deploy.yml
- Inventory: Production Servers
- Credentials: SSH Key
- Extra Variables: { "version": "latest" }
```

**Semaphore**:
```
Task Template: "Deploy Web App"
- Repository: Web App Playbooks
- Playbook Filename: deploy.yml
- Inventory: Production Servers
- Environment: Variable Groups
- Survey Variables: version
```

**Migration**: Map each job template to a task template.

#### Credentials → Key Store
**Tower/AWX Credential Types**:
- Machine (SSH) → SSH Key
- Source Control (SSH) → SSH Key
- Vault → Login with Password (vault password)
- Cloud credentials → Login with Password (API keys as JSON)

### Step-by-Step Migration

#### Phase 1: Inventory & Planning (Week 1)

1. **Document Tower Setup**:
   ```bash
   # Export Tower configuration
   tower-cli config
   tower-cli organization list
   tower-cli project list
   tower-cli job_template list
   ```

2. **Create Migration Spreadsheet**:
   ```
   | Tower Org | Tower Project | Job Template | Semaphore Project | Status |
   |-----------|---------------|--------------|-------------------|--------|
   | Eng       | Web Playbooks | Deploy       | Engineering       | TODO   |
   ```

3. **Identify Dependencies**:
   - Custom credential types → Plan Variable Group structure
   - Workflow templates → Design task chaining approach
   - Custom notifications → Configure Semaphore integrations

#### Phase 2: Infrastructure Setup (Week 1-2)

1. **Install Semaphore**:
   ```bash
   # Production-grade installation
   # See: Installation Guide
   ```

2. **Configure Authentication**:
   ```bash
   # Match Tower's auth (LDAP/SAML)
   # See: LDAP/OpenID Configuration
   ```

3. **Set Up Notifications**:
   ```bash
   # Configure same channels as Tower
   # See: Notifications Guide
   ```

#### Phase 3: Resource Migration (Week 2-3)

1. **Create Projects**:
   ```
   For each Tower Organization:
   - Create Semaphore Project
   - Add team members with appropriate roles
   ```

2. **Migrate Credentials**:
   ```
   For each Tower Credential:
   - Create Key Store entry
   - Test connectivity
   - Document mapping
   ```

3. **Add Repositories**:
   ```
   For each Tower Project:
   - Create Semaphore Repository
   - Verify clone works
   - Note any submodules
   ```

4. **Create Inventories**:
   ```
   For each Tower Inventory:
   - Static → Create static inventory
   - Dynamic → Set up dynamic inventory script
   - Test connections
   ```

5. **Set Up Variable Groups**:
   ```
   For Tower Extra Variables:
   - Create Variable Groups per environment
   - Mark secrets appropriately
   - Test variable substitution
   ```

#### Phase 4: Template Migration (Week 3-4)

1. **Migrate Job Templates**:
   ```
   For each Tower Job Template:
   1. Create Task Template
   2. Configure:
      - Repository
      - Playbook filename
      - Inventory
      - Variable Groups
   3. Add Survey Variables (if any)
   4. Configure notifications
   5. Test execution
   ```

2. **Convert Workflows** (if any):
   ```
   Tower Workflow:
   - Job A → Job B → Job C
   
   Semaphore Options:
   a) Create master playbook that includes all
   b) Use task dependencies (if supported)
   c) Manual execution in sequence
   d) Use API to chain tasks
   ```

#### Phase 5: Testing (Week 4-5)

1. **Parallel Testing**:
   ```
   Run same playbooks in both Tower and Semaphore:
   - Compare outputs
   - Verify results
   - Check timing
   - Validate notifications
   ```

2. **User Acceptance Testing**:
   ```
   - Train team on Semaphore UI
   - Gather feedback
   - Adjust configurations
   - Update documentation
   ```

#### Phase 6: Cutover (Week 5-6)

1. **Gradual Migration**:
   ```
   Week 1: Non-critical jobs
   Week 2: Development environments
   Week 3: Staging environments
   Week 4: Production (one application at a time)
   ```

2. **Monitoring**:
   ```
   - Watch for failures
   - Compare success rates
   - Check performance
   - Gather user feedback
   ```

3. **Decommission Tower**:
   ```
   - Archive Tower database
   - Export logs
   - Document lessons learned
   - Celebrate! 🎉
   ```

### Migration Script Example

```python
#!/usr/bin/env python3
# tower-to-semaphore.py - Helper script

import requests
import json

# Configuration
TOWER_URL = "https://tower.example.com"
TOWER_TOKEN = "your-tower-token"
SEMAPHORE_URL = "https://semaphore.example.com"
SEMAPHORE_TOKEN = "your-semaphore-token"

# Export Tower job templates
def export_tower_templates():
    headers = {"Authorization": f"Bearer {TOWER_TOKEN}"}
    response = requests.get(f"{TOWER_URL}/api/v2/job_templates/", headers=headers)
    return response.json()["results"]

# Create Semaphore templates
def create_semaphore_template(tower_template, project_id):
    headers = {
        "Authorization": f"Bearer {SEMAPHORE_TOKEN}",
        "Content-Type": "application/json"
    }
    
    semaphore_template = {
        "name": tower_template["name"],
        "description": tower_template["description"],
        "playbook": tower_template["playbook"],
        "project_id": project_id,
        # ... map other fields
    }
    
    response = requests.post(
        f"{SEMAPHORE_URL}/api/project/{project_id}/templates",
        headers=headers,
        json=semaphore_template
    )
    return response.json()

# Main migration
def main():
    tower_templates = export_tower_templates()
    print(f"Found {len(tower_templates)} templates in Tower")
    
    for template in tower_templates:
        print(f"Migrating: {template['name']}")
        # Implement mapping logic
        # create_semaphore_template(template, PROJECT_ID)

if __name__ == "__main__":
    main()
```

### Common Challenges

#### Challenge 1: Workflow Templates
**Problem**: Semaphore doesn't have native workflow templates

**Solutions**:
1. **Combined Playbook**: Create a single playbook that includes all steps
2. **API Orchestration**: Use Semaphore API to chain task executions
3. **External Tool**: Use n8n or Airflow to orchestrate
4. **Manual Process**: Document execution order

#### Challenge 2: Custom Credential Types
**Problem**: Tower supports custom credential types, Semaphore has predefined types

**Solution**:
- Use "Login with Password" with JSON in password field:
```json
{
  "api_key": "...",
  "api_secret": "...",
  "region": "us-east-1"
}
```
- Access in playbook via environment variables

#### Challenge 3: Instance Groups
**Problem**: Tower's instance groups for execution isolation

**Solution**:
- Use Semaphore Pro Runners for similar functionality
- Assign runners to specific projects
- Configure runner labels for targeting

---

## Migrating from Jenkins

Jenkins is a general-purpose CI/CD tool, while Semaphore focuses on infrastructure automation.

### When to Migrate

**Good Fit**:
- Jenkins used primarily for Ansible/Terraform execution
- Running deployment scripts via Jenkins
- Managing infrastructure as code
- Configuration management tasks

**Not a Good Fit**:
- Complex build pipelines
- Multi-stage CI workflows
- Extensive plugin ecosystem requirements
- Java application builds

### Conceptual Mapping

| Jenkins | Semaphore UI | Notes |
|---------|--------------|-------|
| Job | Task Template | Single execution unit |
| Pipeline | Task chain / Playbook | Multi-step workflows |
| Parameters | Survey Variables | Runtime input |
| Credentials | Key Store | Encrypted storage |
| Build Triggers | Schedules / Webhooks | Automated execution |
| Build History | Task History | Execution logs |

### Migration Strategy

#### 1. Inventory Jenkins Jobs

```groovy
// Example Jenkins job
pipeline {
    agent any
    parameters {
        string(name: 'ENVIRONMENT', defaultValue: 'dev')
        string(name: 'VERSION', defaultValue: 'latest')
    }
    stages {
        stage('Deploy') {
            steps {
                ansiblePlaybook(
                    playbook: 'deploy.yml',
                    inventory: 'inventory/${ENVIRONMENT}',
                    extras: "-e version=${VERSION}"
                )
            }
        }
    }
}
```

**Convert to Semaphore**:
```
Task Template: "Deploy Application"
- Type: Ansible
- Playbook: deploy.yml
- Inventory: (select environment)
- Survey Variables:
  - environment: dev/staging/prod
  - version: text input
```

#### 2. Replace Jenkins Plugins

| Jenkins Plugin | Semaphore Alternative |
|----------------|----------------------|
| Ansible Plugin | Native Ansible support |
| Terraform Plugin | Native Terraform support |
| SSH Plugin | SSH Keys in Key Store |
| Credentials Plugin | Key Store |
| Email Extension | Email notifications |
| Slack Notification | Slack integration |
| Build Timeout | Task timeouts |

#### 3. Migration Steps

1. **Document Jenkins Jobs**:
   ```bash
   # Export Jenkins configuration
   java -jar jenkins-cli.jar -s http://jenkins/ \
     list-jobs
   ```

2. **Create Repositories**:
   - Move Jenkinsfiles content to Ansible playbooks
   - Commit scripts to Git repositories

3. **Create Task Templates**:
   - One template per Jenkins job
   - Map parameters to survey variables
   - Configure same inventories

4. **Set Up Schedules**:
   ```
   Jenkins: @daily
   Semaphore: 0 0 * * * (cron)
   ```

5. **Configure Webhooks**:
   - Replace Jenkins webhooks with Semaphore webhooks
   - Update Git repository settings

#### 4. Hybrid Approach

Run Jenkins and Semaphore in parallel:
```
Jenkins: CI/CD pipelines, builds, tests
Semaphore: Deployments, infrastructure, configuration
```

---

## Migrating from GitLab CI/CD

### When to Use Both

**GitLab CI** for:
- Code builds and tests
- Container image creation
- Code quality checks

**Semaphore** for:
- Infrastructure deployment
- Configuration management
- Operations automation

### Integration Pattern

```yaml
# .gitlab-ci.yml
build:
  stage: build
  script:
    - npm run build
    - docker build -t myapp:$CI_COMMIT_SHA .

deploy:
  stage: deploy
  script:
    # Trigger Semaphore deployment
    - curl -X POST "https://semaphore.example.com/api/project/${PROJECT_ID}/tasks"
      -H "Authorization: Bearer ${SEMAPHORE_TOKEN}"
      -d '{"template_id": "deploy-template", "version": "'$CI_COMMIT_SHA'"}'
```

### Migration from .gitlab-ci.yml

```yaml
# Original .gitlab-ci.yml
deploy_production:
  stage: deploy
  script:
    - ansible-playbook -i inventory/prod deploy.yml -e "version=$VERSION"
  when: manual
  only:
    - main
```

**Convert to Semaphore**:
1. Create Task Template: "Deploy to Production"
2. Configure Ansible playbook
3. Add survey variable: version
4. Remove from `.gitlab-ci.yml`
5. Add Semaphore API call to GitLab CI

---

## Migrating from Rundeck

Rundeck and Semaphore are similar in purpose, making migration straightforward.

### Feature Comparison

| Feature | Rundeck | Semaphore |
|---------|---------|-----------|
| Job Execution | ✅ | ✅ |
| Scheduling | ✅ | ✅ |
| Access Control | ✅ | ✅ |
| Notifications | ✅ | ✅ |
| API | ✅ | ✅ |
| Node Sources | ✅ | ✅ (Inventories) |

### Conceptual Mapping

| Rundeck | Semaphore |
|---------|-----------|
| Project | Project |
| Job | Task Template |
| Node Source | Inventory |
| Key Storage | Key Store |
| Execution | Task |
| Schedule | Schedule |

### Migration Process

1. **Export Rundeck Jobs**:
   ```bash
   rd jobs list -p ProjectName
   rd jobs get -p ProjectName -f job-export.xml
   ```

2. **Convert Job Definitions**:
   ```xml
   <!-- Rundeck job.xml -->
   <joblist>
     <job>
       <name>Deploy Web App</name>
       <description>Deploys the application</description>
       <sequence>
         <command>
           <script><![CDATA[ansible-playbook deploy.yml]]></script>
         </command>
       </sequence>
     </job>
   </joblist>
   ```

   Becomes Semaphore Task Template:
   ```
   Name: Deploy Web App
   Description: Deploys the application
   Type: Ansible
   Playbook: deploy.yml
   ```

3. **Migrate Node Sources**:
   - Copy inventory files
   - Configure dynamic inventories
   - Set up SSH keys

4. **Set Up Schedules**:
   - Copy cron expressions directly
   - Semaphore uses same cron syntax

---

## General Migration Strategy

### Pre-Migration Checklist

- [ ] Document current automation workflows
- [ ] Inventory all jobs/pipelines
- [ ] List all credentials and their usage
- [ ] Map user roles and permissions
- [ ] Review integrations and webhooks
- [ ] Identify customizations and plugins
- [ ] Plan downtime windows
- [ ] Create rollback plan

### Migration Phases

#### Phase 1: Preparation (1-2 weeks)
- Install and configure Semaphore
- Set up authentication (LDAP/OpenID)
- Configure integrations
- Create test environment

#### Phase 2: Resource Migration (2-3 weeks)
- Create projects
- Add repositories
- Import inventories
- Migrate credentials
- Set up variable groups

#### Phase 3: Template Creation (2-4 weeks)
- Convert jobs to task templates
- Test each template
- Add survey variables
- Configure notifications

#### Phase 4: Testing (2-3 weeks)
- Parallel testing
- User acceptance testing
- Performance validation
- Documentation updates

#### Phase 5: Cutover (1-2 weeks)
- Gradual migration
- Monitor for issues
- User training
- Decommission old system

### Best Practices

1. **Start Small**: Migrate non-critical workflows first
2. **Test Thoroughly**: Validate in test environment
3. **Document Everything**: Update runbooks and procedures
4. **Train Users**: Ensure team knows Semaphore UI
5. **Monitor Closely**: Watch for issues after migration
6. **Keep Old System**: Maintain for rollback during transition
7. **Gather Feedback**: Iterate based on user input

### Common Pitfalls

❌ **Avoid**:
- Big-bang migration (do gradual instead)
- Skipping testing phase
- Inadequate documentation
- Not training users
- Rushing the process

✅ **Do**:
- Plan thoroughly
- Test extensively
- Communicate clearly
- Train proactively
- Monitor continuously

---

## Getting Help

### Migration Support

- **[Discord Community](https://discord.gg/5R6k7hNGcH)** - Ask migration questions
- **[GitHub Discussions](https://github.com/semaphoreui/semaphore/discussions)** - Share experiences
- **[Email Support](mailto:denis@semaphoreui.com)** - Direct assistance

### Additional Resources

- [Installation Guide](../administration-guide/installation.md)
- [Configuration Guide](../administration-guide/configuration.md)
- [User Guide](../user-guide/README.md)
- [API Documentation](../administration-guide/api.md)
- [Best Practices](./best-practices.md)

---

**Need help with your migration?** Reach out to the community or contact support!
