const Validator = require('../../core/validator/validator');
const idValidator = require('../../core/validator/idValidator')('id');
const validatePositiveNumberCallback = require('../../core/validator/validatePositiveNumberCallback');
const { listValidator } = require('../../core/validator/listValidator');

const reservasPayloadModel = Object.freeze({
    usuario_id: 'number',
    horario_id: 'number',
    estado: 'string',
});

const reservasCallbacks = Object.freeze({
    usuario_id: validatePositiveNumberCallback,
    horario_id: validatePositiveNumberCallback,
    estado: (value) => {
        const validStatus = new Set(['confirmada', 'cancelada']);
        return validStatus.has(value.toLowerCase());
    },
});

const reservasValidator = new Validator(
    'reservasValidator',
    reservasPayloadModel,
    reservasCallbacks
);

const reservasPatchValidator = new Validator(
    'reservasPatchValidator',
    reservasPayloadModel,
    reservasCallbacks,
    { allowPartial: true }
);

module.exports = {
    insertValidator: {
        body: {
            payloadValidator: reservasValidator,
        },
    },
    updateValidator: {
        body: {
            payloadValidator: reservasPatchValidator,
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
