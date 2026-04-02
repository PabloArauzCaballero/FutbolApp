const { toSnakeCase } = require('../core/utils/strManagementTool');
const {
    logRepoInfo,
    logRepoError,
} = require('../logs/utilities');


function getRepository(moduleName) {
    if (typeof moduleName !== 'string' || moduleName.trim() === '') {
        throw new Error('moduleName debe ser un string no vacío.');
    }

    const model = require('../modules/models')[moduleName];

    if (!model) {
        throw new Error(`No se encontró un model para moduleName: ${moduleName}.`);
    }

    const requiredMethods = ['create', 'findByPk', 'findAndCountAll'];

    for (const methodName of requiredMethods) {
        if (typeof model[methodName] !== 'function') {
            throw new Error(`El model recibido no implementa ${methodName}().`);
        }
    }

    const modelSnakeCase = toSnakeCase(moduleName);

    async function crear(payload) {
        try {
            logRepoInfo({
                event: `${modelSnakeCase}_repository_create_started`,
                message: `Iniciando persistencia de ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'crear',
                extraMeta: {
                    payload,
                },
            });

            const modelInstance = await model.create(payload);
            const result = modelInstance.toJSON();

            logRepoInfo({
                event: `${modelSnakeCase}_repository_create_success`,
                message: `${moduleName} persistido(a) correctamente.`,
                moduleName: modelSnakeCase,
                action: 'crear',
                extraMeta: {
                    resourceId: result?.id ?? null,
                },
            });

            return result;
        } catch (error) {
            logRepoError({
                event: `${modelSnakeCase}_repository_create_error`,
                message: `Error al persistir ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'crear',
                error,
                extraMeta: {
                    payload,
                },
            });

            throw error;
        }
    }

    async function obtenerPorId(id) {
        try {
            logRepoInfo({
                event: `${modelSnakeCase}_repository_get_started`,
                message: `Iniciando búsqueda de ${moduleName} por id.`,
                moduleName: modelSnakeCase,
                action: 'obtenerPorId',
                extraMeta: {
                    resourceId: id,
                },
            });

            const modelInstance = await model.findByPk(id);

            if (!modelInstance) {
                logRepoInfo({
                    event: `${modelSnakeCase}_repository_get_not_found`,
                    message: `No se encontró ${moduleName} con id ${id}.`,
                    moduleName: modelSnakeCase,
                    action: 'obtenerPorId',
                    extraMeta: {
                        resourceId: id,
                    },
                });

                return null;
            }

            const result = modelInstance.toJSON();

            logRepoInfo({
                event: `${modelSnakeCase}_repository_get_success`,
                message: `${moduleName} obtenido(a) correctamente.`,
                moduleName: modelSnakeCase,
                action: 'obtenerPorId',
                extraMeta: {
                    resourceId: id,
                },
            });

            return result;
        } catch (error) {
            logRepoError({
                event: `${modelSnakeCase}_repository_get_error`,
                message: `Error al obtener ${moduleName} por id.`,
                moduleName: modelSnakeCase,
                action: 'obtenerPorId',
                error,
                extraMeta: {
                    resourceId: id,
                },
            });

            throw error;
        }
    }

    async function modificar(id, patch = {}) {
        try {
            logRepoInfo({
                event: `${modelSnakeCase}_repository_update_started`,
                message: `Iniciando actualización de ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'modificar',
                extraMeta: {
                    resourceId: id,
                    patch,
                },
            });

            const currentInstance = await model.findByPk(id);

            if (!currentInstance) {
                logRepoInfo({
                    event: `${modelSnakeCase}_repository_update_not_found`,
                    message: `No se encontró ${moduleName} con id ${id}.`,
                    moduleName: modelSnakeCase,
                    action: 'modificar',
                    extraMeta: {
                        resourceId: id,
                    },
                });

                return null;
            }

            Object.assign(currentInstance, patch);
            await currentInstance.save();

            const result = currentInstance.toJSON();

            logRepoInfo({
                event: `${modelSnakeCase}_repository_update_success`,
                message: `${moduleName} actualizado(a) correctamente.`,
                moduleName: modelSnakeCase,
                action: 'modificar',
                extraMeta: {
                    resourceId: id,
                    updatedFields: Object.keys(patch ?? {}),
                },
            });

            return result;
        } catch (error) {
            logRepoError({
                event: `${modelSnakeCase}_repository_update_error`,
                message: `Error al actualizar ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'modificar',
                error,
                extraMeta: {
                    resourceId: id,
                    patch,
                },
            });

            throw error;
        }
    }

    async function eliminar(id) {
        try {
            logRepoInfo({
                event: `${modelSnakeCase}_repository_delete_started`,
                message: `Iniciando eliminación de ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'eliminar',
                extraMeta: {
                    resourceId: id,
                },
            });

            const modelInstance = await model.findByPk(id);

            if (!modelInstance) {
                logRepoInfo({
                    event: `${modelSnakeCase}_repository_delete_not_found`,
                    message: `No se encontró ${moduleName} con id ${id}.`,
                    moduleName: modelSnakeCase,
                    action: 'eliminar',
                    extraMeta: {
                        resourceId: id,
                    },
                });

                return null;
            }

            const result = modelInstance.toJSON();
            await modelInstance.destroy();

            logRepoInfo({
                event: `${modelSnakeCase}_repository_delete_success`,
                message: `${moduleName} eliminado(a) correctamente.`,
                moduleName: modelSnakeCase,
                action: 'eliminar',
                extraMeta: {
                    resourceId: id,
                },
            });

            return result;
        } catch (error) {
            logRepoError({
                event: `${modelSnakeCase}_repository_delete_error`,
                message: `Error al eliminar ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'eliminar',
                error,
                extraMeta: {
                    resourceId: id,
                },
            });

            throw error;
        }
    }

    async function listar({ offset, limit } = {}) {
        try {
            logRepoInfo({
                event: `${modelSnakeCase}_repository_list_started`,
                message: `Iniciando listado paginado de ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'listar',
                extraMeta: {
                    offset,
                    limit,
                },
            });

            const { count, rows } = await model.findAndCountAll({
                order: [['id', 'ASC']],
                offset,
                limit,
            });

            const result = {
                items: rows.map((item) => item.toJSON()),
                pagination: {
                    offset,
                    limit,
                    total: count,
                },
            };

            logRepoInfo({
                event: `${modelSnakeCase}_repository_list_success`,
                message: `Listado de ${moduleName} obtenido correctamente.`,
                moduleName: modelSnakeCase,
                action: 'listar',
                extraMeta: {
                    offset,
                    limit,
                    returned: result.items.length,
                    total: count,
                },
            });

            return result;
        } catch (error) {
            logRepoError({
                event: `${modelSnakeCase}_repository_list_error`,
                message: `Error al listar ${moduleName}.`,
                moduleName: modelSnakeCase,
                action: 'listar',
                error,
                extraMeta: {
                    offset,
                    limit,
                },
            });

            throw error;
        }
    }

    return {
        crear,
        obtenerPorId,
        modificar,
        eliminar,
        listar,
    };
}

module.exports = getRepository;
