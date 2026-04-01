const { DataTypes } = require("sequelize");

module.exports = {
    name: "TipoCancha",
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: "id",
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "nombre",
        },
    },
    metadata: {
        tableName: "TipoCancha",
        freezeTableName: true,
        timestamps: false,
        underscored: false,
    },
};
