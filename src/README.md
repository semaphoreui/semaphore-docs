# Welcome to Semaphore UI

**A modern, lightweight, and powerful automation platform for Ansible, Terraform, OpenTofu, Bash, PowerShell, and Python.**

<img style="box-shadow: none;" src=".gitbook/assets/134777345-8789d9e4-ff0d-439c-b80e-ddc56b74fcee.webp">

## What is Semaphore UI?

Semaphore UI is an open-source web interface that makes infrastructure automation accessible, secure, and efficient. Whether you're deploying applications, managing infrastructure, or running maintenance scripts, Semaphore provides an intuitive interface backed by a powerful REST API.

### Why Choose Semaphore?

- **🚀 Lightweight**: Single binary, minimal resources, no complex dependencies (no Kubernetes, Docker, or JVM required)
- **⚡ Fast Setup**: Install and run in minutes, not hours
- **🔒 Secure**: Self-hosted, encrypted credentials, role-based access control
- **🛠️ Versatile**: Run Ansible, Terraform/OpenTofu, Shell, PowerShell, and Python from one platform
- **📱 Modern UI**: Responsive design works on desktop, tablet, and mobile devices
- **🔌 Extensible**: REST API, webhooks, remote runners, and integrations

### Built for Everyone

Semaphore is written in **pure Go** and available for:
- **Linux** (x64, ARM, ARM64)
- **macOS** (x64, ARM64)
- **Windows** (via WSL or direct binary)

### Database Support

Choose the database that fits your needs:
- **PostgreSQL** (recommended for production)
- **MySQL** (production-ready)
- **BoltDB** (embedded, zero-config for testing)

## What Can You Do with Semaphore?

### Infrastructure & Configuration Management
- Deploy applications with Ansible playbooks
- Manage cloud infrastructure with Terraform/OpenTofu
- Configure servers and network devices
- Orchestrate complex multi-tier deployments

### Automation & CI/CD
- [Build, test, and deploy pipelines](./administration-guide/cicd.md)
- Automated rollbacks and disaster recovery
- Scheduled maintenance tasks
- Health checks and monitoring scripts

### Team Collaboration
- Share automation across teams with projects
- Role-based access control per project
- Audit logs for compliance
- Self-service automation for developers

### Operations & Maintenance
- Database backups and restores
- Certificate renewals
- System updates and patches
- Custom operational runbooks

## Core Features

### For Users
- ✅ Run automation tasks from your browser
- ✅ Real-time task output and logging
- ✅ Schedule automated task execution (cron-based)
- ✅ Interactive forms (survey variables) for runtime input
- ✅ Complete task history with searchable logs
- ✅ Mobile-responsive interface
- ✅ Git integration (GitHub, GitLab, Bitbucket, Azure DevOps, Gitea)

### For Administrators
- ✅ Centralized credential management (encrypted)
- ✅ LDAP and OpenID Connect authentication
- ✅ Multiple notification channels (Email, Slack, Telegram, MS Teams)
- ✅ REST API for automation and integration
- ✅ Remote runners for distributed execution (Pro)
- ✅ Comprehensive audit logging
- ✅ Webhook triggers for event-driven automation

### For DevOps Teams
- ✅ Multi-project organization
- ✅ Team-based access control
- ✅ Variable groups for environment management
- ✅ Dynamic and static inventories
- ✅ Build versioning and deployment tracking
- ✅ Pipeline capabilities (build → test → deploy)

## Quick Start

Ready to try Semaphore? Pick your installation method:

### Option 1: Docker (Fastest)
```bash
docker run -d -p 3000:3000 semaphoreui/semaphore:latest
```
Access at `http://localhost:3000` (default: admin/changeme)

### Option 2: Package Manager (Production)
```bash
# Debian/Ubuntu
wget https://github.com/semaphoreui/semaphore/releases/download/v2.10.14/semaphore_2.10.14_linux_amd64.deb
sudo dpkg -i semaphore_2.10.14_linux_amd64.deb
```

### Option 3: Cloud Deployment
Deploy to AWS, Azure, GCP, or DigitalOcean with our guides.

**👉 [Full Installation Guide](./administration-guide/installation.md)**

## Getting Started Guide

New to Semaphore? Follow our comprehensive getting started guide:

