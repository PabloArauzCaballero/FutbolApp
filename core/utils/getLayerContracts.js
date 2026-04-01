function getLayerContracts(actionValidator = {}, actionNormalizer = {}) {
    const {
        body: validatorBody = {},
        params: validatorParams = {},
        query: validatorQuery = {},
    } = actionValidator;

    const {
        body: normalizerBody = {},
        params: normalizerParams = {},
        query: normalizerQuery = {},
    } = actionNormalizer;

    return {
        body: {
            payloadValidator: validatorBody.payloadValidator ?? null,
            payloadNormalizer: normalizerBody.payloadNormalizer ?? null,
        },
        params: {
            payloadValidator: validatorParams.payloadValidator ?? null,
            payloadNormalizer: normalizerParams.payloadNormalizer ?? null,
        },
        query: {
            payloadValidator: validatorQuery.payloadValidator ?? null,
            payloadNormalizer: normalizerQuery.payloadNormalizer ?? null,
        },
    };
}

module.exports = {
    getLayerContracts,
}