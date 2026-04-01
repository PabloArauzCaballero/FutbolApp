const { appLogger } = require("./");

function buildHttpMeta(req, extraMeta = {}) {
    return {
        method: req.method,
        route: req.originalUrl,
        ip: req.ip,
        requestId: req.requestId || req.id || null,
        traceId: req.traceId || req.requestId || req.id || null,
        userId: req.user?.id || null,
        ...extraMeta,
    };
}

function buildRepoMeta(moduleName, extraMeta = {}) {
    return {
        model: moduleName || null,
        ...extraMeta,
    };
}

function logInfo(
    req,
    {
        event,
        message,
        moduleName = "unknown",
        layer = "controller",
        action,
        statusHttp,
        extraMeta = {},
    }
) {
    const payload = {
        event,
        message,
        module: `${moduleName}.${layer}`,
        action,
        success: true,
        meta: buildHttpMeta(req, extraMeta),
    };

    if (typeof statusHttp === "number") {
        payload.statusHttp = statusHttp;
    }

    appLogger.info(payload);
}

function logError(
    req,
    {
        event,
        message,
        moduleName = "unknown",
        layer = "controller",
        action,
        statusHttp,
        errorCode,
        extraMeta = {},
    }
) {
    const payload = {
        event,
        message,
        module: `${moduleName}.${layer}`,
        action,
        success: false,
        meta: buildHttpMeta(req, extraMeta),
    };

    if (typeof statusHttp === "number") {
        payload.statusHttp = statusHttp;
    }

    if (typeof errorCode === "string" && errorCode.trim() !== "") {
        payload.errorCode = errorCode;
    }

    appLogger.error(payload);
}

function logRepoInfo({
    event,
    message,
    moduleName = "unknown",
    layer = "repository",
    action,
    extraMeta = {},
}) {
    appLogger.info({
        event,
        message,
        module: `${moduleName}.${layer}`,
        action,
        success: true,
        meta: buildRepoMeta(moduleName, extraMeta),
    });
}

function logRepoError({
    event,
    message,
    moduleName = "unknown",
    layer = "repository",
    action,
    error,
    extraMeta = {},
}) {
    appLogger.error({
        event,
        message: message || error?.message || "Repository error",
        module: `${moduleName}.${layer}`,
        action,
        success: false,
        errorCode: error?.code || error?.name || "REPOSITORY_ERROR",
        meta: buildRepoMeta(moduleName, {
            ...extraMeta,
            stack: error?.stack,
            original: error?.original || null,
            parent: error?.parent || null,
        }),
    });
}

module.exports = {
    logError,
    logInfo,
    logRepoInfo,
    logRepoError,
};