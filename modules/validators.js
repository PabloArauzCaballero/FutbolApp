const canchaValidator = require('./canchas/canchas.validator');
const horariosValidator = require('./horarios/horarios.validator');
const usuariosValidator = require('./personas/personas.validator');
const resenasValidator = require('./resenas/resenas.validator');
const reservasValidator = require('./reservas/reservas.validator');
const tipoCanchaValidator = require('./tipoCancha/tipoCancha.validator');

module.exports = {
    Canchas: canchaValidator,
    Horarios: horariosValidator,
    Usuarios: usuariosValidator,
    Resenas: resenasValidator,
    Reservas: reservasValidator,
    TipoCancha: tipoCanchaValidator,
};
