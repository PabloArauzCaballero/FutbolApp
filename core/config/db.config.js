const { Sequelize } = require("sequelize");
const { serverLogger } = require("../../logs");

const sequelize = new Sequelize(
    process.env.DATABASE_NAME || "futbol",
    process.env.DATABASE_USER || "postgres",
    process.env.DATABASE_PASSWORD || "admin",
    {
        host: process.env.DATABASE_HOST || "localhost",
        port: process.env.DBPORT || 5432,
        dialect: process.env.DATABASE_DIALECT || "postgres",
        logging: false,
    }
);

let initPromise = null;

sequelize.initDatabase = async function initDatabase() {
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            await sequelize.authenticate();

            serverLogger.log({
                event: "database_auth_success",
                message: "Connection has been established successfully.",
                module: "db.config",
                action: "authenticate",
                success: true,
                meta: {
                    database: sequelize.config.database,
                    host: sequelize.config.host,
                    port: sequelize.config.port,
                    dialect: sequelize.getDialect(),
                },
            });

            require("../../modules/models");
            await sequelize.sync();

            serverLogger.log({
                event: "database_sync_success",
                message: "Database synchronized successfully.",
                module: "db.config",
                action: "sync",
                success: true,
                meta: {
                    database: sequelize.config.database,
                    host: sequelize.config.host,
                    port: sequelize.config.port,
                    dialect: sequelize.getDialect(),
                },
            });

            return sequelize;
        } catch (error) {
            initPromise = null;

            serverLogger.error({
                event: "database_init_error",
                message: error?.message || "Unable to initialize database.",
                module: "db.config",
                action: "initDatabase",
                success: false,
                errorCode: error?.code || error?.name || "DB_INIT_ERROR",
                meta: {
                    database: sequelize.config.database,
                    host: sequelize.config.host,
                    port: sequelize.config.port,
                    dialect: sequelize.getDialect(),
                    stack: error?.stack,
                    original: error?.original || null,
                    parent: error?.parent || null,
                },
            });

            throw error;
        }
    })();

    return initPromise;
};

module.exports = sequelize;
