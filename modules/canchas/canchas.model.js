const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const model = sequelize.define(
        "Cancha",
        {
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
            type: DataTypes.ENUM("Activa", "Inactiva"),
            allowNull: false,
            field: "estado",
        },
    },
        {
            tableName: "Cancha",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return model;
};
