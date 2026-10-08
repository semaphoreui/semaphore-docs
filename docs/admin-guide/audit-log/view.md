---
title: View the audit log
description: "Read the audit log in the web UI: the newest events, every field of an event and, with Semaphore Pro, filters and export to CSV or JSON Lines."
---

# View the audit log

Administrators open **Audit log** from the user menu. The newest events come first, 50 to a page.

![The audit log, newest events first](/assets/audit-log-list.png)

Click an event to see every field it has. The copy button copies the event in the format Semaphore sends to a
SIEM.

![An event with all of its fields](/assets/audit-log-card.png)

## Filter and export <FeatureState feature="audit-log-filters" /> {#filter-export}

Filter by period, user, event kind, result, project or IP address. In an event, the user, the address, the object
and the project are links that filter the log by them.

![The log filtered by the address of an event](/assets/audit-log-filters.png)

When a combination of filters finds few events, Semaphore searches for two seconds at a time and shows how far back
it got. Click **Search older** to go on.

**Export** saves every event that matches the filters as a CSV or JSON Lines file. Each export is recorded as an
`audit.log/export` event.

![Export as CSV or JSON Lines](/assets/audit-log-export.png)
