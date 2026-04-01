const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')('id');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const tipoCanchaPayloadModel = {
    nombre: 'string',
};

const tipoCanchasNormalizer = new Normalizer(
    'tipoCanchasNormalizer',
    tipoCanchaPayloadModel
);

const tipoCanchasPatchNormalizer = new Normalizer(
    'tipoCanchasPatchNormalizer',
    tipoCanchaPayloadModel,
    {},
    {
        allowEmptyPayload: true,
    }
);

module.exports = {
    insertNormalizer: {
        body: {
            payloadNormalizer: tipoCanchasNormalizer,
        },
    },
    updateNormalizer: {
        body: {
            payloadNormalizer: tipoCanchasPatchNormalizer,
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
