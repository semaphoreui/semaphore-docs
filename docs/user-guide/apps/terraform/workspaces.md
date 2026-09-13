---
title: Workspaces
description: Managing Terraform and OpenTofu workspaces in a template, isolating state per environment, and setting the default workspace.
---

# Workspaces

![Workspaces tab of a template](/assets/template-workspaces.webp)

Semaphore provides built-in support for Terraform workspaces, allowing you to manage multiple environments and configurations within a single project. This feature helps you maintain separate state files for different environments like development, staging, and production.

## Features {#features}

- **Workspace Management**: Create, switch, and delete workspaces directly from the Semaphore UI.
- **State Isolation**: Each workspace maintains its own state file, preventing conflicts between environments.
- **Environment Variables**: Configure workspace-specific environment variables.
- **Workspace Selection**: Choose the target workspace when running Terraform commands.

## Using Workspaces in Semaphore {#using-workspaces-in-semaphore}

### Creating a Workspace {#creating-a-workspace}

In the **Workspaces** section of the Terraform/OpenTofu template where you want to add a workspace, follow these steps:

1. Click the ➕ button.  
2. In the menu that appears, select **New Workspace**.  
3. In the modal dialog, enter the workspace name and select the SSH key to be used for cloning modules.  
4. Click the **Create** button to add the new workspace to the template.  
5. You can now use this workspace to run tasks.


### Switching workspaces {#switching-workspaces}

You can set the default workspace for a Terraform/OpenTofu template by clicking the **MAKE DEFAULT** button.


### Workspace-specific variables {#workspace-specific-variables}

Semaphore currently does not support workspace-specific variables.