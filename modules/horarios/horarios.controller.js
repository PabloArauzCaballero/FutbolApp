const service = require("./horarios.service");
const {
    createSchema,
    updateSchema,
    idParamsSchema,
    listQuerySchema,
} = require("./horarios.schemas");

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

async function crear(req, res) {
    try {
        req.log.info({ body: req.body }, "Solicitud para crear horario");

        const body = validateData(createSchema, req.body, res);
        if (!body) return;

        const result = await service.crear(body);

        if (!result.ok) {
            req.log.warn({ body: req.body, result }, "No se pudo crear horario");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ data: result.data }, "Horario creada correctamente");
        return res.status(201).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al crear horario");
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

        const body = validateData(updateSchema, req.body, res);
        if (!body) return;

        const result = await service.modificar(params.id, body);

        if (!result.ok) {
            req.log.warn({ id: params.id, body, result }, "No se pudo modificar horario");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Horario modificada correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al modificar horario");
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

        const result = await service.eliminar(params.id);

        if (!result.ok) {
            req.log.warn({ id: params.id, result }, "No se pudo eliminar horario");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Horario eliminada correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al eliminar horario");
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

        if (!result.ok) {
            req.log.warn({ id: params.id, result }, "No se pudo obtener horario por id");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ id: params.id, data: result.data }, "Horario obtenida correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al obtener horario por id");
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
            req.log.warn({ query, result }, "No se pudo enlistar horarios");
            return res.status(400).json({
                ok: false,
                message: result.message,
            });
        }

        req.log.info({ query, total: result.data?.length || 0 }, "Horarios enlistadas correctamente");
        return res.status(200).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Error interno al enlistar horarios");
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
