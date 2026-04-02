# Futbol App Upgrade

## Descripción general

Este proyecto es una API REST construida con **Node.js**, **Express** y **Sequelize** para administrar recursos de una aplicación de fútbol. Actualmente el sistema tiene implementados de forma funcional los módulos de:

- **Cancha**
- **TipoCancha**

La base del proyecto sigue una estructura **modular** con separación por capas:

- **rutas** para exponer endpoints
- **controlador genérico** para recibir la petición HTTP
- **normalización** para limpiar y convertir datos
- **validación** para imponer reglas de negocio
- **service** para orquestar casos de uso
- **repository** para persistencia con Sequelize
- **modelos** para definir las tablas
- **logging** en archivos JSONL

Además, el servidor incluye:

- endpoint de salud `GET /health`
- manejo global de errores
- logging estructurado
- apagado controlado del proceso (`SIGINT`, `SIGTERM`)
- inicialización automática de base de datos con `sequelize.sync()`

---

## Tecnologías usadas

- **Node.js**
- **Express 5**
- **Sequelize**
- **PostgreSQL** como objetivo principal
- **dotenv** para variables de entorno
- **nodemon** para desarrollo

Dependencias vistas en el proyecto:

- `express`
- `sequelize`
- `pg`
- `pg-hstore`
- `dotenv`
- `nodemon`
- `sqlite3`

> Nota: el proyecto intenta cargar `cors`, `helmet` y `compression` de forma opcional. Si no están instalados, usa un fallback y la app sigue funcionando.

---

## Estructura del proyecto

```text
Futbol app upgrade/
├── app.js
├── server.js
├── package.json
├── .env
├── core/
│   ├── config/
│   │   └── db.config.js
│   ├── normalizer/
│   │   ├── normalizer.js
│   │   ├── idNormalizer.js
│   │   ├── listNormalizer.js
│   │   ├── normalizeTarget.js
│   │   └── normalizePositiveNumberCallback.js
│   ├── validator/
│   │   ├── validator.js
│   │   ├── idValidator.js
│   │   ├── listValidator.js
│   │   ├── validateTaget.js
│   │   └── validatePositiveNumberCallback.js
│   └── utils/
│       ├── getLayerContracts.js
│       ├── processTarget.js
│       └── strManagmentTool.js
├── logs/
│   ├── index.js
│   ├── logger.js
│   ├── utilities.js
│   ├── appLogs.jsonl
│   └── serverLogs.jsonl
├── modules/
│   ├── index.js
│   ├── controller.js
│   ├── repository.js
│   ├── service.js
│   ├── models.js
│   ├── validators.js
│   ├── normalizers.js
│   ├── canchas/
│   ├── tipoCancha/
│   ├── horarios/
│   ├── personas/
│   ├── resenas/
│   └── reservas/
└── node_modules/
```

---

## Flujo de ejecución de una petición

El flujo real del código es este:

1. **La ruta** recibe la petición HTTP.
2. **El controlador genérico** identifica qué operación ejecutar (`crear`, `modificar`, `eliminar`, `obtenerPorId`, `listar`).
3. El controlador pide los **contratos** de validación y normalización para `body`, `params` y `query`.
4. `processTarget()` ejecuta primero la **normalización** y luego la **validación**.
5. Si todo está correcto, el controlador llama al **service**.
6. El `service` delega al **repository**.
7. El `repository` opera sobre el **modelo Sequelize**.
8. El resultado vuelve al controlador y se responde en JSON.
9. En cada paso importante se generan **logs estructurados**.

En resumen:

```text
Route -> Controller -> Normalizer -> Validator -> Service -> Repository -> Model -> DB
```

---

## Archivos principales y qué hace cada uno

### `server.js`
Es el punto de entrada del proyecto.

Responsabilidades principales:

- carga variables de entorno con `dotenv`
- crea el servidor HTTP
- inicializa la base de datos con `sequelize.initDatabase()`
- levanta la app de Express
- registra eventos de inicio, error y apagado
- maneja `uncaughtException` y `unhandledRejection`

Es el archivo que se ejecuta con:

```bash
npm run dev
```

