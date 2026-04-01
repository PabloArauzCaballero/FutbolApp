const Normalizer = require("./normalizer");

function createIdNormalizer(idFieldName = "id"){
    return new Normalizer(
        "idNormalizer",
        {
            [idFieldName] : "number",
        }
    );
}

module.exports = createIdNormalizer;
