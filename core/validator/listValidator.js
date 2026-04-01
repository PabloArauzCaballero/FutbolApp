const Validator = require('../../core/validator/validator');

const isNonNegativeInteger = (value) => {
    return Number.isSafeInteger(value) && value >= 0;
};

const isPositiveInteger = (value) => {
    return Number.isSafeInteger(value) && value > 0;
};

const listValidator = new Validator(
    "listValidator", 
    {
        offset: "number",
        limit: "number"
    },
    {
        offset: isNonNegativeInteger,
        limit: isPositiveInteger,
    }
); 

module.exports = {
    listValidator, 
    Validator,
};
