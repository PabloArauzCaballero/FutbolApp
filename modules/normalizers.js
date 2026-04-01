const canchaNormalizer = require("./canchas/canchas.normalizer");
/*
const horariosNormalizer = require("./horarios/horarios.normalizer");
const personasNormalizer = require("./personas/personas.normalizer");
const resenasNormalizer = require("./resenas/resenas.normalizer");
const reservasNormalizer = require("./reservas/reservas.normalizer");
*/
const tipoCanchaNormalizer = require("./tipoCancha/tipoCancha.normalizer");

module.exports = {
    "Cancha": canchaNormalizer,
/* 
    "Horarios": horariosNormalizer,
    "Personas": personasNormalizer,
    "Resenas": resenasNormalizer,
    "Reservas": reservasNormalizer,
*/
    "TipoCancha": tipoCanchaNormalizer
}