o

```bash
npm start
```

---

### `app.js`
Construye la aplicación Express.

Incluye:

- middlewares globales
- `express.json()` y `express.urlencoded()`
- generación de `requestId` y `traceId`
- endpoint `/health`
- montaje dinámico de módulos bajo `/api`
- middleware 404
- middleware global de errores

Los módulos se montan así:

- `/api/canchas`
- `/api/tipoCancha`

---

### `core/config/db.config.js`
Configura Sequelize y la conexión con la base de datos.

Funciones importantes:

- crea la instancia `Sequelize`
- autentica la conexión
- carga los modelos desde `modules/models`
- ejecuta `sequelize.sync()`
- evita inicializaciones duplicadas con `initPromise`
- registra logs de éxito o error en la conexión

---

## Núcleo de normalización y validación

Una parte muy importante del proyecto es que la limpieza y validación de datos no está repetida en cada módulo, sino abstraída en clases reutilizables.

### `core/normalizer/normalizer.js`
Es una clase genérica que transforma los datos de entrada.

Puede:

- recortar espacios en strings
- convertir strings numéricos a números
- convertir fechas válidas a `Date`
- limpiar objetos y arreglos
- eliminar valores vacíos o inútiles
- aplicar callbacks específicos por campo

Ejemplos de uso:

- transformar `"  Activa  "` en `"Activa"`
- transformar `"10"` en `10`
- transformar un `tipo_id` string en número entero

### `core/validator/validator.js`
Es una clase genérica para validar payloads.

Valida:

- que el payload sea un objeto plano no vacío
- que solo lleguen campos esperados
- que no falten campos obligatorios
- que cada campo tenga el tipo correcto
- que cada regla específica retorne `true` o `false`

También soporta:

- `allowPartial: true` para operaciones tipo `PATCH`

### `normalizeTarget.js` y `validateTaget.js`
Son wrappers simples que estandarizan la respuesta de normalización y validación.

### `processTarget.js`
Orquesta el proceso en este orden:

1. normaliza
2. valida
3. devuelve el resultado listo para el controlador

Esto evita duplicar lógica en cada endpoint.

---

## Logging del proyecto

### `logs/logger.js`
Implementa una clase `Logger` que escribe archivos **JSONL** (una línea JSON por registro).

Características:

- valida el esquema del log antes de escribir
- agrega `idReg`
- agrega `currentTimestamp`
- soporta niveles: `log`, `info`, `warn`, `error`
- serializa fechas
- asegura que el directorio y archivo existan
- encadena escrituras para reducir problemas de concurrencia en disco

### `logs/index.js`
Crea dos loggers principales:

- `appLogger` -> `./logs/appLogs.jsonl`
- `serverLogger` -> `./logs/serverLogs.jsonl`

### `logs/utilities.js`
Expone funciones auxiliares para loguear eventos desde:

- controladores
- repositorios

Esto hace que los logs tengan estructura homogénea.

---

## Capa modular compartida

### `modules/index.js`
Declara qué módulos se montan realmente en la app. Actualmente:

- `canchas`
- `tipoCancha`

### `modules/models.js`
Carga y registra los modelos Sequelize activos.

Actualmente crea:

- `Cancha`
- `TipoCancha`

Los demás módulos aparecen comentados, lo que indica que el proyecto está preparado para crecer pero aún no están terminados completamente.

### `modules/controller.js`
Es un **controlador genérico reutilizable**.

Genera automáticamente las acciones:

- `crear`
- `modificar`
- `eliminar`
- `obtenerPorId`
- `listar`

Ventajas de este enfoque:

- evita repetir controladores casi iguales
- centraliza la lógica HTTP
- aplica normalización y validación de manera uniforme
- unifica mensajes, estados HTTP y logging

### `modules/service.js`
Es una capa delgada que delega al repository.

Hoy su función principal es mantener la separación de capas. Aunque es simple, deja preparado el proyecto para meter reglas de negocio más complejas sin ensuciar el controlador.

### `modules/repository.js`
Es un **repository genérico** que trabaja con el modelo correspondiente al nombre del módulo.

Incluye operaciones:

