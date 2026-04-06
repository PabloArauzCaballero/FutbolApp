const {sequelize, Sequelize} = require("../../core/config/db.config");
const model = require("./resenas.model")(sequelize);
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "resenas.repository",
    model: "Resena",
});

let Cancha = null;
let Usuario = null;
function getRelations() {
    if (!Cancha) {
        Cancha = require("../canchas/canchas.model")(sequelize);
        Usuario = require("../personas/personas.model")(sequelize);
    }
    return { Cancha, Usuario };
}

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando creación de reseña");
        const newInstance = await model.create(payload);
        const result = newInstance.toJSON();

        logger.info({ id: result.id }, "Reseña creada correctamente");
        return {
            ok: true,
            message: "Creation success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al crear reseña");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificación de reseña");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Reseña no encontrada para modificar");
            return {
                ok: false,
                message: "Reseña not found.",
            };
        }

        Object.assign(currentInstance, payload);
        await currentInstance.save();

        const result = currentInstance.toJSON();
        logger.info({ id, updatedFields: Object.keys(payload) }, "Reseña modificada correctamente");

        return {
            ok: true,
            message: "Update success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error al modificar reseña");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminación de reseña");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Reseña no encontrada para eliminar");
            return {
                ok: false,
                message: "Reseña not found.",
            };
        }

        const result = currentInstance.toJSON();
        await currentInstance.destroy();

        logger.info({ id }, "Reseña eliminada correctamente");
        return {
            ok: true,
            message: "Delete success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al eliminar reseña");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando búsqueda de reseña por id");
        const { Cancha, Usuario } = getRelations();
        const currentInstance = await model.findByPk(id, {
            include: [
                { model: Cancha, as: "cancha" },
                { model: Usuario, as: "usuario" },
            ],
        });

        if (!currentInstance) {
            logger.warn({ id }, "Reseña no encontrada");
            return {
                ok: false,
                message: "Reseña not found.",
            };
        }

        const result = currentInstance.toJSON();
        logger.info({ id }, "Reseña obtenida correctamente");

        return {
            ok: true,
            message: "Get success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al obtener reseña por id");
        throw error;
    }
}

async function enlistar(payload = {}) {
    try {
        logger.info({ payload }, "Iniciando listado de reseñas");
        const { offset, limit } = payload;
        const { Cancha, Usuario } = getRelations();

        const rows = await model.findAll({
            offset,
            limit,
            order: [["id", "ASC"]],
            include: [{
                model: Cancha,
                as: "cancha",
            }, {
                model: Usuario,
                as: "usuario",
            }],
        });

        const result = rows.map((row) => row.toJSON());
        logger.info({ total: result.length, offset, limit }, "Reseñas enlistadas correctamente");

        return {
            ok: true,
            message: "List success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al enlistar reseñas");
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
