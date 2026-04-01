const sequelize = require('../core/config/db.config');

const tipoCancha = require('./tipoCancha/tipoCancha.model')(sequelize);
const canchas = require('./canchas/canchas.model')(sequelize);
const horarios = require('./horarios/horarios.model')(sequelize);
const usuarios = require('./personas/personas.model')(sequelize);
const resenas = require('./resenas/resenas.model')(sequelize);
const reservas = require('./reservas/reservas.model')(sequelize);

module.exports = {
    Canchas: canchas,
    Horarios: horarios,
    Usuarios: usuarios,
    Resenas: resenas,
    Reservas: reservas,
    TipoCancha: tipoCancha,
};
