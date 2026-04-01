function validate(target, validator) {
    if (!validator || typeof validator.validateInput !== 'function') {
        return {
            ok: false,
            message: 'Invalid validator: expected an object with a validateInput(payload) method.',
            errors: [
                {
                    code: 'INVALID_VALIDATOR',
                    message: 'Invalid validator: expected an object with a validateInput(payload) method.',
                },
            ],
        };
    }

    try {
        const validationResult = validator.validateInput(target);

        if (!validationResult.status) {
            return {
                ok: false,
                message: validationResult.message,
                errors: validationResult.errors || [],
            };
        }

        return {
            ok: true,
            message: null,
            errors: [],
        };
    } catch (error) {
        return {
            ok: false,
            message: `Unexpected validation error: ${error.message}`,
            errors: [
                {
                    code: 'UNEXPECTED_VALIDATION_ERROR',
                    message: `Unexpected validation error: ${error.message}`,
                },
            ],
        };
    }
}

module.exports = {
    validate,
};
