const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')("id");
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const tipoCanchasNormalizer = new Normalizer(
    "tipoCanchasNormalizer",
    {
        nombre: "string",
    },
);

module.exports = {
    insertNormalizer: {
        body: {
            payloadNormalizer: tipoCanchasNormalizer,
        },
    },

    updateNormalizer: {
        body: {
            payloadNormalizer: tipoCanchasNormalizer,
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