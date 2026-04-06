const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    if (sequelize.models.Resena) {
        return sequelize.models.Resena;
    }

    const model = sequelize.define(
        "Resena",
        {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: "id",
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "usuario_id",
            references: {
                model: "Usuario",
                key: "id",
            },
        },
        cancha_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "cancha_id",
            references: {
                model: "Cancha",
                key: "id",
            },
        },
        calificacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "calificacion",
        },
        comentario: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "comentario",
        },
    },
        {
            tableName: "Resena",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return model;
};
