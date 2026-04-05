const { sequelize } = require("../../core/config/db.config");
const Persona = require("../personas/personas.model")(sequelize);
const rootLogger = require("../../logs/logger");

const logger = rootLogger.child({
    module: "auth.repository",
});

async function findUser(email) {
    try {
        logger.info({ email }, "Solicitando información del usuario");

        const personaInstance = await Persona.findOne({
            where: { email },
        });

        if (!personaInstance) {
            logger.warn({ email }, "Usuario no encontrado");

            return {
                ok: false,
                message: "Usuario no encontrado",
                data: null,
            };
        }

        logger.info(
            { email, userId: personaInstance.id },
            "Datos recibidos correctamente"
        );

        return {
            ok: true,
            message: "Usuario encontrado",
            data: personaInstance.toJSON(),
        };
    } catch (error) {
        logger.error(
            { err: error, email },
            "Error interno del servidor al solicitar información de usuario"
        );

        throw error;
    }
}

async function signup(payload) {
    try {
        logger.info({ email: payload?.email }, "Creando usuario");

        const newUserInstance = await Persona.create(payload);

        if (!newUserInstance) {
            logger.warn({ email: payload?.email }, "Error al crear el usuario");

            return {
                ok: false,
                message: "Error al crear el usuario",
                data: null,
            };
        }

        logger.info(
            { email: payload?.email, userId: newUserInstance.id },
            "Usuario creado correctamente"
        );

        return {
            ok: true,
            message: "Usuario creado correctamente",
            data: newUserInstance.toJSON(),
        };
    } catch (error) {
        logger.error(
            { err: error, email: payload?.email },
            "Error interno al crear usuario"
        );

        throw error;
    }
}

module.exports = {
    findUser,
    signup,
};