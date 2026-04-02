
const {sha1Encode} = require("../../core/auth/text.utils");
const {email: emailFldName, password: passwordFldName}= require("./module.prototype");
const repository = require("./auth.repository");

async function register(payload){
    const user = await repository.login(payload[emailFldName]);

    if(user.usuario){
        return {
            ok: false,
            message: "Usuario ya existente"
        }
    }

    const encodedPassword = sha1Encode(payload[passwordFldName]);
    const newPayload = payload;
    newPayload[passwordFldName] = encodedPassword;
    

    const newUser = await repository.register(newPayload);
    
    return {
        ok: true,
        data: newUser
    };
}

async function login(email, password){
    const user = await repository.login(email);

    if(!user){
        return {
            ok: false,
            message: "Usuario no encontrado"
        }
    }

    const encodedPassword = sha1Encode(password);

    if(password !== user.data[passwordFldName]){
        return {
            ok: false,
            message: "Contraseña incorrecta"
        }
    }
    
    return {
        ok: true,
        result: user
    };
}

module.exports = { 
    login,
    register,
}