const Validator = require('./validator');
const validatePositiveNumberCallback = require('./validatePositiveNumberCallback');

function createIdValidator(idFieldName = 'id', options = {}) {
    return new Validator(
        'idValidator',
        {
            [idFieldName]: 'number',
        },
        {
            [idFieldName]: validatePositiveNumberCallback,
        },
        options
    );
}

module.exports = createIdValidator;
