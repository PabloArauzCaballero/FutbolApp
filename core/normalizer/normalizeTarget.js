function normalize(target, normalizer) {
    if (!normalizer || typeof normalizer.normalizeInput !== 'function') {
        return {
            ok: false,
            message: 'Invalid normalizer: expected an object with a normalizeInput(payload) method.',
            data: null,
            errors: [
                {
                    code: 'INVALID_NORMALIZER',
                    message: 'Invalid normalizer: expected an object with a normalizeInput(payload) method.',
                },
            ],
        };
    }

    try {
        const normalizedResult = normalizer.normalizeInput(target);

        if (!normalizedResult.status) {
            return {
                ok: false,
                message: normalizedResult.message,
                data: null,
                errors: normalizedResult.errors || [],
            };
        }

        return {
            ok: true,
            message: null,
            data: normalizedResult.data,
            errors: [],
        };
    } catch (error) {
        return {
            ok: false,
            message: `Unexpected normalization error: ${error.message}`,
            data: null,
            errors: [
                {
                    code: 'UNEXPECTED_NORMALIZATION_ERROR',
                    message: `Unexpected normalization error: ${error.message}`,
                },
            ],
        };
    }
}

module.exports = {
    normalize,
};
