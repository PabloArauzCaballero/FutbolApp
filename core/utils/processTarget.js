function processTarget(target, payloadNormalizer, payloadValidator, normalize, validate) {
    let normalizedData = target;

    if (payloadNormalizer) {
        const normalizeResult = normalize(target, payloadNormalizer);
        
        if (!normalizeResult.ok) {
            return {
                ok: false,
                stage: "normalization",
                message: normalizeResult.message,
            };
        }

        normalizedData = normalizeResult.data;
    }

    if (payloadValidator) {
        const validateResult = validate(normalizedData, payloadValidator);

        if (!validateResult.ok) {
            return {
                ok: false,
                stage: "validation",
                message: validateResult.message,
            };
        }
    }

    return {
        ok: true,
        data: normalizedData,
    };
}

module.exports = {
    processTarget,
}
