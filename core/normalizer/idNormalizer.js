const Normalizer = require('./normalizer');

function createIdNormalizer(idFieldName = 'id', options = {}) {
    return new Normalizer(
        'idNormalizer',
        {
            [idFieldName]: 'number',
        },
        {},
        options
    );
}

module.exports = createIdNormalizer;