- `crear(payload)`
- `obtenerPorId(id)`
- `modificar(id, patch)`
- `eliminar(id)`
- `listar({ offset, limit })`

Aspectos valiosos:

- comprueba que el modelo exista
- comprueba que el modelo implemente métodos mínimos
- devuelve objetos planos (`toJSON()`)
- incluye logging detallado por operación
- usa `findAndCountAll` para paginación

---

## Módulo `TipoCancha`

### Propósito
Administra los tipos de cancha.

### Archivos principales

- `modules/tipoCancha/tipoCancha.routes.js`
- `modules/tipoCancha/tipoCancha.model.js`
- `modules/tipoCancha/model.prototype.js`
- `modules/tipoCancha/tipoCancha.validator.js`
- `modules/tipoCancha/tipoCancha.normalizer.js`
- `modules/tipoCancha/index.js`

### Modelo
La tabla `TipoCancha` tiene:

- `id` -> entero autoincremental, PK
- `nombre` -> string obligatorio

### Normalización
- recorta el texto de `nombre`
- usa `idNormalizer` para params con `id`
- usa `listNormalizer` para `offset` y `limit`

### Validación
La validación exige que `nombre`:

- tenga entre 2 y 60 caracteres
- no contenga dobles espacios
- solo contenga letras, espacios, apóstrofes o guiones

### Endpoints
Base path:

```text
/api/tipoCancha
```

Endpoints:

- `POST /api/tipoCancha/`
- `PATCH /api/tipoCancha/:id`
- `DELETE /api/tipoCancha/:id`
- `GET /api/tipoCancha/:id`
- `GET /api/tipoCancha/?offset=0&limit=10`

### Ejemplo de creación

```json
{
  "nombre": "Sintética"
}
```

---

## Módulo `Cancha`

### Propósito
Administra las canchas registradas en el sistema.

### Archivos principales

- `modules/canchas/canchas.routes.js`
- `modules/canchas/canchas.model.js`
- `modules/canchas/model.prototype.js`
- `modules/canchas/canchas.validator.js`
- `modules/canchas/canchas.normalizer.js`
- `modules/canchas/index.js`

### Modelo
La tabla `Cancha` tiene:

- `id` -> entero autoincremental, PK
- `nombre` -> string obligatorio
- `tipo_id` -> entero obligatorio, FK a `TipoCancha.id`
- `precio_por_hora` -> decimal(10,2)
- `estado` -> enum: `Activa` o `Inactiva`

### Relación importante
`Cancha.tipo_id` referencia a la tabla `TipoCancha`.

### Normalización
La normalización hace lo siguiente:

- recorta `nombre`
- convierte `precio_por_hora` a número con 2 decimales
- convierte `estado` a formato capitalizado (`Activa`, `Inactiva`)
- convierte `tipo_id` a número positivo
- normaliza `id`, `offset` y `limit` donde corresponde

### Validación
Las reglas son:

#### `nombre`
- entre 2 y 60 caracteres
- sin dobles espacios
- solo letras, espacios, apóstrofes o guiones

#### `precio_por_hora`
- entre 0 y 10000
- con máximo 2 decimales efectivos

#### `estado`
- solo acepta `activa` o `inactiva` sin importar mayúsculas/minúsculas en la entrada

#### `tipo_id`
- debe ser entero positivo

### Endpoints
Base path:

```text
/api/canchas
```

Endpoints:

- `POST /api/canchas/`
- `PATCH /api/canchas/:id`
- `DELETE /api/canchas/:id`
- `GET /api/canchas/:id`
- `GET /api/canchas/?offset=0&limit=10`

### Ejemplo de creación

```json
{
  "nombre": "Cancha Norte",
  "tipo_id": 1,
  "precio_por_hora": 120.50,
  "estado": "Activa"
}
```

### Ejemplo de actualización parcial

```json
{
  "precio_por_hora": 150,
  "estado": "inactiva"
}
```

---

## Respuestas esperadas de la API

### Respuesta exitosa de creación

