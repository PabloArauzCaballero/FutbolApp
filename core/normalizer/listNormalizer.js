const Normalizer = require('../../core/normalizer/normalizer');

const listNormalizer = new Normalizer(
    "listNormalizer",
    {
        offset: "number",
        limit: "number"
    }
);

module.exports = {
    listNormalizer,
    Normalizer,
};
