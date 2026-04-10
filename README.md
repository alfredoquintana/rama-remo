# Sistema Rama de Remo

Aplicacion full stack para la gestion interna de una rama de remo. El estado actual de la rama `desarrollo` cubre autenticacion, usuarios, habilitacion de acceso, deportistas, categorias, flota, reuniones con acta integrada, planificacion anual con seguimiento y una interfaz web protegida para trabajo operativo.

## Estado actual

- Backend en NestJS 11 con TypeORM y MySQL.
- Frontend en React 19 + TypeScript + Vite.
- Autenticacion por RUT y clave con JWT.
- Usuarios que pueden existir con o sin acceso al sistema.
- Modulo deportivo basado en `usuario`, `deportista`, `categoria` y `deportista_categoria`.
- Modulo de flota basado en `tipo_bote`, `estado_bote` y `bote`.
- Reuniones con participantes y acta asociada.
- Planificacion anual con areas, items y seguimientos.
- Seed automatico para catalogos y datos demo de desarrollo.

## Documentacion tecnica

- [Docs generales](./docs/README.md)
- [Modelo de datos actual](./docs/arquitectura/01-modelo-datos-mer.md)
- [Arquitectura y funcionamiento](./docs/arquitectura/02-arquitectura-y-funcionamiento.md)
- [Procesos clave](./docs/arquitectura/03-bpmn-procesos-clave.md)
- [Desarrollo actual](./docs/arquitectura/04-desarrollo-actual.md)

## Estandar de idioma y codificacion

- Todos los archivos fuente y de configuracion deben guardarse en UTF-8.
- Los textos visibles al usuario deben escribirse en espanol consistente con el sistema.
- Esta regla aplica a labels, mensajes, seeds, datos demo y documentacion.

## Modulos funcionales vigentes

### Autenticacion y sesion

- Login por RUT y clave.
- Reconstruccion de sesion desde `GET /auth/me`.
- Cambio de clave desde `Mi acceso`.
- Toda la aplicacion queda protegida por `ProtectedRoute`, salvo `/login`.

### Usuarios y roles

- Crear usuario con acceso o sin acceso.
- Editar datos personales.
- Habilitar acceso a un usuario existente.
- Asignar uno o mas roles a usuarios con acceso.
- Regla actual:
  - un usuario sin acceso puede existir sin roles
  - un usuario con acceso debe tener al menos un rol
  - si no hay acceso, no se genera clave provisoria
  - si se habilita acceso, se genera clave provisoria segun entorno

### Deportistas y categorias

- Buscar usuarios existentes para registrarlos como deportistas.
- Registrar deportista sin duplicar datos personales.
- Asignar categoria inicial.
- Listar deportistas activos.
- Ver categoria vigente e historial.
- Cambiar categoria manteniendo trazabilidad.
- Regla actual:
  - la condicion deportiva la define la existencia de `deportista`
  - el rol `deportista` no equivale por si solo a ser deportista en el modulo
  - cada deportista debe tener una sola categoria vigente

### Flota

- Gestion centralizada desde `/flota`.
- Catalogos parametrizados para tipo de bote y estado de bote.
- Registro, edicion y consulta de botes desde modales.
- Busqueda inteligente por nombre, marca, tipo, estado y anio.
- Filtros por tipo de bote, estado y activo.
- Paginacion en el listado.
- Regla actual:
  - `tipo_bote` y `estado_bote` se cargan por seed
  - los botes del club se ingresan manualmente
  - `nombre` de bote es unico
  - solo se permite crear o editar usando catalogos activos

### Reuniones y actas

- Crear, editar, listar y eliminar reuniones.
- Buscar y asignar participantes.
- Registrar acta dentro del mismo flujo de la reunion.
- Adjuntar archivo del acta en base64.
- El sistema registra automaticamente:
  - usuario que actualiza
  - rol principal usado para el acta
  - fecha de actualizacion

### Planificacion anual

