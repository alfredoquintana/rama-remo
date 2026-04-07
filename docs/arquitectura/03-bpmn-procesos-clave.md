# Procesos clave

Mermaid no soporta BPMN completo en este repositorio, asi que este documento deja una version simplificada de los procesos funcionales mas importantes hoy.

## 1. Login y acceso protegido

```mermaid
flowchart TD
    subgraph Usuario
        U1[Ingresa RUT y clave]
        U2[Reintenta o entra]
    end

    subgraph Frontend
        F1[LoginPage envia credenciales]
        F2[Guarda token]
        F3[ProtectedRoute habilita rutas]
        F4[Muestra error]
    end

    subgraph Backend
        B1[POST /auth/login]
        B2[Busca usuario]
        B3{Tiene clave valida y roles}
        B4[Genera JWT]
    end

    subgraph Base_de_datos
        D1[(usuario + usuario_rol + rol)]
    end

    U1 --> F1 --> B1 --> B2 --> D1 --> B3
    B3 -->|Si| B4 --> F2 --> F3 --> U2
    B3 -->|No| F4 --> U2
```

## 2. Crear usuario sin acceso o habilitar acceso

```mermaid
flowchart TD
    subgraph Usuario_interno
        U1[Registra datos personales]
        U2{Necesita acceso ahora}
        U3[Guarda persona sin acceso]
        U4[Selecciona roles]
        U5[Habilita acceso]
    end

    subgraph Frontend
        F1[Formulario de usuario]
        F2[Formulario de habilitar acceso]
    end

    subgraph Backend
        B1[POST /users]
        B2{Trae roleIds}
        B3[Guarda usuario con clave_hash null]
        B4[Guarda usuario con clave provisoria]
        B5[POST /users/:id/enable-access]
        B6[Asigna roles y clave provisoria]
    end

    U1 --> F1 --> B1 --> B2
    B2 -->|No| B3 --> U3
    B2 -->|Si| B4 --> U5
    U4 --> F2 --> B5 --> B6 --> U5
```

## 3. Registrar deportista y cambiar categoria

```mermaid
flowchart TD
    subgraph Operacion_deportiva
        U1[Busca usuario existente]
        U2[Selecciona categoria inicial]
        U3[Registra deportista]
        U4[Solicita cambio de categoria]
    end

    subgraph Frontend
        F1[Buscador por nombre o RUT]
        F2[Formulario de registro]
        F3[Detalle con historial]
    end

    subgraph Backend
        B1[GET /athletes/users/search]
        B2[POST /athletes]
        B3[Valida que no exista deportista]
        B4[Crea deportista]
        B5[Crea categoria vigente]
        B6[PATCH /athletes/:id/category]
        B7[Cierra categoria vigente]
        B8[Crea nueva categoria vigente]
    end

    U1 --> F1 --> B1
    U2 --> F2 --> B2 --> B3 --> B4 --> B5 --> U3
    U4 --> F3 --> B6 --> B7 --> B8
```

## 4. Gestionar flota del club

```mermaid
flowchart TD
    subgraph Usuario_interno
        U1[Abre modulo Flota]
        U2[Busca o filtra botes]
        U3[Solicita registrar o editar]
        U4[Confirma guardado]
        U5[Consulta detalle]
    end

    subgraph Frontend
        F1[GET /fleet/catalogs]
        F2[GET /fleet con filtros]
        F3[Modal de alta o edicion]
        F4[Modal de detalle]
    end

    subgraph Backend
        B1[Entrega catalogos activos]
        B2[Busca por nombre marca tipo estado y anio]
        B3[Valida tipo de bote]
        B4[Valida estado de bote]
        B5[Valida nombre unico]
        B6[Guarda o actualiza bote]
        B7[Devuelve detalle]
    end

    U1 --> F1 --> B1
    U2 --> F2 --> B2
    U3 --> F3 --> B3 --> B4 --> B5 --> B6 --> B7 --> U4
    U5 --> F4 --> B7
```

## 5. Crear o actualizar reunion con acta

```mermaid
flowchart TD
    subgraph Directiva
        U1[Completa datos de reunion]
        U2[Agrega participantes]
        U3[Opcional escribe acta o adjunta archivo]
        U4[Confirma guardado]
    end

    subgraph Frontend
        F1[MeetingForm valida campos]
        F2[Envia a API]
        F3[Muestra detalle]
        F4[Muestra error]
    end

    subgraph Backend
        B1[Valida horas y lugar]
        B2[Valida participantes]
        B3{Trae acta}
        B4[Valida acta y tamano maximo]
        B5[Resuelve actor y rol principal]
        B6[Guarda reunion]
        B7[Reemplaza participantes]
        B8[Upsert del acta]
    end

    U1 --> U2 --> U3 --> U4 --> F1 --> F2 --> B1 --> B2 --> B3
    B3 -->|Si| B4 --> B5 --> B6
    B3 -->|No| B6
    B6 --> B7 --> B8 --> F3
    B1 -->|Error| F4
    B2 -->|Error| F4
    B4 -->|Error| F4
```

## 6. Gestion de plan anual

```mermaid
flowchart TD
    subgraph Usuario_interno
        U1[Abre plan]
        U2[Crea item o seguimiento]
        U3[Revisa resumen]
    end

    subgraph Frontend
        F1[Paginas y formularios de planificacion]
        F2[Envia a planning]
        F3[Refresca detalle]
    end

    subgraph Backend
        B1[Valida plan area y responsable]
        B2{Operacion}
        B3[Crea o actualiza item]
        B4[Crea seguimiento]
        B5[Actualiza estado del item]
        B6[Recompone detalle]
        B7[Calcula resumen]
    end

    U1 --> U2 --> F1 --> F2 --> B1 --> B2
    B2 -->|Item| B3 --> B6
    B2 -->|Seguimiento| B4 --> B5 --> B6
    B6 --> B7 --> F3 --> U3
```

## Lectura rapida de impacto por modelo

- `usuario` y `usuario_rol` sostienen login y habilitacion de acceso.
- `deportista` y `deportista_categoria` sostienen historial y categoria vigente.
- `tipo_bote`, `estado_bote` y `bote` sostienen la gestion de flota.
- `reunion`, `participante_reunion` y `acta` sostienen la trazabilidad de reuniones.
- `plan_item` y `plan_seguimiento` sostienen el seguimiento operativo del plan anual.
