const Normalizer = require('./normalizer');

const listNormalizer = new Normalizer(
    'listNormalizer',
    {
        offset: 'number',
        limit: 'number',
    },
    {},
    {
        allowEmptyPayload: true,
        unknownFieldsPolicy: 'strip',
    }
);

module.exports = {
    listNormalizer,
    Normalizer,
};
