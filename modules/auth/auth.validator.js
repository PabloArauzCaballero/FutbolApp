const Validator = require('../../core/validator/validator');

const authPayloadModel = Object.freeze({
    email: 'string',
    contrasena: 'string',
});

const authCallbacks = Object.freeze({
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


});

const authValidator = new Validator(
    'authValidator',
    authPayloadModel,
    authCallbacks, {
        allowPartial: false,
    }
);

module.exports = {
    body: {
        payloadValidator: authValidator,
    },
};
