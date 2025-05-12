<div class="breadcrumbs">
    <a href="/user-guide/task-templates/">Task templates</a>
    → <a href="/user-guide/task-templates/apps/terraform">Terraform/OpenTofu</a>
    → Workspaces
</div>

# Workspaces

Semaphore provides built-in support for Terraform workspaces, allowing you to manage multiple environments and configurations within a single project. This feature helps you maintain separate state files for different environments like development, staging, and production.

![](<../../../../.gitbook/assets/tf-workspace.webp>)

## Features

- **Workspace Management**: Create, switch, and delete workspaces directly from the Semaphore UI.
- **State Isolation**: Each workspace maintains its own state file, preventing conflicts between environments.
- **Environment Variables**: Configure workspace-specific environment variables.
- **Workspace Selection**: Choose the target workspace when running Terraform commands.

## Using Workspaces in Semaphore

### Creating a Workspace

1. Navigate to your project in Semaphore.
2. Go to the "Terraform" section.
3. Click on "Workspaces" in the sidebar.
4. Click "Create Workspace" and provide a name for your workspace.

### Switching Workspaces

You can switch between workspaces in two ways:

1. **Through the UI**:
   - Go to the "Terraform" section.
   - Select "Workspaces" from the sidebar.
   - Click on the desired workspace to make it active.

2. **In your Terraform configuration**:
   ```hcl
   terraform {
     workspace {
       name = "development"  # or "staging", "production", etc.
     }
   }
   ```

### Workspace-specific Variables

You can set workspace-specific variables in Semaphore:

1. Go to your project settings.
2. Navigate to the **Variable Groups** section.
3. Add variables with workspace-specific prefixes:
   ```
   TF_WORKSPACE_development_VAR_NAME=value
   TF_WORKSPACE_staging_VAR_NAME=value
   TF_WORKSPACE_production_VAR_NAME=value
   ```

## Best Practices

- Use descriptive names for your workspaces (e.g., `dev`, `staging`, `prod`).
- Keep workspace configurations consistent across your team.
- Use workspace-specific variables for environment-specific values.
- Regularly clean up unused workspaces to maintain a clean project structure.

## Limitations

- Maximum number of workspaces per project: 50
- Workspace names must be unique within a project
- Workspace names cannot contain special characters (use alphanumeric characters and hyphens)

For more information about Terraform workspaces, refer to the [Terraform documentation](https://developer.hashicorp.com/terraform/language/state/workspaces).
