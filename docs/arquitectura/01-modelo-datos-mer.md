# Modelo de datos actual

Este documento resume el modelo entidad-relacion vigente segun las entidades TypeORM y el comportamiento observado en los servicios del backend.

## Fuente de verdad actual

- El esquema real se deriva del codigo de [backend/src/database/entities](../../backend/src/database/entities).
- En desarrollo se usa `synchronize: true`.
- `docs/database.sql` no documenta el modelo completo.

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
        VARCHAR clave_hash NULL
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

    CATEGORIA {
        INT id_categoria PK
        VARCHAR nombre UK
        INT edad_min
        INT edad_max
        INT orden
        BOOLEAN activa
    }

    DEPORTISTA {
        INT id_deportista PK
        INT id_usuario FK UK
        BOOLEAN activo
    }

    DEPORTISTA_CATEGORIA {
        INT id_deportista_categoria PK
        INT id_deportista FK
        INT id_categoria FK
        DATE fecha_desde
        DATE fecha_hasta NULL
        BOOLEAN vigente
    }

    TIPO_BOTE {
        INT id_tipo_bote PK
        VARCHAR codigo UK
        VARCHAR nombre
        BOOLEAN requiere_timonel
        INT orden
        BOOLEAN activo
    }

    ESTADO_BOTE {
        INT id_estado_bote PK
        VARCHAR nombre UK
        BOOLEAN permite_uso
        BOOLEAN activo
    }

    BOTE {
        INT id_bote PK
        INT id_tipo_bote FK
        INT id_estado_bote FK
        VARCHAR nombre UK
        VARCHAR marca NULL
        INT anio NULL
        LONGTEXT observacion NULL
        BOOLEAN activo
    }

    COMPETENCIA {
        INT id_competencia PK
        INT id_club FK
        VARCHAR nombre
        ENUM tipo_competencia
        ENUM origen
        VARCHAR organizador NULL
        VARCHAR sede NULL
        DATE fecha_inicio
        DATE fecha_fin
        ENUM estado
        LONGTEXT observacion NULL
    }

    COMPETENCIA_PRUEBA {
        INT id_competencia_prueba PK
        INT id_competencia FK
        INT id_categoria FK NULL
        INT id_tipo_bote FK NULL
        INT numero_prueba
        INT orden_prueba
        VARCHAR nombre_prueba
        VARCHAR categoria_origen NULL
        VARCHAR genero_origen NULL
        VARCHAR modalidad_origen NULL
        VARCHAR tipo_bote_origen NULL
        INT distancia NULL
        DATE fecha NULL
        TIME hora NULL
        BOOLEAN requiere_bote
        INT cantidad_tripulantes_esperada NULL
        BOOLEAN requiere_timonel
        BOOLEAN es_master
        LONGTEXT observacion NULL
        ENUM origen_dato
    }

    COMPETENCIA_INSCRIPCION {
        INT id_competencia_inscripcion PK
        INT id_competencia_prueba FK UK
        INT id_bote FK NULL
        VARCHAR estado
        DECIMAL promedio_edad NULL
        VARCHAR categoria_master_estimada NULL
    }

    COMPETENCIA_INSCRIPCION_INTEGRANTE {
        INT id_competencia_inscripcion_integrante PK
        INT id_competencia_inscripcion FK
        INT id_deportista FK
        INT orden
        BOOLEAN es_timonel
        VARCHAR rol_texto NULL
        VARCHAR snapshot_nombre
        VARCHAR snapshot_rut
        DATE snapshot_fecha_nacimiento
        INT edad_competencia
        VARCHAR categoria_master_individual NULL
        LONGTEXT observacion NULL
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
        VARCHAR titulo NULL
        LONGTEXT texto NULL
        VARCHAR archivo_nombre NULL
        VARCHAR archivo_tipo NULL
        LONGTEXT archivo_contenido_base64 NULL
        INT archivo_tamano_bytes NULL
        DATETIME fecha_actualizacion
        INT actualizado_por FK
        INT id_rol FK
    }

    PLAN_ANUAL {
        INT id_plan_anual PK
        INT anio UK
        VARCHAR nombre
        ENUM estado
        LONGTEXT objetivo_general NULL
    }

    PLAN_AREA {
        INT id_area_plan PK
        INT id_plan_anual FK
        VARCHAR nombre
        LONGTEXT descripcion NULL
        INT orden
    }

    PLAN_ITEM {
        INT id_plan_item PK
        INT id_plan_anual FK
        INT id_area_plan FK
        INT id_responsable FK NULL
        VARCHAR titulo
        LONGTEXT descripcion
        LONGTEXT resultado_esperado
        ENUM prioridad
        ENUM estado
        DATE fecha_planificada
        DATE fecha_cumplimiento_real NULL
        LONGTEXT resumen_final NULL
    }

    PLAN_SEGUIMIENTO {
        INT id_plan_seguimiento PK
        INT id_plan_item FK
        INT registrado_por FK NULL
        DATETIME fecha_seguimiento
        ENUM estado
        INT avance_porcentaje
        LONGTEXT comentario
        LONGTEXT bloqueos NULL
        LONGTEXT proximo_paso NULL
        LONGTEXT funciono_bien NULL
        LONGTEXT por_mejorar NULL
    }

    USUARIO ||--o{ USUARIO_ROL : posee
    ROL ||--o{ USUARIO_ROL : asigna

    MENU ||--o{ ITEM : contiene
    MENU ||--o{ MENU_ROL : relaciona
    ROL ||--o{ MENU_ROL : habilita

    USUARIO ||--o| DEPORTISTA : puede_ser
    CATEGORIA ||--o{ DEPORTISTA_CATEGORIA : clasifica
    DEPORTISTA ||--o{ DEPORTISTA_CATEGORIA : registra

    TIPO_BOTE ||--o{ BOTE : clasifica
    ESTADO_BOTE ||--o{ BOTE : condiciona

    CATEGORIA ||--o{ COMPETENCIA_PRUEBA : normaliza
    CLUB ||--o{ COMPETENCIA : organiza
    COMPETENCIA ||--o{ COMPETENCIA_PRUEBA : contiene
    TIPO_BOTE ||--o{ COMPETENCIA_PRUEBA : define
    COMPETENCIA_PRUEBA ||--o| COMPETENCIA_INSCRIPCION : admite
    BOTE o|--o{ COMPETENCIA_INSCRIPCION : asigna
    COMPETENCIA_INSCRIPCION ||--o{ COMPETENCIA_INSCRIPCION_INTEGRANTE : compone
    DEPORTISTA ||--o{ COMPETENCIA_INSCRIPCION_INTEGRANTE : participa

    REUNION ||--o{ PARTICIPANTE_REUNION : convoca
    USUARIO ||--o{ PARTICIPANTE_REUNION : participa
    REUNION ||--o| ACTA : genera
    USUARIO ||--o{ ACTA : actualiza
    ROL ||--o{ ACTA : firma_como

    PLAN_ANUAL ||--o{ PLAN_AREA : organiza
    PLAN_ANUAL ||--o{ PLAN_ITEM : contiene
    PLAN_AREA ||--o{ PLAN_ITEM : clasifica
    USUARIO o|--o{ PLAN_ITEM : responsable
    PLAN_ITEM ||--o{ PLAN_SEGUIMIENTO : registra
    USUARIO o|--o{ PLAN_SEGUIMIENTO : reporta
```

## Relaciones y reglas mas relevantes

### Usuario y acceso

- `usuario` puede existir sin roles y sin `clave_hash`.
- Un usuario sin `clave_hash` y sin roles queda registrado, pero no puede iniciar sesion.
- El acceso real exige `clave_hash` y al menos un rol.
- La tabla `usuario_rol` sigue siendo la relacion formal entre usuario y rol.

### Deportistas

- `deportista` se apoya sobre un `usuario` existente.
- La condicion deportiva real la define la fila en `deportista`.
- `deportista_categoria` conserva historial y vigencia.
- Regla funcional: un deportista debe tener una sola categoria vigente.
- El rol `deportista` no reemplaza a la entidad `deportista`.

### Flota

- `tipo_bote` parametriza el tipo competitivo u operativo del bote.
- `estado_bote` parametriza el estado operativo del bote y conserva `permite_uso` para decisiones futuras.
- `bote` depende siempre de un `tipo_bote` y un `estado_bote`.
- Regla funcional: `bote.nombre` es unico en el sistema.
- Regla funcional: al crear o editar un bote solo se aceptan tipos y estados activos.
- El seed carga catalogos de flota, pero no crea botes del club.

### Competencias

- `competencia` modela el evento y su ventana operativa.
- `competencia_prueba` normaliza categoria por `id_categoria` y tipo de bote por `id_tipo_bote`.
- `competencia_prueba.categoria_origen` se conserva como snapshot operativo del nombre de categoria.
- `competencia_inscripcion` admite una sola fila por prueba.
- `competencia_inscripcion.estado` hoy trabaja con el dominio `presuntiva` o `nominativa`.
- `competencia_inscripcion` ya no usa `codigo_embarcacion` ni `observacion_interna`.
- `competencia_inscripcion_integrante` conserva snapshots historicos del deportista inscrito.

### Reuniones y actas

- `participante_reunion` usa clave primaria compuesta.
- `acta.id_reunion` es unico, lo que fuerza una sola acta por reunion.
- El archivo del acta se persiste dentro de la base en base64.

### Planificacion

- `plan_area` es unico por `id_plan_anual + nombre`.
- `plan_anual.anio` es unico.
- `plan_item` puede tener responsable opcional.

## Decisiones de modelado destacadas

### Separacion entre persona y acceso

El sistema no modela "persona" como una tabla aparte. Esa responsabilidad queda en `usuario`, y el acceso al sistema se resuelve por la combinacion de `clave_hash` y `usuario_rol`.

Consecuencia:

- un usuario puede existir solo como registro personal
- habilitar acceso es una transicion funcional, no una nueva entidad

### Separacion entre usuario y deportista

El sistema no usa el rol `deportista` como fuente de verdad deportiva. El modelo real distingue:

- persona registrada: `usuario`
- condicion deportiva: `deportista`
- clasificacion historica: `deportista_categoria`

### Catalogos de flota parametrizados

La flota no guarda texto libre para tipo o estado. Se apoya en:

- `tipo_bote`
- `estado_bote`

Eso asegura consistencia en filtros, grillas y futuros usos con regatas o asignaciones.

## Observaciones del estado actual

- Existe `menu_rol` en modelo, pero `GET /menus` no filtra por rol en tiempo de consulta.
- No hay tabla de auditoria transversal ni timestamps comunes en todas las entidades.
- La trazabilidad mas fuerte hoy esta en `deportista_categoria`, `acta` y `plan_seguimiento`.
- El modulo `flota` ya existe, pero no hay todavia relaciones con regatas o asignacion deportiva.
