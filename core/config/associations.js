/**
 * Define Sequelize associations between models.
 * Call this AFTER all models have been created (after sync).
 */
const { sequelize } = require("./db.config");

const models = {};

// Load all models
models.Usuario = require("../modules/personas/personas.model")(sequelize);
models.TipoCancha = require("../modules/tipoCancha/tipoCancha.model")(sequelize);
models.Cancha = require("../modules/canchas/canchas.model")(sequelize);
models.Horario = require("../modules/horarios/horarios.model")(sequelize);
models.Reserva = require("../modules/reservas/reservas.model")(sequelize);
models.Resena = require("../modules/resenas/resenas.model")(sequelize);

// ===== Associations =====

// Cancha -> TipoCancha
models.Cancha.belongsTo(models.TipoCancha, {
    foreignKey: "tipo_id",
    as: "tipoCancha",
});
models.TipoCancha.hasMany(models.Cancha, {
    foreignKey: "tipo_id",
});

// Horario -> Cancha
models.Horario.belongsTo(models.Cancha, {
    foreignKey: "cancha_id",
    as: "cancha",
});
models.Cancha.hasMany(models.Horario, {
    foreignKey: "cancha_id",
});

// Reserva -> Usuario
models.Reserva.belongsTo(models.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
});
models.Usuario.hasMany(models.Reserva, {
    foreignKey: "usuario_id",
});

// Reserva -> Horario
models.Reserva.belongsTo(models.Horario, {
    foreignKey: "horario_id",
    as: "horario",
});
models.Horario.hasMany(models.Reserva, {
    foreignKey: "horario_id",
});

// Resena -> Usuario
models.Resena.belongsTo(models.Usuario, {
    foreignKey: "usuario_id",
    as: "usuario",
});

// Resena -> Cancha
models.Resena.belongsTo(models.Cancha, {
    foreignKey: "cancha_id",
    as: "cancha",
});

module.exports = models;
