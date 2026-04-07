# BPMN simplificado de procesos clave

Mermaid no soporta BPMN nativo completo en este repositorio, asi que este documento deja un BPMN simplificado usando carriles y decisiones. La idea es reflejar el proceso real que hoy ejecuta el sistema.

## 1. Inicio de sesion y acceso protegido

```mermaid
flowchart TD
    subgraph Usuario
        U1[Ingresa RUT y clave]
        U2[Reintenta o entra al sistema]
    end

    subgraph Frontend
        F1[LoginPage envia credenciales]
        F2[Guarda token y usuario]
        F3[ProtectedRoute habilita rutas]
        F4[Muestra error]
    end

    subgraph Backend
        B1[POST /auth/login]
        B2{Credenciales validas}
        B3[Genera JWT y respuesta]
    end

    subgraph Base_de_datos
        D1[(usuario + usuario_rol + rol)]
    end

    U1 --> F1 --> B1 --> D1 --> B2
    B2 -->|Si| B3 --> F2 --> F3 --> U2
    B2 -->|No| F4 --> U2
```

## 2. Crear o actualizar reunion con acta

```mermaid
flowchart TD
    subgraph Directiva
        U1[Completa datos de reunion]
        U2[Agrega participantes]
        U3[Opcional: redacta acta o adjunta archivo]
        U4[Confirma guardado]
    end

    subgraph Frontend_React
        F1[MeetingForm valida campos]
        F2[Envio a API]
        F3[Muestra reunion guardada]
        F4[Muestra error]
    end

    subgraph Backend_NestJS
        B1[Valida horas de inicio y fin]
        B2[Valida participantes]
        B3{Existe acta en payload}
        B4[Valida contenido del acta y tamano maximo]
        B5[Resuelve actor y rol principal]
        B6[Transaccion: guarda reunion]
        B7[Reemplaza participantes]
        B8[Upsert del acta]
    end

    subgraph MySQL
        D1[(reunion)]
        D2[(participantes_reu)]
        D3[(acta)]
        D4[(usuario y usuario_rol)]
    end

    U1 --> U2 --> U3 --> U4 --> F1 --> F2 --> B1 --> B2 --> B3
    B2 --> D4
    B3 -->|Si| B4 --> B5 --> D4 --> B6
    B3 -->|No| B6
    B6 --> D1 --> B7 --> D2
    B7 --> B8 --> D3 --> F3
    B1 -->|Error| F4
    B2 -->|Error| F4
    B4 -->|Error| F4
    B5 -->|Error| F4
```

## 3. Seguimiento de plan anual

```mermaid
flowchart TD
    subgraph Usuario_interno
        U1[Abre plan anual]
        U2[Crea item o registra seguimiento]
        U3[Revisa resumen del plan]
    end

    subgraph Frontend
        F1[AnnualPlan pages y formularios]
        F2[Envio a endpoints de planning]
        F3[Refresca detalle del plan]
    end

    subgraph Backend
        B1[Valida plan, area y responsable]
        B2{Operacion}
        B3[Crear o actualizar item]
        B4[Crear seguimiento]
        B5[Actualiza estado del item]
        B6[Reconstruye detalle del plan]
        B7[Calcula resumen y atrasados]
    end

    subgraph Base_de_datos
        D1[(plan_anual)]
        D2[(plan_area)]
        D3[(plan_item)]
        D4[(plan_seguimiento)]
        D5[(usuario)]
    end

    U1 --> U2 --> F1 --> F2 --> B1
    B1 --> D1
    B1 --> D2
    B1 --> D5
    B1 --> B2
    B2 -->|Item| B3 --> D3 --> B6
    B2 -->|Seguimiento| B4 --> D4 --> B5 --> D3 --> B6
    B6 --> D1
    B6 --> D2
    B6 --> D3
    B6 --> D4
    B6 --> B7 --> F3 --> U3
```

## Lectura rapida

- La autenticacion esta resuelta de extremo a extremo.
- Los procesos mas completos hoy son reuniones con acta y planificacion anual con seguimiento.
- Las reglas de negocio principales viven en los servicios del backend, no en procedimientos de base de datos.
