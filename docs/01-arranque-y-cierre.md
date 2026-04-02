# Arranque y cierre del servidor

Esta parte explica que pasa desde que ejecutas `npm start` hasta que el proceso queda escuchando peticiones, y tambien como termina de forma ordenada.

## Secuencia de arranque

1. `npm start` ejecuta `node server.js`.
2. [server.js](../server.js) carga variables de entorno con `dotenv`.
3. Se importa [app.js](../app.js), que ya trae Express configurado.
4. Se importa [core/config/db.config.js](../core/config/db.config.js) y se llama a `sequelize.initDatabase()`.
5. `initDatabase()` autentica la conexion, carga los modelos desde [modules/models.js](../modules/models.js) y ejecuta `sequelize.sync()`.
6. Cuando la base responde, se crea el `http.Server` con la app de Express.
7. El servidor queda escuchando en `PORT`.
8. Se registran handlers para `SIGINT`, `SIGTERM`, `uncaughtException` y `unhandledRejection`.

## Que hace app.js al inicializarse

[app.js](../app.js) no solo crea Express; tambien decide el comportamiento base de toda la aplicacion:

- activa `view engine: ejs`;
- define `views/` como carpeta de plantillas;
- monta `helmet`, `compression` y `cors` si existen;
- habilita `express.json()` y `express.urlencoded()`;
- sirve archivos estaticos desde `public/`;
- agrega `requestId`, `traceId` y `startTime` a cada request;
- crea la sesion con `express-session`;
- expone `res.locals.currentUser` para las vistas;
- redirige `/` a `/login` o `/dashboard` segun exista sesion;
- expone `/health`;
- monta rutas de modulos y, al final, maneja 404 y errores globales.

## Orden de montaje de rutas

El orden importa mucho:

1. Primero van los middlewares generales.
2. Despues se monta la ruta raiz `/`.
3. Luego `/health`.
4. Despues se recorren los modulos definidos en [modules/index.js](../modules/index.js).
5. Al final queda el handler de 404.
6. Finalmente queda el handler global de errores.

Eso significa que una request solo llega al 404 si no la captura ninguna ruta anterior.

## Base de datos

En [core/config/db.config.js](../core/config/db.config.js) ocurre lo importante para persistencia:

- `sequelize.authenticate()` verifica la conexion;
- luego se cargan los modelos reales desde `modules/models`;
- despues `sequelize.sync()` crea o ajusta las tablas segun los modelos;
- `initPromise` evita que la inicializacion se repita si se llama mas de una vez.

## Cierre ordenado

Cuando llega una señal de termino o una excepcion grave, `server.js` llama a `shutdown()`:

- avisa en logs que arranco el cierre;
- intenta cerrar el servidor HTTP con `server.close()`;
- si todo sale bien, hace `process.exit(0)` o `process.exit(1)` segun el caso;
- si no cierra a tiempo, fuerza la salida despues de 10 segundos.

Ese es el final real del ciclo de vida de la aplicacion.
