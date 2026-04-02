# Flujo de una request en el backend

Este documento explica el camino que sigue una peticion cuando ya entro a la aplicacion. Es el flujo mas importante para entender el backend.

## Cadena general

```text
Ruta -> middleware -> controller -> normalizer -> validator -> service -> repository -> model -> base de datos
```

## Doble capa de proteccion

Antes de que un modulo procese datos, [app.js](../app.js) decide si la request puede entrar:

- `checkUser` bloquea cualquier modulo que no sea auth si no hay sesion.
- `requireRole` restringe ciertas vistas HTML por rol.

Esto da una separacion importante:

- las vistas de admin necesitan rol `admin`;
- las vistas de cliente necesitan rol `cliente`;
- los endpoints API de los modulos no usan `requireRole` dentro de `app.js`, solo `checkUser`.

## Como se monta cada modulo

Los modulos se declaran en [modules/index.js](../modules/index.js). Cada entrada suele exponer:

- `basePath` para la API, por ejemplo `/canchas`;
- `viewBasePath` para la vista, por ejemplo `/admin/canchas`;
- `router` para endpoints JSON;
- `viewRouter` para la pagina HTML.

Luego [app.js](../app.js) los monta asi:

- `/api/<basePath>` para la API;
- `<viewBasePath>` para la vista HTML.

## El controller generico

La pieza central es [modules/controller.js](../modules/controller.js). Ese archivo fabrica las acciones comunes:

- `crear`
- `modificar`
- `eliminar`
- `obtenerPorId`
- `listar`

El controller no conoce la logica concreta de cada modulo. Toma la configuracion que recibe y ejecuta siempre el mismo esquema:

1. arma los contratos de validacion y normalizacion con `getLayerContracts()`;
2. ejecuta `processTarget()` sobre `body`, `params` o `query`;
3. si algo falla, responde `400` con el error correspondiente;
4. si todo esta bien, delega al service;
5. si el service no encuentra el recurso, responde `404`;
6. si todo sale bien, responde `200` o `201`.

## Normalizacion y validacion

La dupla de funciones vive en [core/utils/processTarget.js](../core/utils/processTarget.js), [core/normalizer/normalizeTarget.js](../core/normalizer/normalizeTarget.js) y [core/validator/validateTarget.js](../core/validator/validateTarget.js).

Orden real:

1. normalizar;
2. validar el resultado normalizado;
3. devolver el payload limpio al controller.

Eso evita repetir logica en cada ruta.

### Normalizadores y validadores tipicos

- [core/validator/idValidator.js](../core/validator/idValidator.js) valida un `id` numerico positivo.
- [core/normalizer/idNormalizer.js](../core/normalizer/idNormalizer.js) convierte ese `id` si llega como string.
- [core/validator/listValidator.js](../core/validator/listValidator.js) valida `offset` y `limit`.
- [core/normalizer/listNormalizer.js](../core/normalizer/listNormalizer.js) deja esa query lista para paginar.

## Service y repository

[modules/service.js](../modules/service.js) casi no contiene logica: solo traduce la intencion del controller a llamadas al repository.

[modules/repository.js](../modules/repository.js) si toca la base:

- `crear()` -> `model.create()`;
- `obtenerPorId()` -> `model.findByPk()`;
- `modificar()` -> carga, muta y guarda;
- `eliminar()` -> carga y destruye;
- `listar()` -> `findAndCountAll()` con paginacion.

Ese repository siempre toma el modelo desde [modules/models.js](../modules/models.js).

## Ejemplo concreto: `POST /api/canchas`

1. La ruta vive en [modules/canchas/canchas.routes.js](../modules/canchas/canchas.routes.js).
2. La request llega al controller de `canchas`.
3. Se normaliza y valida el body con [modules/canchas/canchas.normalizer.js](../modules/canchas/canchas.normalizer.js) y [modules/canchas/canchas.validator.js](../modules/canchas/canchas.validator.js).
4. El controller llama al service.
5. El service llama al repository.
6. El repository usa el modelo `Canchas`.
7. Sequelize inserta el registro en la tabla.
8. La respuesta vuelve al navegador en JSON.

## Flujo de auth

Auth no usa el controller generico.

El recorrido es:

1. [modules/auth/auth.routes.js](../modules/auth/auth.routes.js) recibe `POST /api/auth/login`, `POST /api/auth/register` o `POST /api/auth/logout`.
2. [modules/auth/auth.controller.js](../modules/auth/auth.controller.js) valida y normaliza el body.
3. [modules/auth/auth.service.js](../modules/auth/auth.service.js) verifica usuario y contrasena o crea el usuario.
4. [modules/auth/auth.repository.js](../modules/auth/auth.repository.js) consulta o inserta en `Usuarios`.
5. Si el login es correcto, `req.session.user` queda guardado.

Ese `req.session.user` es la llave que habilita todo lo demas.

## Relacion entre tablas

Los modelos estan conectados asi:

- `Canchas.tipo_id` referencia `TipoCancha.id`;
- `Horarios.cancha_id` referencia `Canchas.id`;
- `Reservas.usuario_id` referencia `Usuarios.id`;
- `Reservas.horario_id` referencia `Horarios.id`;
- `Resenas.usuario_id` referencia `Usuarios.id`;
- `Resenas.cancha_id` referencia `Canchas.id`.

Por eso una reserva nueva no es solo una fila mas: tambien depende de que el horario exista y luego puede marcarse como no disponible.

## Casos especiales que conviene mencionar

- [modules/personas/personas.routes.js](../modules/personas/personas.routes.js) no expone `POST`; el alta de usuarios se hace por `auth/register`.
- Los modulos de `horarios`, `reservas` y `resenas` siguen el mismo controlador generico, pero con contratos distintos de validacion y normalizacion.
- Las rutas `/front` de varios modulos renderizan `shared/index` y funcionan como una vista de prueba.
