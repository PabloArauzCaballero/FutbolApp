const { DataTypes } = require("sequelize");

module.exports = {
    name: "Canchas",
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
        tipo_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "tipo_id",
            references: {
                model: "TipoCancha",
                key: "id",
            },
        },
        precio_por_hora: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: "precio_por_hora",
        },
        estado: {
            type: DataTypes.ENUM("activa", "inactiva"),
            allowNull: false,
            field: "estado",
        },
    },
    metadata: {
        tableName: "Canchas",
        freezeTableName: true,
        timestamps: false,
        underscored: false,
    },
};
