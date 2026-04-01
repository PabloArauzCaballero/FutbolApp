const sequelize = require("../core/config/db.config");

const tipoCancha = require("./tipoCancha/tipoCancha.model")(sequelize);
const canchas = require("./canchas/canchas.model")(sequelize);
/*
const horarios = require("./horarios/horarios.model")(sequelize);
const personas = require("./personas/personas.model")(sequelize);
const resenas = require("./resenas/resenas.model")(sequelize);
const reservas = require("./reservas/reservas.model")(sequelize);
*/

module.exports = {
    "Cancha": canchas,
/*
    Horarios: horarios,
    Personas: personas,
    Resenas: resenas,
    Reservas: reservas,
*/
    "TipoCancha": tipoCancha,
};
