const {sequelize} = require("../../core/config/db.config");
const model = require("./tipoCancha.model")(sequelize);
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "tipoCancha.repository",
    model: "TipoCancha",
});

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando creación de tipo de cancha");
        const newInstance = await model.create(payload);
        const result = newInstance.toJSON();

        logger.info({ id: result.id }, "Tipo de cancha creada correctamente");
        return {
            ok: true,
            message: "Creation success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al crear tipo de cancha");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificación de tipo de cancha");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Tipo de cancha no encontrada para modificar");
            return {
                ok: false,
                message: "Tipo de cancha not found.",
            };
        }

        Object.assign(currentInstance, payload);
        await currentInstance.save();

        const result = currentInstance.toJSON();
        logger.info({ id, updatedFields: Object.keys(payload) }, "Tipo de cancha modificada correctamente");

        return {
            ok: true,
            message: "Update success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error al modificar tipo de cancha");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminación de tipo de cancha");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Tipo de cancha no encontrada para eliminar");
            return {
                ok: false,
                message: "Tipo de cancha not found.",
            };
        }

        const result = currentInstance.toJSON();
        await currentInstance.destroy();

        logger.info({ id }, "Tipo de cancha eliminada correctamente");
        return {
            ok: true,
            message: "Delete success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al eliminar tipo de cancha");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando búsqueda de tipo de cancha por id");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Tipo de cancha no encontrada");
            return {
                ok: false,
                message: "Tipo de cancha not found.",
            };
        }

        const result = currentInstance.toJSON();
        logger.info({ id }, "Tipo de cancha obtenida correctamente");

        return {
            ok: true,
            message: "Get success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al obtener tipo de cancha por id");
        throw error;
    }
}

async function enlistar(payload = {}) {
    try {
        logger.info({ payload }, "Iniciando listado de tipos de cancha");
        const { offset, limit } = payload;

        const rows = await model.findAll({
            offset,
            limit,
            order: [["id", "ASC"]],
        });

        const result = rows.map((row) => row.toJSON());
        logger.info({ total: result.length, offset, limit }, "Tipos de cancha enlistadas correctamente");

        return {
            ok: true,
            message: "List success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al enlistar tipos de cancha");
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
