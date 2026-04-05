/**
 * Central model registry. All models are defined here once
 * and associations are set up. Modules should use this instead
 * of calling sequelize.define() individually.
 */
const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("./db.config");

// ==================== Model Definitions ====================

const Usuario = sequelize.define(
    "Usuario",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        nombre: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        contrasena: { type: DataTypes.STRING, allowNull: false },
        rol: { type: DataTypes.ENUM("admin", "cliente"), allowNull: false },
    },
    { tableName: "Usuario", freezeTableName: true, timestamps: false }
);

const TipoCancha = sequelize.define(
    "TipoCancha",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        nombre: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "TipoCancha", freezeTableName: true, timestamps: false }
);

const Cancha = sequelize.define(
    "Cancha",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        nombre: { type: DataTypes.STRING, allowNull: false },
        tipo_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "TipoCancha", key: "id" } },
        precio_por_hora: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        estado: { type: DataTypes.ENUM("Activa", "Inactiva"), allowNull: false },
    },
    { tableName: "Cancha", freezeTableName: true, timestamps: false }
);

const Horario = sequelize.define(
    "Horario",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        cancha_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Cancha", key: "id" } },
        fecha: { type: DataTypes.DATEONLY, allowNull: false },
        hora_inicio: { type: DataTypes.TIME, allowNull: false },
        hora_fin: { type: DataTypes.TIME, allowNull: false },
        disponible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { tableName: "Horario", freezeTableName: true, timestamps: false }
);

const Reserva = sequelize.define(
    "Reserva",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Usuario", key: "id" } },
        horario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Horario", key: "id" } },
        estado: { type: DataTypes.ENUM("Confirmada", "Cancelada"), allowNull: false },
    },
    { tableName: "Reserva", freezeTableName: true, timestamps: false }
);

const Resena = sequelize.define(
    "Resena",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        usuario_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Usuario", key: "id" } },
        cancha_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Cancha", key: "id" } },
        calificacion: { type: DataTypes.INTEGER, allowNull: false },
        comentario: { type: DataTypes.TEXT, allowNull: false },
    },
    { tableName: "Resena", freezeTableName: true, timestamps: false }
);

// ==================== Associations ====================

// TipoCancha 1:N Cancha
Cancha.belongsTo(TipoCancha, { foreignKey: "tipo_id", as: "tipoCancha" });

// Cancha 1:N Horario
Horario.belongsTo(Cancha, { foreignKey: "cancha_id", as: "cancha" });

// Usuario 1:N Reserva
Reserva.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

// Horario 1:N Reserva
Reserva.belongsTo(Horario, { foreignKey: "horario_id", as: "horario" });

// Resena -> Cancha & Usuario
Resena.belongsTo(Cancha, { foreignKey: "cancha_id", as: "cancha" });
Resena.belongsTo(Usuario, { foreignKey: "usuario_id", as: "usuario" });

module.exports = {
    Usuario,
    TipoCancha,
    Cancha,
    Horario,
    Reserva,
    Resena,
};
