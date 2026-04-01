const Validator = require('../../core/validator/validator');
const idValidator = require('../../core/validator/idValidator')("id");
const validatePositiveNumberCallback = require('../../core/validator/validatePositiveNumberCallback');
const { listValidator } = require('../../core/validator/listValidator');

const canchaModel = Object.freeze({
    nombre: "string",
    precio_por_hora: "number",
    estado: "string",
    tipo_id: "number",  
});

const canchaCallbacks = Object.freeze({
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

    precio_por_hora: (value) => {
        if (value < 0 || value > 10000) {
            return false;
        }

        return Number.isInteger(value * 100);
    },

    estado: (value) => {
        const validStatus = new Set(["activa", "inactiva"]);
        return validStatus.has(value.toLowerCase());
    },
    tipo_id:  validatePositiveNumberCallback,
});

const canchasValidator = new Validator(
    "canchasValidator",
    canchaModel,
    canchaCallbacks
);

const canchasPatchValidator = new Validator(
    "canchasPatchValidator",
    canchaModel,
    canchaCallbacks,
    { allowPartial: true }
);

module.exports = {
    insertValidator: {
        body: {
            payloadValidator: canchasValidator,
        },
    },

    updateValidator: {
        body: {
            payloadValidator: canchasPatchValidator,
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