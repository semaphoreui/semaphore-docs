---
title: Ver el registro de auditoría
description: "Lea el registro de auditoría en la interfaz web: los eventos más recientes, todos los campos de un evento y, con Semaphore Pro, filtros y exportación a CSV o JSON Lines."
---

# Ver el registro de auditoría

Los administradores abren **Audit log** desde el menú de usuario. Los eventos más recientes aparecen primero, 50 por página.

![El registro de auditoría, con los eventos más recientes primero](/assets/audit-log-list.png)

Haga clic en un evento para ver todos sus campos. El botón de copiar copia el evento en el formato que Semaphore
envía a un SIEM.

![Un evento con todos sus campos](/assets/audit-log-card.png)

## Filtrar y exportar <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtre por período, usuario, tipo de evento, resultado, proyecto o dirección IP. En un evento, el usuario, la
dirección, el objeto y el proyecto son enlaces que filtran el registro por ellos.

![El registro filtrado por la dirección de un evento](/assets/audit-log-filters.png)

Cuando una combinación de filtros encuentra pocos eventos, Semaphore busca unos dos segundos cada vez. **Older** y
**Newer** siguen buscando por sí mismos hasta encontrar eventos, muestran hasta dónde ha llegado la búsqueda y se
detienen con **Stop**.

**Export** guarda todos los eventos que cumplen los filtros como un archivo CSV o JSON Lines. Cada exportación se
registra como un evento `audit.log/export`.

![Exportación como CSV o JSON Lines](/assets/audit-log-export.png)
