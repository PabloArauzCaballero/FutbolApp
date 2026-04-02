const Normalizer = require('../../core/normalizer/normalizer');

const usuariosNormalizer = new Normalizer(
    'usuariosNormalizer',
    {
        nombre: 'string',
        email: 'string',
        contrasena: 'string',
        rol: 'string',
    },
    {
        email: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
        rol: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
    }
);


module.exports = {
    body: {
        payloadNormalizer: usuariosNormalizer,
    },
};
