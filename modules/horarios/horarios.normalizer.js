const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')('id');
const normalizePositiveNumberCallback = require('../../core/normalizer/normalizePositiveNumberCallback');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const horariosNormalizer = new Normalizer(
    'horariosNormalizer',
    {
        cancha_id: 'number',
        fecha: 'date',
        hora_inicio: 'time',
        hora_fin: 'time',
        disponible: 'boolean',
    },
    {
        cancha_id: normalizePositiveNumberCallback,
    }
);

const horariosPatchNormalizer = new Normalizer(
    'horariosPatchNormalizer',
    {
        cancha_id: 'number',
        fecha: 'date',
        hora_inicio: 'time',
        hora_fin: 'time',
        disponible: 'boolean',
    },
    {
        cancha_id: normalizePositiveNumberCallback,
    },
    {
        allowEmptyPayload: true,
    }
);

module.exports = {
    insertNormalizer: {
        body: {
            payloadNormalizer: horariosNormalizer,
        },
    },
    updateNormalizer: {
        body: {
            payloadNormalizer: horariosPatchNormalizer,
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
