const Validator = require('../../core/validator/validator');
const idValidator = require('../../core/validator/idValidator')("id");
const { listValidator } = require('../../core/validator/listValidator');

const tipoCanchaPayloadModel = Object.freeze({
    nombre: "string",
});

const tipoCanchaCallbacks = Object.freeze({
    nombre: (value) => {
        const normalizedValue = value.trim();

        if (normalizedValue.length < 2 || normalizedValue.length > 60) {
            return false;
        }

        if (/\s{2,}/.test(normalizedValue)) {
            return false;
        }

        return /^[A-Za-zÁÉÍÓÚáéíóúÑñ' -]+$/.test(normalizedValue);
    },
});

const tipoCanchaValidator = new Validator(
    "tipoCanchaValidator",
    tipoCanchaPayloadModel,
    tipoCanchaCallbacks
);

const tipoCanchaPatchValidator = new Validator(
    "tipoCanchaPatchValidator",
    tipoCanchaPayloadModel,
    tipoCanchaCallbacks,
    { allowPartial: true }
);

module.exports = {
    insertValidator: {
        body: {
            payloadValidator: tipoCanchaValidator,
        },
    },

    updateValidator: {
        body: {
            payloadValidator: tipoCanchaPatchValidator,
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