# UI Tour

This guided tour highlights the primary areas of Semaphore UI so you can quickly find the features you need. Screens may look slightly different depending on your version, theme, or feature flags, but the navigation stays consistent.

## Global navigation

The top-level navigation bar includes:

* **Projects** – all projects you can access. Pin frequently used projects to the sidebar.
* **Administration** – system-wide settings (available to administrators only), including user management, runners, license information, and system diagnostics.
* **Help** – links to documentation, community resources, and version information.

Use the profile menu (top right) to update your account details, configure notification preferences, or sign out.

## Project dashboard

Opening a project lands you on the **Task Templates** view by default. The project header contains:

* Project information: name, description, default environment.
* Quick stats: recent task success/failure and queued runs.
* Tabs for resources within the project.

Tabs available in every project:

| Tab | Purpose |
| --- | --- |
| Task Templates | Define what Semaphore runs, configure surveys, matrices, approvals. |
| Tasks | Monitor historical and in-flight task executions. Filters support status, authors, templates, and time ranges. |
| Schedules | Automate recurring runs with cron-like rules. |
| Repositories | Manage source control integrations and ref selections. |
| Inventory | Configure static or dynamic inventories used by templates. |
| Environment | Define variable groups exposed to tasks. |
| Key Store | Store SSH keys, API tokens, passwords, vault secrets. |
| Team | Invite users and assign roles (viewer, operator, admin). |

Some projects display extra tabs (for example **Runners** or **Integrations**) when features are enabled.

## Task details view

Clicking a task opens a detailed execution view:

* **Summary panel** shows status, duration, initiator, runner, commit SHA, and inventory.
* **Live log** streams output in real time with search and download options.
* **Hosts/Steps tabs** break down playbook results or Terraform steps.
* **Artifacts** lists generated files or state snapshots where applicable.
* **Actions menu** lets you rerun, cancel, or clone the task (depending on permissions).

Use the breadcrumb trail to jump back to the originating template or project dashboard.

## Administration area

Administrators gain a system-level sidebar:

* **Users & Teams** – manage global accounts, SSO mapping, and roles.
* **Runners** – view registered runners, labels, versions, and last-seen status.
* **System** – check version, license state (if applicable), background job queues, and telemetry.
* **Settings** – configure global options such as OpenID providers, SMTP, audit retention, or feature flags.

Most settings link directly to detailed instructions in the [Administration Guide](../administration-guide/README.md).

## Keyboard and productivity tips

* Press `Ctrl/⌘ + K` to open the command palette for quick navigation.
* Use saved filters on the **Tasks** view to monitor specific templates or teams.
* Pin projects to the left sidebar by clicking the star icon next to their name.

---

Next, review [Next Steps](./next-steps.md) to turn your evaluation into a repeatable, collaborative setup.
