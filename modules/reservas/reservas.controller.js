const service = require("./reservas.service");
const {
    createSchema,
    updateSchema,
    idParamsSchema,
    listQuerySchema,
} = require("./reservas.schemas");

function validateData(schema, input, res) {
    const result = schema.safeParse(input);

    if (!result.success) {
        return res.status(400).json({
            ok: false,
            message: "Datos inválidos.",
            errors: result.error.flatten(),
        });
    }

    return result.data;
}

function isAdmin(req) {
    return req.user?.rol === "admin";
}

function isOwner(req, reserva) {
    return Number(reserva?.usuario_id) === Number(req.user?.id);
}

async function crear(req, res) {
    try {
        req.log.info({ body: req.body, userId: req.user?.id, rol: req.user?.rol }, "Solicitud para crear reserva");

        const incomingBody = isAdmin(req)
            ? req.body
            : { ...req.body, usuario_id: req.user.id };

        const body = validateData(createSchema, incomingBody, res);
        if (!body) return;

        const result = await service.crear(body);

        if (!result.ok) {
            req.log.warn({ body: incomingBody, result }, "No se pudo crear reserva");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ data: result.data }, "Reserva creada correctamente");
        return res.status(201).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al crear reserva");
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
        });
    }
}

async function modificar(req, res) {
    try {
        const params = validateData(idParamsSchema, req.params, res);
        if (!params) return;

        const currentResult = await service.obtenerPorId(params.id);

        if (!currentResult.ok || !currentResult.data) {
            req.log.warn({ id: params.id, result: currentResult }, "No se encontró reserva para validar modificación");
            return res.status(404).json({
                ok: false,
                message: currentResult.message || "Reserva no encontrada.",
            });
        }

        if (!isAdmin(req) && !isOwner(req, currentResult.data)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para modificar esta reserva.",
            });
        }

        const incomingBody = isAdmin(req)
            ? req.body
            : Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => key !== "usuario_id"));

        const body = validateData(updateSchema, incomingBody, res);
        if (!body) return;

        const result = await service.modificar(params.id, body);

        if (!result.ok) {
            req.log.warn({ id: params.id, body, result }, "No se pudo modificar reserva");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Reserva modificada correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al modificar reserva");
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
        });
    }
}

async function eliminar(req, res) {
    try {
        const params = validateData(idParamsSchema, req.params, res);
        if (!params) return;

        const currentResult = await service.obtenerPorId(params.id);

        if (!currentResult.ok || !currentResult.data) {
            req.log.warn({ id: params.id, result: currentResult }, "No se encontró reserva para validar eliminación");
            return res.status(404).json({
                ok: false,
                message: currentResult.message || "Reserva no encontrada.",
            });
        }

        if (!isAdmin(req) && !isOwner(req, currentResult.data)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para eliminar esta reserva.",
            });
        }

        const result = await service.eliminar(params.id);

        if (!result.ok) {
            req.log.warn({ id: params.id, result }, "No se pudo eliminar reserva");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Reserva eliminada correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al eliminar reserva");
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
        });
    }
}

async function obtenerPorId(req, res) {
    try {
        const params = validateData(idParamsSchema, req.params, res);
        if (!params) return;

        const result = await service.obtenerPorId(params.id);

        if (!result.ok || !result.data) {
            req.log.warn({ id: params.id, result }, "No se pudo obtener reserva por id");
            return res.status(404).json({
                ok: false,
                message: result.message,
            });
        }

        if (!isAdmin(req) && !isOwner(req, result.data)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para ver esta reserva.",
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Reserva obtenida correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al obtener reserva por id");
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
        });
    }
}

async function enlistar(req, res) {
    try {
        const query = validateData(listQuerySchema, req.query, res);
        if (!query) return;

        const result = await service.enlistar(query);

        if (!result.ok) {
            req.log.warn({ query, result }, "No se pudo enlistar reservas");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        const filteredData = isAdmin(req)
            ? result.data
            : result.data.filter((reserva) => isOwner(req, reserva));

        req.log.info({ query, total: filteredData?.length || 0 }, "Reservas enlistadas correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: filteredData,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al enlistar reservas");
        return res.status(500).json({
            ok: false,
            message: "Error interno del servidor.",
        });
    }
}

module.exports = {
    crear,
    modificar,
    eliminar,
    obtenerPorId,
    enlistar,
};
