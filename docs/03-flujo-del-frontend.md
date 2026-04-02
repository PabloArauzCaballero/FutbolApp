# Flujo del frontend (actual)

El frontend es server-side con EJS.  
No usa CRUD genérico por JS en admin ni scripts `client-*.js` en cliente.

## Configuración

[frontend/index.js](../frontend/index.js) define:

- nombre de app;
- rutas principales;
- páginas de admin;
- páginas de cliente.

## Organización

La lógica de vistas está separada por capas:

- `frontend/routes/*`: rutas de vistas;
- `frontend/services/*`: carga y escritura de datos para vistas;
- `frontend/helpers/view-utils.js`: utilidades compartidas;
- `views/*`: plantillas EJS.

## Rutas de vistas

- Auth: [frontend/routes/auth.view.routes.js](../frontend/routes/auth.view.routes.js)
- Dashboard y redirecciones: [frontend/routes/dashboard.view.routes.js](../frontend/routes/dashboard.view.routes.js)
- Admin por módulo: `frontend/routes/admin/*`
- Cliente: `frontend/routes/cliente/*`

`frontend/routerFactory.js` solo compone routers.

## Flujo en admin

1. `GET /admin/<modulo>` carga datos y renderiza la vista EJS.
2. Formulario de alta: `POST /admin/<modulo>/create`
3. Formulario de edición: `POST /admin/<modulo>/update/:id`
4. Formulario de eliminación: `POST /admin/<modulo>/delete/:id`
5. Después de cada acción se redirige con `?msg=...&type=...`.

Todo esto se implementa en:

- [frontend/routes/admin/create-admin-module-view-router.js](../frontend/routes/admin/create-admin-module-view-router.js)
- [frontend/services/admin-view.service.js](../frontend/services/admin-view.service.js)

## Flujo en cliente

### Canchas

- `GET /cliente/canchas` muestra canchas activas.
- `GET /cliente/canchas/:id` muestra horarios disponibles y reseñas.
- `POST /cliente/reservas/create` crea reserva y bloquea horario.

### Reservas

- `GET /cliente/reservas` lista reservas del usuario.
- `POST /cliente/reservas/:id/cancelar` cancela reserva y libera horario.

### Reseñas

- `GET /cliente/resenas` muestra reseñas pendientes y registradas.
- `POST /cliente/resenas/create` guarda reseña.

Todo esto se implementa en:

- [frontend/routes/cliente/canchas.view.routes.js](../frontend/routes/cliente/canchas.view.routes.js)
- [frontend/routes/cliente/reservas.view.routes.js](../frontend/routes/cliente/reservas.view.routes.js)
- [frontend/routes/cliente/resenas.view.routes.js](../frontend/routes/cliente/resenas.view.routes.js)
- [frontend/services/cliente-view.service.js](../frontend/services/cliente-view.service.js)

## Plantillas activas

- Auth: [views/auth/login.ejs](../views/auth/login.ejs)
- Admin: `views/admin/*.ejs`
- Cliente: `views/cliente/*.ejs`
- Partials: [views/partials](../views/partials)
