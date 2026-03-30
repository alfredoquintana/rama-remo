# Sistema Rama de Remo

Base full stack para iniciar el MVP del sistema administrativo de una rama de remo.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: NestJS + TypeScript
- Base de datos: MySQL local con XAMPP
- ORM: TypeORM
- Gestor de paquetes: npm

## Requisitos previos

- Node.js 22 o superior
- npm 10 o superior
- XAMPP con MySQL habilitado

## Instalacion paso a paso

1. Clonar o abrir este proyecto.
2. Crear la base de datos en MySQL desde XAMPP.
3. Revisar `backend/.env` y ajustar credenciales si tu instalacion de MySQL usa otra configuracion.
4. Revisar `frontend/.env` si quieres cambiar la URL del backend.
5. Instalar dependencias:

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

## Como crear la base de datos en XAMPP

1. Abrir el panel de XAMPP.
2. Iniciar el modulo `MySQL`.
3. Entrar a `http://localhost/phpmyadmin`.
4. Crear una base de datos nueva llamada `rama_remo`.

Tambien puedes crearla ejecutando el script [`docs/database.sql`](/c:/Users/alfre/OneDrive/Documentos/rama-remo/docs/database.sql).

Si usas el usuario por defecto de XAMPP, esta base funciona con:

- Host: `localhost`
- Puerto: `3306`
- Usuario: `root`
- Password: vacio

## Como correr el backend

```bash
cd backend
npm run start:dev
```

Backend por defecto: `http://localhost:3001`

Health check:

```bash
http://localhost:3001/health
```

## Como correr el frontend

```bash
cd frontend
npm run dev
```

Frontend por defecto: `http://localhost:5173`

## Estructura del proyecto

```text
rama-remo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   └── modules/
│   │       └── health/
│   ├── .env
│   └── .env.example
├── docs/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── .env
│   └── .env.example
├── .gitignore
└── README.md
```

## Comandos principales

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

### Backend

```bash
cd backend
npm run start:dev
npm run build
npm run lint
```

## Variables de entorno backend

`backend/.env.example`

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=rama_remo
PORT=3001
```

## Estado actual

- Frontend base con layout simple y Home inicial.
- Cliente API base listo para crecer.
- Backend NestJS configurado con `@nestjs/config` y TypeORM para MySQL.
- Endpoint `GET /health` disponible.
