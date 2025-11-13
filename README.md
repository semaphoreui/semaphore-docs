# Semaphore Docs

Documentation for Semaphore UI - Modern UI and powerful API for Ansible, Terraform, OpenTofu, PowerShell and other DevOps tools.

## Build System

This project uses [Docusaurus](https://docusaurus.io/) for building the documentation site.

### Development

To start a local development server with hot reloading:

```bash
npm install  # First time only
npm start
# or
./run.sh
```

The site will be available at http://localhost:3000

### Production Build

To create an optimized production build:

```bash
npm install  # First time only
npm run build
# or
./build.sh
```

The built site will be in the `build/` directory.

### Deployment

The deployment uses Ansible playbooks in the `deploy/` directory:

```bash
cd deploy
ansible-playbook build.yml  # Build the site
# Deploy as configured for your environment
```

## Project Structure

- `docs/` - Documentation content (Markdown files)
- `src/` - React components and custom pages
  - `src/css/` - Custom styles
  - `src/pages/` - Custom pages
  - `src/components/` - React components
- `static/` - Static assets (images, etc.)
- `docusaurus.config.ts` - Main Docusaurus configuration
- `sidebars.ts` - Sidebar navigation configuration

## Migration from mdbook

This project was recently migrated from mdbook to Docusaurus. See [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for details about the migration.

## Links

* Documentation: [https://semaphoreui.com](https://semaphoreui.com)
* Source code: [https://github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore)
* Issue tracking: [https://github.com/semaphoreui/semaphore/issues](https://github.com/semaphoreui/semaphore/issues)
* Docker: [https://hub.docker.com/r/semaphoreui/semaphore](https://hub.docker.com/r/semaphoreui/semaphore)
* Discord: [https://discord.gg/5R6k7hNGcH](https://discord.gg/5R6k7hNGcH)