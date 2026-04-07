# Sistema Rama de Remo

Aplicacion full stack para la gestion administrativa de una rama de remo. El sistema cubre autenticacion, usuarios, roles, reuniones con acta integrada, planificacion anual con seguimiento y una interfaz web protegida para trabajo interno de directiva.

## Estado actual

- Backend en NestJS con TypeORM y MySQL.
- Frontend en React + TypeScript + Vite.
- Sesion protegida con token.
- Seeds automaticos para catalogos y datos demo.
- Interfaz con selector de temas inspirado en la bandera de Alemania.
- Formato visual estandar de fechas `dd/mm/YY`.
- Formato visual estandar de horas `HH:mm`.

## Modulos funcionales

### Autenticacion y sesion

- Login por RUT y clave.
- Persistencia de sesion en frontend.
- Ruta protegida para toda la aplicacion excepto `/login`.
- Cambio de clave desde `Mi acceso`.
- Validacion global del backend con `ValidationPipe`:
  - `whitelist: true`
  - `transform: true`
  - `forbidNonWhitelisted: true`

### Usuarios y roles

- Crear usuarios con clave provisoria automatica.
- Editar datos personales y roles.
- Asignar uno o mas roles por usuario.
- Listado ordenado por nombre.
- Visualizacion de roles con inicial mayuscula en frontend.
- Protecciones de negocio:
  - no se puede eliminar un usuario con actas registradas a su nombre
  - no se puede eliminar el ultimo usuario con rol `admin`
  - no se puede crear o actualizar un usuario con un RUT duplicado

### Reuniones y actas

- Crear, editar, listar y eliminar reuniones.
- Asignar participantes desde buscador por nombre, RUT o rol.
- Registrar acta en el mismo flujo de la reunion.
- Adjuntar archivo al acta en base64.
- El sistema registra automaticamente:
  - usuario que actualiza el acta
  - rol principal del usuario autenticado
  - fecha de actualizacion
- Reglas de negocio:
  - la hora de fin debe ser posterior a la hora de inicio
  - no se puede guardar un acta vacia
  - el archivo del acta no puede superar 5 MB
  - todos los participantes deben existir

### Planificacion anual

- Crear, editar, listar y eliminar planes anuales.
- Definir areas del plan.
- Crear y actualizar items por area.
- Registrar seguimientos con avance porcentual y aprendizaje.
- Resumen automatico:
  - total de items
  - cumplidos
  - en curso
  - atrasados
  - porcentaje de cumplimiento
- Reglas de negocio:
  - un plan debe tener al menos un area
  - el anio debe estar entre 2000 y 2100
  - no se pueden repetir nombres de areas dentro del mismo plan
  - no se puede quitar un area si ya tiene items asociados
  - el responsable debe existir si fue informado
  - el avance del seguimiento debe estar entre 0 y 100
  - los estados finales pueden completar automaticamente la fecha de cumplimiento

## Cambios actuales de interfaz

- Modal de cuenta sobre el nombre del usuario con:
  - cambio de tema
  - configurar o cambiar foto
  - quitar foto
  - acceso a `Mi acceso`
  - cierre de sesion
- Menu lateral con icono de casa junto a `Inicio`.
- Tema por defecto: `Alemania clasico`.
- Temas disponibles:
  - `Alemania clasico`
  - `Alemania grafito`
  - `Alemania marfil`
- El tema se guarda en `localStorage` y se reaplica al volver a entrar.
- La foto personal del usuario tambien se guarda en `localStorage`.

## Stack tecnico

- Frontend: React 19 + TypeScript + Vite + React Router.
- Backend: NestJS 11 + TypeScript.
- ORM: TypeORM.
- Base de datos: MySQL.
- Gestor de paquetes: npm.

## Requisitos previos

- Node.js 22 o superior.
- npm 10 o superior.
- MySQL disponible localmente.
- XAMPP es una opcion valida para desarrollo local.

