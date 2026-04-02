# Flujo general de la aplicacion

Este proyecto se entiende mejor si lo explicas de arriba hacia abajo: primero arranca el servidor, despues se cargan los modelos y rutas, luego el usuario entra por las vistas, y finalmente cada accion termina en una peticion API que baja hasta Sequelize.

## Orden recomendado para explicarlo

1. [server.js](../server.js) levanta el proceso.
2. [app.js](../app.js) arma Express y monta middlewares, vistas y rutas.
3. [core/config/db.config.js](../core/config/db.config.js) conecta y sincroniza la base.
4. [frontend/routerFactory.js](../frontend/routerFactory.js) define las vistas HTML.
5. Cada modulo expone sus rutas API y su flujo termina en `controller -> service -> repository -> model`.
6. El frontend ejecuta `fetch` contra la API y actualiza la pantalla.
7. Si el proceso se corta, el servidor ejecuta un cierre ordenado con `SIGINT` o `SIGTERM`.

## Mapa resumido

```mermaid
flowchart TD
    A[server.js] --> B[sequelize.initDatabase()]
    B --> C[app.js]
    C --> D[Views EJS]
    C --> E[/api/auth/login]
    C --> F[/api/<modulo>]
    D --> G[public/js/*.js]
    G --> E
    G --> F
    E --> H[controller -> service -> repository -> model]
    F --> H
    H --> I[(Base de datos)]
```

## Idea central

No hay dos aplicaciones separadas. Hay una sola app Node/Express con dos caras:

- una cara HTML/EJS para navegar y mostrar formularios;
- una cara API JSON para leer y modificar los datos.

La autenticacion une ambas caras con `express-session`: el login guarda `req.session.user` y desde ahi todo el resto de la navegacion depende del rol.

## Lo que realmente se explica en clase

- El arranque tecnico.
- El acceso a login y dashboard.
- El recorrido de una accion CRUD.
- La carga de datos desde el navegador.
- El cierre del proceso.

Para ver cada parte con mas detalle, seguí estos archivos:

- [01-arranque-y-cierre.md](./01-arranque-y-cierre.md)
- [02-flujo-de-una-request.md](./02-flujo-de-una-request.md)
- [03-flujo-del-frontend.md](./03-flujo-del-frontend.md)
