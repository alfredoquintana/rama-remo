# Sistema Rama de Remo

MVP full stack para la administración de una rama de remo, orientado al trabajo de directiva.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: NestJS + TypeScript
- Base de datos: MySQL local con XAMPP
- ORM: TypeORM
- Gestor de paquetes: npm

## MVP incluido

- Gestión de usuarios
- Asignación de uno o más roles por usuario
- Credenciales provisorias al crear usuarios
- Cambio de clave desde la app
- Gestión de reuniones
- Participantes por reunión con buscador
- Acta integrada en el flujo de reunión
- Registro automático de quién actualizó el acta y con qué rol
- Login básico con sesión protegida
- Usuario administrador inicial
- Seed inicial de roles, menús y datos demo

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

También puedes ejecutar el script [docs/database.sql](c:/Users/alfre/OneDrive/Documentos/rama-remo/docs/database.sql).

Configuración esperada por defecto:

- Host: `localhost`
- Puerto: `3306`
- Usuario: `root`
- Password: vacío
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

## Instalación

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

## Cómo levantar el proyecto

Orden recomendado:

1. Inicia MySQL en XAMPP.
2. Verifica que exista la base `rama_remo` o la que esté definida en `backend/.env`.
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

- TypeORM sincroniza las tablas automáticamente para desarrollo.
- Se cargan los roles base.
- Se cargan los menús e ítems iniciales.
- Se aseguran usuarios demo, reuniones demo y planificación demo cuando la base está vacía en esos módulos.

### Frontend

```powershell
cd frontend
npm.cmd run dev
```

Frontend disponible en:

- `http://localhost:5173`

## Acceso inicial

Login del administrador sembrado automáticamente:

- RUT: `11111111-1`
- Contraseña: `admin123`
- Roles: `admin`, `presidente`

Este usuario tiene acceso total al MVP.

Clave provisoria estándar para usuarios nuevos:

- `remo1234`

Cada usuario nuevo queda creado con login basado en su `RUT` y con esa clave provisoria por defecto.
Luego, ya autenticado, puede cambiar su clave desde `Mi acceso`.

## Datos demo incluidos

El seed deja disponible una base de demostración coherente con:

- 6 usuarios demo con roles reales de trabajo
- 2 reuniones demo
- 1 acta demo asociada
- 1 plan anual demo con áreas, ítems y seguimientos

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

### Navegación

- `menu`
- `item`
- `menu_rol`

### Planificación

- `plan_anual`
- `plan_area`
- `plan_item`
- `plan_seguimiento`

## Mejora aplicada al modelo

El flujo del acta se simplificó para que:

- no exista selección manual de tipo
- no exista selección manual de usuario ni rol para subir el acta
- el sistema registre automáticamente al usuario autenticado y su rol principal

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
- `DELETE /meetings/:id`

### Planificación

- `GET /planning/annual-plans`
- `GET /planning/annual-plans/:id`
- `POST /planning/annual-plans`
- `PATCH /planning/annual-plans/:id`
- `DELETE /planning/annual-plans/:id`
- `POST /planning/annual-plans/:id/items`
- `PATCH /planning/annual-plans/items/:itemId`
- `POST /planning/annual-plans/items/:itemId/follow-ups`

### Catálogos autenticados

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
- Crear reunión
- Editar reunión
- Detalle de reunión
- Listado de planificación anual
- Crear plan anual
- Editar plan anual
- Detalle de planificación anual

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

### Menús

- Inicio
- Usuarios
- Reuniones
- Planificación

### Ítems

- Usuarios > Listado de usuarios
- Usuarios > Crear usuario
- Reuniones > Listado de reuniones
- Reuniones > Crear reunión
- Planificación > Planes anuales
- Planificación > Crear plan anual

## Comandos útiles

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

## Cambios recientes de interfaz

- Visualizacion de fechas con formato `dd/mm/YY`
- Visualizacion de horas con formato `HH:mm`
- Roles mostrados con inicial mayuscula en formularios y vistas
- Selector persistente de 3 temas visuales
- Alemania clasico
- Alemania grafito
- Alemania marfil
- Menu de cuenta unificado sobre el nombre del usuario para tema, foto, acceso y cierre de sesion
- Icono de casa junto a `Inicio` en el menu lateral
- Eliminacion de la etiqueta `MVP` en la portada y cabecera principal

## Criterios visuales del frontend

- Los formularios mantienen `input type="date"` y `input type="time"` para compatibilidad de captura.
- Las vistas del sistema normalizan fechas y horas antes de mostrarlas.
- El tema elegido se guarda en `localStorage` y se reaplica en la siguiente sesion.

## Verificaciones realizadas

- Backend compila correctamente
- Frontend compila correctamente
- Backend responde `GET /health`
- Backend responde login `POST /auth/login`
- Backend responde `GET /auth/me` con token válido
- Backend responde `PATCH /auth/password`
- Backend responde `GET /roles` autenticado
- Backend permite editar usuarios, reuniones y planificación
- Backend permite eliminar usuarios, reuniones y planificación
- Se limpió la data sucia de prueba y se dejó una base demo coherente
