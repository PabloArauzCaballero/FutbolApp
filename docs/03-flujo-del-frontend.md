# Flujo del frontend

Esta aplicacion no termina en el backend. La experiencia real del usuario pasa por EJS y por varios scripts en `public/js/` que hacen fetch a la API.

## Configuracion de vistas

[frontend/index.js](../frontend/index.js) define toda la navegacion visible:

- `appName` y `brand`;
- `loginPath`, `logoutPath` y `homePath`;
- `defaultListLimit`;
- `adminModules` con la configuracion de cada CRUD;
- `clientPages` con las paginas del cliente.

Eso hace que las pantallas no esten hardcodeadas una por una.

## routerFactory

[frontend/routerFactory.js](../frontend/routerFactory.js) crea tres routers de vistas:

- `createAuthViewRouter()` para `/login`;
- `createMainViewRouter()` para `/dashboard`, `/cliente/*` y redirecciones generales;
- `createCrudViewRouter(moduleKey)` para las paginas CRUD de admin.

Este archivo es la bisagra entre la configuracion y las plantillas EJS.

## Login y registro

La pantalla principal de auth es [views/auth/login.ejs](../views/auth/login.ejs).

Flujo:

1. la vista carga `window.__APP_CONFIG__`;
2. [public/js/auth.js](../public/js/auth.js) escucha los submits de login y registro;
3. login hace `POST /api/auth/login`;
4. registro hace `POST /api/auth/register`;
5. si el login sale bien, el navegador va a `homePath`;
6. si falla, muestra el mensaje en pantalla.

El logout es simple: [public/js/logout.js](../public/js/logout.js) llama `POST /api/auth/logout` y luego redirige a `/login`.

## Pantallas admin

Las vistas CRUD de admin se renderizan en [views/admin/crud.ejs](../views/admin/crud.ejs).

Esa vista inyecta:

- `window.__APP_CONFIG__`;
- `window.__CRUD_CONFIG__`.

Despues carga [public/js/app.js](../public/js/app.js), que hace todo el trabajo de interfaz generica:

- llena selects con datos de otras APIs;
- lista registros con `GET`;
- crea con `POST`;
- edita con `PATCH`;
- elimina con `DELETE`;
- cambia entre modo creacion y modo edicion;
- muestra feedback de error o exito.

O sea: la vista no sabe nada del modulo concreto. Solo lee `pageConfig`.

## Pantallas de cliente

Las paginas de cliente son:

- [views/cliente/canchas.ejs](../views/cliente/canchas.ejs)
- [views/cliente/reservas.ejs](../views/cliente/reservas.ejs)
- [views/cliente/resenas.ejs](../views/cliente/resenas.ejs)

Cada una inyecta `window.__CLIENT_CONTEXT__` y carga un script distinto:

- [public/js/client-canchas.js](../public/js/client-canchas.js)
- [public/js/client-reservas.js](../public/js/client-reservas.js)
- [public/js/client-resenas.js](../public/js/client-resenas.js)

### `client-canchas.js`

- carga canchas, tipos, horarios y reseñas;
- deja seleccionar una cancha;
- filtra horarios por fecha;
- reserva un horario con `POST /api/reservas`;
- marca ese horario como no disponible con `PATCH /api/horarios/:id`.

### `client-reservas.js`

- carga reservas y horarios;
- muestra solo las reservas del usuario actual;
- permite cancelar reservas confirmadas;
- al cancelar, actualiza la reserva y vuelve a liberar el horario.

### `client-resenas.js`

- carga reservas, horarios, canchas y reseñas;
- detecta reservas ya finalizadas sin reseña;
- permite registrar una reseña nueva;
- muestra las reseñas ya creadas por el usuario.

## Como termina el flujo en el navegador

El flujo visual termina cuando el script de cada pagina:

- recibe `DOMContentLoaded`;
- carga datos iniciales;
- pinta la tabla o tarjeta;
- responde a clicks y submits;
- refresca el estado despues de cada accion.

En otras palabras, el frontend no solo renderiza: tambien reacciona y vuelve a pedir datos a la API.
