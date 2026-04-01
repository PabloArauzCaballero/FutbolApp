const { DataTypes } = require('sequelize');

module.exports = {
    name: 'Reservas',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id',
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'usuario_id',
            references: {
                model: 'Usuarios',
                key: 'id',
            },
        },
        horario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'horario_id',
            references: {
                model: 'Horarios',
                key: 'id',
            },
        },
        estado: {
            type: DataTypes.ENUM('confirmada', 'cancelada'),
            allowNull: false,
            field: 'estado',
        },
    },
    metadata: {
        tableName: 'Reservas',
        freezeTableName: true,
        timestamps: false,
        underscored: false,
    },
};
