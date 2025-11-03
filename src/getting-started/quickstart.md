# Quick Start

Get Semaphore UI running in 10 minutes with this step-by-step guide.

## Installation Options

Choose the method that best fits your environment:

### Option 1: Docker (Recommended for Testing)

The fastest way to try Semaphore:

```bash
# Create a data directory
mkdir semaphore-data

# Run Semaphore with embedded database
docker run -d \
  --name semaphore \
  -p 3000:3000 \
  -v $(pwd)/semaphore-data:/var/lib/semaphore \
  semaphoreui/semaphore:latest
```

Access Semaphore at `http://localhost:3000`

**Default credentials**: 
- Username: `admin`
- Password: `changeme`

> **Note**: This uses BoltDB (embedded database) for simplicity. For production, use MySQL or PostgreSQL. See [Docker installation guide](../administration-guide/installation/docker.md) for details.

### Option 2: Docker Compose (Recommended for Production)

For a production-ready setup with PostgreSQL:

1. Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: semaphore
      POSTGRES_PASSWORD: semaphore
      POSTGRES_DB: semaphore
    volumes:
      - semaphore-postgres:/var/lib/postgresql/data
    restart: unless-stopped

  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_DB_DIALECT: postgres
      SEMAPHORE_DB_HOST: postgres
      SEMAPHORE_DB_PORT: 5432
      SEMAPHORE_DB_USER: semaphore
      SEMAPHORE_DB_PASS: semaphore
      SEMAPHORE_DB_NAME: semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_PASSWORD: changeme
      SEMAPHORE_ADMIN_NAME: Admin User
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: changeme_encryption_key
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  semaphore-postgres:
```

2. Start the services:

```bash
docker-compose up -d
```

3. Access Semaphore at `http://localhost:3000`

> **Security Note**: Change the default passwords and encryption key before deploying to production!

### Option 3: Package Manager (Linux)

For Debian/Ubuntu:

```bash
# Add repository
wget -O - https://github.com/semaphoreui/semaphore/releases/download/v2.10.14/semaphore_2.10.14_linux_amd64.deb

# Install
sudo dpkg -i semaphore_2.10.14_linux_amd64.deb

# Start service
sudo systemctl start semaphore
sudo systemctl enable semaphore
```

For more installation options, see the [Installation Guide](../administration-guide/installation.md).

## First-Time Setup

After starting Semaphore, follow these steps:

### 1. Access the Web Interface

Open your browser and navigate to `http://localhost:3000` (or your server's address).

### 2. Log In

Use the default credentials:
- **Username**: `admin`
- **Password**: `changeme`

**⚠️ Important**: Change this password immediately after logging in!

### 3. Change Your Password

1. Click on your username in the top-right corner
2. Select **"Profile"**
3. Click **"Change Password"**
4. Enter a strong new password
5. Click **"Save"**

### 4. Create Your First Project

Projects organize all your automation work. Let's create one:

1. Click **"New Project"** on the dashboard
2. Enter a project name (e.g., "My Infrastructure")
3. Optionally add a description
4. Click **"Create"**

You'll be redirected to your new project's dashboard.

## Your First Automation Task

Let's run a simple Ansible playbook to verify everything works.

### Step 1: Add a Repository

1. In your project, click **"Repositories"** in the left sidebar
2. Click **"New Repository"**
3. Fill in the details:
   - **Name**: `My Playbooks`
   - **URL**: `https://github.com/ansible/ansible-examples.git` (public example repo)
   - **Branch**: `master`
   - **Access Key**: Select **"None"** (public repository)
4. Click **"Create"**

Semaphore will clone the repository. You'll see a success message when done.

### Step 2: Create an Inventory

An inventory defines which hosts to run tasks on. For this example, we'll use a simple static inventory targeting localhost.

1. Click **"Key Store"** in the left sidebar
2. Click **"New Key"**
3. Create a credential:
   - **Name**: `Local Connection`
   - **Type**: Select **"None"** (for localhost, no authentication needed)
4. Click **"Create"**

5. Now click **"Inventory"** in the left sidebar
6. Click **"New Inventory"**
7. Fill in:
   - **Name**: `Localhost`
   - **User Credentials**: Select `Local Connection`
   - **Type**: Select **"Static"**
   - **Inventory**:
     ```ini
     [local]
     localhost ansible_connection=local
     ```
8. Click **"Create"**

### Step 3: Create a Task Template

Task templates define what to run and how.

1. Click **"Task Templates"** in the left sidebar
2. Click **"New Template"**
3. Fill in:
   - **Name**: `Hello World`
   - **Playbook**: Select **"Ansible"**
   - **Playbook Filename**: Enter a simple playbook path or use one from the example repo
   - **Repository**: Select `My Playbooks`
   - **Inventory**: Select `Localhost`
   - You can leave other fields as defaults
4. Click **"Create"**

### Step 4: Run Your First Task

1. Find your `Hello World` template in the list
2. Click the **"Run"** button (▶️)
3. A dialog appears - click **"Run"** to confirm

You'll be redirected to the task execution page where you can watch the real-time output!

🎉 **Congratulations!** You've just run your first automation task with Semaphore UI!

## What's Next?

Now that you have Semaphore running, explore these guides:

- **[Core Concepts](./concepts.md)** - Understand how Semaphore components work together
- **[UI Tour](./ui-tour.md)** - Learn about all the interface features
- **[Next Steps](./next-steps.md)** - Build practical workflows for your infrastructure

### Need Help?

- Check the [Troubleshooting Guide](../faq/troubleshooting.md)
- Join our [Discord Community](https://discord.gg/5R6k7hNGcH)
- Review the [User Guide](../user-guide/README.md) for detailed documentation

## Production Considerations

Before using Semaphore in production:

1. **Security**:
   - Change all default passwords
   - Use a strong encryption key for `SEMAPHORE_ACCESS_KEY_ENCRYPTION`
   - Set up HTTPS with a reverse proxy (see [Security Guide](../administration-guide/security.md))
   - Configure LDAP or OpenID for centralized authentication

2. **Database**:
   - Use PostgreSQL or MySQL (not BoltDB) for production
   - Set up regular backups
   - Configure proper database credentials

3. **Configuration**:
   - Review the [Configuration Guide](../administration-guide/configuration.md)
   - Set up notifications (email, Slack, etc.)
   - Configure remote runners if needed

4. **Monitoring**:
   - Check [Logs](../administration-guide/logs.md) regularly
   - Set up log retention policies
   - Monitor system resources

See the full [Administration Guide](../administration-guide/README.md) for complete production setup instructions.
