const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    if (sequelize.models.TipoCancha) {
        return sequelize.models.TipoCancha;
    }

    const model = sequelize.define(
        "TipoCancha",
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
    },
        {
            tableName: "TipoCancha",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return model;
};
