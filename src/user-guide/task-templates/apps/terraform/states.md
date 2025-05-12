<div class="breadcrumbs">
    <a href="/user-guide/task-templates/">Task templates</a>
    → <a href="/user-guide/task-templates/apps/terraform">Terraform/OpenTofu</a>
    → HTTP backend (Pro)
</div>

# HTTP Backend (Pro)

The Semaphore UI HTTP backend for Terraform securely stores and manages Terraform state files directly within Semaphore. Available in the Pro plan, it offers several key advantages.

## Features

- **Secure State Storage**: State files are encrypted and stored securely within Semaphore.
- **State Locking**: Prevents concurrent modifications to the same state file.
- **Version History**: Track changes to your infrastructure state over time.
- **UI Integration**: Manage state files directly through the Semaphore interface.

## Configuration

To use the Semaphore UI HTTP backend, add the following configuration to your Terraform configuration:

```hcl
terraform {
  backend "http" {
    address = "https://<your-semaphore-instance>/api/terraform/state/<project-id>"
    lock_address = "https://<your-semaphore-instance>/api/terraform/state/<project-id>/lock"
    unlock_address = "https://<your-semaphore-instance>/api/terraform/state/<project-id>/lock"
    username = "semaphore"
    password = "<your-api-token>"
  }
}
```



Replace the following placeholders:
- `<your-semaphore-instance>`: Your Semaphore instance URL
- `<project-id>`: Your Semaphore project ID
- `<your-api-token>`: Your Semaphore API token

## Accessing State Files

You can access and manage your Terraform state files through the Semaphore UI:

1. Navigate to your project in Semaphore
2. Go to the "Terraform" section
3. Select "States" from the sidebar
4. View, download, or manage your state files

## Best Practices

- Always use state locking when working in team environments
- Regularly backup your state files
- Use meaningful names for your state files
- Keep your API tokens secure and rotate them periodically

## Limitations

- Maximum state file size: 100MB
- State locking timeout: 5 minutes
- Maximum number of state versions: 100 per project

For more information about managing Terraform state in Semaphore, refer to the [Terraform documentation](https://developer.hashicorp.com/terraform/language/settings/backends/http).

