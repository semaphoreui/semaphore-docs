---
title: Views
description: How to group task templates into view tabs, manage them, assign templates, and choose the columns of the template list.
---

# Views

Views group task templates into tabs above the template list. A project starts with a single **All** view; you can add your own, for example **Build**, **Deploy**, and **Tools**, so that people find the right template quickly in projects with many templates.

![Template list with view tabs](/assets/templates-list.webp)

## Managing views {#managing-views}

Users with the **Manager** role or higher can edit views. Click the pencil icon next to the view tabs to open the **Edit views** dialog, then use **Add view** to create a new tab. Each view has the following settings:

| Setting | Description |
|---|---|
| **Title** | The tab label. |
| **Type** | **Custom** shows only templates assigned to this view. **All** shows every template of the project. |
| **Sort by** and **Reverse** | Default sort order of the templates in the tab. |
| **Hidden** | Keep the view but hide the tab. |
| **Show task counts** | Show on the tab how many of its templates are in each state, see [Template counts on the tabs](#template-counts). Off by default. |

Drag views in the dialog to change the order of the tabs. Deleting a view does not delete its templates, they stay visible in the **All** view.

## Assigning a template to a view {#assigning-a-template-to-a-view}

Open the template form and choose the tab in the **View** field. A template belongs to one custom view at a time and is always listed in views of the **All** type.

## Template counts on the tabs {#template-counts}

A view with **Show task counts** turned on shows next to its title how many of its templates are in each state, as one chip of coloured segments. The state of a template is the status of its last task. A segment is hidden when its count is zero, and the counts follow the tasks as they run. The setting is off for a new view, and the counts are computed only for the views that have it on.

| Colour | Templates counted |
|---|---|
| Green | The last task succeeded. |
| Red | The last task failed. |
| Grey | The last task was stopped or is being stopped, or the template was never launched. |
| Orange | The last task waits for confirmation. |
| Blue | The last task is waiting in the queue, starting or running. |

The counts include only the templates you are allowed to see.

## Columns {#columns}

The gear icon in the top right corner of the template list opens the column chooser. It applies to every view and is stored in your browser.

![Column chooser](/assets/templates-columns.webp)