function normalize(target, normalizer) {
    const normalizedResult = normalizer.normalizeInput(target);

    if (!normalizedResult.status) {
        return {
            ok: false,
            message: normalizedResult.message,
            data: null,
        };
    }

    return {
        ok: true,
        message: null,
        data: normalizedResult.data,
    };
}

module.exports = {
    normalize,
}