```json
{
  "ok": true,
  "message": "Cancha creada exitosamente.",
  "data": {
    "id": 1,
    "nombre": "Cancha Norte",
    "tipo_id": 1,
    "precio_por_hora": 120.5,
    "estado": "Activa"
  }
}
```

### Respuesta exitosa de listado

```json
{
  "ok": true,
  "message": "Cancha listados exitosamente.",
  "data": {
    "items": [
      {
        "id": 1,
        "nombre": "Cancha Norte",
        "tipo_id": 1,
        "precio_por_hora": 120.5,
        "estado": "Activa"
      }
    ],
    "pagination": {
      "offset": 0,
      "limit": 10,
      "total": 1
    }
  }
}
```

### Error de validación

```json
{
  "ok": false,
  "message": "Validation failed for param \"estado\" with value \"Suspendida\"."
}
```

### Error 404

```json
{
  "ok": false,
  "message": "Ruta no encontrada: GET /api/otro-modulo",
  "requestId": "..."
}
```

---

## Variables de entorno

El proyecto usa las siguientes variables:

```env
PORT=
DATABASE_DIALECT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=
DBPORT=
```

Ejemplo de uso típico con PostgreSQL:

```env
PORT=3000
DATABASE_DIALECT=postgres
DATABASE_NAME=futbol
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password
DATABASE_HOST=localhost
DBPORT=5432
```

---

## Instalación y ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar `.env`

Crear o editar el archivo `.env` con tus datos de base de datos.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

### 4. Ejecutar en producción

```bash
npm start
```

### 5. Verificar salud del servidor

```bash
GET http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Servidor funcionando correctamente"
}
```

---

## Orden recomendado para probar el sistema

Como `Cancha` depende de `TipoCancha`, el orden lógico para probar es:

1. crear un `TipoCancha`
2. crear una `Cancha` usando el `tipo_id` creado
3. obtener la cancha por id
4. listar canchas con paginación
5. modificar una cancha
6. eliminar una cancha

---

## Sobre los módulos aún no implementados

Dentro de `modules/` aparecen también carpetas para:

- `horarios`
- `personas`
- `resenas`
- `reservas`

Pero en el estado actual del proyecto:

- no están montados en `modules/index.js`
- no están definidos en `modules/models.js`
- sus rutas apuntan a controladores específicos que no están presentes en el paquete revisado

Eso sugiere que el proyecto está en una fase donde la arquitectura base ya fue preparada para crecer, pero los módulos activos reales son solo `Cancha` y `TipoCancha`.

---

## Fortalezas del código

Este proyecto tiene varias decisiones buenas:

- **arquitectura limpia y modular**
- **controlador genérico reutilizable**
- **normalización y validación separadas**
- **logging estructurado en JSONL**
- **manejo global de errores**
- **apagado controlado del servidor**
- **repositorio genérico reutilizable**
- **uso de `allowPartial` para PATCH**
- **montaje dinámico de módulos**

---

## Aspectos a mejorar

Hay algunos puntos que conviene ajustar en futuras versiones:

1. **No subir `node_modules/` al repositorio.**
2. **No subir `.env` ni logs reales.**
3. Agregar un archivo `.gitignore` sólido.
4. Separar dependencias de desarrollo (`nodemon`) en `devDependencies`.
5. Agregar pruebas automáticas.
6. Definir asociaciones explícitas de Sequelize si luego quieres includes más ricos.
7. Corregir pequeños detalles de naming, por ejemplo `validateTaget.js` debería ser `validateTarget.js`.
8. Corregir mensajes menores de respuesta, por ejemplo `"Cancha listados exitosamente."` podría convertirse en `"Canchas listadas exitosamente."`.
9. Completar o eliminar módulos placeholder que aún no están activos.

---

## Resumen técnico final

Este proyecto implementa una API REST backend para gestionar tipos de cancha y canchas, usando una arquitectura modular con fuerte énfasis en reutilización. Su pieza más interesante es el controlador genérico respaldado por normalizadores, validadores y repositorios genéricos. Eso hace que agregar nuevos módulos sea mucho más rápido y consistente.

Dicho simple: no es solo una API CRUD; es una base de proyecto bien encaminada para crecer como sistema más grande.

---

