const { DataTypes } = require('sequelize');

module.exports = {
    name: 'Horarios',
    attributes: {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id',
        },
        cancha_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'cancha_id',
            references: {
                model: 'Canchas',
                key: 'id',
            },
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'fecha',
        },
        hora_inicio: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'hora_inicio',
        },
        hora_fin: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'hora_fin',
        },
        disponible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'disponible',
            defaultValue: true,
        },
    },
    metadata: {
        tableName: 'Horarios',
        freezeTableName: true,
        timestamps: false,
        underscored: false,
    },
};
