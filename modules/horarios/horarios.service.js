const repository = require("./horarios.repository");
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "horarios.service",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando crear horario");
        const result = await repository.crear(payload);
        logger.info({ ok: result?.ok, id: result?.data?.id }, "Finalizó crear horario");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en horarios.service.crear");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificar horario");
        const result = await repository.modificar(id, payload);
        logger.info({ id, ok: result?.ok }, "Finalizó modificar horario");
        return result;
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error en horarios.service.modificar");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminar horario");
        const result = await repository.eliminar(id);
        logger.info({ id, ok: result?.ok }, "Finalizó eliminar horario");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en horarios.service.eliminar");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando obtener horario por id");
        const result = await repository.obtenerPorId(id);
        logger.info({ id, ok: result?.ok, found: !!result?.data }, "Finalizó obtener horario por id");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en horarios.service.obtenerPorId");
        throw error;
    }
}

async function enlistar(payload) {
    try {
        logger.info({ payload }, "Iniciando enlistar horarios");
        const result = await repository.enlistar(payload);
        logger.info({ ok: result?.ok, total: result?.data?.length || 0 }, "Finalizó enlistar horarios");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en horarios.service.enlistar");
        throw error;
    }
}

module.exports = {
    crear,
    modificar,
    eliminar,
    obtenerPorId,
    enlistar,
};
