const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')('id');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');


const usuariosPatchNormalizer = new Normalizer(
    'usuariosPatchNormalizer',
    {
        nombre: 'string',
        email: 'string',
        rol: 'string',
    },
    {
        email: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
        rol: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
    },
    {
        allowEmptyPayload: true,
    }
);

module.exports = {
    updateNormalizer: {
        body: {
            payloadNormalizer: usuariosPatchNormalizer,
        },
        params: {
            payloadNormalizer: idNormalizer,
        },
    },
    deleteNormalizer: {
        params: {
            payloadNormalizer: idNormalizer,
        },
    },
    getNormalizer: {
        params: {
            payloadNormalizer: idNormalizer,
        },
    },
    listNormalizer: {
        query: {
            payloadNormalizer: listNormalizer,
        },
    },
};