- Crear, editar, listar y eliminar planes anuales.
- Definir areas.
- Crear y actualizar items por area.
- Registrar seguimientos con avance porcentual.
- Obtener resumen automatico de estado del plan.

## Modelo de datos actual

El modelo real se deriva de TypeORM en [backend/src/database/entities](./backend/src/database/entities) y no de `docs/database.sql`.

Entidades principales:

- `usuario`
- `rol`
- `usuario_rol`
- `menu`
- `item`
- `menu_rol`
- `categoria`
- `deportista`
- `deportista_categoria`
- `tipo_bote`
- `estado_bote`
- `bote`
- `reunion`
- `participante_reunion`
- `acta`
- `plan_anual`
- `plan_area`
- `plan_item`
- `plan_seguimiento`

Puntos de negocio importantes:

- `usuario.clave_hash` puede ser `null`, lo que permite usuarios sin acceso.
- `deportista` referencia a `usuario` en relacion uno a uno.
- `deportista_categoria` conserva historial y vigencia de categoria.
- `tipo_bote` y `estado_bote` son catalogos operativos parametrizados.
- `bote` referencia obligatoriamente a un tipo y un estado.
- `acta.id_reunion` es unico, por lo que solo existe una acta por reunion.
- `plan_anual.anio` es unico.

## Flujos importantes

### Usuario sin acceso

1. Se crea `usuario` con datos personales.
2. No se asignan roles.
3. `clave_hash` queda `null`.
4. No puede iniciar sesion.

### Habilitar acceso

1. Se toma un usuario ya existente.
2. Se asignan roles.
3. Se genera clave provisoria.
4. El usuario queda habilitado para login.

### Registrar deportista

1. Se busca un usuario ya existente.
2. Se valida que aun no sea deportista.
3. Se crea `deportista`.
4. Se crea una fila vigente en `deportista_categoria`.

### Cambiar categoria

1. Se toma la categoria vigente.
2. La categoria actual deja de estar vigente.
3. Se registra `fecha_hasta`.
4. Se crea nueva fila vigente.

### Gestionar flota

1. Se cargan catalogos de tipos y estados.
2. Se consulta grilla paginada con filtros y buscador.
3. Se crea o edita un bote desde modal.
4. El backend valida tipo activo, estado activo y nombre unico.

## Seed de desarrollo

El seed se ejecuta al iniciar backend y deja:

- 9 roles base.
- Catalogo de categorias deportivas.
- Catalogo completo de tipos de bote: `1x`, `2x`, `2-`, `2+`, `4x`, `4-`, `4+`, `8+`.
- Estados de bote: `Disponible`, `En mantenimiento`, `Fuera de servicio`.
- Menus base de Inicio, Usuarios, Deportistas, Flota, Reuniones y Planificacion.
- 6 usuarios demo con acceso.
- 100 personas del club adicionales.
- Esas 100 personas tambien registradas como deportistas.
- Categorias iniciales para esos 100 deportistas.
- 30 deportistas clasificados como Master.
- 2 reuniones demo.
- 1 acta demo.
- 1 plan anual demo con areas, items y seguimientos.
- No se crean botes demo: la flota del club se ingresa manualmente.

## Variables de entorno

### Backend

