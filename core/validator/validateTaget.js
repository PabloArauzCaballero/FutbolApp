function validate(target, validator) {
    const validationResult = validator.validateInput(target);

    if (!validationResult.status) {
        return {
            ok: false,
            message: validationResult.message,
        };
    }

    return {
        ok: true,
        message: null,
    };
}

module.exports = {
    validate,
}