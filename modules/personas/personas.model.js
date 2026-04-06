const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    if (sequelize.models.Usuario) {
        return sequelize.models.Usuario;
    }

    const model = sequelize.define(
        "Usuario",
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: "email",
        },
        contrasena: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "contrasena",
        },
        rol: {
            type: DataTypes.ENUM("admin", "cliente"),
            allowNull: false,
            field: "rol",
        },
    },
        {
            tableName: "Usuario",
            freezeTableName: true,
            timestamps: false,
        }
    );

    return model;
};
