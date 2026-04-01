const Validator = require('../../core/validator/validator');
const idValidator = require('../../core/validator/idValidator')('id');
const validatePositiveNumberCallback = require('../../core/validator/validatePositiveNumberCallback');
const { listValidator } = require('../../core/validator/listValidator');

const resenasPayloadModel = Object.freeze({
    usuario_id: 'number',
    cancha_id: 'number',
    calificacion: 'number',
    comentario: 'string',
});

const resenasCallbacks = Object.freeze({
    usuario_id: validatePositiveNumberCallback,
    cancha_id: validatePositiveNumberCallback,
    calificacion: (value) => Number.isInteger(value) && value >= 1 && value <= 5,
    comentario: (value) => {
        const normalizedValue = value.trim();
        return normalizedValue.length >= 3 && normalizedValue.length <= 500;
    },
});

const resenasValidator = new Validator(
    'resenasValidator',
    resenasPayloadModel,
    resenasCallbacks
);

const resenasPatchValidator = new Validator(
    'resenasPatchValidator',
    resenasPayloadModel,
    resenasCallbacks,
    { allowPartial: true }
);

module.exports = {
    insertValidator: {
        body: {
            payloadValidator: resenasValidator,
        },
    },
    updateValidator: {
        body: {
            payloadValidator: resenasPatchValidator,
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