## Variables de entorno

### Backend

Archivo: [backend/.env.example](c:\Users\alfre\OneDrive\Documentos\rama-remo\backend\.env.example)

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

Notas:

- `FRONTEND_URL` controla el origen permitido por CORS.
- `ADMIN_RUT` y `ADMIN_PASSWORD` determinan el admin inicial.
- `DEFAULT_USER_PASSWORD` define la clave provisoria de usuarios nuevos.

### Frontend

Archivo: [frontend/.env.example](c:\Users\alfre\OneDrive\Documentos\rama-remo\frontend\.env.example)

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

Nota para PowerShell:

- Si `npm` falla por `npm.ps1`, usa `npm.cmd`.

## Puesta en marcha

Orden recomendado:

1. Iniciar MySQL.
2. Crear la base configurada en `backend/.env`.
3. Levantar backend.
4. Levantar frontend.

### Crear base de datos

Puedes crearla desde phpMyAdmin o con el script [docs/database.sql](c:\Users\alfre\OneDrive\Documentos\rama-remo\docs\database.sql).

Configuracion habitual:

- host: `localhost`
- puerto: `3306`
- usuario: `root`
- password: vacio
- base: `rama_remo`

### Levantar backend

```powershell
cd backend
npm.cmd run start:dev
```

Disponible en:

- `http://localhost:3001`
- health check: `http://localhost:3001/health`

Al iniciar:

- TypeORM sincroniza tablas en desarrollo.
- Se validan variables de entorno.
- Se aplican roles base, menus e items.
- Se siembran usuarios demo, reuniones demo y planificacion demo si aun no existen.

### Levantar frontend

```powershell
cd frontend
npm.cmd run dev
```

Disponible en:

- `http://localhost:5173`

## Acceso inicial

Administrador inicial:

- RUT: `11111111-1`
- clave: `admin123`
- roles: `admin`, `presidente`

Clave provisoria por defecto para nuevos usuarios:

- `remo1234`

Cada usuario nuevo:

- inicia sesion con su RUT
- recibe la clave provisoria definida por entorno
- puede cambiarla desde `Mi acceso`

## Datos demo incluidos

El seed deja una base de demostracion coherente con:

- 6 usuarios demo
- 9 roles base
- menus de Inicio, Usuarios, Reuniones y Planificacion
- 2 reuniones demo
- 1 acta demo
- 1 plan anual demo
- areas, items y seguimientos de ejemplo

### Roles base

- admin
- presidente
- vicepresidente
- secretario
- tesorero
- director
- apoderado
- deportista
- entrenador

### Menus e items base

- Inicio
- Usuarios
  - Listado de usuarios
  - Crear usuario
- Reuniones
  - Listado de reuniones
  - Crear reunion
- Planificacion
  - Planes anuales
  - Crear plan anual

## Rutas del frontend

- `/login`
- `/`
- `/mi-acceso`
- `/usuarios`
- `/usuarios/nuevo`
- `/usuarios/:id/editar`
- `/reuniones`
- `/reuniones/nueva`
- `/reuniones/:id`
- `/reuniones/:id/editar`
- `/planificacion`
- `/planificacion/nuevo`
- `/planificacion/:id`
- `/planificacion/:id/editar`

## API principal

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
- `DELETE /users/:id`

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

## Validaciones relevantes

### Backend

#### Login

- `rut`: string, maximo 20 caracteres
- `password`: string, maximo 100 caracteres

#### Cambio de clave

- `newPassword`: minimo 6 y maximo 100 caracteres

#### Usuarios

- `rut`: string, maximo 20
- `nombre`: string, maximo 120
- `telefono`: string, maximo 30
- `fechaNac`: fecha valida ISO
- `direccion`: string, maximo 255
- `roleIds`: arreglo unico de enteros
- en creacion, `roleIds` no puede venir vacio

#### Reuniones

