const Validator = require('./validator');

const isNonNegativeInteger = (value) => Number.isSafeInteger(value) && value >= 0;
const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

const listValidator = new Validator(
    'listValidator',
    {
        offset: 'number',
        limit: 'number',
    },
    {
        offset: isNonNegativeInteger,
        limit: isPositiveInteger,
    },
    {
        allowPartial: true,
        allowEmptyPayload: true,
    }
);

module.exports = {
    listValidator,
    Validator,
};
