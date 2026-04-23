# Endurecimiento del backend

Este documento resume los cambios de seguridad aplicados en backend, para que sirven y que impacto operativo tienen en desarrollo.

## Alcance

Se aplicaron estas mejoras:

- eliminacion de secretos y credenciales por defecto embebidas en codigo
- rate limiting para login y endpoints sensibles
- headers de seguridad HTTP en el arranque del backend
- actualizacion de dependencias vulnerables del backend

RBAC se dejo fuera de esta iteracion a proposito para no bloquear el desarrollo mientras siguen cambiando modulos y flujos.

## 1. Secretos y credenciales sin defaults

Archivos principales:

- `backend/src/config/app.config.ts`
- `backend/src/config/env.validation.ts`
- `backend/src/modules/auth/auth.guard.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/seed/seed.service.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/.env.example`

### Que se hizo

- se quitaron los valores por defecto de `APP_SECRET`, `ADMIN_RUT`, `ADMIN_PASSWORD` y `DEFAULT_USER_PASSWORD`
- esas variables quedaron obligatorias en la validacion del entorno
- el backend ahora usa `getOrThrow` para fallar temprano si falta alguna
- el seed y la habilitacion de acceso toman las claves solo desde variables de entorno

### Para que se hizo

- evitar que el backend arranque con una firma JWT conocida
- evitar credenciales predecibles para admin y usuarios habilitados
- impedir que una mala configuracion quede oculta durante desarrollo o despliegue

### Para que sirve

- reduce el riesgo de acceso no autorizado por secretos conocidos
- mejora la separacion entre codigo y configuracion sensible
- obliga a que cada entorno tenga sus propias credenciales

### Impacto operativo

- ahora hay que completar `backend/.env` antes de levantar el backend
- si falta una variable obligatoria, la app no inicia

## 2. Rate limiting

Archivo principal:

- `backend/src/main.ts`

### Que se hizo

- se agrego un rate limiter especifico para `POST /auth/login`
- se agrego un rate limiter adicional para operaciones sensibles de escritura
- los limites se pueden ajustar por variables de entorno:
  - `LOGIN_RATE_LIMIT_WINDOW_MS`
  - `LOGIN_RATE_LIMIT_MAX`
  - `SENSITIVE_RATE_LIMIT_WINDOW_MS`
  - `SENSITIVE_RATE_LIMIT_MAX`

### Para que se hizo

- reducir intentos de fuerza bruta sobre login
- limitar abuso automatizado sobre endpoints que crean, actualizan o eliminan datos

### Para que sirve

- baja la superficie de ataques simples y repetitivos
- amortigua intentos de credenciales erradas en masa
- protege mejor los endpoints de administracion y cambios de estado

### Impacto operativo

- si alguien insiste con credenciales incorrectas o escribe demasiadas veces en poco tiempo, recibira `429`
- en desarrollo se puede relajar por entorno cambiando los limites del `.env`

## 3. Headers de seguridad HTTP

Archivo principal:

- `backend/src/main.ts`

### Que se hizo

- se integro `helmet`
- se desactivo `x-powered-by`
- se habilitaron headers defensivos del stack HTTP
- no se activo HSTS para evitar problemas en entornos locales o sin TLS real

### Para que se hizo

- endurecer respuestas HTTP sin cambiar la logica funcional de la API
- reducir exposicion innecesaria del servidor y mejorar defensas base del navegador

### Para que sirve

- agrega protecciones como `X-Content-Type-Options`, `Referrer-Policy` y `X-Frame-Options`
- reduce fingerprinting basico del backend

### Impacto operativo

- el impacto funcional esperado es bajo
- no deberia romper frontend porque se desactivo la parte de `helmet` que suele chocar mas en APIs y desarrollo local

## 4. Actualizacion de dependencias

Archivo principal:

- `backend/package.json`

### Que se hizo

- se actualizaron paquetes Nest vulnerables a versiones corregidas dentro de la misma linea mayor
- se agregaron `helmet` y `express-rate-limit`

### Para que se hizo

- cerrar hallazgos reportados por auditoria de dependencias del backend
- reducir riesgo heredado desde librerias base del framework HTTP

### Para que sirve

- disminuye exposicion a vulnerabilidades conocidas en runtime
- deja una base mas segura para seguir desarrollando

### Impacto operativo

- requiere reinstalar dependencias del backend
- siempre conviene validar build y audit despues de cambios de dependencias
