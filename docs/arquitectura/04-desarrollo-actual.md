# Diagrama de desarrollo actual

Este documento muestra como esta organizado hoy el desarrollo del sistema, que piezas existen y que consideraciones tecnicas conviene tener presentes.

## Topologia de desarrollo local

```mermaid
flowchart LR
    DEV[Desarrollador en IDE] --> FEDEV[npm run dev en frontend]
    DEV --> BEDEV[npm run start:dev en backend]
    DEV --> MYSQL[MySQL local]

    FEDEV --> VITE[Vite dev server :5173]
    VITE --> APP[React app]
    APP --> API[HTTP fetch]

    BEDEV --> NEST[NestJS :3001]
    NEST --> ENV[ConfigModule + env validation]
    NEST --> ORM[TypeORM synchronize]
    NEST --> SEED[SeedService bootstrap]
    ORM --> MYSQL
    SEED --> MYSQL

    API --> NEST
```

## Mapa actual del repositorio

```mermaid
flowchart TD
    ROOT[rama-remo]
    ROOT --> BACKEND[backend]
    ROOT --> FRONTEND[frontend]
    ROOT --> DOCS[docs]

    BACKEND --> B1[src/config]
    BACKEND --> B2[src/database/entities]
    BACKEND --> B3[src/modules/auth]
    BACKEND --> B4[src/modules/users]
    BACKEND --> B5[src/modules/meetings]
    BACKEND --> B6[src/modules/planning]
    BACKEND --> B7[src/modules/menus]
    BACKEND --> B8[src/modules/roles]
    BACKEND --> B9[src/modules/seed]

    FRONTEND --> F1[src/app]
    FRONTEND --> F2[src/layouts]
    FRONTEND --> F3[src/components]
    FRONTEND --> F4[src/pages]
    FRONTEND --> F5[src/services]
    FRONTEND --> F6[src/types]
```

## Estado funcional actual

- Implementado: autenticacion con JWT y sesion persistida en frontend.
- Implementado: CRUD de usuarios con asignacion multiple de roles.
- Implementado: CRUD de reuniones con participantes y acta integrada.
- Implementado: CRUD de plan anual con areas, items y seguimientos.
- Implementado: catalogos base, menus e informacion demo mediante seed al arranque.
- Implementado: interfaz React protegida para operacion interna.

## Decisiones tecnicas vigentes

- Backend monolitico modular en NestJS.
- Frontend SPA en React con React Router.
- Persistencia relacional en MySQL.
- ORM con TypeORM y sincronizacion automatica en desarrollo.
- Seed automatico como parte del bootstrap de la aplicacion.
- Almacenamiento de archivos de acta dentro de la base en formato base64.

## Brechas o consideraciones del estado actual

- `docs/database.sql` no documenta el esquema real; solo crea la base.
- No hay migraciones versionadas ni estrategia formal de evolucion de esquema.
- El modelo tiene `menu_rol`, pero la navegacion no se filtra aun por roles en tiempo de consulta.
- La autenticacion existe, pero no hay autorizacion por rol a nivel de endpoint.
- Al guardar archivos de acta en base, el crecimiento de la tabla `acta` puede volverse relevante con el tiempo.

## Recomendaciones para la siguiente iteracion

- Generar migraciones o un SQL exportado desde el esquema real.
- Aplicar filtro efectivo de menus y permisos por rol.
- Separar archivos adjuntos de acta hacia almacenamiento externo o al menos binario fuera de `base64`.
- Incorporar diagramas como parte del README principal o de una wiki tecnica si este material va a crecer.
