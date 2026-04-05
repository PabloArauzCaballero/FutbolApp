const repository = require("./tipoCancha.repository");
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "tipoCancha.service",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando crear tipo de cancha");
        const result = await repository.crear(payload);
        logger.info({ ok: result?.ok, id: result?.data?.id }, "Finalizó crear tipo de cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en tipoCancha.service.crear");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificar tipo de cancha");
        const result = await repository.modificar(id, payload);
        logger.info({ id, ok: result?.ok }, "Finalizó modificar tipo de cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error en tipoCancha.service.modificar");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminar tipo de cancha");
        const result = await repository.eliminar(id);
        logger.info({ id, ok: result?.ok }, "Finalizó eliminar tipo de cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en tipoCancha.service.eliminar");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando obtener tipo de cancha por id");
        const result = await repository.obtenerPorId(id);
        logger.info({ id, ok: result?.ok, found: !!result?.data }, "Finalizó obtener tipo de cancha por id");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en tipoCancha.service.obtenerPorId");
        throw error;
    }
}

async function enlistar(payload) {
    try {
        logger.info({ payload }, "Iniciando enlistar tipos de cancha");
        const result = await repository.enlistar(payload);
        logger.info({ ok: result?.ok, total: result?.data?.length || 0 }, "Finalizó enlistar tipos de cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en tipoCancha.service.enlistar");
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
