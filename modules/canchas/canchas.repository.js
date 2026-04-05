const {sequelize, Sequelize} = require("../../core/config/db.config");
const model = require("./canchas.model")(sequelize);
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "canchas.repository",
    model: "Cancha",
});

// Lazy-load associations to avoid circular deps
let TipoCancha = null;
function getTypeCancha() {
    if (!TipoCancha) {
        TipoCancha = require("../tipoCancha/tipoCancha.model")(sequelize);
    }
    return TipoCancha;
}

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando creación de cancha");
        const newInstance = await model.create(payload);
        const result = newInstance.toJSON();

        logger.info({ id: result.id }, "Cancha creada correctamente");
        return {
            ok: true,
            message: "Creation success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al crear cancha");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificación de cancha");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Cancha no encontrada para modificar");
            return {
                ok: false,
                message: "Cancha not found.",
            };
        }

        Object.assign(currentInstance, payload);
        await currentInstance.save();

        const result = currentInstance.toJSON();
        logger.info({ id, updatedFields: Object.keys(payload) }, "Cancha modificada correctamente");

        return {
            ok: true,
            message: "Update success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error al modificar cancha");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminación de cancha");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Cancha no encontrada para eliminar");
            return {
                ok: false,
                message: "Cancha not found.",
            };
        }

        const result = currentInstance.toJSON();
        await currentInstance.destroy();

        logger.info({ id }, "Cancha eliminada correctamente");
        return {
            ok: true,
            message: "Delete success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al eliminar cancha");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando búsqueda de cancha por id");
        const TipoCancha = getTypeCancha();
        const currentInstance = await model.findByPk(id, {
            include: [{
                model: TipoCancha,
                as: "tipoCancha",
            }],
        });

        if (!currentInstance) {
            logger.warn({ id }, "Cancha no encontrada");
            return {
                ok: false,
                message: "Cancha not found.",
            };
        }

        const result = currentInstance.toJSON();
        logger.info({ id }, "Cancha obtenida correctamente");

        return {
            ok: true,
            message: "Get success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al obtener cancha por id");
        throw error;
    }
}

async function enlistar(payload = {}) {
    try {
        logger.info({ payload }, "Iniciando listado de canchas");
        const { offset, limit } = payload;
        const TipoCancha = getTypeCancha();

        const rows = await model.findAll({
            offset,
            limit,
            order: [["id", "ASC"]],
            // TODO: Fix associations - include disabled temporarily
            // include: [{
            //     model: TipoCancha,
            //     as: "tipoCancha",
            // }],
        });

        const result = rows.map((row) => row.toJSON());
        logger.info({ total: result.length, offset, limit }, "Canchas enlistadas correctamente");

        return {
            ok: true,
            message: "List success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al enlistar canchas");
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
