const repository = require("./canchas.repository");
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "canchas.service",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando crear cancha");
        const result = await repository.crear(payload);
        logger.info({ ok: result?.ok, id: result?.data?.id }, "Finalizó crear cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en canchas.service.crear");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificar cancha");
        const result = await repository.modificar(id, payload);
        logger.info({ id, ok: result?.ok }, "Finalizó modificar cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error en canchas.service.modificar");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminar cancha");
        const result = await repository.eliminar(id);
        logger.info({ id, ok: result?.ok }, "Finalizó eliminar cancha");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en canchas.service.eliminar");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando obtener cancha por id");
        const result = await repository.obtenerPorId(id);
        logger.info({ id, ok: result?.ok, found: !!result?.data }, "Finalizó obtener cancha por id");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en canchas.service.obtenerPorId");
        throw error;
    }
}

async function enlistar(payload) {
    try {
        logger.info({ payload }, "Iniciando enlistar canchas");
        const result = await repository.enlistar(payload);
        logger.info({ ok: result?.ok, total: result?.data?.length || 0 }, "Finalizó enlistar canchas");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en canchas.service.enlistar");
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
