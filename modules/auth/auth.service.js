const { sha1Encode } = require("../../core/text.utils");
const rootLogger = require("../../logs/logger");
const repository = require("./auth.repository");

const logger = rootLogger.child({
    module: "auth.service",
});

function sanitizeUser(user) {
    if (!user) return null;

    const { contrasena, password, ...safeUser } = user;
    return safeUser;
}

async function login({ email, contrasena }) {
    try {
        logger.info({ email }, "Procesando login");

        const repositoryResult = await repository.findUser(email);

        if (!repositoryResult?.ok || !repositoryResult?.data) {
            logger.info({ email }, "Usuario no encontrado");

            return {
                ok: false,
                statusCode: 404,
                message: "Usuario no encontrado.",
            };
        }

        const user = repositoryResult.data;

        const encodedPassword = sha1Encode(contrasena);

        if (encodedPassword !== user.contrasena) {
            logger.info({ email }, "Contraseña incorrecta");

            return {
                ok: false,
                statusCode: 401,
                message: "Contraseña incorrecta.",
            };
        }

        logger.info({ email, userId: user.id }, "Login procesado correctamente");
        
        return {
            ok: true,
            statusCode: 200,
            message: "Login exitoso.",
            data: sanitizeUser(user),
        };
    } catch (error) {
        logger.error({ err: error, email }, "Error al procesar login");
        throw error;
    }
}

async function signup(payload) {
    try {
        logger.info({ email: payload.email }, "Procesando signup");

        const existingUserResult = await repository.findUser(payload.email);
        const existingUser = existingUserResult?.data;

        if (existingUser) {
            logger.info({ email: payload.email }, "Usuario ya existente");

            return {
                ok: false,
                statusCode: 409,
                message: "Usuario ya existe.",
            };
        }

        const workedPayload = {
            ...payload,
            contrasena: sha1Encode(payload.contrasena),
        };

        const repositoryResult = await repository.signup(workedPayload);
        const newUser = repositoryResult?.data ?? repositoryResult;
 
        if (!newUser) {
            logger.warn({ email: payload.email }, "Error al crear usuario");

            return {
                ok: false,
                statusCode: 500,
                message: "Error interno al crear usuario.",
            };
        }

        logger.info(
            { email: payload.email, userId: newUser.id },
            "Usuario creado correctamente"
        );

        return {
            ok: true,
            statusCode: 201,
            message: "Usuario creado correctamente.",
            data: sanitizeUser(newUser),
        };
    } catch (error) {
        logger.error({ err: error, email: payload?.email }, "Error al procesar signup");
        throw error;
    }
}

module.exports = {
    login,
    signup,
};