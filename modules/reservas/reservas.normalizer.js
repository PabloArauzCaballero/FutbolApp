const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')('id');
const normalizePositiveNumberCallback = require('../../core/normalizer/normalizePositiveNumberCallback');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const reservasNormalizer = new Normalizer(
    'reservasNormalizer',
    {
        usuario_id: 'number',
        horario_id: 'number',
        estado: 'string',
    },
    {
        usuario_id: normalizePositiveNumberCallback,
        horario_id: normalizePositiveNumberCallback,
        estado: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
    }
);

const reservasPatchNormalizer = new Normalizer(
    'reservasPatchNormalizer',
    {
        usuario_id: 'number',
        horario_id: 'number',
        estado: 'string',
    },
    {
        usuario_id: normalizePositiveNumberCallback,
        horario_id: normalizePositiveNumberCallback,
        estado: (_rawValue, normalizedValue) => normalizedValue.toLowerCase(),
    },
    {
        allowEmptyPayload: true,
    }
);

module.exports = {
    insertNormalizer: {
        body: {
            payloadNormalizer: reservasNormalizer,
        },
    },
    updateNormalizer: {
        body: {
            payloadNormalizer: reservasPatchNormalizer,
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
