# Estandar de desarrollo y escalabilidad

Este estandar busca que nuevos requerimientos entren sin agrandar archivos
demasiado y sin romper comportamiento existente. La regla principal es separar
por responsabilidad antes de que una pagina, servicio o CSS se vuelva dificil
de mantener.

## Backend

- Un modulo NestJS debe exponer controladores delgados: validar acceso, recibir
  DTOs y delegar al servicio.
- Un servicio principal debe coordinar el caso de uso, no concentrar todo.
- Cuando un servicio supere aproximadamente 350 a 450 lineas, revisar si hay
  responsabilidades separables.
- Separar en servicios internos cuando aparezcan estas responsabilidades:
  catalogos, archivos, mappers de respuesta, validadores de dominio,
  calculos/resumenes, integraciones externas o reglas de negocio repetibles.
- Las rutas publicas no deben cambiar por un refactor interno. Primero se
  mantienen DTOs y respuestas; despues se mejora la estructura.
- Los archivos adjuntos no deben guardarse como base64 en columnas de negocio.
  La base debe guardar metadata y una ruta/clave; el contenido vive en storage.
- Si existe data antigua en base64, mantener lectura compatible hasta migrarla.

## Frontend

- Una pagina debe orquestar datos y estados de pantalla. Si empieza a mezclar
  filtros, modales, formularios, tablas y helpers, hay que partirla.
- Alrededor de 350 a 450 lineas en una pagina es una alerta para extraer:
  helpers puros, hooks de carga, componentes de tabla, modales o paneles.
- Los helpers de una pagina van en `frontend/src/features/<dominio>/`.
- Los componentes reutilizables siguen en `frontend/src/components/`.
- Los servicios HTTP siguen en `frontend/src/services/`.
- Los tipos compartidos siguen en `frontend/src/types/`.
- Evitar duplicar logica de transformacion de formularios. Si se usa en crear
  y editar, debe vivir en un helper o estado de formulario reutilizable.

## CSS

- `frontend/src/index.css` debe ser solo el punto de entrada de estilos.
- Los estilos se organizan por dominio:
  - `styles/foundation.css`: variables, temas y reset base.
  - `styles/layout.css`: shell, header, sidebar, estructura general.
  - `styles/controls.css`: botones, formularios, tablas, modales y controles.
  - `styles/competitions.css`: pantallas de competencias.
  - `styles/planning.css`: pantallas de planificacion.
  - `styles/content.css`: mensajes, detalles, auth y contenido transversal.
  - `styles/responsive.css`: media queries.
- Un archivo CSS de dominio no deberia pasar aproximadamente 500 a 700 lineas.
  Si pasa eso, partir por subdominio o componente.
- No agregar CSS nuevo en `index.css`; agregarlo al modulo correspondiente.
- Mantener nombres BEM o similares: `.dominio-bloque__elemento` y modificadores
  `.is-active`, `.is-open`, `.button-primary`.

## Adjuntos

- El frontend puede seguir enviando base64 temporalmente para no romper el flujo.
- El backend debe convertir ese base64 a archivo fisico o storage externo.
- La tabla guarda nombre, tipo, tamano y ruta/clave.
- Las descargas pueden seguir devolviendo base64 mientras el frontend no tenga
  endpoint binario dedicado.
- La migracion final recomendada es crear un endpoint especifico de descarga y
  dejar de enviar archivos dentro del detalle completo de una reunion.

## Checklist para nuevos requerimientos

- Crear o reutilizar el modulo correcto.
- Definir DTOs y tipos antes de tocar vistas grandes.
- Mantener compatibilidad de rutas y respuestas si es refactor.
- Si hay tabla/formulario/modal, crear componente propio antes de crecer la
  pagina.
- Si hay estilos nuevos, ubicarlos en el CSS de dominio.
- Si hay reglas de negocio reutilizables, extraer helper o servicio interno.
- Agregar validaciones en backend aunque ya existan en frontend.
- Probar build de backend y frontend antes de cerrar.

## Puntos del sistema donde aplica seguir refactorizando

- `competitions.service.ts`: ya se extrajo catalogos; sigue siendo candidato
  para separar pruebas, inscripciones, validaciones y mapeo de respuestas.
- `planning.service.ts`: separar resumenes/calculos, items y seguimientos.
- `users.service.ts`: separar normalizacion de datos, roles y estado de acceso.
- `seed.service.ts`: partir data seed por dominio para que no crezca como script
  unico.
- `CompetitionManagementPage.tsx`: ya se extrajeron helpers; siguiente paso es
  separar tabla de pruebas, modal de inscripcion y panel de resumen.
- `AnnualPlanDetailPage.tsx`: separar acordeones de areas, detalle de item y
  modal de seguimiento.
- `FleetPage.tsx`: ya se extrajeron helpers; siguiente paso es separar filtros,
  tabla y modal de bote.
