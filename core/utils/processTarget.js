const { normalize: defaultNormalize } = require('../normalizer/normalizeTarget');
const { validate: defaultValidate } = require('../validator/validateTarget');

function processTarget(
    target,
    payloadNormalizer,
    payloadValidator,
    normalize = defaultNormalize,
    validate = defaultValidate
) {
    let normalizedData = target;

    if (payloadNormalizer) {
        const normalizeResult = normalize(target, payloadNormalizer);

        if (!normalizeResult.ok) {
            return {
                ok: false,
                stage: 'normalization',
                message: normalizeResult.message,
                errors: normalizeResult.errors || [],
            };
        }

        normalizedData = normalizeResult.data;
    }

    if (payloadValidator) {
        const validateResult = validate(normalizedData, payloadValidator);

        if (!validateResult.ok) {
            return {
                ok: false,
                stage: 'validation',
                message: validateResult.message,
                errors: validateResult.errors || [],
            };
        }
    }

    return {
        ok: true,
        stage: null,
        message: null,
        data: normalizedData,
        errors: [],
    };
}

module.exports = {
    processTarget,
};
