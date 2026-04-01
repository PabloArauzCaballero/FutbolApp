function normalizeActionContract(actionContract = {}) {
    if (actionContract === null || typeof actionContract !== 'object' || Array.isArray(actionContract)) {
        return {};
    }

    return actionContract;
}

function extractScopeConfig(scopeConfig = {}) {
    return {
        payloadValidator: scopeConfig.payloadValidator ?? null,
        payloadNormalizer: scopeConfig.payloadNormalizer ?? null,
    };
}

function getLayerContracts(actionValidator = {}, actionNormalizer = {}) {
    const safeActionValidator = normalizeActionContract(actionValidator);
    const safeActionNormalizer = normalizeActionContract(actionNormalizer);

    return {
        body: extractScopeConfig({
            payloadValidator: safeActionValidator.body?.payloadValidator,
            payloadNormalizer: safeActionNormalizer.body?.payloadNormalizer,
        }),
        params: extractScopeConfig({
            payloadValidator: safeActionValidator.params?.payloadValidator,
            payloadNormalizer: safeActionNormalizer.params?.payloadNormalizer,
        }),
        query: extractScopeConfig({
            payloadValidator: safeActionValidator.query?.payloadValidator,
            payloadNormalizer: safeActionNormalizer.query?.payloadNormalizer,
        }),
    };
}

module.exports = {
    getLayerContracts,
};
