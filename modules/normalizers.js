const canchaNormalizer = require('./canchas/canchas.normalizer');
const horariosNormalizer = require('./horarios/horarios.normalizer');
const usuariosNormalizer = require('./personas/personas.normalizer');
const resenasNormalizer = require('./resenas/resenas.normalizer');
const reservasNormalizer = require('./reservas/reservas.normalizer');
const tipoCanchaNormalizer = require('./tipoCancha/tipoCancha.normalizer');

module.exports = {
    Canchas: canchaNormalizer,
    Horarios: horariosNormalizer,
    Usuarios: usuariosNormalizer,
    Resenas: resenasNormalizer,
    Reservas: reservasNormalizer,
    TipoCancha: tipoCanchaNormalizer,
};
