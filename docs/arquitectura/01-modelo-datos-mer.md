# Modelo de datos actual (MER)

Este documento resume el modelo entidad-relacion actual del sistema segun las entidades TypeORM en `backend/src/database/entities` y el comportamiento observado en los servicios del backend.

## Fuente de verdad actual

- El esquema se deriva del codigo TypeORM, no de `docs/database.sql`.
- En desarrollo se usa `synchronize: true`, por lo que la base se ajusta automaticamente desde las entidades.
- `docs/database.sql` hoy solo crea la base `rama_remo`.

## MER logico actual

```mermaid
erDiagram
    USUARIO {
        INT id_usuario PK
        VARCHAR rut UK
        VARCHAR nombre
        VARCHAR telefono
        DATE fecha_nac
        VARCHAR direccion
        VARCHAR clave_hash
    }

    ROL {
        INT id_rol PK
        VARCHAR nombre UK
    }

    USUARIO_ROL {
        INT id_usuario PK FK
        INT id_rol PK FK
    }

    MENU {
        INT id_menu PK
        VARCHAR nombre UK
    }

    ITEM {
        INT id_item PK
        VARCHAR nombre
        VARCHAR ruta UK
        INT id_menu FK
    }

    MENU_ROL {
        INT id_menu PK FK
        INT id_rol PK FK
    }

    REUNION {
        INT id_reunion PK
        DATE fecha
        TIME hora_inicio
        TIME hora_fin
        VARCHAR lugar
        ENUM estado
        ENUM modalidad
    }

    PARTICIPANTE_REUNION {
        INT id_reunion PK FK
        INT id_usuario PK FK
    }

    ACTA {
        INT id_acta PK
        INT id_reunion FK UK
        VARCHAR titulo
        LONGTEXT texto
        VARCHAR archivo_nombre
        VARCHAR archivo_tipo
        LONGTEXT archivo_contenido_base64
        INT archivo_tamano_bytes
        DATETIME fecha_actualizacion
        INT actualizado_por FK
        INT id_rol FK
    }

    PLAN_ANUAL {
        INT id_plan_anual PK
        INT anio UK
        VARCHAR nombre
        ENUM estado
        LONGTEXT objetivo_general
    }

    PLAN_AREA {
        INT id_area_plan PK
        INT id_plan_anual FK
        VARCHAR nombre
        LONGTEXT descripcion
        INT orden
    }

    PLAN_ITEM {
        INT id_plan_item PK
        INT id_plan_anual FK
        INT id_area_plan FK
        INT id_responsable FK
        VARCHAR titulo
        LONGTEXT descripcion
        LONGTEXT resultado_esperado
        ENUM prioridad
        ENUM estado
        DATE fecha_planificada
        DATE fecha_cumplimiento_real
        LONGTEXT resumen_final
    }

    PLAN_SEGUIMIENTO {
        INT id_plan_seguimiento PK
        INT id_plan_item FK
        INT registrado_por FK
        DATETIME fecha_seguimiento
        ENUM estado
        INT avance_porcentaje
        LONGTEXT comentario
        LONGTEXT bloqueos
        LONGTEXT proximo_paso
        LONGTEXT funciono_bien
        LONGTEXT por_mejorar
    }

    USUARIO ||--o{ USUARIO_ROL : posee
    ROL ||--o{ USUARIO_ROL : asigna

    MENU ||--o{ ITEM : contiene
    MENU ||--o{ MENU_ROL : habilita
    ROL ||--o{ MENU_ROL : autoriza

    REUNION ||--o{ PARTICIPANTE_REUNION : convoca
    USUARIO ||--o{ PARTICIPANTE_REUNION : participa
    REUNION ||--o| ACTA : genera
    USUARIO ||--o{ ACTA : actualiza
    ROL ||--o{ ACTA : firma_como

    PLAN_ANUAL ||--o{ PLAN_AREA : organiza
    PLAN_ANUAL ||--o{ PLAN_ITEM : agrupa
    PLAN_AREA ||--o{ PLAN_ITEM : clasifica
    USUARIO o|--o{ PLAN_ITEM : responsable
    PLAN_ITEM ||--o{ PLAN_SEGUIMIENTO : registra
    USUARIO o|--o{ PLAN_SEGUIMIENTO : reporta
```

## Relaciones importantes

- `usuario` y `rol` se relacionan en muchos a muchos mediante `usuario_rol`.
- `menu` y `rol` tambien se relacionan en muchos a muchos mediante `menu_rol`.
- `reunion` tiene muchos participantes mediante `participantes_reu`.
- `reunion` tiene cero o un `acta`, y cada `acta` pertenece a una sola reunion.
- `plan_anual` contiene muchas `plan_area` y muchos `plan_item`.
- `plan_item` pertenece a una `plan_area`, puede tener un `usuario` responsable y puede registrar multiples `plan_seguimiento`.

## Restricciones y reglas visibles en el modelo

- `usuario.rut` es unico.
- `rol.nombre` es unico.
- `menu.nombre` es unico.
- `item.ruta` es unica.
- `acta.id_reunion` es unico, lo que fuerza una sola acta por reunion.
- `plan_anual.anio` es unico, por lo que hoy solo existe un plan anual por anio.
- `plan_area` impone unicidad por `idPlanAnual + nombre`.
- `usuario_rol`, `menu_rol` y `participantes_reu` usan clave primaria compuesta.

## Observaciones del estado actual

- Los archivos adjuntos de acta se almacenan en la base como `base64`, no en disco ni en almacenamiento externo.
- El modelo contempla autorizacion de menus por rol con `menu_rol`, pero el endpoint `/menus` hoy devuelve todos los menus autenticados sin filtrar por rol.
- No se observan tablas de auditoria generales ni timestamps comunes en todas las entidades; la trazabilidad fuerte existe sobre todo en `acta` y `plan_seguimiento`.
