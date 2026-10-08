---
title: Ver o log de auditoria
description: "Consulte o log de auditoria na interface web: os eventos mais recentes, todos os campos de um evento e, com o Semaphore Pro, filtros e exportação para CSV ou JSON Lines."
---

# Ver o log de auditoria

Os administradores abrem **Audit log** no menu do usuário. Os eventos mais recentes aparecem primeiro, 50 por página.

![O log de auditoria, com os eventos mais recentes primeiro](/assets/audit-log-list.png)

Clique em um evento para ver todos os seus campos. O botão de copiar copia o evento no formato que o Semaphore
envia a um SIEM.

![Um evento com todos os seus campos](/assets/audit-log-card.png)

## Filtrar e exportar <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtre por período, usuário, tipo de evento, resultado, projeto ou endereço IP. Em um evento, o usuário, o
endereço, o objeto e o projeto são links que filtram o log por eles.

![O log filtrado pelo endereço de um evento](/assets/audit-log-filters.png)

Quando uma combinação de filtros encontra poucos eventos, o Semaphore busca por dois segundos de cada vez e mostra
até onde chegou no passado. Clique em **Search older** para continuar.

**Export** salva todos os eventos que correspondem aos filtros como um arquivo CSV ou JSON Lines. Cada exportação
é registrada como um evento `audit.log/export`.

![Exportação como CSV ou JSON Lines](/assets/audit-log-export.png)
