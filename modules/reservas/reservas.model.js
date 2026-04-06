const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    if (sequelize.models.Reserva) {
        return sequelize.models.Reserva;
    }

    const model = sequelize.define(
        "Reserva",
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
        horario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "horario_id",
            references: {
                model: "Horario",
                key: "id",
            },
        },
        estado: {
            type: DataTypes.ENUM("Confirmada", "Cancelada"),
            allowNull: false,
            field: "estado",
        },
    },
        {
            tableName: "Reserva",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return model;
};
