const path = require('path');
const { Logger, LEVEL_WEIGHTS } = require('./logger');
const { LoggerError } = require('./errors');

const LOG_SCHEMA = Object.freeze({
  event: 'string',
  message: 'string',
  module: 'string',
  action: 'string',
  statusHttp: 'number',
  requestId: 'string',
  traceId: 'string',
  durationMs: 'number',
  success: 'boolean',
  errorCode: 'string',
  meta: 'object',
  occurredAt: 'timestamp',
  tags: 'array',
  context: 'object',
  payload: 'any',
});

function createLogger(moduleName, filePath = null, columnsModel = LOG_SCHEMA, options = {}) {
  return new Logger(moduleName, filePath, columnsModel, options);
}

function createAppLogger(options = {}) {
  const logsDir = path.resolve(options.logsDir ?? path.join(process.cwd(), 'logs'));
  return createLogger('App', path.join(logsDir, 'appLogs.jsonl'), LOG_SCHEMA, options);
}

function createServerLogger(options = {}) {
  const logsDir = path.resolve(options.logsDir ?? path.join(process.cwd(), 'logs'));
  return createLogger('Server', path.join(logsDir, 'serverLogs.jsonl'), LOG_SCHEMA, options);
}

let appLoggerSingleton = null;
let serverLoggerSingleton = null;

function getAppLogger() {
  if (!appLoggerSingleton) {
    appLoggerSingleton = createAppLogger();
  }

  return appLoggerSingleton;
}

function getServerLogger() {
  if (!serverLoggerSingleton) {
    serverLoggerSingleton = createServerLogger();
  }

  return serverLoggerSingleton;
}

const exportedApi = {
  Logger,
  LoggerError,
  LEVEL_WEIGHTS,
  LOG_SCHEMA,
  createLogger,
  createAppLogger,
  createServerLogger,
  getAppLogger,
  getServerLogger,
};

Object.defineProperty(exportedApi, 'appLogger', {
  enumerable: true,
  get: getAppLogger,
});

Object.defineProperty(exportedApi, 'serverLogger', {
  enumerable: true,
  get: getServerLogger,
});

module.exports = exportedApi;
