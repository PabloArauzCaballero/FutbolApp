const Logger = require("./logger");

const LOG_SCHEMA = Object.freeze({
    event: "string",
    message: "string",
    module: "string",
    action: "string",
    statusHttp: "number",
    requestId: "string",
    traceId: "string",
    durationMs: "number",
    success: "boolean",
    errorCode: "string",
    meta: "object",
});

const appLogger = new Logger("App", "./logs/appLogs.jsonl", LOG_SCHEMA);
const serverLogger = new Logger("Server", "./logs/serverLogs.jsonl", LOG_SCHEMA);

module.exports = {
    appLogger,
    serverLogger,
    Logger,
    LOG_SCHEMA,
};