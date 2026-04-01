const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')('id');
const normalizePositiveNumberCallback = require('../../core/normalizer/normalizePositiveNumberCallback');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const resenasNormalizer = new Normalizer(
    'resenasNormalizer',
    {
        usuario_id: 'number',
        cancha_id: 'number',
        calificacion: 'number',
        comentario: 'string',
    },
    {
        usuario_id: normalizePositiveNumberCallback,
        cancha_id: normalizePositiveNumberCallback,
        calificacion: (_rawValue, normalizedValue) => Number(normalizedValue),
    }
);

const resenasPatchNormalizer = new Normalizer(
    'resenasPatchNormalizer',
    {
        usuario_id: 'number',
        cancha_id: 'number',
        calificacion: 'number',
        comentario: 'string',
    },
    {
        usuario_id: normalizePositiveNumberCallback,
        cancha_id: normalizePositiveNumberCallback,
        calificacion: (_rawValue, normalizedValue) => Number(normalizedValue),
    },
    {
        allowEmptyPayload: true,
    }
);

module.exports = {
    insertNormalizer: {
        body: {
            payloadNormalizer: resenasNormalizer,
        },
    },
    updateNormalizer: {
        body: {
            payloadNormalizer: resenasPatchNormalizer,
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
