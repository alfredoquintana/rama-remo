# Sistema Rama de Remo

MVP full stack para la administracion de una rama de remo, orientado al trabajo de directiva.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: NestJS + TypeScript
- Base de datos: MySQL local con XAMPP
- ORM: TypeORM
- Gestor de paquetes: npm

## MVP incluido

- Gestion de usuarios
- Asignacion de uno o mas roles por usuario
- Credenciales provisorias al crear usuarios
- Cambio de clave desde la app
- Gestion de reuniones
- Participantes por reunion con buscador
- Acta integrada en el flujo de reunion
- Registro automatico de quien actualizo el acta y con que rol
- Login basico con sesion protegida
- Usuario administrador inicial
- Seed inicial de roles y menu

## Requisitos previos

- Node.js 22 o superior
- npm 10 o superior
- XAMPP con MySQL iniciado
- Base de datos MySQL creada manualmente

## Base de datos en XAMPP

1. Abre XAMPP.
2. Inicia `MySQL`.
3. Entra a `http://localhost/phpmyadmin`.
4. Crea la base de datos indicada en tu [backend/.env](c:/Users/alfre/OneDrive/Documentos/rama-remo/backend/.env).

Tambien puedes ejecutar el script [docs/database.sql](c:/Users/alfre/OneDrive/Documentos/rama-remo/docs/database.sql).

Configuracion esperada por defecto:

- Host: `localhost`
- Puerto: `3306`
- Usuario: `root`
- Password: vacio
- Base de datos: `rama_remo`

Si tu [backend/.env](c:/Users/alfre/OneDrive/Documentos/rama-remo/backend/.env) usa otro nombre, por ejemplo `remo`, crea esa base exacta.

## Variables de entorno

### Backend

Archivo: [backend/.env.example](c:/Users/alfre/OneDrive/Documentos/rama-remo/backend/.env.example)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=rama_remo
PORT=3001
APP_SECRET=rama-remo-dev-secret
ADMIN_RUT=11111111-1
ADMIN_PASSWORD=admin123
DEFAULT_USER_PASSWORD=remo1234
```

### Frontend

Archivo: [frontend/.env.example](c:/Users/alfre/OneDrive/Documentos/rama-remo/frontend/.env.example)

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Instalacion

### Frontend

```powershell
cd frontend
npm.cmd install
```

### Backend

```powershell
cd backend
npm.cmd install
```

Nota para PowerShell:

- Si `npm` da error por `npm.ps1`, usa `npm.cmd` en lugar de `npm`.

## Como levantar el proyecto

Orden recomendado:

1. Inicia MySQL en XAMPP.
2. Verifica que exista la base `rama_remo`.
3. Levanta el backend.
4. Levanta el frontend.

### Backend

```powershell
cd backend
npm.cmd run start:dev
```

Backend disponible en:

- `http://localhost:3001`
- Health check: `http://localhost:3001/health`

Al iniciar el backend:

- TypeORM sincroniza las tablas automaticamente para desarrollo
- se cargan los roles base
- se cargan los menus e items iniciales

### Frontend

```powershell
cd frontend
npm.cmd run dev
```

Frontend disponible en:

- `http://localhost:5173`

## Acceso inicial

Login del administrador sembrado automaticamente:

- RUT: `11111111-1`
- Contrasena: `admin123`
- Rol: `admin`

Este usuario tiene acceso total al MVP.

Clave provisoria estandar para usuarios nuevos:

- `remo1234`

Cada usuario nuevo queda creado con login basado en su `RUT` y con esa clave provisoria por defecto.
Luego, ya autenticado, puede cambiar su clave desde `Mi acceso`.

## Estructura principal

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
```

## Modelo de datos del MVP

### Usuarios

- `usuario`
- `rol`
- `usuario_rol`

### Reuniones

- `reunion`
- `participantes_reu`
- `acta`

### Navegacion

- `menu`
- `item`
- `menu_rol`

## Mejora aplicada al modelo

El flujo del acta se simplifico para que:

- no exista seleccion manual de tipo
- no exista seleccion manual de usuario ni rol para subir el acta
- el sistema registre automaticamente al usuario autenticado y su rol principal

## Endpoints principales

### Base

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

### Catalogos autenticados

- `GET /menus`
- `GET /roles`

## Pantallas del frontend

- Inicio
- Login
- Mi acceso
- Listado de usuarios
- Crear usuario
- Editar usuario
- Listado de reuniones
- Crear reunion
- Editar reunion
- Detalle de reunion

## Seeds incluidos

### Roles

- admin
- presidente
- vicepresidente
- secretario
- tesorero
- director
- apoderado
- deportista
- entrenador

### Menus

- Inicio
- Usuarios
- Reuniones

### Items

- Usuarios > Listado de usuarios
- Usuarios > Crear usuario
- Reuniones > Listado de reuniones
- Reuniones > Crear reunion

## Comandos utiles

### Frontend

```powershell
cd frontend
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

### Backend

```powershell
cd backend
npm.cmd run start:dev
npm.cmd run build
npm.cmd run lint
```

## Verificaciones realizadas

- Backend compila correctamente
- Backend pasa lint
- Frontend compila correctamente
- Frontend pasa lint
- Backend responde `GET /health`
- Backend responde login `POST /auth/login`
- Backend responde `GET /auth/me` con token valido
- Backend responde `PATCH /auth/password`
- Backend responde `GET /roles` autenticado

No se ejecutaron pruebas de creacion o edicion reales sobre usuarios y reuniones para no ensuciar tu base local con registros de prueba.
