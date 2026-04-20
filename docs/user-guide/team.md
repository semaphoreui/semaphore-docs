# Teams

In Semaphore UI, every project is associated with a **Team**. Only team members and admins can access the project. Each member of the team is assigned one of four built-in roles, which govern their level of access and the actions they can perform.

In the **Enterprise** edition, built-in roles can be extended with [custom roles](#extended-rbac-enterprise) that grant additional, fine-grained permissions on specific templates.

<div class="warning">
To avoid losing access to a project, it's recommended to have at least two team members with the <b>Owner</b> role.
</div>

---

## Built-in roles

Every team member has exactly one of these four roles:

- **Owner**
- **Manager**
- **Task Runner**
- **Guest**

Below are detailed descriptions of each role and its permissions.

### Owner

- **Full permissions**<br />
  Owners can do anything within the project, including managing roles, adding/removing members, and configuring any project settings.

- **Multiple owners**<br />
  A project can have multiple Owners, ensuring there is more than one person with full privileges.

- **Restrictions on self-removal**<br />
  An Owner cannot remove themselves if they are the only Owner of the project. This prevents the project from being left without an Owner.

- **Managing other owners**<br />
  Owners can manage (including remove or change roles of) all team members, including other Owners.

### Manager

- **Broad project control:** Managers have almost the same permissions as Owners, allowing them to handle most day-to-day tasks and manage the project environment.

- Managers **cannot**:
  - Remove the project.
  - Remove or change the roles of Owners.

- **Typical use case:** Assign the Manager role to senior team members who need extensive access but don't require the authority to delete the project or manage Owners.

### Task Runner

- **Run tasks:** Task Runners can execute any task template that exists within the project.

- **Read-only for other resources:** While they can run tasks, they only have read‐only access to other resources such as inventory, variables, repositories, etc.

- **Typical use case:** Developers or QA engineers who need to trigger and monitor tasks but do not need the ability to modify project settings or manage team membership.

### Guest

- **Read-only access:** Guests have read-only access to all project resources (e.g., viewing logs, inventories, dashboards).

- **No write permissions:** They cannot modify settings, run tasks, or change roles.

- **Typical use case:** Stakeholders or other collaborators who only need to view project status and details without making changes.

---

## Extended RBAC (Enterprise)

:::info
Extended RBAC is available in the **Semaphore Enterprise** edition, starting with [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17).
:::

Extended RBAC layers additional, fine-grained permissions on top of the four built-in roles. The built-in roles themselves are unchanged — if you do not define any custom roles, every project behaves exactly as in the community edition.

With Extended RBAC you can define **custom roles** that grant targeted permissions on specific templates. This lets you give a team member access to just the templates they need, without promoting them to a higher built-in role.

### Custom roles

A custom role is a named set of permissions. Each role has a scope:

- **Global roles** are defined at the instance level and can be used in any project.
- **Project roles** are defined inside a single project and are available only within that project.

Custom roles are managed from the Semaphore UI and through the REST API.

### Available permissions

In the current release, custom roles support **template-level permissions** only. A role can be attached to one or more task templates and control actions such as viewing, running, or managing those templates.

Permissions for other project resources (inventory, repositories, environments, key store, etc.) continue to follow the member's built-in role. Support for additional resource types may be added in future releases.

### How assignment works

1. A custom role is defined with the desired template permissions (globally by an administrator, or inside a project by an Owner or Manager).
2. The role is attached to the relevant templates.
3. A team member is assigned to the role. Their effective permissions are the union of their built-in role and every custom role they hold.

### Not currently supported

- **LDAP / OIDC group mapping.** Custom roles are assigned per user. Mapping external directory groups to custom roles is not supported.
- **Granular permissions for non-template resources.** Only templates can be governed by custom roles today.

---

## Managing team members

- **Inviting new members:** **Owners** and **Managers** can invite new users to join the team and assign them an initial role.

- **Changing roles:** Owners can always change the roles of any team member. Managers can change the roles of **Task Runners** and **Guests**, but **not** other Managers or Owners.

- **Removing members:** Owners and Managers can remove team members with lower roles.
  - An Owner can remove anyone (including other Owners), but cannot remove themselves if they are the sole Owner.
  - A Manager can remove **Task Runners** and **Guests**, but **not** other Managers or Owners.

---

## Best practices

1. **Maintain redundancy:** Assign the **Owner** role to at least two people to ensure continuous access and prevent a single point of failure.
2. **Follow the principle of least privilege:**
   - Give team members the minimum role necessary for their tasks.
   - Use **Task Runner** or **Guest** roles for those who only need limited permissions.
   - On Enterprise, prefer [custom roles](#extended-rbac-enterprise) to grant access to specific templates instead of elevating a member's built-in role.
3. **Review membership regularly:**
   - As team structures change, re‐evaluate roles.
   - Revoke access or downgrade roles for users who no longer need high‐level privileges.
4. **Use managers for day-to-day administration:**
   - Reserve the Owner role for a smaller group with ultimate authority.
   - Delegate routine project management tasks to Managers to reduce the risk of accidental major changes or project deletions.

---

## Frequently asked questions

### 1. Can an Owner remove another Owner?
Yes, an Owner can remove or change the role of any other Owner, unless they are the only remaining Owner in the project.

### 2. Who can delete the project?
Only **Owners** can delete a project.

### 3. Can Managers add or remove other Managers?
No. Managers can only add or remove users with **Task Runner** or **Guest** roles. To manage Owners or other Managers, you must be an Owner.

### 4. What happens if I remove all Owners by accident?
Semaphore UI prevents the removal of an Owner if it would leave the project with no Owners at all. There must be at least one Owner at all times.

### 5. Can Guests run tasks?
No. Guests have read‐only access and cannot trigger or manage tasks. In the Enterprise edition you can grant a Guest permission to run individual templates through a [custom role](#extended-rbac-enterprise).

### 6. Do custom roles replace the built-in roles?
No. Custom roles extend the built-in roles with additional template-level permissions. Every team member still has exactly one built-in role.

### 7. Is Extended RBAC available in the community edition?
No. Extended RBAC requires a **Semaphore Enterprise** subscription.
