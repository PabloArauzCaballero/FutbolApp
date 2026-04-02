const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')('id');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const authNormalizer = new Normalizer(
    'authNormalizer',
    {
        email: 'string',
        contrasena: 'string',
    },
    {
        email: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
    }
);

module.exports = {
    body: {
        payloadNormalizer: authNormalizer,
    },
};
