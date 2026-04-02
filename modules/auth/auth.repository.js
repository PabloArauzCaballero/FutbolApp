const sequelize = require("../../core/config/db.config");
const personas = require("../personas/personas.model")(sequelize);
const {
    logRepoInfo,
    logRepoError,
} = require('../../logs/utilities');
const {id} = require("./module.prototype");
const MODULE_NAME = "auth";

async function login(email){
    try{
        logRepoInfo({
            event: "login_repository_create_started",
            message: "Obteniendo informacion de usuario",
            moduleName: MODULE_NAME ,
            action: 'acceso',
            extraMeta: {
                email,
            },
        });

        const usuarioInstance = await personas.findOne({
            where:{
                email
            }
        });

        const usuario = usuarioInstance ? usuarioInstance.toJSON() : usuarioInstance;
        
        return {
            data: usuario,
            id: usuarioInstance ? usuario[id] : null
        };

    }catch(error){
        logRepoError({
            event: "auth_repository_error",
            message: "Error al obtener usuario.",
            moduleName: MODULE_NAME,
            action: 'acceso',
            error,
            extraMeta: {
                email
            },
        });
        
        throw error;
    }
}


async function register(payload){
    try{
        logRepoInfo({
            event: "user_register_repository_create_started",
            message: "Creando usuario",
            moduleName: MODULE_NAME ,
            action: 'create',
            extraMeta: payload,
        });

        const newUsuario = await personas.create(payload);
        const usuario = newUsuario ? newUsuario.toJSON() : newUsuario;

        return usuario;

    }catch(error){
        logRepoError({
            event: "auth_repository_error",
            message: "Error al crear usuario.",
            moduleName: MODULE_NAME,
            action: 'create',
            error,
            extraMeta: payload
        });
        
        throw error;
    }
}

module.exports = {
    login,
    register,
}