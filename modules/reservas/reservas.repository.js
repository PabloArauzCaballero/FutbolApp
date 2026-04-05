const {sequelize, Sequelize} = require("../../core/config/db.config");
const model = require("./reservas.model")(sequelize);
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "reservas.repository",
    model: "Reserva",
});

let Horario = null;
let Cancha = null;
let Usuario = null;
function getRelations() {
    if (!Horario) {
        Horario = require("../horarios/horarios.model")(sequelize);
        Cancha = require("../canchas/canchas.model")(sequelize);
        Usuario = require("../personas/personas.model")(sequelize);
    }
    return { Horario, Cancha, Usuario };
}

async function crear(payload) {
    try {
        logger.info({ payload }, "Iniciando creación de reserva");
        const newInstance = await model.create(payload);
        const result = newInstance.toJSON();

        logger.info({ id: result.id }, "Reserva creada correctamente");
        return {
            ok: true,
            message: "Creation success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al crear reserva");
        throw error;
    }
}

async function modificar(id, payload) {
    try {
        logger.info({ id, payload }, "Iniciando modificación de reserva");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Reserva no encontrada para modificar");
            return {
                ok: false,
                message: "Reserva not found.",
            };
        }

        Object.assign(currentInstance, payload);
        await currentInstance.save();

        const result = currentInstance.toJSON();
        logger.info({ id, updatedFields: Object.keys(payload) }, "Reserva modificada correctamente");

        return {
            ok: true,
            message: "Update success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id, payload }, "Error al modificar reserva");
        throw error;
    }
}

async function eliminar(id) {
    try {
        logger.info({ id }, "Iniciando eliminación de reserva");
        const currentInstance = await model.findByPk(id);

        if (!currentInstance) {
            logger.warn({ id }, "Reserva no encontrada para eliminar");
            return {
                ok: false,
                message: "Reserva not found.",
            };
        }

        const result = currentInstance.toJSON();
        await currentInstance.destroy();

        logger.info({ id }, "Reserva eliminada correctamente");
        return {
            ok: true,
            message: "Delete success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al eliminar reserva");
        throw error;
    }
}

async function obtenerPorId(id) {
    try {
        logger.info({ id }, "Iniciando búsqueda de reserva por id");
        const { Horario, Cancha, Usuario } = getRelations();
        const currentInstance = await model.findByPk(id, {
            include: [
                {
                    model: Horario,
                    as: "horario",
                    include: [{
                        model: Cancha,
                        as: "cancha",
                    }],
                },
                {
                    model: Usuario,
                    as: "usuario",
                },
            ],
        });

        if (!currentInstance) {
            logger.warn({ id }, "Reserva no encontrada");
            return {
                ok: false,
                message: "Reserva not found.",
            };
        }

        const result = currentInstance.toJSON();
        logger.info({ id }, "Reserva obtenida correctamente");

        return {
            ok: true,
            message: "Get success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, id }, "Error al obtener reserva por id");
        throw error;
    }
}

async function enlistar(payload = {}) {
    try {
        logger.info({ payload }, "Iniciando listado de reservas");
        const { offset, limit } = payload;
        const { Horario, Cancha, Usuario } = getRelations();

        const rows = await model.findAll({
            offset,
            limit,
            order: [["id", "ASC"]],
            // include: [{
            //     model: Horario,
            //     as: "horario",
            //     include: [{
            //         model: Cancha,
            //         as: "cancha",
            //         include: [{
            //             model: require("../tipoCancha/tipoCancha.model")(sequelize),
            //             as: "tipoCancha",
            //         }],
            //     }],
            // }, {
            //     model: Usuario,
            //     as: "usuario",
            // }],
        });

        const result = rows.map((row) => row.toJSON());
        logger.info({ total: result.length, offset, limit }, "Reservas enlistadas correctamente");

        return {
            ok: true,
            message: "List success",
            data: result,
        };
    } catch (error) {
        logger.error({ err: error, payload }, "Error al enlistar reservas");
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
