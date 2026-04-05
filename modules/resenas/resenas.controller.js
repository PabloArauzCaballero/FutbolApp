const service = require("./resenas.service");
const {
    createSchema,
    updateSchema,
    idParamsSchema,
    listQuerySchema,
} = require("./resenas.schemas");

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

function isOwner(req, resena) {
    return Number(resena?.usuario_id) === Number(req.user?.id);
}

async function crear(req, res) {
    try {
        req.log.info({ body: req.body, userId: req.user?.id, rol: req.user?.rol }, "Solicitud para crear reseña");

        const incomingBody = isAdmin(req)
            ? req.body
            : { ...req.body, usuario_id: req.user.id };

        const body = validateData(createSchema, incomingBody, res);
        if (!body) return;

        const result = await service.crear(body);

        if (!result.ok) {
            req.log.warn({ body: incomingBody, result }, "No se pudo crear reseña");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ data: result.data }, "Reseña creada correctamente");
        return res.status(201).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al crear reseña");
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
            req.log.warn({ id: params.id, result: currentResult }, "No se encontró reseña para validar modificación");
            return res.status(404).json({
                ok: false,
                message: currentResult.message || "Reseña no encontrada.",
            });
        }

        if (!isAdmin(req) && !isOwner(req, currentResult.data)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para modificar esta reseña.",
            });
        }

        const incomingBody = isAdmin(req)
            ? req.body
            : Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => key !== "usuario_id"));

        const body = validateData(updateSchema, incomingBody, res);
        if (!body) return;

        const result = await service.modificar(params.id, body);

        if (!result.ok) {
            req.log.warn({ id: params.id, body, result }, "No se pudo modificar reseña");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Reseña modificada correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al modificar reseña");
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
            req.log.warn({ id: params.id, result: currentResult }, "No se encontró reseña para validar eliminación");
            return res.status(404).json({
                ok: false,
                message: currentResult.message || "Reseña no encontrada.",
            });
        }

        if (!isAdmin(req) && !isOwner(req, currentResult.data)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para eliminar esta reseña.",
            });
        }

        const result = await service.eliminar(params.id);

        if (!result.ok) {
            req.log.warn({ id: params.id, result }, "No se pudo eliminar reseña");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Reseña eliminada correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al eliminar reseña");
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
            req.log.warn({ id: params.id, result }, "No se pudo obtener reseña por id");
            return res.status(404).json({
                ok: false,
                message: result.message,
            });
        }

        if (!isAdmin(req) && !isOwner(req, result.data)) {
            return res.status(403).json({
                ok: false,
                message: "No tienes permisos para ver esta reseña.",
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Reseña obtenida correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al obtener reseña por id");
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
            req.log.warn({ query, result }, "No se pudo enlistar reseñas");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        const filteredData = isAdmin(req)
            ? result.data
            : result.data.filter((resena) => isOwner(req, resena));

        req.log.info({ query, total: filteredData?.length || 0 }, "Reseñas enlistadas correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: filteredData,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al enlistar reseñas");
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
