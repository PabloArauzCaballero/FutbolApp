const Validator = require('../../core/validator/validator');
const idValidator = require('../../core/validator/idValidator')('id');
const { listValidator } = require('../../core/validator/listValidator');

const usuariosPayloadModel = Object.freeze({
    nombre: 'string',
    email: 'string',
    rol: 'string',
    contrasena: 'string',

});

const usuariosCallbacks = Object.freeze({
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
    email: (value) => {
        const normalizedValue = value.trim().toLowerCase();

        if (normalizedValue.length < 5 || normalizedValue.length > 254) {
            return false;
        }

        if (/\s/.test(normalizedValue)) {
            return false;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue);
    },

    contrasena: (value) => {
        if (value.length < 8 || value.length > 128) {
            return false;
        }

        const blockedPasswords = new Set([
            '123456',
            '12345678',
            'password',
            'qwerty',
            'admin',
            'letmein',
        ]);

        return !blockedPasswords.has(value.toLowerCase());
    
    },
    rol: (value) => {
        const validRol = new Set(['admin', 'cliente']);
        return validRol.has(value.toLowerCase());
    },
});


const usuariosValidator = new Validator(
    'usuariosValidator',
    usuariosPayloadModel,
    usuariosCallbacks
);


module.exports = {
    body: {
        payloadValidator: usuariosValidator,
    },
};
