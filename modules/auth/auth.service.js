const { sha1Encode } = require("../../core/auth/text.utils");
const { email: emailFldName, password: passwordFldName } = require("./module.prototype");
const repository = require("./auth.repository");

async function register(payload) {
    const user = await repository.login(payload[emailFldName]);

    if (user?.data) {
        return {
            ok: false,
            message: "Usuario ya existente",
        };
    }

    const encodedPassword = sha1Encode(payload[passwordFldName]);
    const newPayload = {
        ...payload,
        [passwordFldName]: encodedPassword,
    };

    const newUser = await repository.register(newPayload);

    return {
        ok: true,
        data: newUser,
    };
}

async function login(email, password) {
    const user = await repository.login(email);

    if (!user?.data) {
        return {
            ok: false,
            message: "Usuario no encontrado",
        };
    }

    const encodedPassword = sha1Encode(password);

    if (encodedPassword !== user.data[passwordFldName]) {
        return {
            ok: false,
            message: "Contraseña incorrecta",
        };
    }

    return {
        ok: true,
        result: user,
    };
}

module.exports = {
    login,
    register,
};