Archivo: [backend/.env.example](./backend/.env.example)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=rama_remo
PORT=3001
FRONTEND_URL=http://localhost:5173
APP_SECRET=rama-remo-dev-secret
ADMIN_RUT=11111111-1
ADMIN_PASSWORD=admin123
DEFAULT_USER_PASSWORD=remo1234
```

### Frontend

Archivo: [frontend/.env.example](./frontend/.env.example)

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Instalacion

### Backend

```powershell
cd backend
npm.cmd install
```

### Frontend

```powershell
cd frontend
npm.cmd install
```

## Puesta en marcha

### Backend

```powershell
cd backend
npm.cmd run start:dev
```

### Frontend

```powershell
cd frontend
npm.cmd run dev
```

## Acceso inicial

- RUT admin: `11111111-1`
- clave admin: `admin123`
- clave provisoria por defecto: `remo1234`

## Rutas de frontend vigentes

- `/login`
- `/`
- `/mi-acceso`
- `/usuarios`
- `/usuarios/nuevo`
- `/usuarios/:id/editar`
- `/usuarios/:id/habilitar-acceso`
- `/deportistas`
- `/deportistas/nuevo`
- `/deportistas/:id`
- `/flota`
- `/reuniones`
- `/reuniones/nueva`
- `/reuniones/:id`
- `/reuniones/:id/editar`
- `/planificacion`
- `/planificacion/nuevo`
- `/planificacion/:id`
- `/planificacion/:id/editar`

## API principal vigente

### Base y autenticacion

- `GET /health`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/password`

### Usuarios

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `POST /users/:id/enable-access`
- `DELETE /users/:id`

### Deportistas

- `GET /athletes/users/search`
- `GET /athletes`
- `GET /athletes/:id`
- `POST /athletes`
- `PATCH /athletes/:id/category`

### Categorias

- `GET /categories`
- `POST /categories`

### Flota

- `GET /fleet/catalogs`
- `GET /fleet`
- `GET /fleet/:id`
- `POST /fleet`
- `PATCH /fleet/:id`

### Reuniones

- `GET /meetings`
- `GET /meetings/:id`
- `POST /meetings`
- `PATCH /meetings/:id`
- `DELETE /meetings/:id`

### Planificacion

- `GET /planning/annual-plans`
- `GET /planning/annual-plans/:id`
- `POST /planning/annual-plans`
- `PATCH /planning/annual-plans/:id`
- `DELETE /planning/annual-plans/:id`
- `POST /planning/annual-plans/:id/items`
- `PATCH /planning/annual-plans/items/:itemId`
- `POST /planning/annual-plans/items/:itemId/follow-ups`

### Catalogos autenticados

- `GET /menus`
- `GET /roles`

## Validaciones destacadas

- No se puede crear un usuario con RUT duplicado.
- No se puede dejar sin roles a un usuario con acceso.
- No se pueden asignar roles a un usuario sin acceso usando el update comun.
- No se puede registrar dos veces al mismo usuario como deportista.
- No se puede dejar mas de una categoria vigente por deportista.
- La nueva categoria no puede iniciar antes que la vigente.
- No se puede crear una categoria sin nombre.
- No se puede crear un bote sin tipo de bote valido.
- No se puede crear un bote sin estado de bote valido.
- No se puede repetir el nombre de un bote.
- No se puede usar un tipo o estado de bote inactivo al guardar.
- La hora de termino de una reunion debe ser posterior a la de inicio.
- El acta debe traer descripcion o archivo.
- El archivo de acta no puede superar 5 MB.

## Estructura principal del repositorio

```text
rama-remo/
|- backend/
|  |- src/
|  |  |- config/
|  |  |- database/
|  |  |  |- entities/
|  |  |- modules/
|  |     |- athletes/
|  |     |- auth/
|  |     |- categories/
|  |     |- fleet/
|  |     |- health/
|  |     |- meetings/
|  |     |- menus/
|  |     |- planning/
|  |     |- roles/
|  |     |- seed/
|  |     |- users/
|- docs/
|- frontend/
|  |- src/
|  |  |- app/
|  |  |- components/
|  |  |- layouts/
|  |  |- pages/
|  |  |- services/
|  |  |- types/
|  |  |- utils/
```

## Verificaciones recomendadas

1. Login con usuario admin.
2. Crear usuario sin acceso.
3. Habilitar acceso a usuario existente.
4. Registrar usuario existente como deportista.
5. Cambiar categoria y revisar historial.
6. Ingresar un bote del club y comprobar filtros en `Flota`.
7. Crear reunion con participantes y acta.
8. Crear plan anual, item y seguimiento.
