const Normalizer = require('../../core/normalizer/normalizer');
const idNormalizer = require('../../core/normalizer/idNormalizer')("id");
const normalizePositiveNumberCallback = require('../../core/normalizer/normalizePositiveNumberCallback');
const { listNormalizer } = require('../../core/normalizer/listNormalizer');

const capitalizeFirstLetter = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const canchasNormalizer = new Normalizer(
    "canchasNormalizer",
    {
        nombre: "string",
        precio_por_hora: "number",
        estado: "string",
        tipo_id: "number",
    },
    {
        precio_por_hora: (_rawValue, normalizedValue) => {
            return Number(normalizedValue.toFixed(2));
        },
        estado: (_rawValue, normalizedValue) => {
            return capitalizeFirstLetter(normalizedValue.toLowerCase());
        },
        tipo_id: normalizePositiveNumberCallback,
    }
);

module.exports = {
    insertNormalizer: { 
        body : {
            payloadNormalizer : canchasNormalizer
        },
    },
    
    updateNormalizer: { 
        body : {
            payloadNormalizer : canchasNormalizer            
        }, 
        params: {
            payloadNormalizer : idNormalizer,
        },
    },

    deleteNormalizer: { 
        params: {
            payloadNormalizer : idNormalizer
        },
    },
    getNormalizer: { 
        params: {
            payloadNormalizer : idNormalizer
        }
    },
    listNormalizer: { 
        query: {
            payloadNormalizer : listNormalizer
        }, 
    },
    Normalizer,
};