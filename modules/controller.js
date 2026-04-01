const { toSnakeCase, capitalizeFirstLetter } = require("../core/utils/strManagmentTool");
const { getLayerContracts } = require("../core/utils/getLayerContracts");
const { processTarget } = require("../core/utils/processTarget");
const { normalize } = require("../core/normalizer/normalizeTarget");
const { validate } = require("../core/validator/validateTaget");
const {
    logError,
    logInfo,
} = require("../logs/utilities");

function getController(moduleName, validator, normalizer) {
    const moduleNameSnakeCase = toSnakeCase(moduleName);
    const moduleLabel = moduleNameSnakeCase.replace(/_/g, " ");

    const service = require("./service")(moduleName);

    const {
        insertValidator,
        updateValidator,
        deleteValidator,
        getValidator,
        listValidator,
    } = validator;

    const {
        insertNormalizer,
        updateNormalizer,
        deleteNormalizer,
        getNormalizer,
        listNormalizer,
    } = normalizer;

    function eventName(action, state) {
        return `${moduleNameSnakeCase}_${action}_${state}`;
    }

    async function crear(req, res, next) {
        try {
            const contracts = getLayerContracts(insertValidator, insertNormalizer);
            const rawBody = req.body ?? {};

            logInfo(req, {
                event: eventName("create", "requested"),
                message: `Solicitud recibida para crear ${moduleLabel}.`,
                moduleName: moduleNameSnakeCase,
                action: "crear",
                extraMeta: {
                    body: rawBody,
                },
            });

            const bodyResult = processTarget(
                rawBody,
                contracts.body.payloadNormalizer,
                contracts.body.payloadValidator,
                normalize,
                validate
            );

            if (!bodyResult.ok) {
                logError(req, {
                    event: eventName("create", `${bodyResult.stage}_error`),
                    message: bodyResult.message || `Error en body al crear ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "crear",
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

            const newInstance = await service.crear(bodyResult.data);

            logInfo(req, {
                event: eventName("create", "success"),
                message: `${capitalizeFirstLetter(moduleLabel)} creado exitosamente.`,
                moduleName: moduleNameSnakeCase,
                action: "crear",
                statusHttp: 201,
                extraMeta: {
                    resourceId: newInstance?.id ?? null,
                },
            });

            return res.status(201).json({
                ok: true,
                message: `${capitalizeFirstLetter(moduleLabel)} creado exitosamente.`,
                data: newInstance,
            });
        } catch (error) {
            next(error);
        }
    }

    async function modificar(req, res, next) {
        try {
            const contracts = getLayerContracts(updateValidator, updateNormalizer);
            const rawBody = req.body ?? {};
            const rawParams = req.params ?? {};

            logInfo(req, {
                event: eventName("update", "requested"),
                message: `Solicitud recibida para modificar ${moduleLabel}.`,
                moduleName: moduleNameSnakeCase,
                action: "modificar",
                extraMeta: {
                    body: rawBody,
                    params: rawParams,
                },
            });

            const bodyResult = processTarget(
                rawBody,
                contracts.body.payloadNormalizer,
                contracts.body.payloadValidator,
                normalize,
                validate
            );

            if (!bodyResult.ok) {
                logError(req, {
                    event: eventName("update", `body_${bodyResult.stage}_error`),
                    message: bodyResult.message || `Error en body al modificar ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "modificar",
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

            const paramsResult = processTarget(
                rawParams,
                contracts.params.payloadNormalizer,
                contracts.params.payloadValidator,
                normalize,
                validate
            );

            if (!paramsResult.ok) {
                logError(req, {
                    event: eventName("update", `params_${paramsResult.stage}_error`),
                    message: paramsResult.message || `Error en params al modificar ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "modificar",
                    statusHttp: 400,
                    errorCode: paramsResult.stage === "normalization"
                        ? "NORMALIZATION_ERROR"
                        : "VALIDATION_ERROR",
                    extraMeta: {
                        params: rawParams,
                    },
                });

                return res.status(400).json({
                    ok: false,
                    message: paramsResult.message,
                });
            }

            const paramsResultValues = Object.params(paramsResult.data);

            if(paramsResultValues.length == 0){
                throw new Error("No se recibio ningun ID.");
            }

            if(paramsResultValues.length > 1){
                throw new Error("Se recibió más de un ID en params para modificar. Asegúrese de que la ruta solo contenga un ID.");
            }

            const id = paramsResultValues[0];

            const updatedInstance = await service.modificar(
                id,
                bodyResult.data,
            );


            if (!updatedInstance) {
                logError(req, {
                    event: eventName("update", "not_found"),
                    message: `No se encontró ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "modificar",
                    statusHttp: 404,
                    errorCode: "RESOURCE_NOT_FOUND",
                    extraMeta: {
                        params: rawParams,
                    },
                });

                return res.status(404).json({
                    ok: false,
                    message: `No se encontró ${moduleLabel}.`,
                });
            }

            logInfo(req, {
                event: eventName("update", "success"),
                message: `${capitalizeFirstLetter(moduleLabel)} modificado exitosamente.`,
                moduleName: moduleNameSnakeCase,
                action: "modificar",
                statusHttp: 200,
                extraMeta: {
                    resourceId: updatedInstance?.id ?? null,
                },
            });

            return res.status(200).json({
                ok: true,
                message: `${capitalizeFirstLetter(moduleLabel)} modificado exitosamente.`,
                data: updatedInstance,
            });
        } catch (error) {
            next(error);
        }
    }

    async function eliminar(req, res, next) {
        try {
            const contracts = getLayerContracts(deleteValidator, deleteNormalizer);
            const rawParams = req.params ?? {};

            logInfo(req, {
                event: eventName("delete", "requested"),
                message: `Solicitud recibida para eliminar ${moduleLabel}.`,
                moduleName: moduleNameSnakeCase,
                action: "eliminar",
                extraMeta: {
                    params: rawParams,
                },
            });

            const paramsResult = processTarget(
                rawParams,
                contracts.params.payloadNormalizer,
                contracts.params.payloadValidator,
                normalize,
                validate
            );

            if (!paramsResult.ok) {
                logError(req, {
                    event: eventName("delete", `${paramsResult.stage}_error`),
                    message: paramsResult.message || `Error en params al eliminar ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "eliminar",
                    statusHttp: 400,
                    errorCode: paramsResult.stage === "normalization"
                        ? "NORMALIZATION_ERROR"
                        : "VALIDATION_ERROR",
                    extraMeta: {
                        params: rawParams,
                    },
                });

                return res.status(400).json({
                    ok: false,
                    message: paramsResult.message,
                });
            }


            const paramsResultValues = Object.params(paramsResult.data);

            if(paramsResultValues.length == 0){
                throw new Error("No se recibio ningun ID.");
            }

            if(paramsResultValues.length > 1){
                throw new Error("Se recibió más de un ID en params para modificar. Asegúrese de que la ruta solo contenga un ID.");
            }

            const id = paramsResultValues[0];

            const deletedInstance = await service.eliminar(
                id
            );

            if (!deletedInstance) {
                logError(req, {
                    event: eventName("delete", "not_found"),
                    message: `No se encontró ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "eliminar",
                    statusHttp: 404,
                    errorCode: "RESOURCE_NOT_FOUND",
                    extraMeta: {
                        params: rawParams,
                    },
                });

                return res.status(404).json({
                    ok: false,
                    message: `No se encontró ${moduleLabel}.`,
                });
            }

            logInfo(req, {
                event: eventName("delete", "success"),
                message: `${capitalizeFirstLetter(moduleLabel)} eliminado exitosamente.`,
                moduleName: moduleNameSnakeCase,
                action: "eliminar",
                statusHttp: 200,
                extraMeta: {
                    resourceId: deletedInstance?.id ?? null,
                },
            });

            return res.status(200).json({
                ok: true,
                message: `${capitalizeFirstLetter(moduleLabel)} eliminado exitosamente.`,
                data: deletedInstance,
            });
        } catch (error) {
            next(error);
        }
    }

    async function obtenerPorId(req, res, next) {
        try {
            const contracts = getLayerContracts(getValidator, getNormalizer);
            const rawParams = req.params ?? {};
            const rawQuery = req.query ?? {};

            logInfo(req, {
                event: eventName("get", "requested"),
                message: `Solicitud recibida para obtener ${moduleLabel}.`,
                moduleName: moduleNameSnakeCase,
                action: "obtener",
                extraMeta: {
                    params: rawParams,
                    query: rawQuery,
                },
            });

            const paramsResult = processTarget(
                rawParams,
                contracts.params.payloadNormalizer,
                contracts.params.payloadValidator,
                normalize,
                validate
            );

            if (!paramsResult.ok) {
                logError(req, {
                    event: eventName("get", `params_${paramsResult.stage}_error`),
                    message: paramsResult.message || `Error en params al obtener ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "obtener",
                    statusHttp: 400,
                    errorCode: paramsResult.stage === "normalization"
                        ? "NORMALIZATION_ERROR"
                        : "VALIDATION_ERROR",
                    extraMeta: {
                        params: rawParams,
                    },
                });

                return res.status(400).json({
                    ok: false,
                    message: paramsResult.message,
                });
            }

            const queryResult = processTarget(
                rawQuery,
                contracts.query.payloadNormalizer,
                contracts.query.payloadValidator,
                normalize,
                validate
            );

            if (!queryResult.ok) {
                logError(req, {
                    event: eventName("get", `query_${queryResult.stage}_error`),
                    message: queryResult.message || `Error en query al obtener ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "obtener",
                    statusHttp: 400,
                    errorCode: queryResult.stage === "normalization"
                        ? "NORMALIZATION_ERROR"
                        : "VALIDATION_ERROR",
                    extraMeta: {
                        query: rawQuery,
                    },
                });

                return res.status(400).json({
                    ok: false,
                    message: queryResult.message,
                });
            }

            const paramsResultValues = Object.params(paramsResult.data);

            if(paramsResultValues.length == 0){
                throw new Error("No se recibio ningun ID.");
            }

            if(paramsResultValues.length > 1){
                throw new Error("Se recibió más de un ID en params para modificar. Asegúrese de que la ruta solo contenga un ID.");
            }

            const id = paramsResultValues[0];

            const instance = await service.obtener(
                id,
                queryResult.data
            );

            if (!instance) {
                logError(req, {
                    event: eventName("get", "not_found"),
                    message: `No se encontró ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "obtener",
                    statusHttp: 404,
                    errorCode: "RESOURCE_NOT_FOUND",
                    extraMeta: {
                        params: rawParams,
                        query: rawQuery,
                    },
                });

                return res.status(404).json({
                    ok: false,
                    message: `No se encontró ${moduleLabel}.`,
                });
            }

            logInfo(req, {
                event: eventName("get", "success"),
                message: `${capitalizeFirstLetter(moduleLabel)} obtenido exitosamente.`,
                moduleName: moduleNameSnakeCase,
                action: "obtener",
                statusHttp: 200,
                extraMeta: {
                    resourceId: instance?.id ?? null,
                },
            });

            return res.status(200).json({
                ok: true,
                message: `${capitalizeFirstLetter(moduleLabel)} obtenido exitosamente.`,
                data: instance,
            });
        } catch (error) {
            next(error);
        }
    }

    async function listar(req, res, next) {
        try {
            const contracts = getLayerContracts(listValidator, listNormalizer);
            const rawParams = req.params ?? {};
            const rawQuery = req.query ?? {};

            logInfo(req, {
                event: eventName("list", "requested"),
                message: `Solicitud recibida para listar ${moduleLabel}.`,
                moduleName: moduleNameSnakeCase,
                action: "listar",
                extraMeta: {
                    params: rawParams,
                    query: rawQuery,
                },
            });

            const paramsResult = processTarget(
                rawParams,
                contracts.params.payloadNormalizer,
                contracts.params.payloadValidator,
                normalize,
                validate
            );

            if (!paramsResult.ok) {
                logError(req, {
                    event: eventName("list", `params_${paramsResult.stage}_error`),
                    message: paramsResult.message || `Error en params al listar ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "listar",
                    statusHttp: 400,
                    errorCode: paramsResult.stage === "normalization"
                        ? "NORMALIZATION_ERROR"
                        : "VALIDATION_ERROR",
                    extraMeta: {
                        params: rawParams,
                    },
                });

                return res.status(400).json({
                    ok: false,
                    message: paramsResult.message,
                });
            }

            const queryResult = processTarget(
                rawQuery,
                contracts.query.payloadNormalizer,
                contracts.query.payloadValidator,
                normalize,
                validate
            );

            if (!queryResult.ok) {
                logError(req, {
                    event: eventName("list", `query_${queryResult.stage}_error`),
                    message: queryResult.message || `Error en query al listar ${moduleLabel}.`,
                    moduleName: moduleNameSnakeCase,
                    action: "listar",
                    statusHttp: 400,
                    errorCode: queryResult.stage === "normalization"
                        ? "NORMALIZATION_ERROR"
                        : "VALIDATION_ERROR",
                    extraMeta: {
                        query: rawQuery,
                    },
                });

                return res.status(400).json({
                    ok: false,
                    message: queryResult.message,
                });
            }

            const result = await service.listar(
                paramsResult.data,
                queryResult.data
            );

            logInfo(req, {
                event: eventName("list", "success"),
                message: `${capitalizeFirstLetter(moduleLabel)} listados exitosamente.`,
                moduleName: moduleNameSnakeCase,
                action: "listar",
                statusHttp: 200,
                extraMeta: {
                    returned: Array.isArray(result?.items) ? result.items.length : null,
                    total: result?.pagination?.total ?? null,
                },
            });

            return res.status(200).json({
                ok: true,
                message: `${capitalizeFirstLetter(moduleLabel)} listados exitosamente.`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    return {
        crear,
        modificar,
        eliminar,
        obtenerPorId,
        listar,
    };
}

module.exports = getController;