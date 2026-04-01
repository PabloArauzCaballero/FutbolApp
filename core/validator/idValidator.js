const Validator = require('../../core/validator/validator');
const validatePositiveNumberCallback = require('../../core/validator/validatePositiveNumberCallback');

function createIdValidator(idFieldName = "id"){
    return new Validator(
        "idValidator",
        {
            [idFieldName]: "number",
        },
        {
            [idFieldName]: validatePositiveNumberCallback,
        }
    );
}

module.exports = createIdValidator;
