const Validator = require('../../core/validator/validator');

const personasValidator = new Validator(
    "personasValidator",
    {
        nombre: "string",
        email: "string",
        contrasena: "string",
        rol: "string",
    },
    {
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
            const password = value;

            if (password.length < 12 || password.length > 64) {
                return false;
            }

            const blockedPasswords = new Set([
                "123456",
                "12345678",
                "password",
                "qwerty",
                "admin",
                "letmein"
            ]);

            return !blockedPasswords.has(password.toLowerCase());
        },

        rol: (value) => {
            const validRol = new Set(["admin", "cliente"]);
            return validRol.has(value.toLowerCase());
        }
    }
);

module.exports = {
    personasValidator,
    Validator,
};
