# Docs

Documentacion funcional, tecnica y de arquitectura del sistema segun el estado real actual de la rama `desarrollo`.

## Objetivo de esta carpeta

Estos documentos no son un complemento decorativo del proyecto. Se usan para:

- describir el modelo de datos realmente vigente
- explicar los flujos funcionales mas importantes
- dejar trazadas decisiones de diseno y limites actuales del sistema
- reducir diferencias entre lo que dice la documentacion y lo que hace el codigo

## Arquitectura actual

- [Modelo de datos actual](./arquitectura/01-modelo-datos-mer.md)
- [Arquitectura y funcionamiento](./arquitectura/02-arquitectura-y-funcionamiento.md)
- [Procesos clave](./arquitectura/03-bpmn-procesos-clave.md)
- [Desarrollo actual](./arquitectura/04-desarrollo-actual.md)
- [Modulo de competencias](./arquitectura/05-modulo-competencias.md)
- [Modulo de entrenadores](./arquitectura/06-modulo-entrenadores.md)

## Criterio de actualizacion

- La fuente de verdad del modelo de datos es `backend/src/database/entities`.
- La fuente de verdad de los flujos es el comportamiento de servicios, controllers y pages actuales.
- La fuente de verdad de navegacion es `frontend/src/app/App.tsx` y el menu sembrado por `backend/src/modules/seed/seed.service.ts`.
- `docs/database.sql` no representa el esquema funcional completo del sistema; hoy solo sirve para crear la base.

## Alcance documentado hoy

La documentacion actual cubre:

- autenticacion y sesion
- usuarios con y sin acceso
- deportistas, categorias e historial
- flota de botes del club
- competencias, pruebas e inscripciones
- reuniones con acta
- planificacion anual con seguimiento
- propuesta funcional inicial para modulo de entrenadores

## Regla editorial

- Mantener textos en espanol y en UTF-8.
- Priorizar nombres, tablas, rutas y mensajes tal como existen en el codigo.
- Cuando haya una diferencia entre documento y sistema, se debe corregir el documento o explicitar la brecha.
