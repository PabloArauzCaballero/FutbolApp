const {sequelize} = require("../../core/config/db.config");
const model = require("./personas.model")(sequelize);
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "personas.repository",
    model: "Usuario",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando creación de persona");
        const newInstance = await model.create(payload);
        const result = newInstance.toJSON();

        logger.info({ id: result.id }, "Persona creada correctamente");
        return {
            ok: true,
            message: "Creation success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al crear persona");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificación de persona");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Persona no encontrada para modificar");
            return {
                ok: false,
                message: "Persona not found.",
            };
        }

        Object.assign(currentInstance, payload);
        await currentInstance.save();

        const result = currentInstance.toJSON();
        logger.info({ id, updatedFields: Object.keys(payload) }, "Persona modificada correctamente");

        return {
            ok: true,
            message: "Update success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error al modificar persona");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminación de persona");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Persona no encontrada para eliminar");
            return {
                ok: false,
                message: "Persona not found.",
            };
        }

        const result = currentInstance.toJSON();
        await currentInstance.destroy();

        logger.info({ id }, "Persona eliminada correctamente");
        return {
            ok: true,
            message: "Delete success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al eliminar persona");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando búsqueda de persona por id");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Persona no encontrada");
            return {
                ok: false,
                message: "Persona not found.",
            };
        }

        const result = currentInstance.toJSON();
        logger.info({ id }, "Persona obtenida correctamente");

        return {
            ok: true,
            message: "Get success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al obtener persona por id");
        throw error;
    }
}

async function enlistar(payload = {}) {
    try {
        logger.info({ payload }, "Iniciando listado de personas");
        const { offset, limit } = payload;

        const rows = await model.findAll({
            offset,
            limit,
            order: [["id", "ASC"]],
        });

        const result = rows.map((row) => row.toJSON());
        logger.info({ total: result.length, offset, limit }, "Personas enlistadas correctamente");

        return {
            ok: true,
            message: "List success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al enlistar personas");
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
