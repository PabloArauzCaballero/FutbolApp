const Validator = require('../../core/validator/validator');
const idValidator = require('../../core/validator/idValidator')('id');
const validatePositiveNumberCallback = require('../../core/validator/validatePositiveNumberCallback');
const { listValidator } = require('../../core/validator/listValidator');

const horariosPayloadModel = Object.freeze({
    cancha_id: 'number',
    fecha: 'date',
    hora_inicio: 'time',
    hora_fin: 'time',
    disponible: 'boolean',
});

const horariosCallbacks = Object.freeze({
    cancha_id: validatePositiveNumberCallback,
    hora_inicio: (value) => /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))$/.test(value),
    hora_fin: (value) => /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))$/.test(value),
});

const horariosValidator = new Validator(
    'horariosValidator',
    horariosPayloadModel,
    horariosCallbacks
);

const horariosPatchValidator = new Validator(
    'horariosPatchValidator',
    horariosPayloadModel,
    horariosCallbacks,
    { allowPartial: true }
);

module.exports = {
    insertValidator: {
        body: {
            payloadValidator: horariosValidator,
        },
    },
    updateValidator: {
        body: {
            payloadValidator: horariosPatchValidator,
        },
        params: {
            payloadValidator: idValidator,
        },
    },
    deleteValidator: {
        params: {
            payloadValidator: idValidator,
        },
    },
    getValidator: {
        params: {
            payloadValidator: idValidator,
        },
    },
    listValidator: {
        query: {
            payloadValidator: listValidator,
        },
    },
};
