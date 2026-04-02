
**Proyecto: Sistema de Gestión de Reservas para Canchas Deportivas**

**Fecha de presentación:** 02/04/

**Objetivo**

Desarrollar una aplicación web monolítica que permita a usuarios reservar canchas
deportivas (fútbol, tenis, pádel, etc.), gestionar horarios y administrar reservas.

**Tecnologías requeridas**

- Node JS con express.
- EJS para las interfaces de usuario.
- Sequelize como ORM.
- La base de datos puede ser cualquiera.
- Pueden usar cualquier framework de CSS.
- Subir a github para presentar, debería ser un solo proyecto donde hayan colaborado
    los dos usuarios.

**Tablas**

1. **Usuarios**
    o id
    o nombre
    o email
    o contraseña
    o rol (admin / cliente)
2. **Canchas**

```
o id
o nombre
o tipo_id
o precio_por_hora
o estado (activa/inactiva)
```
3. Tipo de cancha
    o Id


```
o Nombre
```
4. **Horarios**
    o id
    o cancha_id
    o fecha
    o hora_inicio
    o hora_fin
    o disponible (boolean)
5. **Reservas**
    o id
    o usuario_id
    o horario_id
    o estado (confirmada, cancelada)
6. **Reseñas**
    o id
    o usuario_id
    o cancha_id
    o calificación (1–5)
    o comentario

**Funcionalidades**

**Autenticación**

- Registro e inicio de sesión
- Protección de rutas según rol

**Cliente**

- Ver listado de canchas
- Ver disponibilidad por fecha


- Crear reserva
- Cancelar reserva
- Ver historial de reservas
- Dejar reseña cuando pasó la reserva
- Ver reseñas de las canchas

**Admin**

- CRUD de canchas
- CRUD de tipos de cancha
- Agregar y Eliminar horarios disponibles
- Ver todas las reservas
- Cambiar estado de reservas
- Ver reseñas de las canchas



