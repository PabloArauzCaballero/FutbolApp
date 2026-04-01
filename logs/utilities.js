const { getAppLogger } = require('./index');

function getRequestIdentifiers(req = {}) {
  return {
    requestId: req.requestId || req.id || null,
    traceId: req.traceId || req.requestId || req.id || null,
  };
}

function buildHttpMeta(req = {}, extraMeta = {}) {
  const { requestId, traceId } = getRequestIdentifiers(req);

  return {
    method: req.method || null,
    route: req.originalUrl || req.url || null,
    ip: req.ip || req.socket?.remoteAddress || null,
    requestId,
    traceId,
    userId: req.user?.id || req.userId || null,
    ...extraMeta,
  };
}

function buildRepoMeta(moduleName, extraMeta = {}) {
  return {
    model: moduleName || null,
    ...extraMeta,
  };
}

function sanitizeString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function buildBasePayload(req, {
  event,
  message,
  moduleName = 'unknown',
  layer = 'controller',
  action,
  statusHttp,
  success,
  errorCode,
  extraMeta = {},
}) {
  const { requestId, traceId } = getRequestIdentifiers(req || {});
  const payload = {
    event,
    message,
    module: `${moduleName}.${layer}`,
    action,
    success,
    meta: buildHttpMeta(req, extraMeta),
  };

  if (requestId) {
    payload.requestId = requestId;
  }

  if (traceId) {
    payload.traceId = traceId;
  }

  if (typeof statusHttp === 'number') {
    payload.statusHttp = statusHttp;
  }

  const safeErrorCode = sanitizeString(errorCode);
  if (safeErrorCode) {
    payload.errorCode = safeErrorCode;
  }

  return payload;
}

function logInfo(req, config) {
  return getAppLogger().info(buildBasePayload(req, {
    ...config,
    success: true,
  }));
}

function logError(req, config) {
  return getAppLogger().error(buildBasePayload(req, {
    ...config,
    success: false,
  }));
}

function logRepoInfo({
  event,
  message,
  moduleName = 'unknown',
  layer = 'repository',
  action,
  statusHttp,
  requestId,
  traceId,
  durationMs,
  extraMeta = {},
}) {
  const payload = {
    event,
    message,
    module: `${moduleName}.${layer}`,
    action,
    success: true,
    meta: buildRepoMeta(moduleName, extraMeta),
  };

  if (typeof statusHttp === 'number') {
    payload.statusHttp = statusHttp;
  }

  if (typeof requestId === 'string' && requestId.trim() !== '') {
    payload.requestId = requestId.trim();
  }

  if (typeof traceId === 'string' && traceId.trim() !== '') {
    payload.traceId = traceId.trim();
  }

  if (typeof durationMs === 'number') {
    payload.durationMs = durationMs;
  }

  return getAppLogger().info(payload);
}

function logRepoError({
  event,
  message,
  moduleName = 'unknown',
  layer = 'repository',
  action,
  error,
  statusHttp,
  requestId,
  traceId,
  durationMs,
  extraMeta = {},
}) {
  const payload = {
    event,
    message: sanitizeString(message) || error?.message || 'Repository error',
    module: `${moduleName}.${layer}`,
    action,
    success: false,
    errorCode: sanitizeString(error?.code) || sanitizeString(error?.name) || 'REPOSITORY_ERROR',
    meta: buildRepoMeta(moduleName, {
      ...extraMeta,
      stack: error?.stack || null,
      original: error?.original || null,
      parent: error?.parent || null,
    }),
  };

  if (typeof statusHttp === 'number') {
    payload.statusHttp = statusHttp;
  }

  if (typeof requestId === 'string' && requestId.trim() !== '') {
    payload.requestId = requestId.trim();
  }

  if (typeof traceId === 'string' && traceId.trim() !== '') {
    payload.traceId = traceId.trim();
  }

  if (typeof durationMs === 'number') {
    payload.durationMs = durationMs;
  }

  return getAppLogger().error(payload);
}

module.exports = {
  getRequestIdentifiers,
  buildHttpMeta,
  buildRepoMeta,
  logInfo,
  logError,
  logRepoInfo,
  logRepoError,
};
