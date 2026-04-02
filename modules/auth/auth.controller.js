const authService = require("./auth.service");

const {processTarget} = require("../../core/utils/processTarget")
const { normalize } = require("../../core/normalizer/normalizeTarget");
const { validate } = require("../../core/validator/validateTaget");
const {
    logError,
    logInfo,
} = require("../../logs/utilities");

const authNormalizer = require("../auth/auth.normalizer");
const authValidator = require("../auth/auth.validator");
const authUserNormalizer = require("./auth.user.normalizer");
const authUserValidator = require("./auth.user.validator");

const MODULE_NAME = "auth";
const {email, password}= require("./module.prototype");

async function login(req, res){
    const bodyPayloadNormalizer = authNormalizer.body.payloadNormalizer;
    const bodyPayloadValidator = authValidator.body.payloadValidator;

    const rawBody = req.body;

    logInfo(req, {
        event: "login_requested",
        message: "Solicitud recibida para login",
        moduleName: MODULE_NAME,
        action: "acceso",
        extraMeta: {
            body: rawBody,
        },
    });

    const bodyResult = processTarget(
        rawBody,
        bodyPayloadNormalizer,
        bodyPayloadValidator,
        normalize,
        validate,
    )

    if (!bodyResult.ok) {
        logError(req, {
            event: "login_login_error",
            message: bodyResult.message || "Error en body de auth.",
            moduleName: "auth",
            action: "acceso",
            statusHttp: 400,
            errorCode: bodyResult.stage === "normalization"
            ? "NORMALIZATION_ERROR"
            : "VALIDATION_ERROR",
            extraMeta: {
                body: rawBody,
            },
        });
        
        return res.status(400).json({
            ok: false,
            message: bodyResult.message,
        });
    }

    const newLogin = await authService.login(
        bodyResult.data[email],
        bodyResult.data[password],
    );    

    if(!newLogin.ok){
        return res.status(400).json({
            ok: false,
            message: newLogin.message,
        });        
    }

    console.log(req.session);

    req.session.user = {
        id: newLogin.result.id,
        email: newLogin.result.data[email]
    }

    return res.status(201).json({
        ok:true, 
        data:newLogin.result.data
    });
}

async function register(req, res){
    const bodyPayloadNormalizer = authUserNormalizer.body.payloadNormalizer;
    const bodyPayloadValidator = authUserValidator.body.payloadValidator;

    const rawBody = req.body;

    logInfo(req, {
        event: "user_register_requested",
        message: "Solicitud recibida para user_register",
        moduleName: MODULE_NAME,
        action: "acceso",
        extraMeta: {
            body: rawBody,
        },
    });

    const bodyResult = processTarget(
        rawBody,
        bodyPayloadNormalizer,
        bodyPayloadValidator,
        normalize,
        validate,
    )

    if (!bodyResult.ok) {
        logError(req, {
            event: "user_creation_error",
            message: bodyResult.message || "Error en body de user_creation.",
            moduleName: "auth",
            action: "acceso",
            statusHttp: 400,
            errorCode: bodyResult.stage === "normalization"
            ? "NORMALIZATION_ERROR"
            : "VALIDATION_ERROR",
            extraMeta: {
                body: rawBody,
            },
        });
        
        return res.status(400).json({
            ok: false,
            message: bodyResult.message,
        });
    }

    const newUser = await authService.register(
        bodyResult.data
    );    

    if(!newUser.ok){
        return res.status(400).json({
            ok: false,
            message: newUser.message,
        });        
    }

    return res.status(201).json({
        ok:true, 
        data:newUser.data
    });
}

module.exports = {
    login,
    register,
}

