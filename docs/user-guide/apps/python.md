
# Python

Semaphore can run Python scripts directly. To do this, create a **Python** task template.

## Creating a Python template

1. Go to **Task Templates** section and click the **New Template** button.
2. Select **Python** as the app type.
3. Configure the template:

| Field | Description |
|---|---|
| **Name** | A descriptive name for the template |
| **Repository** | Repository containing your `.py` script |
| **Playbook / Script** | Relative path to the script, e.g. `scripts/deploy.py` |
| **Variable Groups** | Variable groups whose values are injected as environment variables |

4. Click **Create**.
5. Click **Run** to execute the template.

## Passing variables to scripts

Variables from the selected **Variable Groups** are injected as environment variables. Access them in Python with `os.environ`:

```python
import os

target = os.environ.get("TARGET_HOST")
print(f"Deploying to {target}")
```

## Python version and dependencies

Semaphore uses whichever `python3` binary is on `PATH` in the execution environment.

- **Binary/package install**: ensure the correct `python3` is installed on the host.
- **Docker**: use a custom image with the required Python version.
- **Docker (additional packages)**: mount a `requirements.txt` at `/etc/semaphore/requirements.txt`. Semaphore installs it automatically on container start. See [Docker installation](/admin-guide/installation/docker).

## Notes

- Scripts run non-interactively.
- Exit code `0` means success; any non-zero exit code marks the task as failed.
