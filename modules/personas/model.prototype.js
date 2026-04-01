const { DataTypes } = require('sequelize');

module.exports = {
    name: 'Usuarios',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id',
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'nombre',
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'email',
        },
        contrasena: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'contrasena',
        },
        rol: {
            type: DataTypes.ENUM('admin', 'cliente'),
            allowNull: false,
            field: 'rol',
        },
    },
    metadata: {
        tableName: 'Usuarios',
        freezeTableName: true,
        timestamps: false,
        underscored: false,
    },
};
