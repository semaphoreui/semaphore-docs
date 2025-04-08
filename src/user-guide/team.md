# Teams

In Semaphore UI, every project is associated with a **Team**. Only team members and admins can access the project. Each member of the team is assigned one of four predefined roles, which govern their level of access and the actions they can perform.

> **Tip:** To avoid losing access to a project, it’s recommended to have at least two team members with the **Owner** role.

---

## Team roles

Every team member has exactly one of these four roles: **Owner**, **Manager**, **Task Runner**, or **Guest**. Below are detailed descriptions of each role and its permissions.

### Owner

- **Full permissions:** Owners can do anything within the project, including managing roles, adding/removing members, and configuring any project settings.
- **Multiple owners:** A project can have multiple Owners, ensuring there is more than one person with full privileges.
- **Restrictions on self-removal:** An Owner cannot remove themselves if they are the only Owner of the project. This prevents the project from being left without an Owner.
- **Managing other wwners:** Owners can manage (including remove or change roles of) all team members, including other Owners.

### Manager

- **Broad project control:** Managers have almost the same permissions as Owners, allowing them to handle most day-to-day tasks and manage the project environment.

- Managers **cannot**:
  - Remove the project.
  - Remove or change the roles of Owners.

- **Typical use case:** Assign the Manager role to senior team members who need extensive access but don’t require the authority to delete the project or manage Owners.

### Task Runner

- **Run tasks:** Task Runners can execute any task template that exists within the project.
- **Read-only for other resources:** While they can run tasks, they only have read‐only access to other resources such as inventory, variables, repositories, etc.
- **Typical use case:** Developers or QA engineers who need to trigger and monitor tasks but do not need the ability to modify project settings or manage team membership.

### Guest

- **Read-only access:** Guests have read-only access to all project resources (e.g., viewing logs, inventories, dashboards).
- **No write permissions:** They cannot modify settings, run tasks, or change roles.
- **Typical use case:** Stakeholders or other collaborators who only need to view project status and details without making changes.

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
2. **Follow principle of least privilege:**  
   - Give team members the minimum role necessary for their tasks.  
   - Use **Task Runner** or **Guest** roles for those who only need limited permissions.
3. **Review membership regularly:**  
   - As team structures change, re‐evaluate roles.  
   - Revoke access or downgrade roles for users who no longer need high‐level privileges.
4. **Use managers for day-to-day administration:**  
   - Reserve the Owner role for a smaller group with ultimate authority.  
   - Delegate routine project management tasks to Managers to reduce the risk of accidental major changes or project deletions.

---

## Frequently asked questions

**1. Can an Owner remove another Owner?**  
Yes, an Owner can remove or change the role of any other Owner, unless they are the only remaining Owner in the project.

**2. Who can delete the project?**  
Only **Owners** can delete a project.

**3. Can Managers add or remove other Managers?**  
No. Managers can only add or remove users with **Task Runner** or **Guest** roles. To manage Owners or other Managers, you must be an Owner.

**4. What happens if I remove all Owners by accident?**  
Semaphore UI prevents the removal of an Owner if it would leave the project with no Owners at all. There must be at least one Owner at all times.

**5. Can Guests run tasks?**  
No. Guests only have read‐only access and cannot trigger or manage tasks.

---

## Conclusion

Roles in Semaphore UI help you control access and manage permissions within each project. By choosing the appropriate role for every team member and following best practices, you ensure smooth collaboration, secure operations, and straightforward delegation of responsibilities.