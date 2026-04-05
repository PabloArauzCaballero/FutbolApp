const { loginSchema } = require("./auth.schema");
const { createSchema: signupSchema } = require("../personas/personas.schemas");
const service = require("./auth.service");

function validateData(schema, input) {
    const result = schema.safeParse(input);

    if (!result.success) {
        return {
            ok: false,
            errors: result.error.flatten(),
        };
    }

    return {
        ok: true,
        data: result.data,
    };
}

function getSafeBody(body = {}) {
    const { contrasena, password, ...safeBody } = body;
    return safeBody;
}

function sendError(res, statusCode, message, errors = undefined) {
    return res.status(statusCode).json({
        ok: false,
        message,
        ...(errors ? { errors } : {}),
    });
}

function buildSessionUser(user) {
    return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
    };
}

function regenerateSession(req) {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function saveSession(req) {
    return new Promise((resolve, reject) => {
        req.session.save((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function destroySession(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

async function login(req, res) {
    try {
        req.log.info({ body: getSafeBody(req.body) }, "Login request");

        const validation = validateData(loginSchema, req.body);

        if (!validation.ok) {
            req.log.warn(
                { body: getSafeBody(req.body), errors: validation.errors },
                "Login validation failed"
            );

            return sendError(res, 400, "Datos inválidos.", validation.errors);
        }

        const result = await service.login(validation.data);

        if (!result?.ok) {
            req.log.warn(
                {
                    email: validation?.data?.email || "No data available",
                    message: result?.message || "No data available",
                },
                "Login failed"
            );

            return sendError(res, result.statusCode || 400, result.message);
        }

        await regenerateSession(req);
        req.session.user = buildSessionUser(result.data);
        await saveSession(req);

        req.log.info(
            { email: validation.data.email, userId: result.data?.id, rol: result.data?.rol },
            "Login succeeded"
        );

        return res.status(200).json({
            ok: true,
            message: result.message,
            data: {
                user: req.session.user,
            },
        });
    } catch (error) {
        req.log.error({ err: error }, "Internal error while logging in");
        return sendError(res, 500, "Error interno del servidor.");
    }
}

async function signup(req, res) {
    try {
        req.log.info({ body: getSafeBody(req.body) }, "Signup request");

        const validation = validateData(signupSchema, req.body);

        if (!validation.ok) {
            req.log.warn(
                { body: getSafeBody(req.body), errors: validation.errors },
                "Signup validation failed"
            );

            return sendError(res, 400, "Datos inválidos.", validation.errors);
        }

        const result = await service.signup(validation.data);

        if (!result?.ok) {
            req.log.warn(
                { email: validation.data.email, message: result.message },
                "Signup failed"
            );

            return sendError(res, result.statusCode || 400, result.message);
        }

        req.log.info(
            { email: validation.data.email, userId: result.data?.id },
            "Signup succeeded"
        );

        return res.status(201).json({
            ok: true,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        req.log.error({ err: error }, "Internal error while signing up");
        return sendError(res, 500, "Error interno del servidor.");
    }
}

async function me(req, res) {
    try {
        return res.status(200).json({
            ok: true,
            message: "Sesión activa.",
            data: req.user,
        });
    } catch (error) {
        req.log.error({ err: error }, "Internal error while getting current session user");
        return sendError(res, 500, "Error interno del servidor.");
    }
}

async function logout(req, res) {
    try {
        const currentUser = req.user || req.session?.user || null;

        if (!req.session) {
            return res.status(200).json({
                ok: true,
                message: "Logout exitoso.",
            });
        }

        await destroySession(req);
        res.clearCookie("connect.sid");

        req.log.info({ userId: currentUser?.id }, "Logout request completed");

        return res.status(200).json({
            ok: true,
            message: "Logout exitoso.",
        });
    } catch (error) {
        req.log.error({ err: error }, "Internal error while logging out");
        return sendError(res, 500, "Error interno del servidor.");
    }
}

module.exports = {
    login,
    logout,
    me,
    signup,
};
