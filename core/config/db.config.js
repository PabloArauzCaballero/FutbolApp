const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");

const dbPath = path.resolve(__dirname, "database.sqlite");
const dbDir = path.dirname(dbPath);

// Asegura que exista la carpeta sino lo creamos
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Asegura que exista físicamente el archivo .sqlite sino tambien
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "");
}

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false,
});

/**
 * Set up Sequelize associations between all models.
 * This is called during initDatabase() after authenticate().
 */
function setupAssociations() {
    const Usuario = require("../../modules/personas/personas.model")(sequelize);
    const TipoCancha = require("../../modules/tipoCancha/tipoCancha.model")(sequelize);
    const Cancha = require("../../modules/canchas/canchas.model")(sequelize);
    const Horario = require("../../modules/horarios/horarios.model")(sequelize);
    const Reserva = require("../../modules/reservas/reservas.model")(sequelize);
    const Resena = require("../../modules/resenas/resenas.model")(sequelize);

    // TipoCancha 1:N Cancha
    Cancha.belongsTo(TipoCancha, { foreignKey: "tipo_id", as: "tipoCancha" });
    TipoCancha.hasMany(Cancha, { foreignKey: "tipo_id" });

    // Cancha 1:N Horario
    Horario.belongsTo(Cancha, { foreignKey: "cancha_id", as: "cancha" });
    Cancha.hasMany(Horario, { foreignKey: "cancha_id" });

    // Usuario 1:N Reserva
    Reserva.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
    Usuario.hasMany(Reserva, { foreignKey: "usuario_id" });

    // Horario 1:N Reserva
    Reserva.belongsTo(Horario, { foreignKey: "horario_id", as: "horario" });
    Horario.hasMany(Reserva, { foreignKey: "horario_id" });

    // Resena associations
    Resena.belongsTo(Cancha, { foreignKey: "cancha_id", as: "cancha" });
    Resena.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });
}

async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");

        // Configurar asociaciones ANTES de sincronizar
        setupAssociations();
        console.log("Associations configured.");

        await sequelize.sync();
        console.log("Database and tables are ready.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }
}

module.exports = {
    sequelize,
    Sequelize,
    initDatabase,
};