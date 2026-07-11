
# PowerShell

Semaphore can run PowerShell scripts on Windows hosts (or from a Windows runner). To do this, create a **PowerShell** task template.

## Creating a PowerShell template

1. Go to **Task Templates** section and click the **New Template** button.
2. Select **PowerShell** as the app type.
3. Configure the template:

| Field | Description |
|---|---|
| **Name** | A descriptive name for the template |
| **Repository** | Repository containing your `.ps1` script |
| **Playbook / Script** | Relative path to the script, e.g. `scripts/deploy.ps1` |
| **Variable Groups** | Variable groups whose values are injected as environment variables |

4. Click **Create**.
5. Click **Run** to execute the template.

## Passing variables to scripts

Variables from the selected **Variable Groups** are injected as environment variables before the script runs. Access them in PowerShell with `$env:VARIABLE_NAME`:

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Running on Windows hosts

PowerShell templates require either:
- A **Windows runner** — a Semaphore runner deployed on a Windows host. See [Runners](/admin-guide/runners).
- The Semaphore server itself running on Windows.

## Notes

- Scripts run non-interactively. Avoid prompts that require user input.
- Exit code `0` means success; any non-zero exit code marks the task as failed.
