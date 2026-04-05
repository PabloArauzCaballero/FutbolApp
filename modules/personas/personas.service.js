const repository = require("./personas.repository");
const rootLogger = require("../../logs/logger");
const { sha1Encode } = require("../../core/text.utils");

const logger = rootLogger.child({
    module: "personas.service",
});

function sanitizePersona(persona) {
    if (!persona) return null;
    const { contrasena, password, ...safePersona } = persona;
    return safePersona;
}

function sanitizeResult(result) {
    if (!result) return result;

    if (Array.isArray(result.data)) {
        return {
            ...result,
            data: result.data.map(sanitizePersona),
        };
    }

    return {
        ...result,
        data: sanitizePersona(result.data),
    };
}

function buildPayload(payload = {}, { allowEmptyPassword = false } = {}) {
    const workedPayload = { ...payload };

    if (typeof workedPayload.contrasena === "string") {
        const trimmedPassword = workedPayload.contrasena.trim();

        if (trimmedPassword === "" && !allowEmptyPassword) {
            delete workedPayload.contrasena;
        } else if (trimmedPassword !== "") {
            workedPayload.contrasena = sha1Encode(trimmedPassword);
        }
    }

    return workedPayload;
}

async function crear(payload) {
    try {
        logger.info({ payload: { ...payload, contrasena: payload?.contrasena ? "***" : undefined } }, "Iniciando crear persona");
        const result = await repository.crear(buildPayload(payload, { allowEmptyPassword: false }));
        logger.info({ ok: result?.ok, id: result?.data?.id }, "Finalizó crear persona");
        return sanitizeResult(result);
    } catch (error) {
        logger.error({ err: error, payload }, "Error en personas.service.crear");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload: { ...payload, contrasena: payload?.contrasena ? "***" : undefined } }, "Iniciando modificar persona");
        const result = await repository.modificar(id, buildPayload(payload));
        logger.info({ id, ok: result?.ok }, "Finalizó modificar persona");
        return sanitizeResult(result);
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error en personas.service.modificar");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminar persona");
        const result = await repository.eliminar(id);
        logger.info({ id, ok: result?.ok }, "Finalizó eliminar persona");
        return sanitizeResult(result);
    } catch (error) {
        logger.error({ err: error, id }, "Error en personas.service.eliminar");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando obtener persona por id");
        const result = await repository.obtenerPorId(id);
        logger.info({ id, ok: result?.ok, found: !!result?.data }, "Finalizó obtener persona por id");
        return sanitizeResult(result);
    } catch (error) {
        logger.error({ err: error, id }, "Error en personas.service.obtenerPorId");
        throw error;
    }
}

async function enlistar(payload) {
    try {
        logger.info({ payload }, "Iniciando enlistar personas");
        const result = await repository.enlistar(payload);
        logger.info({ ok: result?.ok, total: result?.data?.length || 0 }, "Finalizó enlistar personas");
        return sanitizeResult(result);
    } catch (error) {
        logger.error({ err: error, payload }, "Error en personas.service.enlistar");
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
