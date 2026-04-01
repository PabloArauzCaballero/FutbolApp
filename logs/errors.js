class LoggerError extends Error {
  constructor(message, code = 'LOGGER_ERROR', details = {}) {
    super(message);
    this.name = 'LoggerError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, LoggerError);
  }
}

module.exports = {
  LoggerError,
};
