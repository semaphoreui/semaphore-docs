---
title: Ediciones
description: Qué incluyen Semaphore Community, Pro y Enterprise, y qué funciones requieren una suscripción de pago.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Ediciones

Semaphore se distribuye en tres ediciones a partir de una única base de código y una única
documentación. Todo lo descrito en esta documentación está disponible en **Community**,
salvo que la página o la sección lleve una insignia de edición.

| Edición | Qué es |
|---|---|
| **Community** | La edición de código abierto. Gratuita, autoalojada, sin clave de licencia. Todo lo que no aparece en la tabla siguiente. |
| **Pro** | Añade flujos de trabajo, runners de proyecto, almacenamientos de secretos externos, ejecutores de contenedores y registro estructurado. |
| **Enterprise** | Añade alta disponibilidad, RBAC ampliado con roles personalizados, el ejecutor de Kubernetes y almacenamientos de secretos empresariales. |

Pro y Enterprise se activan con una clave de licencia, consulte
[Licencia](/admin-guide/license). La edición que ejecuta su servidor se muestra en el menú
de la cuenta, consulte [Su cuenta](/user-guide/account).

## Matriz de funciones {#feature-matrix}

Funciones que requieren una edición de pago. Una función que no aparece aquí está
disponible en todas las ediciones.

<EditionsTable />

## Cómo se marcan las ediciones en esta documentación {#how-editions-are-marked}

Una insignia junto a un título significa que la función descrita debajo necesita esa
edición:

- <Pro /> indica una función de Pro.
- <Enterprise /> indica una función de Enterprise.

Una insignia también puede indicar la versión en la que apareció la función, por ejemplo
<FeatureState feature="extended-rbac" />. Al hacer clic en una insignia, volverá a esta
página.
