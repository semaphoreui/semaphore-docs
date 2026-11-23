# Vistas

Las vistas agrupan las plantillas de tareas en pestañas situadas sobre la lista de plantillas. Un proyecto empieza con una única vista **All**; puede añadir las suyas propias, por ejemplo **Build**, **Deploy** y **Tools**, para que las personas encuentren rápidamente la plantilla adecuada en proyectos con muchas plantillas.

![Lista de plantillas con pestañas de vistas](/assets/templates-list.webp)

## Gestionar las vistas {#managing-views}

Los usuarios con el rol **Manager** o superior pueden editar las vistas. Haga clic en el icono del lápiz situado junto a las pestañas de las vistas para abrir el cuadro de diálogo **Edit views** y luego use **Add view** para crear una nueva pestaña. Cada vista tiene los siguientes ajustes:

| Ajuste | Descripción |
|---|---|
| **Título** | La etiqueta de la pestaña. |
| **Tipo** | **Custom** muestra solo las plantillas asignadas a esta vista. **All** muestra todas las plantillas del proyecto. |
| **Ordenar por** y **Invertir** | Orden de clasificación predeterminado de las plantillas en la pestaña. |
| **Oculta** | Conservar la vista pero ocultar la pestaña. |
| **Show task counts** | Mostrar en la pestaña cuántas de sus plantillas están en cada estado, consulte [Recuento de plantillas en las pestañas](#template-counts). Desactivado por defecto. |

Arrastre las vistas en el cuadro de diálogo para cambiar el orden de las pestañas. Eliminar una vista no elimina sus plantillas: siguen siendo visibles en la vista **All**.

## Asignar una plantilla a una vista {#assigning-a-template-to-a-view}

Abra el formulario de la plantilla y elija la pestaña en el campo **Vista**. Una plantilla pertenece a una sola vista personalizada a la vez y siempre se lista en las vistas del tipo **All**.

## Recuento de plantillas en las pestañas {#template-counts}

Una vista con **Show task counts** activado muestra junto a su título cuántas de sus plantillas están en cada estado, en un chip de segmentos de colores. El estado de una plantilla es el estado de su última tarea. Un segmento se oculta cuando su recuento es cero, y los recuentos siguen a las tareas mientras se ejecutan. El ajuste está desactivado en una vista nueva, y los recuentos se calculan solo para las vistas que lo tienen activado.

| Color | Plantillas contadas |
|---|---|
| Verde | La última tarea se completó correctamente. |
| Rojo | La última tarea falló. |
| Gris | La última tarea se detuvo o se está deteniendo, o la plantilla nunca se ha ejecutado. |
| Naranja | La última tarea espera una confirmación. |
| Azul | La última tarea está en cola, iniciándose o en ejecución. |

Los recuentos incluyen solo las plantillas que usted puede ver.

## Columnas {#columns}

El icono del engranaje de la esquina superior derecha de la lista de plantillas abre el selector de columnas. Se aplica a todas las vistas y se guarda en su navegador.

![Selector de columnas](/assets/templates-columns.webp)
