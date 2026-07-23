# Tutorial: Run Bash and Python scripts

In this tutorial you will run shell and Python scripts with Semaphore UI. You will prepare a Git repository with two small scripts that print information about their environment, connect it to a Semaphore project, create a **Bash Script** task template, and then repeat the steps for a **Python Script** template.

## Prerequisites

* A running Semaphore instance. See the [Quickstart](/getting-started/quickstart) if you do not have one yet.
* A [project](/user-guide/projects) created in Semaphore.
* `/bin/bash` and `python3` available in the environment where Semaphore runs tasks.
* A Git repository that the Semaphore server can reach (for example, a public repository on GitHub).

## Prepare the repository

The repository needs two files: one Bash script and one Python script. Both simply print information about the environment they run in.

```bash title="hello.sh"
#!/bin/bash
echo "Hello from Semaphore!"
echo "Running as user: $(whoami)"
echo "Working directory: $(pwd)"
echo "Bash version: $BASH_VERSION"
```

```python title="hello.py"
import os
import sys

print("Hello from Semaphore!")
print(f"Python version: {sys.version}")
print(f"Working directory: {os.getcwd()}")
```

Commit and push both files to your repository. Scripts run non-interactively, so avoid anything that prompts for input; an exit code of `0` marks the task as successful, any other exit code marks it as failed.

## Create the template

First add the supporting resources (key and repository), then the Bash template.

1. In the **Key Store** section, select **New Key**. Set the type to **None**, give it a name such as `no-auth`, and save it. This key is used to access a repository that requires no authentication.
2. In the **Repositories** section, select **New Repository**. Enter a name, the URL of your Git repository (for example `https://github.com/yourname/semaphore-demo.git`), the branch (usually `main`), and select the `no-auth` access key.
3. In the **Task Templates** section, select **New Template**, then **Bash Script**.
4. In the template form, fill in the fields:
   1. **Name** — for example `Hello Bash`.
   2. **Script Filename** — `hello.sh`.
   3. **Repository** — the repository you created in step 2.
5. Select **Create**.

To create the Python template, repeat steps 3–5 with two differences:

1. In the **Task Templates** section, select **New Template**, then **Python Script** instead of **Bash Script**.
2. Set **Name** to `Hello Python` and **Script Filename** to `hello.py`.

Unlike Ansible templates, script templates have no **Inventory** field — the script runs directly in the task environment. The Python template runs the script with the `python3` binary found on `PATH` in that environment.

## Run the task and read the log

1. On the `Hello Bash` template page, select **Run**.
2. In the **New Task** dialog, optionally enter a value in **Message (Optional)**, then select **Run**.

The task log opens automatically. Semaphore clones the repository and executes the script. For the Bash template you should see the greeting followed by the user name, working directory, and Bash version. The task status turns to **Success**.

Now run the `Hello Python` template the same way. The log shows the greeting, the Python version, and the working directory.

If a task fails, check the log for the script's error output and its exit code — any non-zero exit code marks the task as failed.

## Next steps

* Pass values to your scripts as environment variables with [Variable Groups](/user-guide/environment).
* Run the templates automatically on a cron schedule with [Schedules](/user-guide/schedules).
* Ask for input at run time with [Survey Variables](/user-guide/task-templates/survey-vars).
* Learn more on the [Bash](/user-guide/apps/bash) and [Python](/user-guide/apps/python) app pages, including how to install Python dependencies in Docker.
