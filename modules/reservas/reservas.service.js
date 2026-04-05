const repository = require("./reservas.repository");
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "reservas.service",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando crear reserva");
        const result = await repository.crear(payload);
        logger.info({ ok: result?.ok, id: result?.data?.id }, "Finalizó crear reserva");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en reservas.service.crear");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificar reserva");
        const result = await repository.modificar(id, payload);
        logger.info({ id, ok: result?.ok }, "Finalizó modificar reserva");
        return result;
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error en reservas.service.modificar");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminar reserva");
        const result = await repository.eliminar(id);
        logger.info({ id, ok: result?.ok }, "Finalizó eliminar reserva");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en reservas.service.eliminar");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando obtener reserva por id");
        const result = await repository.obtenerPorId(id);
        logger.info({ id, ok: result?.ok, found: !!result?.data }, "Finalizó obtener reserva por id");
        return result;
    } catch (error) {
        logger.error({ err: error, id }, "Error en reservas.service.obtenerPorId");
        throw error;
    }
}

async function enlistar(payload) {
    try {
        logger.info({ payload }, "Iniciando enlistar reservas");
        const result = await repository.enlistar(payload);
        logger.info({ ok: result?.ok, total: result?.data?.length || 0 }, "Finalizó enlistar reservas");
        return result;
    } catch (error) {
        logger.error({ err: error, payload }, "Error en reservas.service.enlistar");
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
