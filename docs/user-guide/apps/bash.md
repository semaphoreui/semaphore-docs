---
title: Shell/Bash scripts
description: Creating a Bash Script template, passing variable groups as environment variables, and script exit codes.
---

# Shell/Bash scripts

Semaphore can run shell scripts using `/bin/bash`. To do this, create a **Bash Script** task template.

## Creating a Bash template {#creating-a-bash-template}

1. Go to **Task Templates** section and click the **New Template** button.
2. Select **Bash** as the app type.
3. Configure the template:

| Field | Description |
|---|---|
| **Name** | A descriptive name for the template |
| **Repository** | Repository containing your shell script |
| **Playbook / Script** | Relative path to the script, e.g. `scripts/deploy.sh` |
| **Variable Groups** | Variable groups whose values are injected as environment variables |

4. Click **Create**.
5. Click **Run** to execute the template. The New Task dialog for a script template has only the optional message, plus survey variables and prompts if the template defines them.

<div class="DialogScreenshot">

![New Task dialog for a Bash template](/assets/task-new-bash.webp)

</div>

## Passing variables to scripts {#passing-variables-to-scripts}

Variables from the selected **Variable Groups** are injected as environment variables. Access them in the script with `$VARIABLE_NAME`:

```bash
#!/bin/bash
echo "Deploying to $TARGET_HOST"
```

## Notes {#notes}

- Make your script executable (`chmod +x`) or ensure it starts with a valid shebang (`#!/bin/bash`).
- Scripts run non-interactively. Avoid prompts that wait for user input.
- Exit code `0` means success; any non-zero exit code marks the task as failed.
- If a very short script produces no log output, see [Bash script output is missing or incomplete](/faq/troubleshooting#bash-script-output-is-missing-or-incomplete) in the troubleshooting guide.
- To run commands on remote hosts, use [Ansible](./ansible) instead.
