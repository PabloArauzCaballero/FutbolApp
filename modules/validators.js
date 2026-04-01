const canchaValidator = require("./canchas/canchas.validator");
/*
const horariosValidator = require("./horarios/horarios.validator");
const personasValidator = require("./personas/personas.validator");
const resenasValidator = require("./resenas/resenas.validator");
const reservasValidator = require("./reservas/reservas.validator");
*/
const tipoCanchaValidator = require("./tipoCancha/tipoCancha.validator");

module.exports = {
    "Cancha": canchaValidator,
/*
    "Horarios": horariosValidator,
    "Personas": personasValidator,
    "Resenas": resenasValidator,
    "Reservas": reservasValidator,
*/
    "TipoCancha": tipoCanchaValidator
}