require("dotenv").config();

const http = require("http");
const app = require("./app");
const sequelize = require("./core/config/db.config");

// Ajusta esta línea según tu export real de Pino.
// Ejemplo 1:
// const logger = require("./logs/logger").child({ module: "server" });
//
// Ejemplo 2:
// const { logger } = require("./logs");
//
// Ejemplo 3:
// const logger = require("./core/config/logger");

const baseLogger = require("./logs/logger");
const logger = baseLogger.child({ module: "server" });
const { seedDatabase } = require("./core/config/seed");

const PORT = Number(process.env.PORT) || 3000;

let server = null;
let isShuttingDown = false;

function logServerStartAttempt() {
  logger.info({
    event: "server_start_attempt",
    message: "Intentando iniciar el servidor",
    action: "startup",
    success: true,
    meta: {
      port: PORT,
      pid: process.pid,
      env: process.env.NODE_ENV || "development",
    },
  });
}

function logServerListening() {
  logger.info({
    event: "server_listening",
    message: "Servidor iniciado correctamente",
    action: "listen",
    success: true,
    meta: {
      port: PORT,
      url: `http://localhost:${PORT}`,
      pid: process.pid,
      env: process.env.NODE_ENV || "development",
    },
  });
}

function logServerError(error) {
  logger.error({
    event: "server_error",
    message: error?.message || "Error del servidor",
    action: "runtime",
    success: false,
    errorCode: error?.code || error?.name || "SERVER_ERROR",
    meta: {
      stack: error?.stack,
    },
  });
}

function logShutdownStart(signal) {
  logger.warn({
    event: "server_shutdown_started",
    message: `Recibido ${signal}. Iniciando cierre del servidor`,
    action: "shutdown",
    success: true,
    meta: {
      signal,
      pid: process.pid,
    },
  });
}

function logShutdownSuccess(signal) {
  logger.info({
    event: "server_shutdown_completed",
    message: "Servidor cerrado correctamente",
    action: "shutdown",
    success: true,
    meta: {
      signal,
      pid: process.pid,
    },
  });
}

function logShutdownError(error, signal) {
  logger.error({
    event: "server_shutdown_error",
    message: error?.message || "Error al cerrar el servidor",
    action: "shutdown",
    success: false,
    errorCode: error?.code || error?.name || "SHUTDOWN_ERROR",
    meta: {
      signal,
      stack: error?.stack,
    },
  });
}

function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) {
    logger.warn({
      event: "server_shutdown_ignored",
      message:
        "Se ignoró una solicitud adicional de cierre porque el servidor ya se está cerrando",
      action: "shutdown",
      success: true,
      meta: {
        signal,
      },
    });
    return;
  }

  isShuttingDown = true;
  logShutdownStart(signal);

  if (!server) {
    logShutdownSuccess(signal);
    process.exit(exitCode);
    return;
  }

  server.close((error) => {
    if (error) {
      logShutdownError(error, signal);
      process.exit(1);
      return;
    }

    logShutdownSuccess(signal);
    process.exit(exitCode);
  });

  setTimeout(() => {
    logger.error({
      event: "server_forced_shutdown",
      message: "El servidor no cerró a tiempo. Forzando salida del proceso",
      action: "shutdown",
      success: false,
      errorCode: "FORCED_SHUTDOWN",
      meta: {
        signal,
        timeoutMs: 10000,
      },
    });

    process.exit(1);
  }, 10000).unref();
}

async function startServer() {
  try {
    logServerStartAttempt();

    await sequelize.initDatabase();

    await seedDatabase();

    server = http.createServer(app);

    server.listen(PORT, () => {
      logServerListening();
    });

    server.on("error", (error) => {
      logServerError(error);
      process.exit(1);
    });

    process.on("SIGINT", () => shutdown("SIGINT", 0));
    process.on("SIGTERM", () => shutdown("SIGTERM", 0));

    process.on("uncaughtException", (error) => {
      logger.fatal({
        event: "uncaught_exception",
        message: error?.message || "Excepción no controlada",
        action: "process_exception",
        success: false,
        errorCode: error?.code || error?.name || "UNCAUGHT_EXCEPTION",
        meta: {
          stack: error?.stack,
        },
      });

      shutdown("uncaughtException", 1);
    });

    process.on("unhandledRejection", (reason) => {
      logger.fatal({
        event: "unhandled_rejection",
        message: "Promesa rechazada no manejada",
        action: "process_exception",
        success: false,
        errorCode: "UNHANDLED_REJECTION",
        meta: {
          reason:
            reason instanceof Error
              ? {
                  message: reason.message,
                  stack: reason.stack,
                  name: reason.name,
                }
              : reason,
        },
      });

      shutdown("unhandledRejection", 1);
    });
  } catch (error) {
    logger.fatal({
      event: "server_start_failure",
      message: error?.message || "Error al iniciar la aplicación",
      action: "startup",
      success: false,
      errorCode: error?.code || error?.name || "STARTUP_ERROR",
      meta: {
        stack: error?.stack,
        port: PORT,
      },
    });

    process.exit(1);
  }
}

startServer();