const {sequelize, Sequelize} = require("../../core/config/db.config");
const model = require("./horarios.model")(sequelize);
const rootLogger = require("../../logs/logger");
const {Op} = require("sequelize");

const logger = rootLogger.child({
    module: "horarios.repository",
    model: "Horario",
});

let Cancha = null;
function getCancha() {
    if (!Cancha) {
        Cancha = require("../canchas/canchas.model")(sequelize);
    }
    return Cancha;
}

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando creación de horario");
        const newInstance = await model.create(payload);
        const result = newInstance.toJSON();

        logger.info({ id: result.id }, "Horario creada correctamente");
        return {
            ok: true,
            message: "Creation success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al crear horario");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificación de horario");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Horario no encontrada para modificar");
            return {
                ok: false,
                message: "Horario not found.",
            };
        }

        Object.assign(currentInstance, payload);
        await currentInstance.save();

        const result = currentInstance.toJSON();
        logger.info({ id, updatedFields: Object.keys(payload) }, "Horario modificada correctamente");

        return {
            ok: true,
            message: "Update success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error al modificar horario");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminación de horario");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Horario no encontrada para eliminar");
            return {
                ok: false,
                message: "Horario not found.",
            };
        }

        const result = currentInstance.toJSON();
        await currentInstance.destroy();

        logger.info({ id }, "Horario eliminada correctamente");
        return {
            ok: true,
            message: "Delete success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al eliminar horario");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando búsqueda de horario por id");
        const Cancha = getCancha();
        const currentInstance = await model.findByPk(id, {
            include: [{
                model: Cancha,
                as: "cancha",
            }],
        });

        if (!currentInstance) {
            logger.warn({ id }, "Horario no encontrada");
            return {
                ok: false,
                message: "Horario not found.",
            };
        }

        const result = currentInstance.toJSON();
        logger.info({ id }, "Horario obtenida correctamente");

        return {
            ok: true,
            message: "Get success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al obtener horario por id");
        throw error;
    }
}

async function enlistar(payload = {}) {
    try {
        logger.info({ payload }, "Iniciando listado de horarios");
        const { offset, limit, cancha_id, fecha, disponible } = payload;
        const Cancha = getCancha();

        const where = {};
        if (cancha_id) where.cancha_id = parseInt(cancha_id, 10);
        if (fecha) where.fecha = fecha;
        if (disponible !== undefined) where.disponible = disponible === 'true' || disponible === true;

        const rows = await model.findAll({
            offset,
            limit,
            where,
            order: [["id", "ASC"]],
            include: [{
                model: Cancha,
                as: "cancha",
            }],
        });

        const result = rows.map((row) => row.toJSON());
        logger.info({ total: result.length, offset, limit }, "Horarios enlistadas correctamente");

        return {
            ok: true,
            message: "List success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al enlistar horarios");
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