## Autor y contexto

El proyecto está orientado a una app de gestión relacionada con fútbol y reserva/administración de canchas. La versión revisada refleja una evolución clara hacia una arquitectura más ordenada, más mantenible y más cercana a un estándar de backend serio.

---

## Frontend monolítico agregado

Se añadió una capa de frontend basada en **Bootstrap 5**, **EJS** y una construcción **por configuración** para que no tengas que duplicar pantallas módulo por módulo.

### Idea central

El frontend se construye desde:

```text
frontend/index.js
```

En ese archivo defines como **variables de entrada**:

- nombre de la app
- ruta de login
- ruta principal
- módulos visibles en navegación
- columnas de tabla
- campos del formulario
- endpoints API para crear, listar, editar y eliminar
- selects estáticos y selects dinámicos cargados desde otras APIs

Con esa configuración se generan las pantallas CRUD.

### Estructura nueva

```text
frontend/
├── index.js
└── routerFactory.js

public/
├── css/
│   └── app.css
└── js/
    ├── app.js
    ├── auth.js
    └── logout.js

views/
├── auth/
│   └── login.ejs
├── crud/
│   └── page.ejs
└── fragments/
    ├── head.ejs
    ├── navbar.ejs
    ├── crud-form.ejs
    ├── crud-table.ejs
    └── footer-scripts.ejs
```

### Rutas de vista agregadas

Ahora el proyecto tiene dos tipos de rutas:

- **API** bajo `/api/...`
- **Vistas** bajo rutas normales del monolito

Ejemplos:

- `/login`
- `/tipoCancha`
- `/canchas`
- `/horarios`
- `/personas`
- `/reservas`
- `/resenas`

### Router por módulo

Cada módulo ahora exporta:

- `router` para API
- `viewRouter` para render de la vista
- `basePath`
- `viewBasePath`

Eso permite que el monolito sirva tanto el backend como la interfaz desde la misma app Express.

### Fragmentos

Se trabajó por fragmentos para que puedas modificar partes sin tocar toda la pantalla:

- `head.ejs` para dependencias comunes
- `navbar.ejs` para navegación y logout
- `crud-form.ejs` para el formulario genérico
- `crud-table.ejs` para la tabla genérica
- `footer-scripts.ejs` para scripts compartidos

### Login

Se corrigió y dejó funcional el módulo `auth`:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

Además se corrigieron errores reales que tenía la lógica:

- validación de usuario inexistente
- comparación de contraseña hasheada
- chequeo de usuario duplicado al registrar
- creación de sesión con datos consistentes

### Middleware de sesión

Se implementó `check-user.js` para que:

- si la petición es HTML, redirija a `/login`
- si la petición es API, responda `401`
- si hay sesión, deje pasar

### Usuarios

La creación de usuarios desde la pantalla de `Usuarios` usa:

```text
/api/auth/register
```

porque el módulo `personas` ya estaba pensado más para listar/editar/eliminar, mientras que el alta con contraseña pertenece a autenticación.

### Cómo agregar otro módulo al front

Solo debes añadir un nuevo objeto dentro de `frontend/index.js` con esta forma:

```js
{
  key: 'miModulo',
  title: 'Mi módulo',
  description: 'Descripción del módulo',
  viewBasePath: '/miModulo',
  apiBasePath: '/api/miModulo',
  primaryKey: 'id',
  createApiPath: '/api/miModulo',
  updateApiPath: '/api/miModulo/:id',
  deleteApiPath: '/api/miModulo/:id',
  listApiPath: '/api/miModulo',
  tableColumns: [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
  ],
  formFields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
  ],
}
```

Si el campo depende de otra tabla, puedes usar `dataSource`:

```js
{
  name: 'tipo_id',
  label: 'Tipo',
  type: 'select',
  required: true,
  dataSource: {
    url: '/api/tipoCancha?offset=0&limit=100',
    responsePath: 'data.items',
    valueKey: 'id',
    labelKey: 'nombre',
  },
}
```

---

## Cómo levantar el proyecto

```bash
npm install
npm run dev
```

Luego abre:

```text
http://localhost:3000/login
```

