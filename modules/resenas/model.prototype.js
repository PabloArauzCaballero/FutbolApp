const { DataTypes } = require('sequelize');

module.exports = {
    name: 'Resenas',
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
        cancha_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'cancha_id',
            references: {
                model: 'Canchas',
                key: 'id',
            },
        },
        calificacion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'calificacion',
        },
        comentario: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'comentario',
        },
    },
    metadata: {
        tableName: 'Resenas',
        freezeTableName: true,
        timestamps: false,
        underscored: false,
    },
};