1. **[Quick Start](./getting-started/quickstart.md)** - Get running in 10 minutes
2. **[Core Concepts](./getting-started/concepts.md)** - Understand how Semaphore works
3. **[UI Tour](./getting-started/ui-tour.md)** - Navigate the interface
4. **[Next Steps](./getting-started/next-steps.md)** - Build your first workflows

**👉 [Start the Getting Started Guide](./getting-started/README.md)**

## Documentation Structure

### 🚀 [Getting Started](./getting-started/README.md)
Perfect for newcomers. Learn the basics and build your first automation workflow.

### 📖 [User Guide](./user-guide/README.md)
Day-to-day usage: projects, task templates, inventories, schedules, and more.

### ⚙️ [Administration Guide](./administration-guide/README.md)
Installation, configuration, security, authentication, runners, and system management.

### ❓ [FAQ & Troubleshooting](./faq/troubleshooting.md)
Common issues and their solutions.

## Use Cases

### Development Teams
- **Continuous Deployment**: Auto-deploy on Git commits
- **Environment Management**: Provision dev/staging/prod environments
- **Database Migrations**: Run migrations safely with rollback
- **Testing**: Automated test execution

### Operations Teams
- **Configuration Management**: Keep servers in desired state
- **Backup Automation**: Scheduled backups with verification
- **Certificate Management**: Auto-renew SSL certificates
- **Monitoring Scripts**: Regular health checks and alerts

### Platform Engineers
- **Infrastructure as Code**: Terraform/OpenTofu management
- **Multi-Cloud Management**: AWS, Azure, GCP orchestration
- **Self-Service**: Enable developers to deploy safely
- **Compliance**: Audit trails and approval workflows

### Security Teams
- **Patch Management**: Automated security updates
- **Vulnerability Remediation**: Targeted fixes across fleet
- **Compliance Checks**: Regular audit tasks
- **Access Management**: Centralized credential rotation

## Architecture Overview

```
┌────────────────────────────────────────────────────┐
│                  Semaphore UI                      │
│  ┌──────────┐  ┌─────────┐  ┌──────────────────┐  │
│  │ Web UI   │  │REST API │  │Database (Pg/My)│  │
│  │ (React)  │◄─┤  (Go)   │◄─┤  or BoltDB     │  │
│  └──────────┘  └────┬────┘  └──────────────────┘  │
│                     │                              │
│              ┌──────▼──────┐                       │
│              │Task Engine  │                       │
│              └──────┬──────┘                       │
└─────────────────────┼────────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
  ┌────▼───┐    ┌────▼───┐    ┌────▼───┐
  │Ansible │    │Terraform│    │Scripts│
  │        │    │/OpenTofu│    │Bash/PS │
  └────┬───┘    └────┬───┘    └────┬───┘
       │              │              │
       └──────────────┼──────────────┘
                      │
            ┌─────────▼─────────┐
            │ Target Systems    │
            │ (Servers, Cloud)  │
            └───────────────────┘
```

## Community & Support

### Get Help
- 💬 **[Discord Community](https://discord.gg/5R6k7hNGcH)** - Join our active community
- 🐛 **[GitHub Issues](https://github.com/semaphoreui/semaphore/issues)** - Report bugs
- 💡 **[GitHub Discussions](https://github.com/semaphoreui/semaphore/discussions)** - Ask questions
- 📧 **[Email](mailto:denis@semaphoreui.com)** - Direct support

### Contribute
Semaphore is open-source and welcomes contributions:
- 🌟 Star us on GitHub
- 🔀 Submit pull requests
- 📝 Improve documentation
- 🐞 Report bugs and issues
- 💬 Help others in the community

## Links

* Source code: [https://github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore)
* Issue tracking: [https://github.com/semaphoreui/semaphore/issues](https://github.com/semaphoreui/semaphore/issues)
* Docker: [https://hub.docker.com/r/semaphoreui/semaphore](https://hub.docker.com/r/semaphoreui/semaphore)
* Snap: [https://snapcraft.io/semaphore](https://snapcraft.io/semaphore)
* Contact: [denis@semaphoreui.com](mailto:denis@semaphoreui.com)
* Docker container configurator:

   [![](https://img.shields.io/badge/docker_configurator-0050ab?style=for-the-badge&logo=docker)](https://semaphoreui.com/install/docker/)  

* Our responsive community:

   [![discord](https://img.shields.io/badge/discord_community-510b80?style=for-the-badge&logo=discord)](https://discord.gg/5R6k7hNGcH)  