- `fecha`: fecha valida ISO
- `horaInicio`: formato `HH:mm`
- `horaFin`: formato `HH:mm`
- `lugar`: string, maximo 150
- `estado`: enum valido
- `modalidad`: enum valido
- `participantIds`: arreglo unico de enteros, opcional
- `acta.titulo`: string, maximo 160
- `acta.archivo.nombre`: maximo 255
- `acta.archivo.tipo`: maximo 150
- `acta.archivo.contenidoBase64`: base64 valido
- `acta.archivo.tamanoBytes`: entre 1 byte y 5 MB

Reglas adicionales:

- `horaFin` debe ser mayor que `horaInicio`
- el acta debe traer descripcion o archivo
- el actor autenticado debe existir y tener al menos un rol

#### Plan anual

- `anio`: entero entre 2000 y 2100
- `nombre`: string, maximo 150
- `areas`: minimo una
- `areas.nombre`: maximo 100
- `areas.orden`: entero minimo 1

Reglas adicionales:

- no se repiten nombres de areas dentro del mismo plan
- las areas se normalizan con `trim`
- el sistema controla duplicados a nivel de base de datos

#### Item de plan

- `idAreaPlan`: entero
- `idResponsable`: entero opcional
- `titulo`: string, maximo 150
- `descripcion`: requerido
- `resultadoEsperado`: requerido
- `prioridad`: enum opcional
- `estado`: enum opcional
- `fechaPlanificada`: fecha valida ISO
- `fechaCumplimientoReal`: fecha valida ISO opcional
- `resumenFinal`: string opcional

#### Seguimiento

- `estado`: enum valido
- `avancePorcentaje`: entero entre 0 y 100
- `comentario`: requerido
- `bloqueos`, `proximoPaso`, `funcionoBien`, `porMejorar`: opcionales

### Frontend

El frontend agrega validaciones de experiencia antes de enviar al backend:

- confirmacion de nueva clave debe coincidir
- al menos un rol al crear o editar usuario
- al menos un area al crear o editar plan
- no repetir nombres de areas en el mismo plan
- item de plan con titulo, descripcion, resultado esperado y fecha planificada
- seguimiento con comentario y avance entre 0 y 100
- acta con descripcion o archivo
- archivo de acta con maximo 5 MB

## Criterios de interfaz actuales

- El frontend usa `input type="date"` y `input type="time"` para capturar datos tecnicos.
- La visualizacion de fechas se muestra como `dd/mm/YY`.
- La visualizacion de horas se muestra como `HH:mm`.
- El selector de tema y la foto personal viven en el modal de cuenta.
- `Inicio` aparece como acceso principal en el sidebar con icono de casa.
- Los nombres de roles se muestran con inicial mayuscula.

## Estructura principal del repositorio

```text
rama-remo/
|- backend/
|  |- src/
|  |  |- config/
|  |  |- database/
|  |  |  |- entities/
|  |  |- modules/
|  |     |- auth/
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
|  |  |- hooks/
|  |  |- layouts/
|  |  |- pages/
|  |  |- services/
|  |  |- types/
|  |  |- utils/
```

## Comandos utiles

### Frontend

```powershell
cd frontend
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
```

### Backend

```powershell
cd backend
npm.cmd run start:dev
npm.cmd run build
npm.cmd run lint
```

## Verificaciones recomendadas

Despues de levantar el proyecto conviene probar:

1. Login con el usuario admin inicial.
2. Cambio de clave en `Mi acceso`.
3. Creacion y edicion de usuario.
4. Creacion de reunion con participantes.
5. Carga de acta con descripcion o archivo.
6. Creacion de plan anual, item y seguimiento.
7. Cambio de tema desde el modal de cuenta.

## Estado de verificacion en este repositorio

- Backend compila correctamente.
- Frontend compila correctamente.
- Se ha verificado construccion con `npm.cmd run build` en frontend.
- El sistema mantiene datos demo coherentes para desarrollo local.
