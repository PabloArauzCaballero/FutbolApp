const repository = require("./resenas.repository");
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "resenas.service",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando crear reseña");
        const result = await repository.crear(payload);
        logger.info({ ok: result?.ok, id: result?.data?.id }, "Finalizó crear reseña");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en resenas.service.crear");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificar reseña");
        const result = await repository.modificar(id, payload);
        logger.info({ id, ok: result?.ok }, "Finalizó modificar reseña");
        return result;
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error en resenas.service.modificar");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminar reseña");
        const result = await repository.eliminar(id);
        logger.info({ id, ok: result?.ok }, "Finalizó eliminar reseña");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en resenas.service.eliminar");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando obtener reseña por id");
        const result = await repository.obtenerPorId(id);
        logger.info({ id, ok: result?.ok, found: !!result?.data }, "Finalizó obtener reseña por id");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en resenas.service.obtenerPorId");
        throw error;
    }
}

async function enlistar(payload) {
    try {
        logger.info({ payload }, "Iniciando enlistar reseñas");
        const result = await repository.enlistar(payload);
        logger.info({ ok: result?.ok, total: result?.data?.length || 0 }, "Finalizó enlistar reseñas");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en resenas.service.enlistar");
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
